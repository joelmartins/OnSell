<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boas-vindas à {{ $agency->name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 20px;
        }
        .content {
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .credentials-box {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .password {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 16px;
            letter-spacing: 1px;
            text-align: center;
        }
        .btn {
            display: inline-block;
            background-color: #4a86e8;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            margin-top: 30px;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ asset('images/logo.png') }}" alt="{{ $agency->name }} Logo" class="logo">
        <h1>Boas-vindas, {{ $user->name }}!</h1>
    </div>

    <div class="content">
        <p>Olá, <strong>{{ $user->name }}</strong>!</p>
        
        <p>Bem-vindo(a) à plataforma <strong>{{ $agency->name }}</strong>! Estamos animados em ter você conosco.</p>
        
        <p>Sua conta foi criada com sucesso, e você já pode começar a utilizar nossa plataforma. Aqui estão suas credenciais de acesso:</p>
        
        <div class="credentials-box">
            <p><strong>Email:</strong> {{ $user->email }}</p>
            <p><strong>Senha temporária:</strong></p>
            <p class="password">{{ $password }}</p>
            <p><em>Por questões de segurança, recomendamos que você altere sua senha após o primeiro acesso.</em></p>
        </div>
        
        <p>Para acessar a plataforma, clique no botão abaixo:</p>
        
        <p style="text-align: center;">
            <a href="{{ $loginUrl }}" class="btn" target="_blank">Acessar a Plataforma</a>
        </p>
        
        <p>Se você tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato com nossa equipe de suporte.</p>
    </div>

    <div class="footer">
        <p>Este é um e-mail automático. Por favor, não responda.</p>
        <p>&copy; {{ date('Y') }} {{ $agency->name }}. Todos os direitos reservados.</p>
    </div>
</body>
</html> 