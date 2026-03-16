<?php
require 'db.php';
header('Content-Type: application/json');
$stmt = $pdo->query("SELECT id, nombre, email, nota, horas_totales, horas_cumplidas FROM users WHERE role='pasante' ORDER BY nombre");
echo json_encode(['success'=>true, 'pasantes'=>$stmt->fetchAll()]);
?>