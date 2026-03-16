<?php
// registrarEmpresa.php (acepta cupo)
require 'db.php';
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) exit(json_encode(['success'=>false, 'message'=>'Datos inválidos']));

$nombre = trim($data['nombre'] ?? '');
$importancia = $data['importancia'] ?? '';
$ubicacion = trim($data['ubicacion'] ?? '');
$cupo = isset($data['cupo']) && $data['cupo'] !== '' ? intval($data['cupo']) : null;

if (!$nombre || !$importancia) {
    echo json_encode(['success'=>false, 'message'=>'Faltan campos requeridos']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO empresas (nombre, importancia, ubicacion, cupo) VALUES (?, ?, ?, ?)");
    $stmt->execute([$nombre, $importancia, $ubicacion, $cupo]);
    echo json_encode(['success'=>true, 'message'=>'Empresa registrada']);
} catch (Exception $e) {
    echo json_encode(['success'=>false, 'message'=>'Error interno']);
}
?>