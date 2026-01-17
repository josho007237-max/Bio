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

export const promoConfigSchema = z.object({
  campaign: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    avatarUrl: z.string().optional(),
    heroUrl: z.string().optional(),
    steps: z.array(z.string()),
  }),
  audience: z.object({
    enabled: z.boolean().default(true),
    title: z.string().default("Subscribe"),
    description: z.string().default("Get updates and exclusive offers."),
  }),
  design: z.object({
    headerLayout: z.enum(["classic", "hero"]).default("hero"),
    background: z.object({
      style: z.enum(["solid", "gradient", "image"]).default("solid"),
      color1: z.string().default("#000000"),
      color2: z.string().optional(),
      imageUrl: z.string().optional(),
    }),
    typography: z.object({
      titleFont: z.string().default("Anton"),
      titleColor: z.string().default("#FFFFFF"),
      bodyColor: z.string().default("#EDE5E5"),
    }),
    buttons: z.object({
      style: z.enum(["solid", "outline"]).default("solid"),
      backgroundColor: z.string().default("#FFFFFF"),
      textColor: z.string().default("#000000"),
      borderRadius: z.number().min(0).max(32).default(16),
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
      downloadUrl: z.string(),
    }),
  ),
  activities: z.array(
    z.object({
      id: z.string(),
      platform: z.enum(["x", "facebook", "youtube", "tiktok", "web"]),
      label: z.string(),
      url: z.string(),
      instruction: z.string().optional(),
    }),
  ),
});

export const audienceEntrySchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  createdAt: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PromoConfig = z.infer<typeof promoConfigSchema>;
export type AudienceEntry = z.infer<typeof audienceEntrySchema>;
