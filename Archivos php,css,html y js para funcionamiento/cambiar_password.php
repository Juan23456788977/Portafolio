<?php
require 'db.php';

// Datos del usuario y la nueva clave
$email = 'admin@empresa.com'; // Cambia esto por el correo del usuario
$nueva_clave = 'admin123'; // Cambia esto por la nueva clave que quieras poner

// Genera el hash seguro para la nueva clave
$hash = password_hash($nueva_clave, PASSWORD_DEFAULT);

// Actualiza la clave en la base de datos
$stmt = $pdo->prepare("UPDATE users SET password=? WHERE email=?");
if ($stmt->execute([$hash, $email])) {
    echo "Contraseña actualizada correctamente para $email";
} else {
    echo "Error al actualizar la contraseña.";
}
?>