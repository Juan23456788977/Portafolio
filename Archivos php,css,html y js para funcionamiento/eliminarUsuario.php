<?php
// eliminarUsuario.php — soft-delete (marca deleted_at)
// admin: puede borrar cualquier usuario
// moderador: puede borrar pasante o supervisor (no puede borrar admins ni otros moderadores)
require 'db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

if (empty($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? intval($data['id']) : 0;
if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID faltante']);
    exit;
}

try {
    // obtener rol del objetivo
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $t = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$t) {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        exit;
    }
    $targetRole = $t['role'];

    $actor = $_SESSION['user'];

    if ($actor['role'] !== 'admin') {
        if ($actor['role'] === 'moderador') {
            if (!in_array($targetRole, ['pasante', 'supervisor'])) {
                echo json_encode(['success' => false, 'message' => 'Permisos insuficientes para eliminar este usuario']);
                exit;
            }
        } else {
            // otros roles no pueden eliminar usuarios
            echo json_encode(['success' => false, 'message' => 'Permisos insuficientes']);
            exit;
        }
    }

    $stmt = $pdo->prepare("UPDATE users SET deleted_at = NOW() WHERE id = ? LIMIT 1");
    $ok = $stmt->execute([$id]);

    echo json_encode(['success' => (bool)$ok, 'message' => $ok ? 'Usuario marcado como eliminado' : 'No se pudo eliminar']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno: ' . $e->getMessage()]);
}
?>