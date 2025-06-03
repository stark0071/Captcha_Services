import 'express-session';

declare module 'express-session' {
  interface SessionData {
    captchaSessionId?: string;
    userId?: number;
  }
}