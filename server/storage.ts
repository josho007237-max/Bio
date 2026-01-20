import {
  type AudienceEntry,
  type ClickLogEntry,
  type PromoConfig,
  type User,
  type InsertUser,
} from "@shared/schema";
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

const dataDir = path.resolve(process.cwd(), "data");
const configPath = path.join(dataDir, "promo-config.json");
const audiencePath = path.join(dataDir, "audience.json");
const clicksPath = path.join(dataDir, "clicks.json");

// defaultConfig ต้อง match กับ PromoConfig (โดยเฉพาะ design)
const defaultConfig: PromoConfig = {
  campaign: {
    title: "",
    shareInstruction: "",
    // field อื่น ๆ ที่มีใน schema สามารถเติมทีหลังได้ เช่น subtitle/avatarUrl/heroUrl/shareMessage
    steps: [],
  },
  profile: {
    title: "",
    subtitle: "",
    avatarUrl: "",
    heroUrl: "",
  },
  discounts: [],
  downloads: [],
  activities: [],
  design: {
    background: {
      style: "solid",
      // schema หน้า public ใช้ color1/color2 + imageUrl
      color1: "#0f172a",
      color2: "#0f172a",
      imageUrl: "",
    },
    typography: {
      // หน้า public ใช้ titleColor/bodyColor/titleFont
      titleColor: "#ffffff",
      bodyColor: "#e5e7eb",
      titleFont: "Sans",
    },
    buttons: {
      // หน้า public ใช้ style/textColor/backgroundColor/borderRadius (number)
      style: "solid",
      textColor: "#0f172a",
      backgroundColor: "#f97316",
      borderRadius: 999,
    },
    // ใช้กับ ProfileHeader layout
    headerLayout: "stacked",
  },
};

const isMissingFileError = (error: unknown) =>
  error instanceof Error &&
  "code" in error &&
  (error as NodeJS.ErrnoException).code === "ENOENT";

export async function loadConfig(): Promise<PromoConfig> {
  try {
    const raw = await fs.readFile(configPath, "utf-8");
    return JSON.parse(raw) as PromoConfig;
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error;
    }
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
  return defaultConfig;
}

export async function saveConfig(config: PromoConfig): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

export async function loadAudience(): Promise<AudienceEntry[]> {
  try {
    const raw = await fs.readFile(audiencePath, "utf-8");
    return JSON.parse(raw) as AudienceEntry[];
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error;
    }
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(audiencePath, JSON.stringify([], null, 2));
  return [];
}

export async function saveAudience(entries: AudienceEntry[]): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(audiencePath, JSON.stringify(entries, null, 2));
}

export async function loadClicks(): Promise<ClickLogEntry[]> {
  try {
    const raw = await fs.readFile(clicksPath, "utf-8");
    return JSON.parse(raw) as ClickLogEntry[];
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error;
    }
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(clicksPath, JSON.stringify([], null, 2));
  return [];
}

export async function saveClicks(entries: ClickLogEntry[]): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(clicksPath, JSON.stringify(entries, null, 2));
}
