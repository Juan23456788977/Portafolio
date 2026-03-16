<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$role = $data['role'] ?? 'pasante'; // por defecto pasante
$required = ['nombre', 'email', 'password'];

foreach ($required as $field) {
    if (!isset($data[$field])) {
        echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
        exit;
    }
}

$nombre = trim($data['nombre']);
$email = strtolower(trim($data['email']));
$password = $data['password'];

// Opcionales para pasantes
$nota = isset($data['nota']) ? intval($data['nota']) : null;
$horasTotales = isset($data['horasTotales']) ? intval($data['horasTotales']) : null;

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Ya existe un usuario con ese email']);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $query = "INSERT INTO users (nombre, email, password, role";
    $values = "?, ?, ?, ?";
    $params = [$nombre, $email, $passwordHash, $role];
    if ($role == 'pasante') {
        $query .= ", nota, horas_totales, horas_cumplidas";
        $values .= ", ?, ?, 0";
        $params[] = $nota;
        $params[] = $horasTotales;
    }
    $query .= ") VALUES ($values)";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'message' => ucfirst($role) . ' agregado correctamente']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
}
?>