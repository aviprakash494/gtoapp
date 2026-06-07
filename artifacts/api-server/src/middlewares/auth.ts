import type { Request, Response, NextFunction } from "express";
import type { Logger } from "pino";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  log: Logger;
  body: any;
  params: any;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    res
      .status(500)
      .json({ success: false, message: "Server misconfiguration" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}
