import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";

export function securityHeaders() {
  return helmet();
}

export function rateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      console.warn(`Rate-limited ${_req.ip} on ${_req.method} ${_req.path}`);
      res.status(429).json({ error: "Too many requests, please try again later" });
    },
  });
}

export function requestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms} ms)`);
    });
    next();
  };
}
