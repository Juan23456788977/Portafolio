<?php
require 'db.php';
header('Content-Type: application/json');
$stmt = $pdo->query("SELECT id, nombre, email FROM users WHERE role='supervisor'");
echo json_encode(['success'=>true, 'supervisores'=>$stmt->fetchAll()]);
?>