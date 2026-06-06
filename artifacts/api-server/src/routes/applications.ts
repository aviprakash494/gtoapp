import { Router } from "express";
import { body, param } from "express-validator";
import Application from "../models/Application.js";
import University from "../models/University.js";
import { authenticate, type AuthRequest } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

router.post(
  "/applications",
  authenticate,
  [
    body("universityId")
      .isMongoId()
      .withMessage("Valid university ID is required"),
    body("statement").optional().trim(),
  ],
  validate,
  async (req: AuthRequest, res: any) => {
    try {
      const { universityId, statement } = req.body as {
        universityId: string;
        statement?: string;
      };

      const university = await University.findById(universityId);
      if (!university) {
        return res
          .status(404)
          .json({ success: false, message: "University not found" });
      }

      const existing = await Application.findOne({
        student: req.userId,
        university: universityId,
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "You have already applied to this university",
        });
      }

      const application = await Application.create({
        student: req.userId,
        university: universityId,
        statement,
      });

      await application.populate(["student", "university"]);

      return res.status(201).json({
        success: true,
        message: "Application submitted",
        application,
      });
    } catch (err) {
      req.log.error({ err }, "Create application error");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

router.get(
  "/applications",
  authenticate,
  async (req: AuthRequest, res: any) => {
    try {
      const applications = await Application.find({ student: req.userId })
        .populate("university")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: applications.length,
        applications,
      });
    } catch (err) {
      req.log.error({ err }, "Get applications error");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

router.get(
  "/applications/:id",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid application ID")],
  validate,
  async (req: AuthRequest, res: any) => {
    try {
      const application = await Application.findOne({
        _id: req.params["id"],
        student: req.userId,
      }).populate(["student", "university"]);

      if (!application) {
        return res
          .status(404)
          .json({ success: false, message: "Application not found" });
      }

      return res.json({ success: true, application });
    } catch (err) {
      req.log.error({ err }, "Get application error");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

export default router;
