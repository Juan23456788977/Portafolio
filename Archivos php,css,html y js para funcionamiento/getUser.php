<?php
require 'db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if (!$id) { echo json_encode(['success'=>false,'message'=>'id faltante']); exit; }

try {
    $stmt = $pdo->prepare("SELECT id, nombre, email, role, nota, horas_totales, horas_cumplidas, empresa_id FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $u = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$u) { echo json_encode(['success'=>false,'message'=>'Usuario no encontrado']); exit; }
    echo json_encode(['success'=>true,'user'=>$u]);
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>'Error interno']);
}
?>