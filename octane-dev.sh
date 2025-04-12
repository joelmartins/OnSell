#!/bin/bash

# Limpar o cache de configuração para desenvolvimento
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Iniciar o servidor Octane com FrankenPHP
php artisan octane:start --server=frankenphp --host=127.0.0.1 --port=8000 --watch 