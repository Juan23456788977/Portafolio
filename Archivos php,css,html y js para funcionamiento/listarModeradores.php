<?php
require 'db.php';
header('Content-Type: application/json');
$stmt = $pdo->query("SELECT id, nombre, email FROM users WHERE role='moderador'");
echo json_encode(['success'=>true, 'moderadores'=>$stmt->fetchAll()]);
?>