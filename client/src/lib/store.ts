import { useCallback, useEffect, useState } from "react";
import { promoConfigSchema, type PromoConfig } from "@shared/schema";

export type DownloadItem = PromoConfig["downloads"][number];
export type DiscountItem = PromoConfig["discounts"][number];
export type ActivityItem = PromoConfig["activities"][number];

export const PromoConfigSchema = promoConfigSchema;

const DEFAULT_CONFIG: PromoConfig = {
  campaign: {
    title: "",
    subtitle: "",
    avatarUrl: "",
    heroUrl: "",
    steps: [],
  },
  audience: {
    enabled: true,
    title: "Subscribe",
    description: "Get updates and exclusive offers.",
  },
  design: {
    headerLayout: "hero",
    background: {
      style: "solid",
      color1: "#000000",
    },
    typography: {
      titleFont: "Anton",
      titleColor: "#FFFFFF",
      bodyColor: "#EDE5E5",
    },
    buttons: {
      style: "solid",
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      borderRadius: 16,
    },
  },
  discounts: [],
  downloads: [],
  activities: [],
};

export function useAppConfig() {
  const [config, setConfig] = useState<PromoConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/config");
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      const data = await response.json();
      const parsed = promoConfigSchema.safeParse(data);
      if (parsed.success) {
        setConfig(parsed.data);
      } else {
        console.error("Invalid config from API", parsed.error.flatten());
        setConfig(DEFAULT_CONFIG);
      }
    } catch (err) {
      console.error("Failed to load config", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setConfig(DEFAULT_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  return { config, setConfig, isLoading, error, reload: loadConfig };
}
