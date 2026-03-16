<?php
// subirFotoUsuario.php — subir avatar/foto y actualizar users.foto (permite id o email)
require 'db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

// Permisos: admin o el propio usuario pueden subir su foto
$actor = $_SESSION['user'] ?? null;
if (!$actor) {
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['foto'])) {
    echo json_encode(['success' => false, 'message' => 'Petición inválida']);
    exit;
}

$targetId = $_POST['id'] ?? null;
$targetEmail = isset($_POST['email']) ? strtolower(trim($_POST['email'])) : null;

// Check ownership/permission
if (!$targetId && !$targetEmail) {
    echo json_encode(['success' => false, 'message' => 'Falta id o email']);
    exit;
}

// If actor is not admin, ensure they are updating their own profile
if ($actor['role'] !== 'admin') {
    if ($targetId && $actor['id'] != intval($targetId)) {
        echo json_encode(['success' => false, 'message' => 'Permisos insuficientes']);
        exit;
    }
    if ($targetEmail && $actor['email'] !== $targetEmail) {
        echo json_encode(['success' => false, 'message' => 'Permisos insuficientes']);
        exit;
    }
}

$file = $_FILES['foto'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ['jpg','jpeg','png','gif'])) {
    echo json_encode(['success' => false, 'message' => 'Formato no permitido']);
    exit;
}

$baseDir = 'fotos';
if (!is_dir($baseDir)) mkdir($baseDir, 0755, true);
$hashName = ($targetEmail ?? $targetId) . '_' . time();
$nombreArchivo = $baseDir . '/user_' . preg_replace('/[^a-z0-9_.-]/i','_', $hashName) . '.' . $ext;

if (!move_uploaded_file($file['tmp_name'], $nombreArchivo)) {
    echo json_encode(['success' => false, 'message' => 'Error al mover archivo']);
    exit;
}

// Guardar ruta en users.foto (intenta por id, si no por email)
try {
    if ($targetId) {
        $stmt = $pdo->prepare("UPDATE users SET foto = ? WHERE id = ? LIMIT 1");
        $ok = $stmt->execute([$nombreArchivo, intval($targetId)]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET foto = ? WHERE email = ? LIMIT 1");
        $ok = $stmt->execute([$nombreArchivo, $targetEmail]);
    }
    echo json_encode(['success' => (bool)$ok, 'foto' => $nombreArchivo]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno']);
}
?>