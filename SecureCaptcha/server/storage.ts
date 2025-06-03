import { 
  users, 
  type User, 
  type InsertUser, 
  type CaptchaSession, 
  type InsertCaptchaSession 
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Captcha session methods
  createCaptchaSession(session: InsertCaptchaSession): Promise<CaptchaSession>;
  getCaptchaSession(sessionId: string): Promise<CaptchaSession | undefined>;
  updateCaptchaSession(sessionId: string, updates: Partial<CaptchaSession>): Promise<CaptchaSession | undefined>;
  deleteCaptchaSession(sessionId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private captchaSessions: Map<string, CaptchaSession>;
  currentId: number;
  currentCaptchaId: number;

  constructor() {
    this.users = new Map();
    this.captchaSessions = new Map();
    this.currentId = 1;
    this.currentCaptchaId = 1;
    
    // Add a demo user
    this.createUser({
      username: "demo",
      password: "password123"
    });
    
    console.log("🔐 Demo user created: username='demo', password='password123'");
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async createCaptchaSession(session: InsertCaptchaSession): Promise<CaptchaSession> {
    const id = this.currentCaptchaId++;
    const captchaSession: CaptchaSession = { 
      ...session, 
      id,
      attempts: 0,
      verified: false
    };
    this.captchaSessions.set(session.sessionId, captchaSession);
    return captchaSession;
  }
  
  async getCaptchaSession(sessionId: string): Promise<CaptchaSession | undefined> {
    return this.captchaSessions.get(sessionId);
  }
  
  async updateCaptchaSession(sessionId: string, updates: Partial<CaptchaSession>): Promise<CaptchaSession | undefined> {
    const session = this.captchaSessions.get(sessionId);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.captchaSessions.set(sessionId, updatedSession);
    return updatedSession;
  }
  
  async deleteCaptchaSession(sessionId: string): Promise<boolean> {
    return this.captchaSessions.delete(sessionId);
  }
}

export const storage = new MemStorage();
