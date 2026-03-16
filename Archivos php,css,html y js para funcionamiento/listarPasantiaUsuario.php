<?php
header('Content-Type: application/json');
$email = $_GET['email'] ?? '';
$datos = [
    "nombre" => "Esteban Pasante",
    "email" => $email,
    "nota" => 8.5,
    "horas_totales" => 360,
    "horas_cumplidas" => 160,
    "asignado_empresa" => "TechPlus",
    "ubicacion_empresa" => "Córdoba"
];
echo json_encode(["success" => true, "pasante" => $datos]);