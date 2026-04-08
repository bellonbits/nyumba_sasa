import type { CapacitorConfig } from "@capacitor/cli";

const isProduction = process.env.NODE_ENV === "production";

const config: CapacitorConfig = {
  appId: "com.nyumbasasa.app",
  appName: "Nyumba Sasa",
  // webDir is only used for static builds — we use server.url instead
  webDir: "out",
  server: {
    // Point Capacitor webview to your live Vercel URL.
    // For local dev, replace with your machine IP: "http://192.168.x.x:3000"
    url: isProduction
      ? "https://nyumba-sasa.vercel.app"  // ← update after Vercel deploy
      : "http://192.168.100.13:3000",
    cleartext: true,
    androidScheme: "https",
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#ffffff",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#ffffff",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
