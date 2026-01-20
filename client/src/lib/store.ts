// client/src/lib/store.ts

import { create } from "zustand";
import { promoConfigSchema, type PromoConfig } from "@shared/schema";

// ใช้ PromoConfig เป็น AppConfig ฝั่ง frontend
export type AppConfig = PromoConfig;

// schema เดียวกัน เอาไปใช้กับ react-hook-form ในหน้า admin
export const AppConfigSchema = promoConfigSchema;

type AppConfigState = {
  config: AppConfig;
  loading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
  saveConfig: (nextConfig: AppConfig, adminPassword: string) => Promise<void>;
};

/**
 * ค่าเริ่มต้นแบบง่าย ๆ ให้เว็บไม่พังตอนโหลดครั้งแรก
 * (จริง ๆ แล้วเราจะไปโหลดของจริงจาก /api/config อีกที)
 */
const defaultConfig: AppConfig = {
  campaign: {
    title: "",
    shareInstruction: "ทำตามขั้นตอนง่าย ๆ เพื่อรับสิทธิพิเศษ",
    shareMessage: "มารับโค้ดส่วนลดและของแจกพิเศษได้ที่นี่ 🎁",
    steps: [],
  },
  profile: {
    title: "",
    subtitle: "",
    avatarUrl: "",
    // heroUrl จะอ่านจาก campaign.heroUrl แทน
  } as any,
  design: {
    headerLayout: "hero",
    background: {
      style: "solid",
      color1: "#000000",
      color2: "#000000",
    },
    typography: {
      titleFont: "Sans",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
    },
    buttons: {
      style: "solid",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      borderRadius: 16,
    },
  } as any,
  discounts: [],
  downloads: [],
  activities: [],
  audience: {
    enabled: true,
    title: "Subscribe",
    description: "Get updates and exclusive offers.",
  },
};

/**
 * Zustand store ใช้ร่วมกันทั้งหน้า public และ admin
 */
export const useAppConfig = create<AppConfigState>((set) => ({
  config: defaultConfig,
  loading: false,
  error: null,

  // โหลด config จาก backend
  fetchConfig: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/config");
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      const data = await response.json();

      // ตรวจรูปแบบด้วย zod (ถ้า config.json พังจะรู้ตรงนี้)
      const parsed = promoConfigSchema.parse(data);

      set({ config: parsed, loading: false });
    } catch (error) {
      console.error(error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // เซฟ config ไป backend (ใช้ในหน้า admin)
  saveConfig: async (nextConfig, adminPassword) => {
    // validate อีกรอบก่อนส่ง
    const parsed = promoConfigSchema.parse(nextConfig);

    const response = await fetch("/api/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": adminPassword,
      },
      body: JSON.stringify(parsed),
    });

    if (!response.ok) {
      throw new Error(`Failed to save config: ${response.status}`);
    }

    // อัปเดต state ให้ตรงกับที่เซฟ
    set({ config: parsed });
  },
}));
