#!/bin/bash

# Script para construir e implantar o aplicativo em produção
echo "=== Iniciando processo de build para produção ==="

# Limpar cache e diretórios temporários
echo "Limpando cache local..."
php artisan optimize:clear
php artisan view:clear
php artisan config:clear
php artisan route:clear
rm -rf public/build
rm -rf bootstrap/cache/*

# Configurar ambiente para produção
echo "Configurando ambiente para produção..."
export NODE_ENV=production
export VITE_APP_ENV=production
export FORCE_HTTPS=true

# Garantir que o diretório public seja gravável
echo "Configurando permissões..."
chmod -R 775 public
chmod -R 775 storage

# Construir assets (sem tentar reinstalar as dependências)
echo "Construindo assets..."
npx vite build

# Verificar se o build foi bem-sucedido
if [ ! -f "public/build/manifest.json" ]; then
    echo "ERRO: Build falhou, manifest.json não encontrado!"
    exit 1
fi

echo "Build concluído com sucesso."

# Criar arquivo para indicar que o build foi gerado localmente
echo "$(date)" > public/build/.build-timestamp

echo "=== Build para produção concluído com sucesso! ==="
echo ""
echo "Para implantar em produção, faça commit dos seguintes diretórios:"
echo "- public/build"
echo ""
echo "Comando sugerido:"
echo "git add public/build"
echo "git commit -m \"Build otimizado para produção\""
echo "git push origin main"
echo ""
echo "O servidor de produção usará esses arquivos estáticos sem precisar rodar npm." 