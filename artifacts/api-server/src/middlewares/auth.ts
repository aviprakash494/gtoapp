import jwt from "jsonwebtoken";

export interface AuthRequest {
  userId?: string;
  log: any;
  body: any;
  params: any;
  headers: any;
}

export function authenticate(req: any, res: any, next: any): void {
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
