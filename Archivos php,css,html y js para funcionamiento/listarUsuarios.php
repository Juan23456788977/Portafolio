<?php
require 'db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

$user = $_SESSION['user'] ?? null;
if (!$user) {
    echo json_encode(['success'=>false, 'message'=>'No autenticado']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $other = isset($_GET['conversation_with']) ? intval($_GET['conversation_with']) : 0;
        if (!$other) { echo json_encode(['success'=>false,'message'=>'conversation_with faltante']); exit; }

        $sql = "SELECT m.id, m.sender_id, m.recipient_id, m.message, m.created_at, u.nombre AS sender_nombre
                FROM messages m
                LEFT JOIN users u ON u.id = m.sender_id
                WHERE ((m.sender_id = :me AND m.recipient_id = :other) OR (m.sender_id = :other AND m.recipient_id = :me))
                ORDER BY m.created_at ASC
                LIMIT 1000";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['me' => $user['id'], 'other' => $other]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success'=>true, 'messages'=>$rows]);
        exit;
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        if (!$data) { echo json_encode(['success'=>false,'message'=>'JSON inválido']); exit; }
        $recipient = intval($data['recipient_id'] ?? 0);
        $message = trim($data['message'] ?? '');
        if (!$recipient || $message === '') { echo json_encode(['success'=>false,'message'=>'recipient_id y message requeridos']); exit; }

        $st = $pdo->prepare("SELECT id FROM users WHERE id = ? LIMIT 1");
        $st->execute([$recipient]);
        if (!$st->fetch()) { echo json_encode(['success'=>false,'message'=>'Destinatario no encontrado']); exit; }

        $ins = $pdo->prepare("INSERT INTO messages (sender_id, recipient_id, message, created_at) VALUES (?, ?, ?, NOW())");
        $ok = $ins->execute([$user['id'], $recipient, $message]);
        if ($ok) {
            $mid = $pdo->lastInsertId();
            $q = $pdo->prepare("SELECT m.id, m.sender_id, m.recipient_id, m.message, m.created_at, u.nombre AS sender_nombre FROM messages m LEFT JOIN users u ON u.id = m.sender_id WHERE m.id = ? LIMIT 1");
            $q->execute([$mid]);
            $mrow = $q->fetch(PDO::FETCH_ASSOC);
            echo json_encode(['success'=>true,'message'=>'Enviado','data'=>$mrow]);
        } else {
            echo json_encode(['success'=>false,'message'=>'No se pudo enviar']);
        }
        exit;
    }

    echo json_encode(['success'=>false,'message'=>'Método no permitido']);
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>'Error interno']);
}
?>