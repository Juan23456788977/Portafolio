<?php
require 'db.php';
header('Content-Type: application/json');

// input expected JSON:
// { nombre, email, password, nota (number, optional), horas_totales (int), lat (decimal, optional), lng (decimal, optional) }

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || empty($data['nombre']) || empty($data['email']) || empty($data['password'])) {
    echo json_encode(['success'=>false,'message'=>'Faltan datos requeridos']);
    exit;
}

$nombre = trim($data['nombre']);
$email = strtolower(trim($data['email']));
$password = $data['password'];
$nota = isset($data['nota']) ? floatval($data['nota']) : null;
$horas_totales = isset($data['horas_totales']) ? intval($data['horas_totales']) : null;
$lat = isset($data['lat']) ? floatval($data['lat']) : null;
$lng = isset($data['lng']) ? floatval($data['lng']) : null;

try {
    // verificar existencia
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email=?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success'=>false,'message'=>'Ya existe un usuario con ese email']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    // insertar pasante
    $stmt = $pdo->prepare("INSERT INTO users (nombre,email,password,role,nota,horas_totales,horas_cumplidas,lat,lng) VALUES (?,?,?,?,?,?,0,?,?)");
    $stmt->execute([$nombre,$email,$hash,'pasante',$nota,$horas_totales,$lat,$lng]);
    $pasanteId = $pdo->lastInsertId();

    // función auxiliar: obtener empresas con lat/lng o por similitud
    function obtenerEmpresas($pdo) {
        $q = $pdo->query("SELECT id,nombre,importancia,ubicacion,lat,lng,horas_pasantia,horas_requeridas FROM empresas");
        return $q->fetchAll(PDO::FETCH_ASSOC);
    }

    $empresas = obtenerEmpresas($pdo);

    // scoring: preferencia por importancia, luego distancia (si lat/lng), luego nota
    // map importancia -> weight (lower = mejor)
    $importance_map = [
        'muy importante'=>1, 'Importante'=>1,
        'importante'=>2, 'Medio importante'=>2,
        'no tan importante'=>3, 'No tan importante'=>3,
        'ALTA'=>1, 'MEDIA'=>2, 'BAJA'=>3
    ];

    $candidates = [];
    foreach ($empresas as $e) {
        $impKey = $e['importancia'] ?? '';
        $impScore = isset($importance_map[$impKey]) ? $importance_map[$impKey] : 3;
        $distKm = null;
        if ($lat !== null && $lng !== null && $e['lat'] && $e['lng']) {
            // Haversine
            $earthRadius = 6371;
            $dLat = deg2rad($e['lat'] - $lat);
            $dLon = deg2rad($e['lng'] - $lng);
            $a = sin($dLat/2)*sin($dLat/2) + cos(deg2rad($lat))*cos(deg2rad($e['lat'])) * sin($dLon/2)*sin($dLon/2);
            $c = 2 * atan2(sqrt($a), sqrt(1-$a));
            $distKm = $earthRadius * $c;
        } else {
            // fallback: approximate by string similarity between ubicacion texts
            $distKm = levenshtein(strtolower($e['ubicacion'] ?? ''), strtolower($data['ubicacion'] ?? '')) / 10.0; // heuristic
        }

        // score: lower better
        // weight factors: importance (100), distance (1), nota (higher better => subtract)
        $notaPart = $nota !== null ? (-floatval($nota) * 5) : 0;
        $score = ($impScore * 100) + ($distKm * 1) + $notaPart;
        $candidates[] = ['empresa'=>$e, 'score'=>$score, 'dist'=>$distKm];
    }

    usort($candidates, function($a,$b){ return $a['score'] <=> $b['score']; });

    $assigned = null;
    if (count($candidates)) {
        $assigned = $candidates[0]['empresa'];
        // actualizar pasante con empresa asignada
        // preferimos guardar empresa_id en users. Si no existe, guardamos nombre en asignado_empresa
        $stmt = $pdo->prepare("UPDATE users SET empresa_id=?, asignado_empresa=?, ubicacion_empresa=? WHERE id=?");
        $ubic = $assigned['ubicacion'] ?? ($data['ubicacion'] ?? null);
        $stmt->execute([$assigned['id'], $assigned['nombre'], $ubic, $pasanteId]);

        // asignar supervisor: buscar supervisor con empresa_id igual o con asignado_empresa igual al nombre
        $supStmt = $pdo->prepare("SELECT id FROM users WHERE role='supervisor' AND empresa_id = ? ORDER BY id LIMIT 1");
        $supStmt->execute([$assigned['id']]);
        $sup = $supStmt->fetchColumn();
        if (!$sup) {
            // fallback: supervisor with matching asignado_empresa name
            $supStmt2 = $pdo->prepare("SELECT id FROM users WHERE role='supervisor' AND asignado_empresa = ? ORDER BY id LIMIT 1");
            $supStmt2->execute([$assigned['nombre']]);
            $sup = $supStmt2->fetchColumn();
        }
        if ($sup) {
            // guardar relacion pasante_supervisor si existe la tabla, sino actualizar supervisor_id
            // intenta insertar en pasante_supervisor
            try {
                $ins = $pdo->prepare("INSERT INTO pasante_supervisor (pasante_id, supervisor_email) VALUES (?, (SELECT email FROM users WHERE id=?))");
                $ins->execute([$pasanteId, $sup]);
            } catch (Exception $e) {
                // si no existe tabla, actualizar users.supervisor_id
                $upd = $pdo->prepare("UPDATE users SET supervisor_id = ? WHERE id = ?");
                $upd->execute([$sup, $pasanteId]);
            }
        }
    }

    echo json_encode(['success'=>true,'pasante_id'=>$pasanteId,'asignada'=> $assigned ? $assigned : null]);
    exit;

} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>'Error interno: '.$e->getMessage()]);
    exit;
}
?>