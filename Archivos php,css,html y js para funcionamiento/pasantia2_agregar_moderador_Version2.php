<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$nombre = trim($data['nombre'] ?? '');
$email = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';
$role = 'moderador';

if (!$nombre || !$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
    exit;
}

// Verifica si el correo ya existe
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'El correo ya está registrado']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO users (nombre, email, password, role) VALUES (?, ?, ?, ?)");
if ($stmt->execute([$nombre, $email, $hash, $role])) {
    echo json_encode(['success' => true, 'message' => 'Moderador agregado exitosamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al agregar moderador']);
}
// Después de insertar el usuario en la base de datos
require_once '../vendor/phpmailer/PHPMailerAutoload.php';
$mail = new PHPMailer();
$mail->isSMTP();
$mail->Host = 'smtp.tuservidor.com';
$mail->SMTPAuth = true;
$mail->Username = 'soporte@tudominio.com';
$mail->Password = 'TUPASS';
$mail->SMTPSecure = 'tls';
$mail->Port = 587;
$mail->setFrom('soporte@tudominio.com', 'Soporte PasantiConnect');
$mail->addAddress($emailNuevoUsuario);
$mail->Subject = '¡Bienvenido a PasantiConnect!';
$mail->Body = "Hola $nombre, tu cuenta ha sido registrada. Ya puedes iniciar sesión en https://tuweb.com";
$mail->send();