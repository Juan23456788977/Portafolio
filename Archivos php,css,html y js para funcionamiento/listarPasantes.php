<?php
require 'db.php';
header('Content-Type: application/json');
// Selecciona pasantes desde la tabla users (role='pasante')
try {
    $stmt = $pdo->prepare("SELECT id, nombre, email, nota, horas_totales, horas_cumplidas, asignado_empresa, ubicacion_empresa FROM users WHERE role = 'pasante' ORDER BY nombre");
    $stmt->execute();
    $pasantes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'pasantes' => $pasantes]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno: ' . $e->getMessage()]);
}
?>