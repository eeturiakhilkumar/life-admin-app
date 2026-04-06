import { create } from "zustand";

type AppState = {
  aiAssistEnabled: boolean;
  privacyMode: "standard" | "strict";
  notificationsEnabled: boolean;
  setAiAssistEnabled: (enabled: boolean) => void;
  setPrivacyMode: (mode: "standard" | "strict") => void;
  setNotificationsEnabled: (enabled: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  aiAssistEnabled: true,
  privacyMode: "strict",
  notificationsEnabled: false,
  setAiAssistEnabled: (aiAssistEnabled) => set({ aiAssistEnabled }),
  setPrivacyMode: (privacyMode) => set({ privacyMode }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled })
}));

