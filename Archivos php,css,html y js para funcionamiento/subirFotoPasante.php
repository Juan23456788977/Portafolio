<?php
require 'db.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['foto']) && isset($_POST['email'])) {
    $email = $_POST['email'];
    $file = $_FILES['foto'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg','jpeg','png','gif'])) {
        echo json_encode(['success'=>false, 'message'=>'Formato no permitido']);
        exit;
    }
    $nombreArchivo = 'fotos/pasante_' . md5($email . time()) . '.' . $ext;
    if (!is_dir('fotos')) mkdir('fotos');
    if (move_uploaded_file($file['tmp_name'], $nombreArchivo)) {
        $stmt = $pdo->prepare("UPDATE pasantes SET foto=? WHERE email=?");
        $stmt->execute([$nombreArchivo, $email]);
        echo json_encode(['success'=>true, 'foto'=>$nombreArchivo]);
    } else {
        echo json_encode(['success'=>false, 'message'=>'Error al subir']);
    }
} else {
    echo json_encode(['success'=>false, 'message'=>'Petición inválida']);
}
?>