import { useState, useEffect } from 'react';
import { z } from 'zod';

export const DownloadItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  fileUrl: z.string(),
});

export const DiscountItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  code: z.string(),
  ctaLabel: z.string(),
  ctaUrl: z.string(),
  imageUrl: z.string().optional(),
});

export const SocialItemSchema = z.object({
  id: z.string(),
  platform: z.enum(['twitter', 'facebook', 'youtube', 'instagram', 'other']),
  url: z.string(),
  label: z.string().optional(),
});

export const AppConfigSchema = z.object({
  profile: z.object({
    title: z.string(),
    subtitle: z.string(),
    avatarUrl: z.string(),
    heroUrl: z.string(),
  }),
  theme: z.enum(['dark-gold', 'light-minimal']),
  instructions: z.array(z.string()),
  downloads: z.array(DownloadItemSchema),
  discounts: z.array(DiscountItemSchema),
  socials: z.array(SocialItemSchema),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type DownloadItem = z.infer<typeof DownloadItemSchema>;
export type DiscountItem = z.infer<typeof DiscountItemSchema>;
export type SocialItem = z.infer<typeof SocialItemSchema>;

const DEFAULT_CONFIG: AppConfig = {
  profile: {
    title: "Premium Creator Hub",
    subtitle: "Get exclusive assets, discounts, and updates.",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60",
    heroUrl: "", // Will be set to generated image in component if empty
  },
  theme: 'dark-gold',
  instructions: [
    "Copy the discount code below",
    "Download your free assets",
    "Share your creation & tag us!"
  ],
  downloads: [
    {
      id: '1',
      title: 'Lightroom Presets Vol. 1',
      description: '5 Professional presets for urban photography.',
      fileUrl: '#',
    },
    {
      id: '2',
      title: 'Social Media Templates',
      description: 'PSD & Canva files for your stories.',
      fileUrl: '#',
    }
  ],
  discounts: [
    {
      id: '1',
      title: '50% OFF Annual Plan',
      description: 'Use this code at checkout to get half off your first year.',
      code: 'PROMO2025',
      ctaLabel: 'Redeem Now',
      ctaUrl: 'https://example.com/redeem',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=60'
    }
  ],
  socials: [
    {
      id: '1',
      platform: 'twitter',
      url: 'https://twitter.com/replit',
      label: 'Follow us on X'
    },
    {
      id: '2',
      platform: 'youtube',
      url: 'https://youtube.com/replit',
      label: 'Watch Tutorials'
    }
  ]
};

const STORAGE_KEY = 'promo_hub_config_v1';

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse config", e);
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const saveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const resetConfig = () => {
    saveConfig(DEFAULT_CONFIG);
  };

  return { config, saveConfig, resetConfig };
}
