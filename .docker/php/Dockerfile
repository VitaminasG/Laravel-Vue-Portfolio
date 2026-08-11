# Laravel 12 requires PHP >= 8.2; the resolved dependency set asks for >= 8.4.1.
FROM php:8.4-fpm

# Required system libraries. libonig-dev is new here: PHP bundled oniguruma up
# to 7.3, and from 7.4 onwards mbstring expects it to be provided by the system.
RUN apt-get update && apt-get install -y \
        git \
        unzip \
        libzip-dev \
        libpng-dev \
        libonig-dev \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions required by Laravel (mbstring, bcmath, pdo_mysql) + opcache, zip, gd
RUN docker-php-ext-install pdo_mysql mbstring bcmath zip gd opcache

# Composer 2. The old 1.x pin existed only because Laravel 5.7's PackageManifest
# could not read Composer 2's installed.json; Packagist dropped Composer 1
# support on 2025-09-01, so 1.x can no longer resolve dependencies at all.
RUN curl -sS https://getcomposer.org/installer | php -- --2 --filename=composer --install-dir=/usr/local/bin

# Custom php-fpm config (unix socket shared with nginx)
COPY templates/php.conf /usr/local/etc/php-fpm.d/zzz-custom.conf

WORKDIR /var/www/portfolio

CMD ["php-fpm"]
