import { useState, useEffect } from 'react';
import { z } from 'zod';

export const DownloadItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  fileUrl: z.string(),
  isUploaded: z.boolean().optional(),
});

export const DiscountItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  code: z.string(),
  ctaLabel: z.string(),
  ctaUrl: z.string(),
  imageUrl: z.string().optional(),
  isUploaded: z.boolean().optional(),
});

export const PostItemSchema = z.object({
  id: z.string(),
  platform: z.enum(['twitter', 'facebook', 'youtube', 'tiktok', 'website', 'other']),
  url: z.string(),
  label: z.string().optional(),
  instruction: z.string().optional(),
});

export const AppConfigSchema = z.object({
  profile: z.object({
    title: z.string(),
    subtitle: z.string(),
    avatarUrl: z.string(),
    heroUrl: z.string(),
  }),
  campaign: z.object({
    name: z.string().optional(),
    shareInstruction: z.string().optional(),
  }).optional(),
  theme: z.enum(['dark-gold', 'light-minimal']),
  instructions: z.array(z.string()),
  downloads: z.array(DownloadItemSchema),
  discounts: z.array(DiscountItemSchema),
  posts: z.array(PostItemSchema),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type DownloadItem = z.infer<typeof DownloadItemSchema>;
export type DiscountItem = z.infer<typeof DiscountItemSchema>;
export type PostItem = z.infer<typeof PostItemSchema>;

const DEFAULT_CONFIG: AppConfig = {
  profile: {
    title: "Premium Creator Hub",
    subtitle: "Get exclusive assets, discounts, and updates.",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60",
    heroUrl: "", // Will be set to generated image in component if empty
  },
  campaign: {
    name: "โปรโมชั่นพิเศษประจำเดือน",
    shareInstruction: "ทำตามขั้นตอนง่ายๆ เพื่อรับสิทธิพิเศษ",
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
  posts: [
    {
      id: '1',
      platform: 'twitter',
      url: 'https://twitter.com/replit/status/174567890',
      label: 'Retweet this post',
      instruction: 'Spread the word to unlock bonus items!'
    },
    {
      id: '2',
      platform: 'youtube',
      url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      label: 'Watch our latest tutorial',
      instruction: 'Learn how to use these assets.'
    }
  ]
};

const STORAGE_KEY = 'promo_hub_config_v2'; // Bumped version for new schema

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migration: config v1 "socials" -> v2 "posts"
        if (parsed.socials && !parsed.posts) {
          parsed.posts = parsed.socials.map((s: any) => ({
             ...s,
             platform: s.platform === 'instagram' ? 'website' : s.platform, // simple map
             instruction: ''
          }));
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse config", e);
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const saveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      alert("Storage limit reached! Please remove some large images or files.");
      console.error("Storage full", e);
    }
  };

  const resetConfig = () => {
    saveConfig(DEFAULT_CONFIG);
  };

  return { config, saveConfig, resetConfig };
}
