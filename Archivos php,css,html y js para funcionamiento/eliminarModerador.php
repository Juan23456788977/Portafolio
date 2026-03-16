<?php
require 'db.php';
header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['id'])) {
    echo json_encode(['success'=>false, 'message'=>'ID faltante']);
    exit;
}
$stmt = $pdo->prepare("DELETE FROM moderadores WHERE id=?");
$ok = $stmt->execute([$data['id']]);
echo json_encode(['success'=>$ok, 'message'=>$ok?'Moderador eliminado':'Error al eliminar']);