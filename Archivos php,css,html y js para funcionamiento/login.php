<?php
// login.php (actualizado): inicia sesión en PHP y devuelve el usuario sin password
header('Content-Type: application/json; charset=utf-8');
require 'db.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['email'], $data['password'], $data['role'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
    exit;
}

$email = strtolower(trim($data['email']));
$password = $data['password'];
$role = $data['role'];

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND role = ?");
    $stmt->execute([$email, $role]);
    $user = $stmt->fetch();
    if ($user && password_verify($password, $user['password'])) {
        // set session safe info (no password)
        unset($user['password']);
        $_SESSION['user'] = [
            'id' => $user['id'],
            'role' => $user['role'],
            'nombre' => $user['nombre'],
            'email' => $user['email']
        ];
        echo json_encode(['success' => true, 'user' => $_SESSION['user']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
}
?>