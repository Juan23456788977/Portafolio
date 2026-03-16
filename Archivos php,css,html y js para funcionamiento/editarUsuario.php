<?php
// editarUsuario.php (permisos: admin = todo, moderador = puede gestionar pasante/supervisor)
// Requiere session con $_SESSION['user'] = ['id'=>..., 'role'=>..., 'email'=>...]
require 'db.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

if (empty($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || empty($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
    exit;
}

$actor = $_SESSION['user'];
$targetId = intval($data['id']);

// obtener rol del target actual (por si hace falta)
$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
$stmt->execute([$targetId]);
$target = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$target) {
    echo json_encode(['success' => false, 'message' => 'Usuario objetivo no encontrado']);
    exit;
}
$targetRole = $target['role'] ?? '';

// Permisos:
// - admin: puede editar todo.
// - moderador: puede editar usuarios de role pasante o supervisor.
// - otros: sólo pueden editarse a sí mismos (ya estaba la lógica).
if ($actor['role'] !== 'admin') {
    if ($actor['role'] === 'moderador') {
        if (!in_array($targetRole, ['pasante', 'supervisor'])) {
            echo json_encode(['success' => false, 'message' => 'Permisos insuficientes para editar este usuario']);
            exit;
        }
    } else {
        // ni admin ni moderador: sólo editarse a sí mismo
        if ($actor['id'] != $targetId) {
            echo json_encode(['success' => false, 'message' => 'Permisos insuficientes']);
            exit;
        }
    }
}

// Construir update dinámico (campos permitidos)
$fields = [];
$params = [];

if (isset($data['nombre'])) { $fields[] = "nombre = ?"; $params[] = trim($data['nombre']); }
if (isset($data['email'])) { $fields[] = "email = ?"; $params[] = strtolower(trim($data['email'])); }
// admin puede cambiar role; moderador no
if ($actor['role'] === 'admin' && isset($data['role'])) { $fields[] = "role = ?"; $params[] = trim($data['role']); }

// moderador/admin pueden actualizar nota/horas/asignado_empresa para pasantes
if (in_array($targetRole, ['pasante','supervisor']) || $actor['role'] === 'admin') {
    if (array_key_exists('nota', $data)) { $fields[] = "nota = ?"; $params[] = ($data['nota'] === '' ? null : intval($data['nota'])); }
    if (array_key_exists('horas_totales', $data)) { $fields[] = "horas_totales = ?"; $params[] = ($data['horas_totales'] === '' ? null : intval($data['horas_totales'])); }
    if (array_key_exists('horas_cumplidas', $data)) { $fields[] = "horas_cumplidas = ?"; $params[] = intval($data['horas_cumplidas']); }
    if (array_key_exists('asignado_empresa', $data)) { $fields[] = "asignado_empresa = ?"; $params[] = $data['asignado_empresa']; }
    if (array_key_exists('ubicacion_empresa', $data)) { $fields[] = "ubicacion_empresa = ?"; $params[] = $data['ubicacion_empresa']; }
    if (array_key_exists('empresa_id', $data)) { $fields[] = "empresa_id = ?"; $params[] = $data['empresa_id'] === '' ? null : intval($data['empresa_id']); }
}

// password: solo si actor = admin o actor es el propio usuario
if (!empty($data['password'])) {
    if ($actor['role'] === 'admin' || $actor['id'] == $targetId) {
        $hash = password_hash($data['password'], PASSWORD_DEFAULT);
        $fields[] = "password = ?";
        $params[] = $hash;
    } else {
        echo json_encode(['success' => false, 'message' => 'No autorizado a cambiar la contraseña']);
        exit;
    }
}

if (empty($fields)) {
    echo json_encode(['success' => false, 'message' => 'Nada para actualizar']);
    exit;
}

$params[] = $targetId;
$sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ? LIMIT 1";

try {
    $stmt = $pdo->prepare($sql);
    $ok = $stmt->execute($params);
    echo json_encode(['success' => (bool)$ok, 'message' => $ok ? 'Usuario actualizado' : 'No se pudo actualizar']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno: ' . $e->getMessage()]);
}
?>