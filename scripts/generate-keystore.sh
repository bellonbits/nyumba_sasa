#!/bin/bash
# ============================================================
# Generates Android release keystore + prints base64 for GitHub Secrets
# Run once: bash scripts/generate-keystore.sh
# ============================================================

set -e

KEYSTORE_FILE="nyumbasasa-release.keystore"
KEY_ALIAS="nyumbasasa"
VALIDITY_DAYS=10000

echo "Generating Android release keystore..."
echo ""

read -p "Keystore password: " -s KEYSTORE_PASSWORD; echo
read -p "Key password (press Enter to use same): " -s KEY_PASSWORD; echo
KEY_PASSWORD="${KEY_PASSWORD:-$KEYSTORE_PASSWORD}"

read -p "Your name (CN): " CN
read -p "Organisation (O): " O
read -p "City (L): " L
read -p "Country code e.g. KE (C): " C

keytool -genkey -v \
  -keystore "$KEYSTORE_FILE" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity "$VALIDITY_DAYS" \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  -dname "CN=$CN, O=$O, L=$L, C=$C"

echo ""
echo "✓ Keystore created: $KEYSTORE_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Add these to GitHub → Settings → Secrets → Actions:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "ANDROID_KEYSTORE_BASE64:"
base64 -i "$KEYSTORE_FILE"
echo ""
echo "ANDROID_KEYSTORE_PASSWORD: $KEYSTORE_PASSWORD"
echo "ANDROID_KEY_ALIAS: $KEY_ALIAS"
echo "ANDROID_KEY_PASSWORD: $KEY_PASSWORD"
echo ""
echo "⚠️  Store the keystore file safely — you need it for every update!"
echo "⚠️  Never commit the keystore or passwords to git."
