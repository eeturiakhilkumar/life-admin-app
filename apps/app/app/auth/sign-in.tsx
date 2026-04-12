import { useState, useEffect } from "react";
import { Redirect, useRouter } from "expo-router";
import { Modal, Platform, Text, TextInput, View, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNPickerSelect from "react-native-picker-select";

import { Card, colors, spacing, radii } from "@life-admin/ui";
import { AuthActionButton } from "../../src/components/auth-action-button";
import { Screen } from "../../src/components/screen";
import { buildPhoneNumberFromInput, sanitizeOtpToken } from "../../src/lib/auth-utils";
import { useAuth } from "../../src/providers/auth-provider";

type AuthTab = "mobile" | "email";
type AuthMode = "signIn" | "signUp";

export default function SignInScreen() {
  const router = useRouter();
  const {
    isConfigured,
    isInitializing,
    requestOtp,
    resetAuthFlow,
    session,
    profile,
    verifyOtp,
    signInWithEmail,
    signUpWithEmail,
    saveUserProfile
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>("mobile");
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");

  // Auth Input State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");

  // Profile Completion Extras
  const [dob, setDob] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("");

  // Mobile OTP State
  const [otpCode, setOtpCode] = useState("");
  const [otpTarget, setOtpTarget] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Loading States
  const [isProcessing, setIsProcessing] = useState(false);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
    setInfoMessage(null);
  }, [activeTab, authMode]);

  const isProfileComplete = profile && profile.displayName && profile.phoneNumber && profile.email && profile.dob && profile.gender;

  useEffect(() => {
    if (!isInitializing && session && profile) {
      if (isProfileComplete) {
        router.replace("/dashboard");
      } else {
        setShowProfileModal(true);
        if (!name) setName(profile.displayName || "");
        if (!email) setEmail(profile.email || session.email || "");
        if (!mobileNumber) setMobileNumber(profile.phoneNumber || session.phoneNumber || "");
        if (profile.dob) setDob(new Date(profile.dob));
        if (profile.gender) setGender(profile.gender);
      }
    }
  }, [isInitializing, session, profile, isProfileComplete]);

  if (isInitializing) return null;
  if (session && isProfileComplete) return <Redirect href="/dashboard" />;

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
      setOtpTarget(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not verify OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleEmailAuth = async () => {
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage("Email and Password are required.");
      return;
    }
    if (authMode === "signUp") {
      if (!name.trim() || !mobileNumber.trim()) {
        setErrorMessage("All fields are mandatory for sign up.");
        return;
      }
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsProcessing(true);
    try {
      if (authMode === "signIn") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (error) {
      let msg = "Authentication failed.";
      if (error instanceof Error) {
        msg = error.message;
        if (msg.includes("auth/operation-not-allowed")) {
          msg = "Email/Password sign-in is not enabled. Please enable it in Firebase Console.";
        }
      }
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim() || !mobileNumber.trim() || !gender) {
      setErrorMessage("All fields are mandatory.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await saveUserProfile({
        displayName: name.trim(),
        email: email.trim(),
        phoneNumber: mobileNumber.trim(),
        dob: dob.toISOString().split("T")[0],
        gender
      });
      setShowProfileModal(false);
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setIsProcessing(false);
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== "web") {
      setShowDatePicker(Platform.OS === "ios");
    }
    if (selectedDate) {
      setDob(selectedDate);
    }
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
                flexDirection: "row",
                justifyContent: "center",
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: colors.accent,
                gap: spacing.xs
              }}
            >
              {tab === "mobile" ? (
                <Ionicons name="phone-portrait-outline" size={18} color={activeTab === tab ? colors.accent : colors.slate} />
              ) : (
                <Ionicons name="mail-outline" size={18} color={activeTab === tab ? colors.accent : colors.slate} />
              )}
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
              {authMode === "signUp" && (
                <View style={{ gap: spacing.md }}>
                  <View>
                    <Text style={labelStyle}>Full Name</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="John Doe"
                      placeholderTextColor={colors.slate}
                      style={inputStyle}
                    />
                  </View>
                  <View>
                    <Text style={labelStyle}>Mobile Number</Text>
                    <TextInput
                      value={mobileNumber}
                      onChangeText={setMobileNumber}
                      placeholder="+919876543210"
                      placeholderTextColor={colors.slate}
                      keyboardType="phone-pad"
                      style={inputStyle}
                    />
                  </View>
                </View>
              )}
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
                disabled={isProcessing}
                label={isProcessing ? "Processing..." : (authMode === "signIn" ? "Sign In" : "Create Account")}
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
              <AuthActionButton label="Cancel" onPress={() => setOtpTarget(null)} variant="ghost" />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Profile Modal */}
      <Modal animationType="fade" transparent visible={showProfileModal}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: spacing.md }}>
          <Card style={{ gap: spacing.md }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.ink }}>Complete your profile</Text>
            <ScrollView contentContainerStyle={{ gap: spacing.md }} style={{ maxHeight: 400 }}>
              <View>
                <Text style={labelStyle}>Full Name</Text>
                <TextInput value={name} onChangeText={setName} placeholder="John Doe" style={inputStyle} />
              </View>
              <View>
                <Text style={labelStyle}>Email Address</Text>
                <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" style={inputStyle} />
              </View>
              <View>
                <Text style={labelStyle}>Mobile Number</Text>
                <TextInput value={mobileNumber} onChangeText={setMobileNumber} placeholder="+919876543210" keyboardType="phone-pad" style={inputStyle} />
              </View>
              <View>
                <Text style={labelStyle}>Date of Birth</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={{ ...inputStyle, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Text style={{ color: dob ? colors.ink : colors.slate }}>
                    {dob.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={colors.slate} />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={dob}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
                {Platform.OS === "web" && showDatePicker && (
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={{ marginTop: spacing.xs, alignSelf: "flex-end" }}
                  >
                    <Text style={{ color: colors.accent, fontWeight: "600" }}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View>
                <Text style={labelStyle}>Gender</Text>
                <View style={{ position: "relative" }}>
                  <RNPickerSelect
                    onValueChange={(value) => setGender(value)}
                    value={gender}
                    items={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Others", value: "others" },
                    ]}
                    style={pickerSelectStyles}
                    placeholder={{ label: "Select gender...", value: null }}
                    Icon={() => <Ionicons name="chevron-down" size={20} color={colors.slate} />}
                  />
                </View>
              </View>
            </ScrollView>

            <AuthActionButton
              disabled={isProcessing}
              label={isProcessing ? "Saving..." : "Continue to Dashboard"}
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.mist,
    borderRadius: radii.md,
    color: colors.ink,
    paddingRight: 30,
    backgroundColor: "#ffffff",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.mist,
    borderRadius: radii.md,
    color: colors.ink,
    paddingRight: 30,
    backgroundColor: "#ffffff",
  },
  inputWeb: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.mist,
    borderRadius: radii.md,
    color: colors.ink,
    paddingRight: 30,
    backgroundColor: "#ffffff",
    cursor: "pointer",
    outlineWidth: 0,
  },
  iconContainer: {
    top: 12,
    right: 12,
  },
});
