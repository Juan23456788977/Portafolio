<?php
require 'db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

try {
    $stmt = $pdo->prepare("SELECT id, nombre, email FROM users WHERE role = 'supervisor' AND deleted_at IS NULL ORDER BY nombre ASC");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success'=>true, 'supervisores'=>$rows]);
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>'Error interno']);
}
?>