import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { promoConfigSchema } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";
import { appendAudience, loadAudience, loadConfig, saveConfig } from "./storage";

const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD;

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
      return res.status(201).json({ url: `/uploads/${req.file.filename}` });
    },
  );

  const audienceSchema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
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

      const rawSource = req.query.source ?? req.header("x-audience-source");
      const source = Array.isArray(rawSource) ? rawSource[0] : rawSource;
      const config = await loadConfig();

      const entry = {
        id: randomUUID(),
        email: parsed.data.email,
        name: parsed.data.name,
        createdAt: new Date().toISOString(),
        source: source || undefined,
        campaignId: config.campaign.title || undefined,
      };

      await appendAudience(entry);

      return res.json({ message: "Audience captured", id: entry.id });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/audience", requireAdmin, async (_req, res, next) => {
    try {
      const entries = await loadAudience();
      res.json(entries);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/audience/export", requireAdmin, async (_req, res, next) => {
    try {
      const entries = await loadAudience();
      const header = ["ID", "Created At", "Email", "Name", "Source", "Campaign ID", "Notes"];
      const rows = entries.map((entry) => [
        entry.id,
        entry.createdAt,
        entry.email ?? "",
        entry.name ?? "",
        entry.source ?? "",
        entry.campaignId ?? "",
        entry.notes ?? "",
      ]);
      const csv = [header, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      res
        .status(200)
        .set({
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=\"audience-export.csv\"",
        })
        .send(csv);
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
