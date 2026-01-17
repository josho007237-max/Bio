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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PromoConfig = z.infer<typeof promoConfigSchema>;
