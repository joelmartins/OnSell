#!/usr/bin/env bash

echo "🐘 Instalando dependências PHP com Composer..."
composer install --no-dev --optimize-autoloader

echo "🔧 Executando migrations..."
php artisan migrate --force

echo "📂 Configurando permissões..."
chmod -R 775 storage bootstrap/cache

echo "📦 Build dos assets com npm..."
npm install
npm run build

echo "✅ Deploy Laravel finalizado!"