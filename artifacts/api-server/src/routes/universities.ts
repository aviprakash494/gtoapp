import { Router } from "express";
import { body, param } from "express-validator";
import University from "../models/University.js";
import { authenticate, type AuthRequest } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

const universityValidators = [
  body("name").trim().notEmpty().withMessage("University name is required"),
  body("country").trim().notEmpty().withMessage("Country is required"),
  body("course").trim().notEmpty().withMessage("Course is required"),
  body("applicationFee")
    .isFloat({ min: 0 })
    .withMessage("Application fee must be a non-negative number"),
  body("description").optional().trim(),
];

router.get("/universities", async (req: AuthRequest, res: any) => {
  try {
    const universities = await University.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: universities.length, universities });
  } catch (err) {
    req.log.error({ err }, "Get universities error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post(
  "/universities",
  authenticate,
  universityValidators,
  validate,
  async (req: AuthRequest, res: any) => {
    try {
      const { name, country, course, applicationFee, description } =
        req.body as {
          name: string;
          country: string;
          course: string;
          applicationFee: number;
          description?: string;
        };

      const university = await University.create({
        name,
        country,
        course,
        applicationFee,
        description,
      });

      return res.status(201).json({
        success: true,
        message: "University created",
        university,
      });
    } catch (err) {
      req.log.error({ err }, "Create university error");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

router.put(
  "/universities/:id",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid university ID"), ...universityValidators],
  validate,
  async (req: AuthRequest, res: any) => {
    try {
      const university = await University.findByIdAndUpdate(
        req.params["id"],
        req.body,
        { new: true, runValidators: true },
      );

      if (!university) {
        return res
          .status(404)
          .json({ success: false, message: "University not found" });
      }

      return res.json({ success: true, message: "University updated", university });
    } catch (err) {
      req.log.error({ err }, "Update university error");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

router.delete(
  "/universities/:id",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid university ID")],
  validate,
  async (req: AuthRequest, res: any) => {
    try {
      const university = await University.findByIdAndDelete(req.params["id"]);

      if (!university) {
        return res
          .status(404)
          .json({ success: false, message: "University not found" });
      }

      return res.json({ success: true, message: "University deleted" });
    } catch (err) {
      req.log.error({ err }, "Delete university error");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

export default router;
