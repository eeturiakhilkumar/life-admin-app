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
  updateProfile,
  EmailAuthProvider,
  linkWithCredential,
  updateEmail
} from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

import { firebaseAuth, firebaseDb } from "../lib/firebase";
import { getServerTimestamp, getNativeAuth, getNativeFirestore } from "../lib/firebase-platform";

export type UserProfile = {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  createdAt?: any;
  updatedAt?: any;
};

type AuthContextValue = {
  isConfigured: boolean;
  isInitializing: boolean;
  session: User | null;
  user: User | null;
  profile: UserProfile | null;
  isProfileComplete: boolean;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (params: { phone: string; token: string }) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  completeProfile: (data: {
    displayName: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    dateOfBirth?: string;
    gender?: string;
  }) => Promise<void>;
  resetAuthFlow: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (isActive) {
        setUser(nextUser);

        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = undefined;
        }

        if (nextUser) {
          if (Platform.OS === "web") {
            if (firebaseDb) {
              unsubscribeProfile = onSnapshot(doc(firebaseDb, "users", nextUser.uid), (snapshot) => {
                if (snapshot.exists()) {
                  setProfile(snapshot.data() as UserProfile);
                } else {
                  setProfile(null);
                }
                setIsInitializing(false);
              });
            } else {
              setIsInitializing(false);
            }
          } else {
            const nativeFirestore = getNativeFirestore();
            if (nativeFirestore) {
              unsubscribeProfile = nativeFirestore()
                .collection("users")
                .doc(nextUser.uid)
                .onSnapshot((snapshot: any) => {
                  if (snapshot.exists) {
                    setProfile(snapshot.data() as UserProfile);
                  } else {
                    setProfile(null);
                  }
                  setIsInitializing(false);
                });
            } else {
              setIsInitializing(false);
            }
          }
        } else {
          setProfile(null);
          setIsInitializing(false);
        }
      }
    });

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      isActive = false;
      unsubscribe();
      resetAuthFlow();
    };
  }, []);

  const saveUserProfile = async (
    currentUser: User | null,
    additionalData: {
      displayName?: string;
      phoneNumber?: string;
      email?: string;
      dateOfBirth?: string;
      gender?: string;
    } = {},
    isNewUser = false
  ) => {
    if (!currentUser) return;

    const profileData: Record<string, unknown> = {
      uid: currentUser.uid,
      email: additionalData.email || currentUser.email,
      phoneNumber: additionalData.phoneNumber || currentUser.phoneNumber,
      displayName: additionalData.displayName || currentUser.displayName,
      dateOfBirth: additionalData.dateOfBirth || profile?.dateOfBirth || null,
      gender: additionalData.gender || profile?.gender || null,
      updatedAt: getServerTimestamp()
    };

    if (isNewUser) {
      profileData.createdAt = getServerTimestamp();
    }

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

  const isProfileComplete = useMemo(() => {
    return Boolean(profile?.displayName && profile?.email && profile?.phoneNumber);
  }, [profile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: Boolean(firebaseAuth),
      isInitializing,
      session: user,
      user,
      profile,
      isProfileComplete,
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
          // Check if it's likely a new user (no displayName)
          const isNewUser = !result.user.displayName;
          await saveUserProfile(result.user as unknown as User, {}, isNewUser);
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
        await saveUserProfile(newUser, {}, true);
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
      async completeProfile({ displayName, email, phoneNumber, password, dateOfBirth, gender }) {
        const currentUser = Platform.OS === "web" ? firebaseAuth?.currentUser : getNativeAuth()?.().currentUser;
        if (!currentUser) throw new Error("No authenticated user found.");

        // 1. Update Display Name if provided
        if (displayName) {
          if (Platform.OS === "web") {
            await updateProfile(currentUser as User, { displayName });
          } else {
            await (currentUser as any).updateProfile({ displayName });
          }
        }

        // 2. Handle Email and Password (for mobile signups)
        if (email && password) {
          const credential = EmailAuthProvider.credential(email, password);
          if (Platform.OS === "web") {
            await linkWithCredential(currentUser as User, credential);
          } else {
            await (currentUser as any).linkWithCredential(credential);
          }
        } else if (email) {
          if (Platform.OS === "web") {
            await updateEmail(currentUser as User, email);
          } else {
            await (currentUser as any).updateEmail(email);
          }
        }

        // 3. Update Firestore Profile
        // We use the updated currentUser because it might have new email/phoneNumber after linking
        const updatedUser = Platform.OS === "web" ? firebaseAuth?.currentUser : getNativeAuth()?.().currentUser;
        await saveUserProfile(updatedUser as User, {
          displayName: displayName || updatedUser?.displayName || undefined,
          // If phoneNumber was passed manually (for email signups), it might not be in updatedUser yet
          ...(phoneNumber ? { phoneNumber } : {}),
          dateOfBirth,
          gender
        } as any);

        // Refresh user state
        if (Platform.OS === "web") {
          setUser(firebaseAuth?.currentUser ? { ...firebaseAuth.currentUser } : null);
        } else {
          setUser(getNativeAuth()?.().currentUser as unknown as User);
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
    [isInitializing, user, profile, isProfileComplete]
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
