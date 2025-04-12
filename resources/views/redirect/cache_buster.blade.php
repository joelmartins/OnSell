<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecionando...</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f8f9fa;
            flex-direction: column;
        }
        .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .message {
            text-align: center;
            max-width: 80%;
        }
        h2 {
            color: #333;
            margin-bottom: 10px;
        }
        p {
            color: #666;
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <div class="loader"></div>
    <div class="message">
        <h2>Processando sua solicitação</h2>
        <p>Você será redirecionado em instantes...</p>
    </div>

    <script>
        // Função para limpar o cache do navegador para essa página específica
        function clearPageCacheAndRedirect() {
            // URL para redirecionamento
            const redirectUrl = "{{ $redirectUrl }}";
            
            // Verificar se o navegador suporta a Cache API
            if ('caches' in window) {
                // Tentar limpar o cache para essa URL
                caches.keys().then(function(cacheNames) {
                    return Promise.all(
                        cacheNames.map(function(cacheName) {
                            return caches.open(cacheName).then(function(cache) {
                                return cache.delete(redirectUrl).then(function() {
                                    console.log('Cache limpo para: ' + redirectUrl);
                                });
                            });
                        })
                    );
                }).catch(function(error) {
                    console.error('Erro ao limpar cache:', error);
                }).finally(function() {
                    // Redirecionar para a URL desejada com parâmetro nocache para evitar cache
                    window.location.href = redirectUrl + (redirectUrl.includes('?') ? '&' : '?') + 'nocache=' + new Date().getTime();
                });
            } else {
                // Fallback para navegadores que não suportam Cache API
                window.location.href = redirectUrl + (redirectUrl.includes('?') ? '&' : '?') + 'nocache=' + new Date().getTime();
            }
        }

        // Iniciar o processo de redirecionamento após 1 segundo
        setTimeout(clearPageCacheAndRedirect, 1000);
    </script>
</body>
</html> 