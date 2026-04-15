import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { Pressable, Text, TextInput, View, StyleSheet, Platform, TouchableOpacity, Modal } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNPickerSelect from "react-native-picker-select";
import { useState } from "react";
import { Calendar } from "react-native-calendars";

import { Card, colors, Section, spacing } from "@life-admin/ui";

import { RequireAuth } from "../../src/components/require-auth";
import { Screen } from "../../src/components/screen";
import { useAuth } from "../../src/providers/auth-provider";

const profileSchema = z.object({
  displayName: z.string().min(4, "Username must be at least 4 characters").max(20, "Username must be at most 20 characters"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileUpdateScreen() {
  const { profile, completeProfile } = useAuth();
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.displayName || "",
      dateOfBirth: profile?.dateOfBirth || "",
      gender: profile?.gender || ""
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await completeProfile({
        displayName: data.displayName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender
      });
      router.back();
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <RequireAuth>
      <Screen title="Update Profile">
        <Section eyebrow="Account" title="Personal Information" />
        <Card style={{ gap: spacing.md }}>
          <View style={styles.field}>
            <Text style={styles.label}>Display Name</Text>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.displayName && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Your Name"
                />
              )}
            />
            {errors.displayName && <Text style={styles.errorText}>{errors.displayName.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Date of Birth</Text>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                    <Text style={{ color: value ? colors.ink : colors.slate + "80" }}>{value || "YYYY-MM-DD"}</Text>
                  </TouchableOpacity>

                  {Platform.OS === "web" ? (
                    <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
                      <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
                        <View style={styles.calendarModal}>
                          <Calendar
                            current={value || undefined}
                            onDayPress={(day: any) => {
                              onChange(day.dateString);
                              setShowDatePicker(false);
                            }}
                            markedDates={
                              value
                                ? {
                                    [value]: { selected: true, selectedColor: colors.accent }
                                  }
                                : {}
                            }
                            theme={{
                              todayTextColor: colors.accent,
                              selectedDayBackgroundColor: colors.accent,
                              arrowColor: colors.accent
                            }}
                          />
                        </View>
                      </Pressable>
                    </Modal>
                  ) : (
                    showDatePicker && (
                      <DateTimePicker
                        value={value ? new Date(value) : new Date()}
                        mode="date"
                        display="default"
                        onChange={(_, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            onChange(formatDate(selectedDate));
                          }
                        }}
                      />
                    )
                  )}
                </View>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Gender</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <View style={styles.pickerContainer}>
                  <RNPickerSelect
                    onValueChange={onChange}
                    value={value}
                    items={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Others", value: "others" }
                    ]}
                    placeholder={{ label: "Select Gender", value: null }}
                    style={{
                      inputIOS: styles.pickerInput,
                      inputAndroid: styles.pickerInput,
                      inputWeb: styles.pickerInput,
                      placeholder: { color: colors.slate + "80" }
                    }}
                  />
                </View>
              )}
            />
          </View>

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? colors.accent + "CC" : colors.accent },
              isSubmitting && { opacity: 0.5 }
            ]}
          >
            <Text style={styles.buttonText}>{isSubmitting ? "Updating..." : "Save Changes"}</Text>
          </Pressable>
        </Card>
      </Screen>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.slate
  },
  input: {
    borderWidth: 1,
    borderColor: colors.mist,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: colors.ink,
    minHeight: 50,
    justifyContent: "center"
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.mist,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden"
  },
  pickerInput: {
    padding: spacing.md,
    fontSize: 16,
    color: colors.ink,
    width: "100%",
    backgroundColor: "transparent",
    minHeight: 50
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  calendarModal: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  inputError: {
    borderColor: "red"
  },
  errorText: {
    color: "red",
    fontSize: 12
  },
  button: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: 999,
    alignItems: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16
  }
});
