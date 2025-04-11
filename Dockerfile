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

# Etapa 2: Build intermediário do PHP com dependências
FROM php:8.3-cli AS php-builder

# Instala dependências do sistema e extensões PHP
RUN apt-get update && apt-get install -y \
    zip unzip curl git libonig-dev libxml2-dev libzip-dev libpq-dev libssl-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip

# Instala Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copia os arquivos do projeto
COPY . .

# Instala dependências PHP com cache (usando arquivo separado primeiro)
COPY composer.* ./
RUN composer install --no-dev --optimize-autoloader

# Etapa 3: Imagem final reduzida (slim, sem ferramentas de build)
FROM php:8.3-cli AS app

# Evita rodar como root
USER www-data

WORKDIR /var/www

# Copia o PHP e o vendor do build intermediário
COPY --from=php-builder --chown=www-data:www-data /var/www /var/www

# Copia apenas os assets finalizados do node
COPY --from=node-builder --chown=www-data:www-data /app/public /var/www/public

# Instala Swoole sem Brotli (para evitar erro no build)
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl-dev \
    && pecl install swoole --configureoptions="--enable-brotli=no" \
    && docker-php-ext-enable swoole \
    && apt-get purge -y --auto-remove libssl-dev && rm -rf /var/lib/apt/lists/*

# Ajusta permissões finais
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8080

CMD ["php", "artisan", "octane:start", "--server=swoole", "--host=0.0.0.0", "--port=8080"]
