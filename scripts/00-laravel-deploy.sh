#!/usr/bin/env bash

echo "🎯 Rodando deploy no Render"

echo "📦 Instalando dependências"
composer install --no-dev --optimize-autoloader

echo "📁 Garantindo permissões"
chmod -R 775 storage bootstrap/cache

echo "🚀 Rodando migrations"
php artisan migrate --force

echo "✅ Deploy pronto!"
