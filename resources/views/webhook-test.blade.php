<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste de Webhooks - OnSell</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f8fa;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        h1 {
            color: #3a86ff;
        }
        .content {
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .webhook-entry {
            background-color: #f9f9f9;
            border-left: 4px solid #3a86ff;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 20px;
            overflow-x: auto;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .no-webhooks {
            text-align: center;
            padding: 40px;
            color: #888;
            font-style: italic;
        }
        .refresh-button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3a86ff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .refresh-button:hover {
            background-color: #2a66cf;
        }
        .test-info {
            background-color: #e9f5ff;
            border: 1px solid #bee5eb;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 30px;
        }
        .test-info h3 {
            margin-top: 0;
            color: #0c5460;
        }
        .test-endpoint {
            font-family: monospace;
            background-color: #f1f1f1;
            padding: 5px 10px;
            border-radius: 4px;
            display: inline-block;
        }
        .auto-refresh {
            margin-top: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Teste de Webhooks - OnSell</h1>
    </div>
    
    <div class="content">
        <div class="test-info">
            <h3>Como testar webhooks</h3>
            <p>Use o Ngrok para expor seu servidor local e configure o serviço externo para enviar webhooks para:</p>
            <p class="test-endpoint">https://seu-tunnel-ngrok.io/webhook-test</p>
            <p>As requisições recebidas serão exibidas abaixo.</p>
        </div>
        
        <a href="{{ route('webhook.view') }}" class="refresh-button">Atualizar Lista</a>
        
        @if(count($webhooks) > 0)
            @foreach($webhooks as $webhook)
                <div class="webhook-entry">{{ $webhook }}</div>
            @endforeach
        @else
            <div class="no-webhooks">
                <p>Nenhum webhook recebido ainda.</p>
                <p>Configure o serviço externo para enviar webhooks para o endpoint de teste.</p>
            </div>
        @endif
        
        <div class="auto-refresh">
            Esta página será atualizada automaticamente a cada 30 segundos.
        </div>
    </div>
    
    <script>
        // Auto-refresh a página a cada 30 segundos
        setTimeout(function() {
            location.reload();
        }, 30000);
    </script>
</body>
</html> 