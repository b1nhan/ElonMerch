# PHP 8.2 FPM with required extensions for Alpine Linux
FROM php:8.2-fpm-alpine

WORKDIR /var/www/api

# Install system dependencies (Alpine Linux package names)
RUN apk add --no-cache \
    curl \
    mysql-client \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zlib-dev \
    libzip-dev \
    git

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    gd \
    zip \
    opcache

# Copy custom PHP configuration
COPY php.ini /usr/local/etc/php/conf.d/custom.ini

# Set proper permissions
RUN chown -R www-data:www-data /var/www/api

EXPOSE 9000

CMD ["php-fpm"]
