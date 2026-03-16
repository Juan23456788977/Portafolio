<?php
require 'db.php';
header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['id'])) {
    echo json_encode(['success'=>false, 'message'=>'Datos incompletos']);
    exit;
}
$stmt = $pdo->prepare("UPDATE pasantes SET nombre=?, email=? WHERE id=?");
$ok = $stmt->execute([
    $data['nombre'],
    $data['email'],
    $data['id']
]);
echo json_encode(['success'=>$ok, 'message'=>$ok?'Pasante actualizado':'Error al actualizar']);