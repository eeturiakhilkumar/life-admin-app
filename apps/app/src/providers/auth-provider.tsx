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
import { doc, getDoc, setDoc } from "firebase/firestore";

import { firebaseAuth, firebaseDb } from "../lib/firebase";
import { getServerTimestamp, getNativeAuth, getNativeFirestore } from "../lib/firebase-platform";

export type UserProfile = {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  createdAt?: any;
  updatedAt?: any;
  lastLoggedIn?: any;
};

type AuthContextValue = {
  isConfigured: boolean;
  isInitializing: boolean;
  session: User | null;
  user: User | null;
  profile: UserProfile | null;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (params: { phone: string; token: string }) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  updateProfileData: (data: { displayName?: string; email?: string; phoneNumber?: string }) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  resetAuthFlow: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (isActive) {
        setUser(nextUser);
        if (nextUser) {
          await fetchProfile(nextUser.uid);
        } else {
          setProfile(null);
        }
        setIsInitializing(false);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
      resetAuthFlow();
    };
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      if (Platform.OS === "web") {
        if (!firebaseDb) return;
        const docRef = doc(firebaseDb, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        const nativeFirestore = getNativeFirestore();
        if (nativeFirestore) {
          const docSnap = await nativeFirestore().collection("users").doc(uid).get();
          if (docSnap.exists) {
            setProfile(docSnap.data() as UserProfile);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const saveUserProfile = async (
    currentUser: User | null,
    additionalData: { displayName?: string; email?: string; phoneNumber?: string } = {},
    isNewUser = false
  ) => {
    if (!currentUser) return;

    let profileExists = false;
    if (Platform.OS === "web") {
      if (firebaseDb) {
        const docSnap = await getDoc(doc(firebaseDb, "users", currentUser.uid));
        profileExists = docSnap.exists();
      }
    } else {
      const nativeFirestore = getNativeFirestore();
      if (nativeFirestore) {
        const docSnap = await nativeFirestore().collection("users").doc(currentUser.uid).get();
        profileExists = docSnap.exists;
      }
    }

    const profileData: Record<string, unknown> = {
      uid: currentUser.uid,
      email: additionalData.email || currentUser.email,
      phoneNumber: additionalData.phoneNumber || currentUser.phoneNumber,
      displayName: additionalData.displayName || currentUser.displayName,
      updatedAt: getServerTimestamp(),
      lastLoggedIn: getServerTimestamp()
    };

    if (isNewUser && !profileExists) {
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
    await fetchProfile(currentUser.uid);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: Boolean(firebaseAuth),
      isInitializing,
      session: user,
      user,
      profile,
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
          // Pass true for isNewUser; saveUserProfile will verify if it actually exists.
          await saveUserProfile(result.user as unknown as User, {}, true);
        }
      },
      async signInWithEmail(email, password) {
        let currentUser: User;
        if (Platform.OS === "web") {
          if (!firebaseAuth) {
            throw new Error("Firebase auth is not configured.");
          }
          const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
          currentUser = credential.user;
        } else {
          const nativeAuth = getNativeAuth();
          if (!nativeAuth) throw new Error("Native Auth not available");
          const credential = await nativeAuth().signInWithEmailAndPassword(email, password);
          currentUser = credential.user as unknown as User;
        }
        await saveUserProfile(currentUser, {}, false);
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
      async updateProfileData(data) {
        const { displayName, email, phoneNumber } = data;
        if (Platform.OS === "web") {
          const currentUser = firebaseAuth?.currentUser;
          if (!currentUser) {
            throw new Error("No authenticated user found.");
          }
          if (displayName) {
            await updateProfile(currentUser, { displayName });
          }
          // Firebase Auth doesn't allow easy update of email/phone without verification usually,
          // so we mostly update Firestore here for these extra fields if provided.
          await saveUserProfile(currentUser, data);
          setUser({ ...currentUser });
        } else {
          const nativeAuth = getNativeAuth();
          if (!nativeAuth) throw new Error("Native Auth not available");
          const currentUser = nativeAuth().currentUser;
          if (!currentUser) {
            throw new Error("No authenticated user found.");
          }
          if (displayName) {
            await currentUser.updateProfile({ displayName });
          }
          await saveUserProfile(currentUser as unknown as User, data);
          setUser(nativeAuth().currentUser as unknown as User);
        }
      },
      async updateDisplayName(displayName) {
        if (Platform.OS === "web") {
          const currentUser = firebaseAuth?.currentUser;
          if (!currentUser) {
            throw new Error("No authenticated user found.");
          }
          await updateProfile(currentUser, { displayName });
          await saveUserProfile(currentUser, { displayName });
          setUser({ ...currentUser });
        } else {
          const nativeAuth = getNativeAuth();
          if (!nativeAuth) throw new Error("Native Auth not available");
          const currentUser = nativeAuth().currentUser;
          if (!currentUser) {
            throw new Error("No authenticated user found.");
          }
          await currentUser.updateProfile({ displayName });
          await saveUserProfile(currentUser as unknown as User, { displayName });
          setUser(nativeAuth().currentUser as unknown as User);
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
      },
      async refreshProfile() {
        if (user) {
          await fetchProfile(user.uid);
        }
      }
    }),
    [isInitializing, user, profile]
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
