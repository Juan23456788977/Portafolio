<?php
// editarEmpresa.php (actualizado para recibir cupo)
require 'db.php';
header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['id'])) {
    echo json_encode(['success'=>false, 'message'=>'Datos incompletos']);
    exit;
}

$id = intval($data['id']);
$nombre = $data['nombre'] ?? null;
$importancia = $data['importancia'] ?? null;
$ubicacion = $data['ubicacion'] ?? null;
$cupo = array_key_exists('cupo', $data) ? ($data['cupo'] === '' ? null : intval($data['cupo'])) : null;

$fields = [];
$params = [];
if ($nombre !== null) { $fields[] = "nombre = ?"; $params[] = $nombre; }
if ($importancia !== null) { $fields[] = "importancia = ?"; $params[] = $importancia; }
if ($ubicacion !== null) { $fields[] = "ubicacion = ?"; $params[] = $ubicacion; }
if (array_key_exists('cupo', $data)) { $fields[] = "cupo = ?"; $params[] = $cupo; }

if (empty($fields)) {
    echo json_encode(['success'=>false,'message'=>'Nada para actualizar']);
    exit;
}

$params[] = $id;
$stmt = $pdo->prepare("UPDATE empresas SET " . implode(', ', $fields) . " WHERE id = ?");
$ok = $stmt->execute($params);
echo json_encode(['success'=>$ok, 'message'=>$ok?'Empresa actualizada':'Error al actualizar']);
?>