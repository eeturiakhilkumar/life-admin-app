import type { ExpoConfig } from "expo/config";

const appEnv = process.env.APP_ENV ?? "development";
const isProduction = appEnv === "production";

const config: ExpoConfig = {
  name: "Life Admin",
  slug: "life-admin",
  scheme: "lifeadmin",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#f5f0e8"
  },
  ios: {
    bundleIdentifier: "com.lifeadmin.app",
    supportsTablet: true,
    usesAppleSignIn: true,
    infoPlist: {
      NSCameraUsageDescription: "Life Admin uses the camera so you can scan bills, renewals, and documents.",
      NSPhotoLibraryUsageDescription: "Life Admin uses your photo library to attach documents and receipts.",
      NSUserNotificationsUsageDescription: "Life Admin sends reminders for bills, appointments, and renewals."
    }
  },
  android: {
    package: "com.lifeadmin.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#f5f0e8"
    },
    permissions: ["POST_NOTIFICATIONS"]
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-router",
    "expo-notifications",
    "expo-secure-store"
  ],
  extra: {
    appEnv,
    router: {
      origin: false
    },
    eas: {
      projectId: "replace-with-eas-project-id"
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  },
  experiments: {
    typedRoutes: true
  },
  updates: {
    url: isProduction ? "https://u.expo.dev/replace-with-production-project-id" : undefined
  },
  runtimeVersion: {
    policy: "appVersion"
  }
};

export default config;

