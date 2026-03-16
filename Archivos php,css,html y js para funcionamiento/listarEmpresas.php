<?php
// listarEmpresas.php (devuelve cupo)
header('Content-Type: application/json');
require 'db.php';
$res = $pdo->query("SELECT id, nombre, importancia, ubicacion, COALESCE(cupo, NULL) AS cupo, COALESCE(lat, NULL) AS lat, COALESCE(lng, NULL) AS lng FROM empresas ORDER BY nombre");
echo json_encode(['success'=>true, 'empresas'=>$res->fetchAll()]);
?>