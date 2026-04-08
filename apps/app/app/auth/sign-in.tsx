import { useState } from "react";
import { Redirect } from "expo-router";
import { Modal, Platform, Text, TextInput, View } from "react-native";

import { Card, colors, Section, spacing, StatChip } from "@life-admin/ui";
import { AuthActionButton } from "../../src/components/auth-action-button";
import { Screen } from "../../src/components/screen";
import { buildPhoneNumberFromInput, sanitizeOtpToken } from "../../src/lib/auth-utils";
import { useResponsiveLayout } from "../../src/lib/layout";
import { useAuth } from "../../src/providers/auth-provider";

export default function SignInScreen() {
  const { isTablet } = useResponsiveLayout();
  const { isConfigured, isInitializing, requestOtp, resetAuthFlow, session, verifyOtp } = useAuth();
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpTarget, setOtpTarget] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isInitializing && session) {
    return <Redirect href="/dashboard" />;
  }

  const phoneDraft = buildPhoneNumberFromInput(mobileNumber, {
    defaultCountryCode: "+91"
  });
  const shouldShowPhoneValidation = mobileNumber.trim().length > 0;
  const phoneValidationMessage = shouldShowPhoneValidation ? phoneDraft.error : null;
  const canRequestOtp = isConfigured && !isSendingOtp && Boolean(phoneDraft.phone);
  const phoneFieldBorderColor = phoneValidationMessage ? colors.accent : colors.mist;

  const sendOtp = async () => {
    const { phone, error } = phoneDraft;

    if (!phone || error) {
      setErrorMessage(error);
      setInfoMessage(null);
      return;
    }

    setIsSendingOtp(true);
    setErrorMessage(null);

    try {
      await requestOtp(phone);
      setOtpTarget(phone);
      setInfoMessage(`OTP sent to ${phone}. Enter the 6-digit code to unlock your Life Admin workspace.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "We could not send the OTP right now.");
      setInfoMessage(null);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyCode = async () => {
    if (!otpTarget) {
      setErrorMessage("Request an OTP before verifying the code.");
      setInfoMessage(null);
      return;
    }

    if (sanitizeOtpToken(otpCode).length !== 6) {
      setErrorMessage("Enter the 6-digit OTP sent to your mobile number.");
      setInfoMessage(null);
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMessage(null);

    try {
      await verifyOtp({
        phone: otpTarget,
        token: sanitizeOtpToken(otpCode)
      });
      setInfoMessage("OTP verified. Redirecting to your dashboard...");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "We could not verify that OTP.");
      setInfoMessage(null);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const closeOtpModal = () => {
    setOtpCode("");
    setOtpTarget(null);
    resetAuthFlow();
  };

  const handleMobileNumberChange = (value: string) => {
    setMobileNumber(value);
    setErrorMessage(null);
    setInfoMessage(null);

    if (otpTarget || otpCode) {
      setOtpCode("");
      setOtpTarget(null);
    }

    resetAuthFlow();
  };

  return (
    <>
      <Screen
        title="Secure mobile OTP sign-in"
        subtitle="Your Life Admin dashboard stays private until a verified mobile session is active. Sign in once, then manage bills, appointments, renewals, shopping lists, documents, and the rest of your daily operations in one place."
        rightRail={
          <View style={{ flexDirection: isTablet ? "column" : "row", flexWrap: "wrap", gap: spacing.sm }}>
            <StatChip label="Auth" value="Phone + OTP" />
            <StatChip label="Session" value="Firebase" />
          </View>
        }
      >
        <Card style={{ gap: spacing.md }}>
          <Section
            eyebrow="Sign in"
            title="Enter your mobile number"
            description="Use one mobile-number field, request the OTP, then verify it in the popup before entering the application."
          />

          {!isConfigured ? (
            <View
              style={{
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "#f0c36d",
                backgroundColor: "#fff6df",
                padding: spacing.md,
              gap: spacing.xs
            }}
          >
              <Text style={{ color: colors.ink, fontWeight: "700" }}>Firebase phone auth still needs setup</Text>
              <Text style={{ color: colors.slate, lineHeight: 22 }}>
                This app needs its Firebase config, an authorized domain, and Firebase Phone sign-in enabled before OTP login can work.
              </Text>
            </View>
          ) : null}

          <View style={{ gap: spacing.xs }}>
            <Text style={{ color: colors.ink, fontWeight: "700" }}>Mobile number</Text>
            <TextInput
              value={mobileNumber}
              onChangeText={handleMobileNumberChange}
              placeholder="Enter your mobile number"
              placeholderTextColor={colors.slate}
              keyboardType="phone-pad"
              autoCapitalize="none"
              style={{
                borderWidth: 1,
                borderColor: phoneFieldBorderColor,
                borderRadius: 18,
                padding: spacing.md,
                backgroundColor: "#ffffff"
              }}
            />
            <Text style={{ color: colors.slate, lineHeight: 22 }}>
              Example: 9876543210. For other countries, include the country code, like +14155552671.
            </Text>
            {phoneValidationMessage ? (
              <View
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#f2b6ae",
                  backgroundColor: colors.accentSoft,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm
                }}
              >
                <Text style={{ color: colors.accent, fontWeight: "700", marginBottom: 2 }}>Please check your number</Text>
                <Text style={{ color: colors.accent, lineHeight: 22 }}>{phoneValidationMessage}</Text>
              </View>
            ) : shouldShowPhoneValidation ? (
              <Text style={{ color: "#1d6f42", lineHeight: 22 }}>
                Number looks good. You can send the OTP now.
              </Text>
            ) : null}
            {Platform.OS === "web" ? <View nativeID="firebase-recaptcha-container" style={{ width: 1, height: 1 }} /> : null}
          </View>

          <AuthActionButton
            disabled={!canRequestOtp}
            label={isSendingOtp ? "Sending OTP..." : "Send OTP"}
            onPress={() => void sendOtp()}
            variant="primary"
          />

          {infoMessage ? <Text style={{ color: colors.slate, lineHeight: 22 }}>{infoMessage}</Text> : null}
          {errorMessage ? <Text style={{ color: colors.accent, lineHeight: 22 }}>{errorMessage}</Text> : null}

          <Section
            eyebrow="Why sign in"
            title="One trusted workspace for life admin"
            description="Once authenticated, the app becomes your private operations dashboard for bills, appointments, renewals, important dates, shopping lists, documents, and future travel ticket workflows."
          />
        </Card>
      </Screen>

      <Modal animationType="fade" transparent visible={Boolean(otpTarget)} onRequestClose={closeOtpModal}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(20, 33, 61, 0.35)",
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.md
          }}
        >
          <Card style={{ width: "100%", maxWidth: 440, gap: spacing.md }}>
            <Section
              eyebrow="Verify OTP"
              title="Enter the 6-digit code"
              description={`We sent an OTP to ${otpTarget}. Verify it to unlock your dashboard.`}
            />

            <TextInput
              value={otpCode}
              onChangeText={(value) => setOtpCode(sanitizeOtpToken(value))}
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              autoCapitalize="none"
              style={{
                borderWidth: 1,
                borderColor: colors.mist,
                borderRadius: 18,
                padding: spacing.md,
                backgroundColor: "#ffffff",
                letterSpacing: 4
              }}
            />

            <View style={{ flexDirection: isTablet ? "row" : "column", gap: spacing.sm }}>
              <AuthActionButton
                disabled={isVerifyingOtp}
                label={isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                onPress={() => void verifyCode()}
                variant="primary"
              />

              <AuthActionButton
                disabled={!isConfigured || isSendingOtp}
                label="Resend code"
                onPress={() => void sendOtp()}
                variant="secondary"
              />

              <AuthActionButton label="Change number" onPress={closeOtpModal} variant="ghost" />
            </View>
          </Card>
        </View>
      </Modal>
    </>
  );
}
