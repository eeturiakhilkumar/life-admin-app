import { useState, useEffect } from "react";
import { Redirect } from "expo-router";
import { Modal, Platform, Text, TextInput, View, TouchableOpacity } from "react-native";

import { Card, colors, spacing, radii } from "@life-admin/ui";
import { AuthActionButton } from "../../src/components/auth-action-button";
import { Screen } from "../../src/components/screen";
import { buildPhoneNumberFromInput, sanitizeOtpToken } from "../../src/lib/auth-utils";
import { useAuth } from "../../src/providers/auth-provider";

type AuthTab = "mobile" | "email";
type AuthMode = "signIn" | "signUp";

export default function SignInScreen() {
  const {
    isConfigured,
    isInitializing,
    requestOtp,
    resetAuthFlow,
    session,
    profile,
    isProfileComplete,
    verifyOtp,
    signInWithEmail,
    signUpWithEmail,
    completeProfile,
    signOut
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>("mobile");
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");

  // Mobile Auth State
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpTarget, setOtpTarget] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Email Auth State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessingEmail, setIsProcessingEmail] = useState(false);

  // Profile Completion State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [extraEmail, setExtraEmail] = useState("");
  const [extraPassword, setExtraPassword] = useState("");
  const [extraMobile, setExtraMobile] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Clear messages when tab or mode changes
  useEffect(() => {
    setErrorMessage(null);
    setInfoMessage(null);
  }, [activeTab, authMode]);

  // Handle profile completion modal trigger
  useEffect(() => {
    if (!isInitializing && session && !isProfileComplete) {
      setShowProfileModal(true);
      // Pre-fill if we have some data
      if (profile?.displayName) setUserName(profile.displayName);
    } else if (!isInitializing && (isProfileComplete || !session)) {
      setShowProfileModal(false);
    }
  }, [isInitializing, session, isProfileComplete, profile]);

  if (!isInitializing && session && isProfileComplete && !showProfileModal) {
    return <Redirect href="/dashboard" />;
  }

  const phoneDraft = buildPhoneNumberFromInput(mobileNumber, {
    defaultCountryCode: "+91"
  });
  const canRequestOtp = isConfigured && !isSendingOtp && Boolean(phoneDraft.phone);

  const handleMobileNumberChange = (value: string) => {
    setMobileNumber(value);
    setErrorMessage(null);
    if (otpTarget || otpCode) {
      setOtpCode("");
      setOtpTarget(null);
    }
    resetAuthFlow();
  };

  const sendOtp = async () => {
    const { phone, error } = phoneDraft;
    if (!phone || error) {
      setErrorMessage(error);
      return;
    }

    setIsSendingOtp(true);
    setErrorMessage(null);

    try {
      await requestOtp(phone);
      setOtpTarget(phone);
      setInfoMessage(`OTP sent to ${phone}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyCode = async () => {
    if (!otpTarget) return;
    if (sanitizeOtpToken(otpCode).length !== 6) {
      setErrorMessage("Enter the 6-digit OTP.");
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMessage(null);

    try {
      await verifyOtp({
        phone: otpTarget,
        token: sanitizeOtpToken(otpCode)
      });
      // Clear OTP target on success to close modal
      setOtpTarget(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not verify OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsProcessingEmail(true);
    setErrorMessage(null);

    try {
      if (authMode === "signIn") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsProcessingEmail(false);
    }
  };

  const validateUsername = (name: string) => {
    if (name.length < 4 || name.length > 20) {
      return "Username must be between 4 and 20 characters.";
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
      return "Username can only contain alphanumeric characters and spaces.";
    }
    return null;
  };

  const handleSaveProfile = async () => {
    const userError = validateUsername(userName.trim());
    if (userError) {
      setErrorMessage(userError);
      return;
    }

    const needsEmail = !profile?.email && !session?.email;
    const needsMobile = !profile?.phoneNumber && !session?.phoneNumber;

    if (needsEmail) {
      if (!extraEmail || !extraPassword) {
        setErrorMessage("Please enter both email and password.");
        return;
      }
      if (extraPassword.length < 6) {
        setErrorMessage("Password must be at least 6 characters.");
        return;
      }
    }

    if (needsMobile) {
      const { phone, error } = buildPhoneNumberFromInput(extraMobile, { defaultCountryCode: "+91" });
      if (!phone || error) {
        setErrorMessage(error || "Invalid mobile number.");
        return;
      }
    }

    setIsSavingProfile(true);
    setErrorMessage(null);
    try {
      const { phone } = buildPhoneNumberFromInput(extraMobile, { defaultCountryCode: "+91" });
      await completeProfile({
        displayName: userName.trim(),
        email: extraEmail || undefined,
        password: extraPassword || undefined,
        phoneNumber: phone || undefined,
      });
      setShowProfileModal(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.mist,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: "#ffffff",
    color: colors.ink,
    fontSize: 16,
  };

  const labelStyle = {
    color: colors.ink,
    fontWeight: "600" as const,
    marginBottom: spacing.xs,
  };

  return (
    <Screen title={authMode === "signIn" ? "Welcome back" : "Create account"}>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {/* Tabs */}
        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.mist }}>
          {(["mobile", "email"] as AuthTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: spacing.md,
                alignItems: "center",
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: colors.accent,
              }}
            >
              <Text style={{
                color: activeTab === tab ? colors.accent : colors.slate,
                fontWeight: "600",
                textTransform: "capitalize"
              }}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          {activeTab === "mobile" ? (
            <View style={{ gap: spacing.md }}>
              <View>
                <Text style={labelStyle}>Mobile Number</Text>
                <TextInput
                  value={mobileNumber}
                  onChangeText={handleMobileNumberChange}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor={colors.slate}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  style={inputStyle}
                />
              </View>
              {Platform.OS === "web" ? <View nativeID="firebase-recaptcha-container" style={{ width: 1, height: 1 }} /> : null}
              <AuthActionButton
                disabled={!canRequestOtp}
                label={isSendingOtp ? "Sending..." : "Send OTP"}
                onPress={() => void sendOtp()}
                variant="primary"
              />
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              <View>
                <Text style={labelStyle}>Email Address</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.slate}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={inputStyle}
                />
              </View>
              <View>
                <Text style={labelStyle}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.slate}
                  secureTextEntry
                  style={inputStyle}
                />
              </View>
              <AuthActionButton
                disabled={isProcessingEmail}
                label={isProcessingEmail ? "Processing..." : (authMode === "signIn" ? "Sign In" : "Create Account")}
                onPress={() => void handleEmailAuth()}
                variant="primary"
              />
            </View>
          )}

          {errorMessage ? (
            <Text style={{ color: colors.accent, textAlign: "center" }}>{errorMessage}</Text>
          ) : infoMessage ? (
            <Text style={{ color: colors.slate, textAlign: "center" }}>{infoMessage}</Text>
          ) : null}

          <TouchableOpacity
            onPress={() => setAuthMode(authMode === "signIn" ? "signUp" : "signIn")}
            style={{ alignItems: "center" }}
          >
            <Text style={{ color: colors.slate }}>
              {authMode === "signIn" ? "Don't have an account? " : "Already have an account? "}
              <Text style={{ color: colors.accent, fontWeight: "600" }}>
                {authMode === "signIn" ? "Sign Up" : "Sign In"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* OTP Modal */}
      <Modal animationType="slide" transparent visible={Boolean(otpTarget)} onRequestClose={() => setOtpTarget(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: spacing.md }}>
          <Card style={{ gap: spacing.md }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.ink }}>Verify OTP</Text>
            <Text style={{ color: colors.slate }}>Enter the 6-digit code sent to {otpTarget}</Text>

            <TextInput
              value={otpCode}
              onChangeText={(value) => setOtpCode(sanitizeOtpToken(value))}
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              style={{ ...inputStyle, letterSpacing: 8, textAlign: "center", fontSize: 24 }}
            />

            <View style={{ gap: spacing.sm }}>
              <AuthActionButton
                disabled={isVerifyingOtp}
                label={isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                onPress={() => void verifyCode()}
                variant="primary"
              />
              <AuthActionButton
                label="Cancel"
                onPress={() => setOtpTarget(null)}
                variant="ghost"
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Profile Completion Modal */}
      <Modal animationType="fade" transparent visible={showProfileModal}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: spacing.md }}>
          <Card style={{ gap: spacing.md }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: colors.ink }}>Complete your profile</Text>
                <Text style={{ color: colors.slate }}>Please provide the following details to continue.</Text>
              </View>
              <TouchableOpacity onPress={() => void signOut()} style={{ paddingLeft: spacing.md }}>
                <Text style={{ color: colors.accent, fontWeight: "600" }}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: spacing.md }}>
              <View>
                <Text style={labelStyle}>Username</Text>
                <TextInput
                  value={userName}
                  onChangeText={setUserName}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={colors.slate}
                  style={inputStyle}
                />
              </View>

              {(!profile?.email && !session?.email) && (
                <>
                  <View>
                    <Text style={labelStyle}>Email Address</Text>
                    <TextInput
                      value={extraEmail}
                      onChangeText={setExtraEmail}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.slate}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={inputStyle}
                    />
                  </View>
                  <View>
                    <Text style={labelStyle}>Password</Text>
                    <TextInput
                      value={extraPassword}
                      onChangeText={setExtraPassword}
                      placeholder="Min. 6 characters"
                      placeholderTextColor={colors.slate}
                      secureTextEntry
                      style={inputStyle}
                    />
                  </View>
                </>
              )}

              {(!profile?.phoneNumber && !session?.phoneNumber) && (
                <View>
                  <Text style={labelStyle}>Mobile Number</Text>
                  <TextInput
                    value={extraMobile}
                    onChangeText={setExtraMobile}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor={colors.slate}
                    keyboardType="phone-pad"
                    style={inputStyle}
                  />
                </View>
              )}
            </View>

            <AuthActionButton
              disabled={isSavingProfile}
              label={isSavingProfile ? "Saving..." : "Continue"}
              onPress={() => void handleSaveProfile()}
              variant="primary"
            />

            {errorMessage && <Text style={{ color: colors.accent, textAlign: "center" }}>{errorMessage}</Text>}
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}
