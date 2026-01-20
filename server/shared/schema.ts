import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const audienceEntrySchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  source: z.string().optional(),
  campaignId: z.string().optional(),
  notes: z.string().optional(),
});

export const promoConfigSchema = z.object({
  campaign: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    avatarUrl: z.string().optional(),
    heroUrl: z.string().optional(),
    shareMessage: z.string().optional(),
    steps: z.array(z.string()),
  }),
  profile: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    avatarUrl: z.string().optional(),
  }),
  audience: z.object({
    enabled: z.boolean(),
    title: z.string(),
    description: z.string().optional(),
  }),
  design: z.object({
    headerLayout: z.enum(["classic", "hero"]),
    background: z.object({
      style: z.enum(["solid", "gradient", "image"]),
      color1: z.string(),
      color2: z.string().optional(),
      imageUrl: z.string().optional(),
    }),
    typography: z.object({
      titleFont: z.string(),
      titleColor: z.string(),
      bodyColor: z.string(),
    }),
    buttons: z.object({
      style: z.enum(["solid", "outline"]),
      backgroundColor: z.string(),
      textColor: z.string(),
      borderRadius: z.number(),
    }),
  }),
  discounts: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      code: z.string(),
      description: z.string().optional(),
      ctaLabel: z.string().optional(),
      ctaUrl: z.string().optional(),
      imageUrl: z.string().optional(),
    }),
  ),
  downloads: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      fileUrl: z.string().optional(),
    }),
  ),
  activities: z.array(
    z.object({
      id: z.string(),
      platform: z.enum(["x", "facebook", "youtube", "tiktok", "web", "other"]),
      label: z.string(),
      url: z.string(),
      instruction: z.string().optional(),
    }),
  ),
});

export type AudienceEntry = z.infer<typeof audienceEntrySchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PromoConfig = z.infer<typeof promoConfigSchema>;
