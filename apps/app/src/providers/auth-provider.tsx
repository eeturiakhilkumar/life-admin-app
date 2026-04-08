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
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { firebaseAuth, firebaseDb } from "../lib/firebase";

// Native Firebase modules are imported dynamically to prevent web build breakage
const getNativeAuth = () => {
  if (Platform.OS === "web") return null;
  return require("@react-native-firebase/auth").default;
};

const getNativeFirestore = () => {
  if (Platform.OS === "web") return null;
  return require("@react-native-firebase/firestore").default;
};

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

  const saveUserProfile = async (currentUser: User | null, additionalData: { displayName?: string } = {}) => {
    if (!currentUser) return;

    const profileData = {
      uid: currentUser.uid,
      email: currentUser.email,
      phoneNumber: currentUser.phoneNumber,
      displayName: additionalData.displayName || currentUser.displayName,
      createdAt:
        Platform.OS === "web" ? serverTimestamp() : require("@react-native-firebase/firestore").default.FieldValue.serverTimestamp(),
      updatedAt:
        Platform.OS === "web" ? serverTimestamp() : require("@react-native-firebase/firestore").default.FieldValue.serverTimestamp()
    };

    if (Platform.OS === "web") {
      if (!firebaseDb) return;
      await setDoc(doc(firebaseDb, "users", currentUser.uid), profileData, { merge: true });
    } else {
      const nativeFirestore = getNativeFirestore();
      if (nativeFirestore) {
        await nativeFirestore().collection("users").doc(currentUser.uid).set(profileData, { merge: true });
      }
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: Boolean(firebaseAuth),
      isInitializing,
      session: user,
      user,
      async requestOtp(phone) {
        if (Platform.OS === "web") {
          if (!firebaseAuth) {
            throw new Error("Firebase phone auth is not configured for this application yet.");
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
        } else {
          const nativeAuth = getNativeAuth();
          if (nativeAuth) {
            const confirmation = await nativeAuth().signInWithPhoneNumber(phone);
            confirmationResultRef.current = confirmation as unknown as ConfirmationResult;
          }
        }
      },
      async verifyOtp({ token }) {
        if (!confirmationResultRef.current) {
          throw new Error("Request an OTP first.");
        }

        const result = await confirmationResultRef.current.confirm(token);
        resetAuthFlow();

        if (result?.user) {
          await saveUserProfile(result.user as unknown as User);
        }
      },
      async signInWithEmail(email, password) {
        if (Platform.OS === "web") {
          if (!firebaseAuth) {
            throw new Error("Firebase auth is not configured.");
          }
          await signInWithEmailAndPassword(firebaseAuth, email, password);
        } else {
          const nativeAuth = getNativeAuth();
          if (nativeAuth) {
            await nativeAuth().signInWithEmailAndPassword(email, password);
          }
        }
      },
      async signUpWithEmail(email, password) {
        let newUser: User;
        if (Platform.OS === "web") {
          if (!firebaseAuth) {
            throw new Error("Firebase auth is not configured.");
          }
          const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
          newUser = credential.user;
        } else {
          const nativeAuth = getNativeAuth();
          if (!nativeAuth) throw new Error("Native Auth not available");
          const credential = await nativeAuth().createUserWithEmailAndPassword(email, password);
          newUser = credential.user as unknown as User;
        }
        await saveUserProfile(newUser);
      },
      async updateDisplayName(displayName) {
        if (Platform.OS === "web") {
          if (!firebaseAuth || !firebaseAuth.currentUser) {
            throw new Error("No authenticated user found.");
          }
          await updateProfile(firebaseAuth.currentUser, { displayName });
          // Refresh user state
          setUser({ ...firebaseAuth.currentUser });
          await saveUserProfile(firebaseAuth.currentUser, { displayName });
        } else {
          const nativeAuth = getNativeAuth();
          if (!nativeAuth) throw new Error("Native Auth not available");
          const currentUser = nativeAuth().currentUser;
          if (!currentUser) {
            throw new Error("No authenticated user found.");
          }
          await currentUser.updateProfile({ displayName });
          // Refresh user state
          setUser(nativeAuth().currentUser as unknown as User);
          await saveUserProfile(nativeAuth().currentUser as unknown as User, { displayName });
        }
      },
      resetAuthFlow,
      async signOut() {
        if (Platform.OS === "web") {
          if (!firebaseAuth) {
            return;
          }
          await firebaseSignOut(firebaseAuth);
        } else {
          const nativeAuth = getNativeAuth();
          if (nativeAuth) {
            await nativeAuth().signOut();
          }
        }
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
