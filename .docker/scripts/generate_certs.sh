#!/bin/bash
#
# Generates a locally trusted (mkcert) SSL certificate for the gediminaspalsys.local domain.
# Same as the vz-widgets project — certificates are placed in .docker/certs/.
#
set -e

CERTS_DIR=".docker/certs"
DOMAIN="gediminaspalsys.local"
CERT_FILE="${CERTS_DIR}/${DOMAIN}.pem"
KEY_FILE="${CERTS_DIR}/${DOMAIN}-key.pem"

if ! command -v mkcert >/dev/null 2>&1; then
    echo "mkcert not found. Install it: brew install mkcert nss"
    exit 1
fi

# Installs the local mkcert CA into the system/browser trust store (idempotent)
mkcert -install

mkdir -p "$CERTS_DIR"

mkcert -cert-file "$CERT_FILE" -key-file "$KEY_FILE" \
    "$DOMAIN" "*.${DOMAIN}" localhost 127.0.0.1 ::1

echo ""
echo "Certificate generated:"
echo "  $CERT_FILE"
echo "  $KEY_FILE"
echo ""
echo "Next run: make update-ssl  (writes them into .env as SSL_CERT/SSL_KEY)"