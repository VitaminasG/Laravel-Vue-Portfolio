#!/bin/bash
#
# Writes the SSL certificate and key into .env as single-line variables
# (SSL_CERT / SSL_KEY with \n in place of line breaks). docker-compose passes
# these to the nginx Dockerfile as build arguments.
# Same approach as the vz-widgets project.
#
CERTS_DIR=".docker/certs"
ENV_FILE=".env"
DOMAIN="gediminaspalsys.local"
CERT_FILE="${CERTS_DIR}/${DOMAIN}.pem"
KEY_FILE="${CERTS_DIR}/${DOMAIN}-key.pem"

if [ ! -f "$CERT_FILE" ]; then
    echo "Certificate file not found: $CERT_FILE"
    echo "Run first: make generate-certs"
    exit 1
fi

if [ ! -f "$KEY_FILE" ]; then
    echo "Key file not found: $KEY_FILE"
    echo "Run first: make generate-certs"
    exit 1
fi

CERT_CONTENT=$(awk '{printf "%s\\n", $0}' "$CERT_FILE" | sed 's/\\n$//')
KEY_CONTENT=$(awk '{printf "%s\\n", $0}' "$KEY_FILE" | sed 's/\\n$//')

# Remove any existing SSL_CERT/SSL_KEY lines
sed -i.bak '/^SSL_CERT=/d' "$ENV_FILE"
sed -i.bak '/^SSL_KEY=/d' "$ENV_FILE"

# Append as single-line values wrapped in double quotes
echo "SSL_CERT=\"$CERT_CONTENT\"" >> "$ENV_FILE"
echo "SSL_KEY=\"$KEY_CONTENT\"" >> "$ENV_FILE"

rm -f "${ENV_FILE}.bak"
echo "SSL certificate and key written to $ENV_FILE (single line, quoted)."