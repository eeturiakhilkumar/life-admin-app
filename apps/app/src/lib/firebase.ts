import Constants from "expo-constants";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { projectFirebaseConfig } from "./firebase-config";

type FirebaseExtra = {
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseAppId?: string;
  firebaseMessagingSenderId?: string;
  firebaseStorageBucket?: string;
  firebaseMeasurementId?: string;
};

const extra = (Constants.expoConfig?.extra ?? Constants.manifest2?.extra ?? {}) as FirebaseExtra;

const readEnvValue = (
  extraValue: string | undefined,
  envValue: string | undefined
) => extraValue?.trim() || envValue?.trim() || undefined;

const firebaseConfig = {
  apiKey: readEnvValue(extra.firebaseApiKey, process.env.EXPO_PUBLIC_FIREBASE_API_KEY) ?? projectFirebaseConfig.apiKey,
  authDomain:
    readEnvValue(extra.firebaseAuthDomain, process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN) ??
    projectFirebaseConfig.authDomain,
  projectId:
    readEnvValue(extra.firebaseProjectId, process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) ??
    projectFirebaseConfig.projectId,
  appId: readEnvValue(extra.firebaseAppId, process.env.EXPO_PUBLIC_FIREBASE_APP_ID) ?? projectFirebaseConfig.appId,
  messagingSenderId: readEnvValue(
    extra.firebaseMessagingSenderId,
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  ) ?? projectFirebaseConfig.messagingSenderId,
  storageBucket:
    readEnvValue(extra.firebaseStorageBucket, process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET) ??
    projectFirebaseConfig.storageBucket,
  measurementId:
    readEnvValue(extra.firebaseMeasurementId, process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID) ??
    projectFirebaseConfig.measurementId
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    firebaseConfig.messagingSenderId
);

export const firebaseApp = hasFirebaseConfig ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
