import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { generateCaptcha, generateSessionId } from "./captcha";
import { 
  captchaVerifySchema, 
  insertUserSchema, 
  loginSchema
} from "@shared/schema";
import { ZodError } from "zod";
import "./types"; // Import session type declarations

// MemoryStore for session storage
import createMemoryStore from "memorystore";
const MemoryStore = createMemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "captcha-service-secret",
      resave: false,
      saveUninitialized: true,
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Generate a new CAPTCHA
  app.get("/api/captcha", async (req: Request, res: Response) => {
    // Generate captcha
    const captcha = generateCaptcha();
    const sessionId = generateSessionId();
    
    // Store in session
    req.session.captchaSessionId = sessionId;
    
    // Store in memory storage
    await storage.createCaptchaSession({
      sessionId,
      captchaText: captcha.text,
      createdAt: Date.now()
    });
    
    // Return captcha image to client
    return res.json({
      image: captcha.dataUrl,
    });
  });

  // Verify CAPTCHA without form submission
  app.post("/api/captcha/verify", async (req: Request, res: Response) => {
    try {
      const { captchaInput } = captchaVerifySchema.parse(req.body);
      const sessionId = req.session.captchaSessionId;
      
      if (!sessionId) {
        return res.status(400).json({ 
          message: "CAPTCHA session expired. Please refresh and try again." 
        });
      }
      
      const captchaSession = await storage.getCaptchaSession(sessionId);
      
      if (!captchaSession) {
        return res.status(400).json({ 
          message: "CAPTCHA session expired. Please refresh and try again." 
        });
      }
      
      // Update attempts - ensure attempts is a number even if null
      const currentAttempts = typeof captchaSession.attempts === 'number' ? captchaSession.attempts : 0;
      await storage.updateCaptchaSession(sessionId, {
        attempts: currentAttempts + 1
      });
      
      // Too many attempts
      if (currentAttempts >= 5) {
        await storage.deleteCaptchaSession(sessionId);
        delete req.session.captchaSessionId;
        
        return res.status(400).json({ 
          message: "Too many attempts. Please refresh the CAPTCHA."
        });
      }
      
      // Check if input matches the stored captcha text
      const isValid = captchaInput === captchaSession.captchaText;
      
      if (isValid) {
        await storage.updateCaptchaSession(sessionId, { verified: true });
        return res.json({ success: true });
      } else {
        return res.status(400).json({ 
          message: "Incorrect CAPTCHA. Please try again."
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid CAPTCHA input" });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Login with CAPTCHA validation
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password, captchaInput } = loginSchema.parse(req.body);
      const sessionId = req.session.captchaSessionId;
      
      if (!sessionId) {
        return res.status(400).json({ 
          message: "CAPTCHA session expired. Please refresh and try again." 
        });
      }
      
      const captchaSession = await storage.getCaptchaSession(sessionId);
      
      if (!captchaSession) {
        return res.status(400).json({ 
          message: "CAPTCHA session expired. Please refresh and try again." 
        });
      }
      
      // Verify CAPTCHA
      if (captchaInput !== captchaSession.captchaText) {
        const currentAttempts = typeof captchaSession.attempts === 'number' ? captchaSession.attempts : 0;
        await storage.updateCaptchaSession(sessionId, {
          attempts: currentAttempts + 1
        });
        
        return res.status(400).json({ 
          message: "Incorrect CAPTCHA. Please try again." 
        });
      }
      
      // Verify user credentials
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ 
          message: "Invalid username or password." 
        });
      }
      
      // Mark CAPTCHA as verified and login successful
      await storage.updateCaptchaSession(sessionId, { verified: true });
      
      // Clean up session
      await storage.deleteCaptchaSession(sessionId);
      delete req.session.captchaSessionId;
      
      // Set user session
      req.session.userId = user.id;
      
      return res.json({ 
        success: true,
        user: { id: user.id, username: user.username } 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid form input" 
        });
      }
      return res.status(500).json({ 
        message: "Server error" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
