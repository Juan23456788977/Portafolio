<?php
header("Content-Type: application/json; charset=UTF-8");
$data = json_decode(file_get_contents("php://input"), true);

$nombre = trim($data['nombre'] ?? '');
$email = trim($data['email'] ?? '');
$tel = trim($data['tel'] ?? '');
$msg = trim($data['msg'] ?? '');

if(!$nombre || !$email || !$msg) {
    echo json_encode(["success"=>false,"message"=>"Campos obligatorios vacíos."]);
    exit;
}

$to = "info@pasanticonnect.com"; // Cambia por tu correo real
$subject = "Nuevo mensaje de contacto desde PasantiConnect";
$body = "Nombre: $nombre\nCorreo: $email\nTeléfono: $tel\nMensaje:\n$msg\n";
$headers = "From: $email\r\nReply-To: $email\r\n";

$success = mail($to, $subject, $body, $headers);

echo json_encode([ "success" => $success ]);