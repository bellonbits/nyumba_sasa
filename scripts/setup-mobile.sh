#!/bin/bash
# =============================================================
# Nyumba Sasa — Capacitor Mobile Setup Script
# Run once after deploying to Vercel:
#   chmod +x scripts/setup-mobile.sh && ./scripts/setup-mobile.sh
# =============================================================

set -e

echo "🏠 Nyumba Sasa — Mobile Setup"
echo "=============================="

# 1. Check Capacitor CLI
if ! command -v npx &> /dev/null; then
  echo "❌ npx not found. Install Node.js first."
  exit 1
fi

# 2. Update capacitor.config.ts with production URL
echo ""
echo "📝 Step 1: Update your Vercel URL"
echo "   Open capacitor.config.ts and replace:"
echo "   'https://nyumba-sasa.vercel.app' with your actual Vercel URL"
echo ""
read -p "Press Enter once you've updated capacitor.config.ts..."

# 3. Init Capacitor (if not already done)
if [ ! -f "capacitor.config.json" ] && [ ! -f "capacitor.config.ts" ]; then
  echo "⚙️  Initialising Capacitor..."
  npx cap init "Nyumba Sasa" "com.nyumbasasa.app" --web-dir=out
fi

# 4. Add platforms
echo ""
echo "📱 Step 2: Adding platforms..."

if [ ! -d "ios" ]; then
  npx cap add ios
  echo "✅ iOS added"
else
  echo "⏭  iOS already exists"
fi

if [ ! -d "android" ]; then
  npx cap add android
  echo "✅ Android added"
else
  echo "⏭  Android already exists"
fi

# 5. Sync
echo ""
echo "🔄 Step 3: Syncing Capacitor..."
npx cap sync

echo ""
echo "=============================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  iOS:     npx cap open ios      (requires Xcode on Mac)"
echo "  Android: npx cap open android  (requires Android Studio)"
echo ""
echo "For local dev (hot reload):"
echo "  1. Run: npm run dev"
echo "  2. In capacitor.config.ts, set server.url to http://YOUR_LOCAL_IP:3000"
echo "  3. Run: npx cap sync && npx cap open android"
