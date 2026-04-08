import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ExpoConfig } from "expo/config";

const parseEnvFile = (filePath: string) => {
  if (!existsSync(filePath)) {
    return {};
  }

  const fileContents = readFileSync(filePath, "utf8");

  return fileContents.split(/\r?\n/).reduce<Record<string, string>>((accumulator, rawLine) => {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      return accumulator;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      return accumulator;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (key) {
      accumulator[key] = value;
    }

    return accumulator;
  }, {});
};

const rootDir = path.resolve(__dirname, "../..");
const envFromRoot = {
  ...parseEnvFile(path.join(rootDir, ".env")),
  ...parseEnvFile(path.join(rootDir, ".env.local"))
};

const readConfigValue = (key: string) => process.env[key] ?? envFromRoot[key];

const appEnv = readConfigValue("APP_ENV") ?? "development";
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
    googleServicesFile: "./GoogleService-Info.plist",
    infoPlist: {
      NSCameraUsageDescription: "Life Admin uses the camera so you can scan bills, renewals, and documents.",
      NSPhotoLibraryUsageDescription: "Life Admin uses your photo library to attach documents and receipts.",
      NSUserNotificationsUsageDescription: "Life Admin sends reminders for bills, appointments, and renewals."
    }
  },
  android: {
    package: "com.lifeadmin.app",
    googleServicesFile: "./google-services.json",
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
    "expo-secure-store",
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    "@react-native-firebase/firestore"
  ],
  extra: {
    appEnv,
    router: {
      origin: false
    },
    eas: {
      projectId: "replace-with-eas-project-id"
    },
    supabaseUrl: readConfigValue("EXPO_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readConfigValue("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
    firebaseApiKey: readConfigValue("EXPO_PUBLIC_FIREBASE_API_KEY"),
    firebaseAuthDomain: readConfigValue("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    firebaseProjectId: readConfigValue("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    firebaseAppId: readConfigValue("EXPO_PUBLIC_FIREBASE_APP_ID"),
    firebaseMessagingSenderId: readConfigValue("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    firebaseStorageBucket: readConfigValue("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    firebaseMeasurementId: readConfigValue("EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID")
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
