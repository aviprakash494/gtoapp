import { Router } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticate, type AuthRequest } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

router.post(
  "/auth/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Invalid phone number"),
  ],
  validate,
  async (req: AuthRequest, res: any) => {
    try {
      const { name, email, password, phone } = req.body as {
        name: string;
        email: string;
        password: string;
        phone?: string;
      };

      const existing = await User.findOne({ email });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "Email already registered" });
      }

      const user = await User.create({ name, email, password, phone });

      const secret = process.env["JWT_SECRET"]!;
      const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "7d" });

      return res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
        user,
      });
    } catch (err) {
      req.log.error({ err }, "Register error");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

router.post(
  "/auth/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  async (req: AuthRequest, res: any) => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const secret = process.env["JWT_SECRET"]!;
      const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "7d" });

      return res.json({
        success: true,
        message: "Login successful",
        token,
        user,
      });
    } catch (err) {
      req.log.error({ err }, "Login error");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

router.get(
  "/auth/profile",
  authenticate,
  async (req: AuthRequest, res: any) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      return res.json({ success: true, user });
    } catch (err) {
      req.log.error({ err }, "Profile error");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

export default router;
