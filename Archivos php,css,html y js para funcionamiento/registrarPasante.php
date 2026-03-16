<?php
// registrarPasante.php (actualizado con control de cupos)
require 'db.php';
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

$nombre = trim($data['nombre'] ?? '');
$email  = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';
$role = ($data['role'] ?? 'pasante');

if (!$nombre || !$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Faltan campos obligatorios (nombre, email, password)']);
    exit;
}

$nota = isset($data['nota']) && $data['nota'] !== '' ? intval($data['nota']) : null;
$horas_totales = isset($data['horas_totales']) && $data['horas_totales'] !== '' ? intval($data['horas_totales']) : null;
$ubicacion_text = trim($data['ubicacion'] ?? $data['ubicacion_empresa'] ?? '');
$lat = isset($data['lat']) && $data['lat'] !== '' ? floatval($data['lat']) : null;
$lng = isset($data['lng']) && $data['lng'] !== '' ? floatval($data['lng']) : null;

try {
    // Verificar existencia
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Ya existe un usuario con ese email']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    // Insert usuario (sin asignación)
    $insertQuery = "INSERT INTO users (nombre, email, password, role, nota, horas_totales, horas_cumplidas, asignado_empresa, ubicacion_empresa, lat, lng) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($insertQuery);
    $stmt->execute([
        $nombre,
        $email,
        $hash,
        $role,
        $nota !== null ? $nota : null,
        $horas_totales !== null ? $horas_totales : null,
        null,
        $ubicacion_text ?: null,
        $lat,
        $lng
    ]);
    $pasanteId = $pdo->lastInsertId();
    $assigned = null;

    if ($role === 'pasante') {
        // Cargar empresas (incluimos cupo)
        $empQ = $pdo->query("SELECT id, nombre, importancia, ubicacion, COALESCE(lat,'') AS lat, COALESCE(lng,'') AS lng, cupo FROM empresas");
        $empresas = $empQ->fetchAll(PDO::FETCH_ASSOC);

        if (count($empresas) > 0) {
            $importance_map = [
                'Importante' => 1, 'importante' => 1, 'muy importante' => 1, 'ALTA' => 1,
                'Medio importante' => 2, 'medio importante' => 2, 'MEDIA' => 2,
                'No tan importante' => 3, 'no tan importante' => 3, 'BAJA' => 3
            ];

            $candidates = [];
            foreach ($empresas as $e) {
                // Si cupo == 0, no lo consideramos
                if (isset($e['cupo']) && $e['cupo'] !== null && intval($e['cupo']) <= 0) {
                    continue;
                }
                $impKey = $e['importancia'] ?? '';
                $impScore = $importance_map[$impKey] ?? 3;

                $distKm = 0;
                if ($lat !== null && $lng !== null && !empty($e['lat']) && !empty($e['lng'])) {
                    $earthRadius = 6371;
                    $dLat = deg2rad(floatval($e['lat']) - $lat);
                    $dLon = deg2rad(floatval($e['lng']) - $lng);
                    $a = sin($dLat/2)*sin($dLat/2) + cos(deg2rad($lat))*cos(deg2rad(floatval($e['lat']))) * sin($dLon/2)*sin($dLon/2);
                    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
                    $distKm = $earthRadius * $c;
                } else {
                    if ($ubicacion_text && $e['ubicacion']) {
                        $lev = levenshtein(strtolower($e['ubicacion']), strtolower($ubicacion_text));
                        $distKm = $lev / 6.0;
                    } else {
                        $distKm = 50;
                    }
                }

                $notaPart = $nota !== null ? (-floatval($nota) * 5.0) : 0.0;
                $score = ($impScore * 100.0) + ($distKm * 1.0) + $notaPart;
                $candidates[] = ['empresa' => $e, 'score' => $score, 'dist' => $distKm];
            }

            // Si no quedaron candidatos con cupo > 0, se devolverá sin asignación
            if (count($candidates) > 0) {
                usort($candidates, function($a, $b) {
                    return ($a['score'] < $b['score']) ? -1 : 1;
                });

                // Intentamos asignar al mejor candidato que aún tenga cupo (o cupo NULL)
                foreach ($candidates as $cand) {
                    $e = $cand['empresa'];

                    // Si cupo es NULL -> ilimitado: asignamos directamente
                    if (!isset($e['cupo']) || $e['cupo'] === null) {
                        $assigned = $e;
                        $upd = $pdo->prepare("UPDATE users SET empresa_id = ?, asignado_empresa = ?, ubicacion_empresa = ? WHERE id = ?");
                        $ubic_to_save = $e['ubicacion'] ?? ($ubicacion_text ?: null);
                        $upd->execute([$e['id'], $e['nombre'], $ubic_to_save, $pasanteId]);
                        break;
                    }

                    // Si cupo > 0 -> intentar decrementar atomically
                    if (intval($e['cupo']) > 0) {
                        // Intentamos disminuir cupo de forma atómica
                        $pdo->beginTransaction();
                        $dec = $pdo->prepare("UPDATE empresas SET cupo = cupo - 1 WHERE id = ? AND cupo > 0");
                        $dec->execute([$e['id']]);
                        if ($dec->rowCount() > 0) {
                            // éxito -> guardamos asignación en user
                            $upd = $pdo->prepare("UPDATE users SET empresa_id = ?, asignado_empresa = ?, ubicacion_empresa = ? WHERE id = ?");
                            $ubic_to_save = $e['ubicacion'] ?? ($ubicacion_text ?: null);
                            $upd->execute([$e['id'], $e['nombre'], $ubic_to_save, $pasanteId]);
                            $pdo->commit();
                            $assigned = $e;
                            break;
                        } else {
                            // otro proceso consumió el cupo; revertir y probar siguiente candidato
                            $pdo->rollBack();
                            continue;
                        }
                    }
                }
            }
        }
    }

    $resp = ['success' => true, 'pasante_id' => $pasanteId];
    if ($assigned) {
        $resp['asignada'] = [
            'id' => $assigned['id'],
            'nombre' => $assigned['nombre'],
            'importancia' => $assigned['importancia'] ?? null,
            'ubicacion' => $assigned['ubicacion'] ?? null
        ];
    } else {
        $resp['asignada'] = null;
    }

    echo json_encode($resp);
    exit;

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno: ' . $e->getMessage()]);
    exit;
}
?>