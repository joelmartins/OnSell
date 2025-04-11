<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documento Compartilhado</title>
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
        .document-box {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .document-icon {
            width: 40px;
            height: 40px;
            vertical-align: middle;
            margin-right: 10px;
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
        .message-box {
            border-left: 3px solid #4a86e8;
            padding-left: 15px;
            margin: 20px 0;
            font-style: italic;
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
        <img src="{{ asset('images/logo.png') }}" alt="OnSell Logo" class="logo">
        <h1>Documento Compartilhado</h1>
    </div>

    <div class="content">
        <p>Olá, <strong>{{ $destinatario->name }}</strong>!</p>
        
        <p><strong>{{ $remetente->name }}</strong> compartilhou um documento com você através do OnSell.</p>
        
        @if(!empty($mensagem))
        <div class="message-box">
            <p>"{{ $mensagem }}"</p>
        </div>
        @endif
        
        <div class="document-box">
            <svg class="document-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <strong>{{ $nomeDocumento }}</strong>
        </div>
        
        <p>Você pode acessar o documento clicando no botão abaixo:</p>
        
        <p style="text-align: center;">
            <a href="{{ $urlTemporaria }}" class="btn" target="_blank">Visualizar Documento</a>
        </p>
        
        <p><strong>Observação:</strong> Este link expirará em 24 horas por motivos de segurança.</p>
    </div>

    <div class="footer">
        <p>Este é um e-mail automático. Por favor, não responda.</p>
        <p>&copy; {{ date('Y') }} OnSell. Todos os direitos reservados.</p>
    </div>
</body>
</html> 