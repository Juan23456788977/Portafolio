<?php
require 'db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

$actor = $_SESSION['user'] ?? null;
if (!$actor) {
    echo json_encode(['success'=>false, 'message'=>'No autenticado']);
    exit;
}
if (!in_array($actor['role'], ['admin', 'moderador'])) {
    echo json_encode(['success'=>false, 'message'=>'Permisos insuficientes']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) {
    echo json_encode(['success'=>false,'message'=>'JSON inválido']);
    exit;
}

$nombre = trim($data['nombre'] ?? '');
$email = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';

if ($nombre === '' || $email === '') {
    echo json_encode(['success'=>false,'message'=>'Faltan nombre o email']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success'=>false,'message'=>'Email inválido']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success'=>false,'message'=>'Ya existe un usuario con ese email']);
        exit;
    }

    if ($password === '') $password = bin2hex(random_bytes(4));
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $ins = $pdo->prepare("INSERT INTO users (nombre, email, password, role, created_at) VALUES (?, ?, ?, 'supervisor', NOW())");
    $ok = $ins->execute([$nombre, $email, $hash]);

    if ($ok) {
        $userId = $pdo->lastInsertId();
        echo json_encode(['success'=>true,'message'=>'Supervisor creado','user_id'=>intval($userId)]);
    } else {
        echo json_encode(['success'=>false,'message'=>'No se pudo crear usuario']);
    }
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>'Error interno']);
}
?>