<?php
require 'db.php';
header('Content-Type: application/json');
// Lista usuarios con role = supervisor (usa la tabla users)
try {
    $stmt = $pdo->prepare("SELECT id, nombre, email, asignado_empresa FROM users WHERE role = 'supervisor' ORDER BY nombre");
    $stmt->execute();
    $supervisores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'supervisores' => $supervisores]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno: ' . $e->getMessage()]);
}
?>