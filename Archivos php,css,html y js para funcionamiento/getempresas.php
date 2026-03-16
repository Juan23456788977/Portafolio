<?php
require 'db.php';
header('Content-Type: application/json');
$stmt = $pdo->query("SELECT id, nombre, importancia, ubicacion FROM empresas ORDER BY nombre");
echo json_encode(['success'=>true, 'empresas'=>$stmt->fetchAll()]);
?>