<?php
header('Content-Type: application/json');
$json = json_decode(file_get_contents("php://input"), true);
$nombre = $json["nombre"] ?? "";
$texto = $json["texto"] ?? "";
if ($nombre && $texto) {
    // Aquí deberías guardar en la base de datos
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Campos incompletos"]);
}