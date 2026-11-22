
<?php
declare(strict_types=1);

require __DIR__ . '/response.php';
require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    header('Allow: DELETE');

    respond([
        'message' => 'Método no permitido.'
    ], 405);
}

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if (!$id || $id < 1) {
    respond([
        'message' => 'Identificador no válido.'
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
    'DELETE FROM tickets WHERE id = ?'
);

$query->execute([$id]);

respond([
    'message' => 'Solicitud eliminada correctamente.'
]);
