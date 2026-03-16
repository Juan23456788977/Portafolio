<?php
require_once 'db.php';
$token = $_GET['token'] ?? '';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['token'];
    $pass = $_POST['password'];
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE reset_token=? AND reset_expiry>NOW()");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user) {
        $hash = password_hash($pass, PASSWORD_DEFAULT);
        $pdo->prepare("UPDATE usuarios SET password=?, reset_token=NULL, reset_expiry=NULL WHERE id=?")
            ->execute([$hash, $user['id']]);
        $success = true;
    } else {
        $error = "Token inválido o expirado.";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Recuperar contraseña</title>
    <style>
      body {background:#222;color:#ffd700;font-family:sans-serif;text-align:center;padding-top:60px;}
      form {background:#333;padding:24px 30px 18px 30px;border-radius:11px;display:inline-block}
      input[type=password]{padding:10px;font-size:1.12em;border-radius:7px;border:none;margin:12px 0;width:220px;}
      button {background:#ffd700;color:#222;padding:10px 28px;border-radius:7px;border:none;font-weight:700;font-size:1.1em;}
      .msg {margin-top:18px;}
    </style>
</head>
<body>
  <h2>Recuperar contraseña</h2>
  <?php if(!empty($token) && empty($success)): ?>
    <form method="POST">
      <input type="hidden" name="token" value="<?=htmlspecialchars($token)?>">
      <input type="password" name="password" placeholder="Nueva contraseña" required><br>
      <button type="submit">Cambiar contraseña</button>
    </form>
    <div class="msg" style="color:#bb0000"><?=$error?></div>
  <?php elseif(!empty($success)): ?>
    <div class="msg" style="color:#00bb00">¡Contraseña cambiada! <a href="/">Iniciar sesión</a></div>
  <?php else: ?>
    <div class="msg" style="color:#bb0000">Token inválido o expirado.</div>
  <?php endif; ?>
</body>
</html>