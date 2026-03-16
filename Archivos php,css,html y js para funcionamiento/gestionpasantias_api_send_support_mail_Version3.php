<?php
require_once '../vendor/phpmailer/PHPMailerAutoload.php';
$data = json_decode(file_get_contents('php://input'), true);

$mail = new PHPMailer();
$mail->isSMTP();
$mail->Host = 'smtp.tuservidor.com'; // Cambia por tu SMTP real
$mail->SMTPAuth = true;
$mail->Username = 'soporte@tudominio.com'; // Cambia por tu correo real
$mail->Password = 'TUPASS'; // Cambia por tu contraseña real
$mail->SMTPSecure = 'tls';
$mail->Port = 587;
$mail->setFrom($data['email'], $data['nombre']);
$mail->addAddress('soporte@tudominio.com'); // Cambia por tu correo real
$mail->Subject = 'Contacto desde la web PasantiConnect';
$mail->Body = $data['mensaje'];
if ($mail->send()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'No se pudo enviar']);
}