import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";

import { buildDashboardFeed, mockItems, type BaseItem, type QuickCaptureInput } from "@life-admin/domain";
import { quickCapturePrompt } from "@life-admin/ai";

const extra = Constants.expoConfig?.extra as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export const supabase =
  extra?.supabaseUrl && extra?.supabaseAnonKey
    ? createClient(extra.supabaseUrl, extra.supabaseAnonKey, {
        auth: {
          ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          lock: processLock
        }
      })
    : null;

export type LifeAdminClient = {
  getDashboardFeed: () => Promise<ReturnType<typeof buildDashboardFeed>>;
  listItemsByType: (type: BaseItem["type"]) => Promise<BaseItem[]>;
  submitQuickCapture: (input: QuickCaptureInput) => Promise<{
    promptPreview: string;
    detectedType: BaseItem["type"];
    confidence: number;
  }>;
};

export const lifeAdminClient: LifeAdminClient = {
  async getDashboardFeed() {
    return buildDashboardFeed(mockItems);
  },
  async listItemsByType(type) {
    return mockItems.filter((item) => item.type === type);
  },
  async submitQuickCapture(input) {
    const normalized = input.text.toLowerCase();
    const detectedType = normalized.includes("renew")
      ? "renewal"
      : normalized.includes("doctor") || normalized.includes("appointment")
        ? "appointment"
        : normalized.includes("document") || normalized.includes("policy")
          ? "document"
          : normalized.includes("list") || normalized.includes("buy")
            ? "shopping_list"
            : normalized.includes("birthday") || normalized.includes("anniversary")
              ? "important_date"
              : "bill";

    return {
      promptPreview: quickCapturePrompt(input.text),
      detectedType,
      confidence: 0.79
    };
  }
};
