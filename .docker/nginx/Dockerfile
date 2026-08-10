FROM nginx:stable

# The SSL certificate is passed as a build argument (single line with \n from .env).
# Same approach as the vz-widgets project: the certificate ships with the image.
ARG SSL_CERT
ARG SSL_KEY

RUN mkdir -p /etc/ssl/certs
# sh (dash) `echo` interprets \n -> real line breaks, restoring the PEM format
RUN echo "${SSL_CERT}" > /etc/ssl/certs/gediminaspalsys.local.crt
RUN echo "${SSL_KEY}"  > /etc/ssl/certs/gediminaspalsys.local.key

COPY templates/nginx.conf /etc/nginx/nginx.conf
COPY templates/gediminaspalsys.local.conf /etc/nginx/conf.d/gediminaspalsys.local.conf

RUN rm -f /etc/nginx/conf.d/default.conf