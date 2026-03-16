<?php
// asignarPendientes.php (actualizado para respetar cupos y decrementar atomically)
require 'db.php';
header('Content-Type: application/json');

try {
    // seleccionar pasantes sin empresa asignada (role='pasante' y empresa_id IS NULL)
    $q = $pdo->query("SELECT id, nombre, email, nota, lat, lng, ubicacion_empresa FROM users WHERE role='pasante' AND (empresa_id IS NULL OR empresa_id='')");
    $pendientes = $q->fetchAll(PDO::FETCH_ASSOC);
    $result = [];

    // cargamos todas las empresas con cupo
    $empQ = $pdo->query("SELECT id,nombre,importancia,ubicacion,lat,lng,cupo FROM empresas");
    $empresas = $empQ->fetchAll(PDO::FETCH_ASSOC);

    $importance_map = ['muy importante'=>1,'Importante'=>1,'importante'=>1,'Medio importante'=>2,'medio importante'=>2,'No tan importante'=>3,'No tan importante'=>3,'ALTA'=>1,'MEDIA'=>2,'BAJA'=>3];

    foreach ($pendientes as $p) {
        $candidates = [];
        foreach ($empresas as $e) {
            if (isset($e['cupo']) && $e['cupo'] !== null && intval($e['cupo']) <= 0) {
                continue; // sin cupos
            }
            $impKey = $e['importancia'] ?? '';
            $impScore = isset($importance_map[$impKey]) ? $importance_map[$impKey] : 3;
            $distKm = null;
            if ($p['lat'] && $p['lng'] && $e['lat'] && $e['lng']) {
                $earthRadius = 6371;
                $dLat = deg2rad($e['lat'] - $p['lat']);
                $dLon = deg2rad($e['lng'] - $p['lng']);
                $a = sin($dLat/2)*sin($dLat/2) + cos(deg2rad($p['lat']))*cos(deg2rad($e['lat'])) * sin($dLon/2)*sin($dLon/2);
                $c = 2 * atan2(sqrt($a), sqrt(1-$a));
                $distKm = $earthRadius * $c;
            } else {
                $distKm = levenshtein(strtolower($e['ubicacion'] ?? ''), strtolower($p['ubicacion_empresa'] ?? '')) / 10.0;
            }
            $notaPart = $p['nota'] !== null ? (-floatval($p['nota']) * 5) : 0;
            $score = ($impScore * 100) + ($distKm * 1) + $notaPart;
            $candidates[] = ['empresa'=>$e, 'score'=>$score];
        }

        if (empty($candidates)) {
            $result[] = ['pasante_id'=>$p['id'],'empresa'=>null];
            continue;
        }

        usort($candidates, function($a,$b){ return $a['score'] <=> $b['score']; });

        $assignedName = null;
        foreach ($candidates as $cand) {
            $e = $cand['empresa'];
            // si cupo NULL => ilimitado
            if (!isset($e['cupo']) || $e['cupo'] === null) {
                $stmt = $pdo->prepare("UPDATE users SET empresa_id=?, asignado_empresa=? WHERE id=?");
                $stmt->execute([$e['id'],$e['nombre'],$p['id']]);
                $assignedName = $e['nombre'];
                break;
            }
            // cupo > 0 -> intentar decrementar atomically
            if (intval($e['cupo']) > 0) {
                $pdo->beginTransaction();
                $dec = $pdo->prepare("UPDATE empresas SET cupo = cupo - 1 WHERE id = ? AND cupo > 0");
                $dec->execute([$e['id']]);
                if ($dec->rowCount() > 0) {
                    $stmt = $pdo->prepare("UPDATE users SET empresa_id=?, asignado_empresa=? WHERE id=?");
                    $stmt->execute([$e['id'],$e['nombre'],$p['id']]);
                    $pdo->commit();
                    $assignedName = $e['nombre'];
                    break;
                } else {
                    $pdo->rollBack();
                    // otro proceso consumió cupo; probar siguiente candidata
                    continue;
                }
            }
        }

        $result[] = ['pasante_id'=>$p['id'],'empresa'=>$assignedName];
    }

    echo json_encode(['success'=>true,'asignaciones'=>$result]);
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
?>