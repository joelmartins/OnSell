# Etapa 1: Build dos assets com Node.js
FROM node:18 AS node-builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY resources/ resources/
COPY vite.config.js ./
COPY public/ public/
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY artisan ./

RUN npm run build

# Etapa 2: Imagem final com PHP + Octane
FROM php:8.3-cli

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    zip unzip curl git libonig-dev libxml2-dev libzip-dev libpq-dev libssl-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip

# Instala Swoole via PECL (requerido pelo Octane)
RUN pecl install swoole && docker-php-ext-enable swoole

# Instala Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copia código da aplicação
COPY . .

# Copia assets prontos da etapa Node
COPY --from=node-builder /app/public /var/www/public

# Instala dependências do Laravel (produção)
RUN composer install --no-dev --optimize-autoloader

# Permissões para storage e cache
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Porta usada pelo Octane/Swoole
EXPOSE 8080

# Comando de inicialização
CMD ["php", "artisan", "octane:start", "--server=swoole", "--host=0.0.0.0", "--port=8080"]
