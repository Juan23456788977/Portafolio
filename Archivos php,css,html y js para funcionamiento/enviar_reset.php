<?php
header("Content-Type: application/json; charset=UTF-8");
$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');

if(!$email) {
    echo json_encode(["success"=>false,"message"=>"Campo obligatorio vacío."]);
    exit;
}

$to = $email;
$subject = "Recuperación de contraseña - PasantiConnect";
$link = "https://tusitio.com/reestablecer.php?token=EJEMPLO123"; // Cambia por link real con token
$body = "Recibiste este correo porque solicitaste reestablecer tu contraseña en PasantiConnect.\n\n";
$body .= "Haz clic en el siguiente enlace para continuar:\n$link\n\n";
$body .= "Si no solicitaste esto, ignora este correo.\n";
$headers = "From: info@pasanticonnect.com\r\n";

$success = mail($to, $subject, $body, $headers);

echo json_encode([ "success" => $success ]);