<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? config('app.name') }}</title>
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
        .info-box {
            background-color: #e8f4fd;
            border: 1px solid #b3e5fc;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .alert-box {
            background-color: #fff8e1;
            border: 1px solid #ffe0b2;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
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
        <img src="{{ asset('images/logo.png') }}" alt="{{ config('app.name') }} Logo" class="logo">
        <h1>@yield('title')</h1>
    </div>

    <div class="content">
        @yield('content')
    </div>

    <div class="footer">
        <p>Este é um e-mail automático. Por favor, não responda.</p>
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Todos os direitos reservados.</p>
    </div>
</body>
</html> 