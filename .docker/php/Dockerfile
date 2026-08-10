# Laravel 5.7 requires PHP >= 7.1.3. 7.3 is the newest version well-compatible with 5.7.
FROM php:7.3-fpm

# Required system libraries
RUN apt-get update && apt-get install -y \
        git \
        unzip \
        libzip-dev \
        libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions required by Laravel 5.7 (mbstring, bcmath, pdo_mysql) + opcache, zip, gd
RUN docker-php-ext-install pdo_mysql mbstring bcmath zip gd opcache

# Composer 1.x — Laravel 5.7's PackageManifest does not understand the Composer 2
# installed.json format ("Undefined index: name"), so we pin the last 1.x release.
RUN curl -sS https://getcomposer.org/installer | php -- --version=1.10.27 --filename=composer --install-dir=/usr/local/bin

# Custom php-fpm config (unix socket shared with nginx)
COPY templates/php.conf /usr/local/etc/php-fpm.d/zzz-custom.conf

WORKDIR /var/www/portfolio

CMD ["php-fpm"]