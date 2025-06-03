import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const captchaSessions = pgTable("captcha_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  captchaText: text("captcha_text").notNull(),
  createdAt: integer("created_at").notNull(),
  attempts: integer("attempts").default(0),
  verified: boolean("verified").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCaptchaSessionSchema = createInsertSchema(captchaSessions).pick({
  sessionId: true,
  captchaText: true,
  createdAt: true,
});

export const captchaVerifySchema = z.object({
  captchaInput: z.string().min(4).max(6),
});

export const loginSchema = insertUserSchema.extend({
  captchaInput: z.string().min(4).max(6),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCaptchaSession = z.infer<typeof insertCaptchaSessionSchema>;
export type CaptchaSession = typeof captchaSessions.$inferSelect;

export type CaptchaVerifyInput = z.infer<typeof captchaVerifySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
