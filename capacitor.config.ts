import type { CapacitorConfig } from "@capacitor/cli";

const isProduction = process.env.NODE_ENV === "production";

const config: CapacitorConfig = {
  appId: "com.nyumbasasa.app",
  appName: "Nyumba Sasa",
  webDir: "out",
  server: {
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
