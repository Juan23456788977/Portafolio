<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$autor = trim($data['autor'] ?? '');
$texto = trim($data['texto'] ?? '');

if (!$autor || !$texto) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO testimonios (autor, texto) VALUES (?, ?)");
if ($stmt->execute([$autor, $texto])) {
    echo json_encode(['success' => true, 'message' => '¡Gracias por tu testimonio!']);
} else {
    echo json_encode(['success' => false, 'message' => 'No se pudo guardar']);
}