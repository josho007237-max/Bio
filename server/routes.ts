import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { promoConfigSchema } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";
import {
  appendAudience,
  appendSubscriber,
  loadAudience,
  loadConfig,
  loadSubscribers,
  saveConfig,
} from "./storage";

const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD;
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const uploadDir = path.resolve(process.cwd(), "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const upload = multer({ dest: uploadDir });

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const password = req.header("x-admin-password");
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return next();
  };

  app.use("/uploads", express.static(uploadDir));

  app.get("/api/config", async (_req, res, next) => {
    try {
      const config = await loadConfig();
      res.json(config);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/config", requireAdmin, async (req, res, next) => {
    try {
      const parsed = promoConfigSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid config",
          errors: parsed.error.flatten(),
        });
      }
      await saveConfig(parsed.data);
      return res.json(parsed.data);
    } catch (error) {
      return next(error);
    }
  });

  app.post(
    "/api/upload",
    requireAdmin,
    upload.single("file"),
    (req, res) => {
      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }
      return res.json({ url: `/uploads/${req.file.filename}` });
    },
  );

  const audienceSchema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    campaign: z.string().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
  });

  app.get("/api/audience", async (_req, res, next) => {
    try {
      const entries = await loadAudience();
      res.set("x-google-sheets-enabled", String(Boolean(GOOGLE_SHEETS_WEBHOOK_URL)));
      res.json(entries);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/audience", async (req, res, next) => {
    try {
      const parsed = audienceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid audience payload",
          errors: parsed.error.flatten(),
        });
      }

      const entry = {
        ...parsed.data,
        timestamp: new Date().toISOString(),
      };

      await appendAudience(entry);

      if (GOOGLE_SHEETS_WEBHOOK_URL) {
        try {
          await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...entry, timestamp: entry.timestamp }),
          });
        } catch (error) {
          console.warn("Failed to post audience to Google Sheets webhook", error);
        }
      }

      return res.json({ ok: true });
    } catch (error) {
      return next(error);
    }
  });

  const subscribeSchema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
  });

  app.get("/api/subscribers", async (_req, res, next) => {
    try {
      const entries = await loadSubscribers();
      res.json(entries);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/subscribe", async (req, res, next) => {
    try {
      const parsed = subscribeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid subscriber payload",
          errors: parsed.error.flatten(),
        });
      }

      const config = await loadConfig();
      const campaignTitle = config.campaign.title?.trim() || "Default Campaign";
      const rawSource = req.query.source ?? req.query.utm_source;
      const trafficSource = Array.isArray(rawSource) ? rawSource[0] : rawSource;

      const entry = {
        id: randomUUID(),
        email: parsed.data.email,
        name: parsed.data.name,
        campaign: campaignTitle,
        trafficSource: trafficSource || undefined,
        signedAt: new Date().toISOString(),
      };

      await appendSubscriber(entry);

      return res.json({ message: "Subscribed", id: entry.id });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/subscribers/export-preview", async (_req, res, next) => {
    try {
      const entries = await loadSubscribers();
      const rows = [
        ["Email", "Name", "Campaign", "Traffic Source", "Signed At"],
        ...entries.map((entry) => [
          entry.email,
          entry.name ?? "",
          entry.campaign ?? "",
          entry.trafficSource ?? "",
          entry.signedAt,
        ]),
      ];
      res.json(rows);
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
