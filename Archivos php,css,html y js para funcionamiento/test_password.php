<?php
// Pega aquí el hash EXACTO que tienes en tu base de datos
$hash = '$2y$10$56QToIZ58jy7JBy8tgnJeu3UVa1uSdZRgiOqiX8O0VJylt/2nFJoa';

// Contraseña a probar:
$prueba = 'admin123';

if(password_verify($prueba, $hash)){
    echo "OK: la clave admin123 es válida para ese hash.";
} else {
    echo "FALLO: la clave admin123 NO es válida para ese hash.";
}
?>