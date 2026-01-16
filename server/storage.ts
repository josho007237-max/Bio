import { type PromoConfig, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();

const configDir = path.resolve(process.cwd(), "data");
const configPath = path.join(configDir, "promo-config.json");

const defaultConfig: PromoConfig = {
  campaign: {
    title: "",
    steps: [],
  },
  discounts: [],
  downloads: [],
  activities: [],
};

export async function loadConfig(): Promise<PromoConfig> {
  try {
    const raw = await fs.readFile(configPath, "utf-8");
    return JSON.parse(raw) as PromoConfig;
  } catch (error) {
    const notFound =
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT";
    if (!notFound) {
      throw error;
    }
  }

  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
  return defaultConfig;
}

export async function saveConfig(config: PromoConfig): Promise<void> {
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}
