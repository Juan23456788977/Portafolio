<?php
header('Content-Type: application/json');
require_once 'db.php';
require_once '../vendor/phpmailer/PHPMailerAutoload.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = strtolower(trim($data['email'] ?? ''));

$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'No existe ese correo']);
    exit;
}
$token = bin2hex(random_bytes(32));
$expiry = date("Y-m-d H:i:s", strtotime('+1 hour'));
$pdo->prepare("UPDATE usuarios SET reset_token=?, reset_expiry=? WHERE id=?")
    ->execute([$token, $expiry, $user['id']]);

$mail = new PHPMailer();
$mail->isSMTP();
$mail->Host = 'smtp.tuservidor.com';
$mail->SMTPAuth = true;
$mail->Username = 'soporte@tudominio.com';
$mail->Password = 'TUPASS';
$mail->SMTPSecure = 'tls';
$mail->Port = 587;
$mail->setFrom('soporte@tudominio.com', 'Soporte PasantiConnect');
$mail->addAddress($email);
$mail->Subject = 'Recupera tu contraseña';
$mail->Body = "Haz clic aquí para reestablecer tu contraseña: https://tuweb.com/reset_password.php?token=$token";

if ($mail->send()) {
    echo json_encode(['success' => true, 'message' => 'Correo de recuperación enviado']);
} else {
    echo json_encode(['success' => false, 'message' => 'No se pudo enviar el correo']);
}