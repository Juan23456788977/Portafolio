<?php
//db.php
header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$db   = 'gestion_pasantias';
$user = 'root';
$pass = '';

$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    echo json_encode(['error' => "Error de conexión a la base de datos."]);
    exit;
}
?>
