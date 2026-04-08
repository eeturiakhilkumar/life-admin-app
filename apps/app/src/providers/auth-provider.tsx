import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import type { ConfirmationResult, User } from "firebase/auth";
import {
  RecaptchaVerifier,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  indexedDBLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  updateProfile
} from "firebase/auth";

import { firebaseAuth } from "../lib/firebase";

type AuthContextValue = {
  isConfigured: boolean;
  isInitializing: boolean;
  session: User | null;
  user: User | null;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (params: { phone: string; token: string }) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  resetAuthFlow: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  const resetAuthFlow = () => {
    confirmationResultRef.current = null;
    verifierRef.current?.clear();
    verifierRef.current = null;

    if (Platform.OS === "web") {
      const browserDocument = (globalThis as { document?: { getElementById: (id: string) => { innerHTML: string } | null } })
        .document;
      const recaptchaContainer = browserDocument?.getElementById("firebase-recaptcha-container") ?? null;

      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = "";
      }
    }
  };

  useEffect(() => {
    let isActive = true;

    if (!firebaseAuth) {
      setIsInitializing(false);
      return;
    }

    const auth = firebaseAuth;

    if (Platform.OS === "web") {
      void setPersistence(auth, indexedDBLocalPersistence).catch(async () => {
        await setPersistence(auth, browserLocalPersistence);
      });
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (isActive) {
        setUser(nextUser);
        setIsInitializing(false);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
      resetAuthFlow();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: Boolean(firebaseAuth),
      isInitializing,
      session: user,
      user,
      async requestOtp(phone) {
        if (!firebaseAuth) {
          throw new Error("Firebase phone auth is not configured for this application yet.");
        }

        if (Platform.OS !== "web") {
          throw new Error("Realtime Firebase phone authentication is currently configured for the web app.");
        }

        resetAuthFlow();

        verifierRef.current = new RecaptchaVerifier(firebaseAuth, "firebase-recaptcha-container", {
          size: "invisible"
        });

        try {
          confirmationResultRef.current = await signInWithPhoneNumber(firebaseAuth, phone, verifierRef.current);
        } catch (error) {
          resetAuthFlow();
          throw error;
        }
      },
      async verifyOtp({ token }) {
        if (!confirmationResultRef.current) {
          throw new Error("Request an OTP first.");
        }

        await confirmationResultRef.current.confirm(token);
        resetAuthFlow();
      },
      async signInWithEmail(email, password) {
        if (!firebaseAuth) {
          throw new Error("Firebase auth is not configured.");
        }
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      async signUpWithEmail(email, password) {
        if (!firebaseAuth) {
          throw new Error("Firebase auth is not configured.");
        }
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      },
      async updateDisplayName(displayName) {
        if (!firebaseAuth || !firebaseAuth.currentUser) {
          throw new Error("No authenticated user found.");
        }
        await updateProfile(firebaseAuth.currentUser, { displayName });
        // Refresh user state
        setUser({ ...firebaseAuth.currentUser });
      },
      resetAuthFlow,
      async signOut() {
        if (!firebaseAuth) {
          return;
        }

        await firebaseSignOut(firebaseAuth);
      }
    }),
    [isInitializing, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
};
