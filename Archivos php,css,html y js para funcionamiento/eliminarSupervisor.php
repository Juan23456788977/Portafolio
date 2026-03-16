<?php
// Compatibilidad: elimina (soft-delete) un supervisor en users
require 'db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? intval($data['id']) : 0;
if (!$id) exit(json_encode(['success'=>false,'message'=>'ID faltante']));

try {
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id=? LIMIT 1");
    $stmt->execute([$id]);
    $r = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$r || $r['role'] !== 'supervisor') {
        echo json_encode(['success'=>false,'message'=>'Usuario no es supervisor o no existe']);
        exit;
    }
    // Permisos: admin o moderador pueden eliminar supervisores (según tu solicitud)
    if (empty($_SESSION['user'])) {
        echo json_encode(['success'=>false,'message'=>'No autenticado']);
        exit;
    }
    $actorRole = $_SESSION['user']['role'];
    if (!in_array($actorRole, ['admin','moderador'])) {
        echo json_encode(['success'=>false,'message'=>'Permisos insuficientes']);
        exit;
    }
    $upd = $pdo->prepare("UPDATE users SET deleted_at = NOW() WHERE id = ? LIMIT 1");
    $ok = $upd->execute([$id]);
    echo json_encode(['success'=> (bool)$ok, 'message'=> $ok ? 'Supervisor marcado como eliminado' : 'Error']);
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>'Error interno']);
}
?>