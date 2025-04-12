FROM dunglas/frankenphp:latest

# Config
ENV PHP_MEMORY_LIMIT=256M \
    PHP_MAX_EXECUTION_TIME=30 \
    PHP_UPLOAD_MAX_FILESIZE=50M \
    PHP_POST_MAX_SIZE=50M \
    PHP_DATE_TIMEZONE="UTC"

WORKDIR /app

# Instalar extensões PHP necessárias
RUN apk add --no-cache \
    postgresql-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql opcache

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar arquivos do projeto
COPY . /app

# Instalar dependências
RUN composer install --optimize-autoloader --no-dev

# Otimizar Laravel e gerar chaves
RUN php artisan optimize && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache

# Configuração FrankenPHP
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443

# Usar o FrankenPHP para executar o Octane
CMD ["php", "artisan", "octane:start", "--server=frankenphp", "--host=0.0.0.0", "--port=80"] 