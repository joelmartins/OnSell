<?php
$statusCode = isset($_GET['code']) ? (int) $_GET['code'] : 500;
$title = 'Erro ' . $statusCode;

$messages = [
    400 => 'Requisição inválida',
    401 => 'Não autorizado',
    403 => 'Acesso proibido',
    404 => 'Página não encontrada',
    500 => 'Erro interno do servidor',
    502 => 'Gateway inválido',
    503 => 'Serviço indisponível',
    504 => 'Tempo de resposta esgotado'
];

$message = isset($messages[$statusCode]) ? $messages[$statusCode] : 'Um erro ocorreu';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $title; ?></title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1a202c;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container {
            max-width: 480px;
            padding: 2rem;
            text-align: center;
            background-color: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #2d3748;
        }
        p {
            margin-bottom: 1.5rem;
            color: #4a5568;
        }
        .status-code {
            font-size: 5rem;
            font-weight: bold;
            color: #e53e3e;
            margin-top: 0;
            margin-bottom: 1rem;
        }
        .btn {
            display: inline-block;
            background-color: #4299e1;
            color: #fff;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            text-decoration: none;
            transition: background-color 0.2s;
        }
        .btn:hover {
            background-color: #3182ce;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status-code"><?php echo $statusCode; ?></div>
        <h1><?php echo $message; ?></h1>
        <p>Desculpe, mas algo não funcionou como esperado.</p>
        <a href="/" class="btn">Voltar à página inicial</a>
    </div>
</body>
</html> 