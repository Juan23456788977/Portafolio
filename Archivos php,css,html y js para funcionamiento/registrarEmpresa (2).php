<?php
// registerEmpresa.php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$required = ['nombre', 'importancia', 'ubicacion'];
$data = json_decode(file_get_contents('php://input'), true);

foreach ($required as $field) {
    if (!isset($data[$field])) {
        echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
        exit;
    }
}

$nombre = trim($data['nombre']);
$importancia = $data['importancia'];
$ubicacion = trim($data['ubicacion']);

$nivelesValidos = ['Importante', 'Medio importante', 'No tan importante'];
if (!in_array($importancia, $nivelesValidos)) {
    echo json_encode(['success' => false, 'message' => 'Nivel de importancia inválido']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM empresas WHERE nombre = ?");
    $stmt->execute([$nombre]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Ya existe una empresa con ese nombre']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO empresas (nombre, importancia, ubicacion) VALUES (?, ?, ?)");
    $stmt->execute([$nombre, $importancia, $ubicacion]);

    echo json_encode(['success' => true, 'message' => 'Empresa agregada correctamente']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
}
?>
