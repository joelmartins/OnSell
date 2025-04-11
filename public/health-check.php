<?php
// Arquivo simples para verificação de saúde do Render
header('Content-Type: application/json');
echo json_encode([
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'environment' => getenv('APP_ENV'),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
]);
exit(0); 