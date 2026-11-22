<?php
declare(strict_types=1);

// Aquí continúa el código original...


require __DIR__ . '/response.php';
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// CONSULTAR SOLICITUDES
if ($method === 'GET') {
    $sql = '
        SELECT
            id,
            code,
            requester,
            email,
            subject,
            category,
            priority,
            description,
            status,
            DATE_FORMAT(created_at, "%Y-%m-%d %H:%i") AS created_at
        FROM tickets
        ORDER BY id DESC
    ';

    $query = $pdo->query($sql);

    respond([
        'tickets' => $query->fetchAll()
    ]);
}

// REGISTRAR SOLICITUD
if ($method === 'POST') {
    $data = json_input();

    $name = trim($data['requester'] ?? '');
    $email = trim($data['email'] ?? '');
    $subject = trim($data['subject'] ?? '');
    $category = trim($data['category'] ?? '');
    $priority = trim($data['priority'] ?? '');
    $description = trim($data['description'] ?? '');

    if (
        !$name ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) ||
        !$subject ||
        !$category ||
        !$description
    ) {
        respond([
            'message' => 'Completa los campos y verifica el correo electrónico.'
        ], 422);
    }

    if (!in_array($priority, ['Baja', 'Media', 'Alta', 'Crítica'], true)) {
        respond([
            'message' => 'Prioridad no válida.'
        ], 422);
    }

    $code = 'ST-' . date('ymd') . '-' .
        strtoupper(bin2hex(random_bytes(2)));

    $sql = '
        INSERT INTO tickets (
            code,
            requester,
            email,
            subject,
            category,
            priority,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ';

    $query = $pdo->prepare($sql);

    $query->execute([
        $code,
        $name,
        $email,
        $subject,
        $category,
        $priority,
        $description
    ]);

    respond([
        'message' => 'Solicitud creada correctamente.',
        'id' => (int) $pdo->lastInsertId(),
        'code' => $code
    ], 201);
}

// EDITAR SOLICITUD
if ($method === 'PUT') {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    $data = json_input();

    if (!$id || $id < 1) {
        respond([
            'message' => 'Identificador no válido.'
        ], 422);
    }

    $name = trim($data['requester'] ?? '');
    $email = trim($data['email'] ?? '');
    $subject = trim($data['subject'] ?? '');
    $category = trim($data['category'] ?? '');
    $priority = trim($data['priority'] ?? '');
    $description = trim($data['description'] ?? '');

    if (
        !$name ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) ||
        !$subject ||
        !$category ||
        !$description
    ) {
        respond([
            'message' => 'Completa los campos y verifica el correo electrónico.'
        ], 422);
    }

    if (!in_array($priority, ['Baja', 'Media', 'Alta', 'Crítica'], true)) {
        respond([
            'message' => 'Prioridad no válida.'
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

    $sql = '
        UPDATE tickets
        SET
            requester = ?,
            email = ?,
            subject = ?,
            category = ?,
            priority = ?,
            description = ?
        WHERE id = ?
    ';

    $query = $pdo->prepare($sql);

    $query->execute([
        $name,
        $email,
        $subject,
        $category,
        $priority,
        $description,
        $id
    ]);

    respond([
        'message' => 'Solicitud actualizada correctamente.'
    ]);
}

header('Allow: GET, POST, PUT');

respond([
    'message' => 'Método no permitido.'
], 405);
