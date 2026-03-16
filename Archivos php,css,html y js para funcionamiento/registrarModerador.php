<?php
// registerModerador.php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['nombre'], $data['email'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
    exit;
}

$nombre = trim($data['nombre']);
$email = strtolower(trim($data['email']));
$password = $data['password'];

if (empty($nombre) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Complete todos los campos']);
    exit;
}

try {
    // Verificar si ya existe moderador o usuario con ese email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Ya existe un usuario con ese email']);
        exit;
    }

    // Crear hash de la contraseña
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Insertar moderador
    $stmt = $pdo->prepare("INSERT INTO users (nombre, email, password, role) VALUES (?, ?, ?, 'moderador')");
    $stmt->execute([$nombre, $email, $passwordHash]);

    echo json_encode(['success' => true, 'message' => 'Moderador agregado correctamente']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
}
?>
