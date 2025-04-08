<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecionando...</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 90%;
        }
        h1 {
            font-size: 1.5rem;
            color: #333;
            margin-bottom: 1rem;
        }
        p {
            color: #666;
            margin-bottom: 2rem;
        }
        .loader {
            display: inline-block;
            width: 2rem;
            height: 2rem;
            border: 0.25rem solid rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            border-top-color: rgba(59, 130, 246, 1);
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 1rem;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="loader"></div>
        <h1>Redirecionando para área do cliente</h1>
        <p>Por favor, aguarde enquanto configuramos seu acesso...</p>
    </div>
    
    <script>
        // Usar setTimeout para garantir que a sessão seja inicializada corretamente
        setTimeout(function() {
            window.location.href = "{{ $redirect_to }}";
        }, 1000);
    </script>
</body>
</html>
