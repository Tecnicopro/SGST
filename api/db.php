<?php
declare(strict_types=1);


$c = require __DIR__ . '/env.php';

try {
    $pdo = new PDO(
        "mysql:host={$c['db_host']};dbname={$c['db_name']};charset=utf8mb4",
        $c['db_user'],
        $c['db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    error_log('Error de conexión MySQL: ' . $e->getMessage());

    require_once __DIR__ . '/response.php';

    respond([
        'message' => 'No se pudo conectar con la base de datos.'
    ], 500);
}