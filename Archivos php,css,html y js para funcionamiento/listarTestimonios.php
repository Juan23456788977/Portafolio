<?php
header('Content-Type: application/json');
require_once 'db.php';

$stmt = $pdo->query("SELECT autor, texto, fecha FROM testimonios ORDER BY fecha DESC LIMIT 50");
$testimonios = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'testimonios' => $testimonios]);