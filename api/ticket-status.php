<?php
declare(strict_types=1);

// Aquí continúa el código original...


require __DIR__ . '/response.php';
require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    header('Allow: PATCH');

    respond([
        'message' => 'Método no permitido.'
    ], 405);
}

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$data = json_input();

$status = trim($data['status'] ?? '');

if (!$id || $id < 1) {
    respond([
        'message' => 'Identificador no válido.'
    ], 422);
}

$validStatuses = [
    'Abierto',
    'En proceso',
    'Resuelto',
    'Cerrado'
];

if (!in_array($status, $validStatuses, true)) {
    respond([
        'message' => 'Estado no válido.'
    ], 422);
}

$check = $pdo->prepare(
    'SELECT id FROM tickets WHERE id = ?'
);

$check->execute([$id]);

if (!$check->fetch()) {
    respond([
        'message' => 'La solicitud no existe.'
    ], 404);
}

$query = $pdo->prepare(
    'UPDATE tickets SET status = ? WHERE id = ?'
);

$query->execute([$status, $id]);

respond([
    'message' => 'Estado actualizado correctamente.'
]);
