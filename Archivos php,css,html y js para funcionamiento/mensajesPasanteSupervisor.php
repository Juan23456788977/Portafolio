<?php
require 'db.php';
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true);
    if (!$d || !isset($d['remitente_id'], $d['destinatario_id'], $d['mensaje'], $d['remitente_tipo'])) {
        echo json_encode(['success'=>false]); exit;
    }
    $stmt = $pdo->prepare("INSERT INTO mensajes (remitente_id, destinatario_id, remitente_tipo, destinatario_tipo, mensaje) VALUES (?,?,?,?,?)");
    $ok = $stmt->execute([$d['remitente_id'],$d['destinatario_id'],$d['remitente_tipo'],$d['destinatario_tipo'] ?? 'supervisor',$d['mensaje']]);
    echo json_encode(['success'=>$ok]);
    exit;
} else {
    // listar por pareja pasante-supervisor (pasa pasante_id y supervisor_id)
    $pas = $_GET['pasante_id'] ?? '';
    $sup = $_GET['supervisor_id'] ?? '';
    if(!$pas || !$sup) { echo json_encode(['success'=>false,'mensajes'=>[]]); exit; }
    $stmt = $pdo->prepare("SELECT * FROM mensajes WHERE (remitente_id=? AND destinatario_id=?) OR (remitente_id=? AND destinatario_id=?) ORDER BY fecha ASC");
    $stmt->execute([$pas,$sup,$sup,$pas]);
    echo json_encode(['success'=>true,'mensajes'=>$stmt->fetchAll()]);
}
?>