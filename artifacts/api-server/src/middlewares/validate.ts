import { validationResult } from "express-validator";

export function validate(req: any, res: any, next: any): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  next();
}
