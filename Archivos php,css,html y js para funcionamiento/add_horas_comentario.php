<?php
require 'db.php';
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

$pasante_id = $data['pasante_id'] ?? '';
$horas = intval($data['horas'] ?? 0);
$comentario = trim($data['comentario'] ?? '');
$supervisor = trim($data['supervisor'] ?? '');

$stmt = $pdo->prepare("UPDATE users SET horas_cumplidas=? WHERE id=?");
$stmt->execute([$horas, $pasante_id]);

if($comentario) {
  $stmt2 = $pdo->prepare("INSERT INTO pasante_comentarios (pasante_id, supervisor_email, comentario) VALUES (?, ?, ?)");
  $stmt2->execute([$pasante_id, $supervisor, $comentario]);
}

echo json_encode(['success'=>true]);
?>