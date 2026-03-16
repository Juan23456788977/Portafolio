<?php
// Compatibilidad: elimina (soft-delete) un pasante en la tabla users
require 'db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? intval($data['id']) : 0;
if (!$id) exit(json_encode(['success'=>false,'message'=>'ID faltante']));

try {
    // reutiliza la lógica centralizada
    $_SESSION['user'] = $_SESSION['user'] ?? null; // por si no hay sesión
    // Llamamos a eliminarUsuario.php internamente haciendo la misma operación:
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id=? LIMIT 1");
    $stmt->execute([$id]);
    $r = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$r || $r['role'] !== 'pasante') {
        echo json_encode(['success'=>false,'message'=>'Usuario no es pasante o no existe']);
        exit;
    }
    $upd = $pdo->prepare("UPDATE users SET deleted_at = NOW() WHERE id = ? LIMIT 1");
    $ok = $upd->execute([$id]);
    echo json_encode(['success'=> (bool)$ok, 'message'=> $ok ? 'Pasante marcado como eliminado' : 'Error']);
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>'Error interno']);
}
?>