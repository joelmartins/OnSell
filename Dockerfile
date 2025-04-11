# Etapa 1: Build dos assets com Node.js
FROM node:18 AS node-builder

WORKDIR /app

# Copia só os arquivos necessários pro build do frontend
COPY package*.json ./
RUN npm install

COPY resources/ resources/
COPY vite.config.js ./
COPY public/ public/
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY .env ./
COPY artisan ./

# Garante que tenha as views (úteis pro SSR ou build)
COPY resources/views/ resources/views/

# Faz o build dos assets (vite)
RUN npm run build

# Etapa 2: Imagem final com PHP + Laravel
FROM php:8.3-fpm

# Instala extensões necessárias
RUN apt-get update && apt-get install -y \
    zip unzip curl git libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip

# Instala Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copia app Laravel
COPY . .

# Copia os assets construídos da etapa do Node
COPY --from=node-builder /app/public /var/www/public

# Instala dependências do Laravel
RUN composer install --no-dev --optimize-autoloader

# Permissões para o Laravel funcionar corretamente
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]