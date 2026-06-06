import { Router } from "express";
import { body } from "express-validator";
import Stripe from "stripe";
import Application from "../models/Application.js";
import University from "../models/University.js";
import Payment from "../models/Payment.js";
import { authenticate, type AuthRequest } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

function getStripe(): Stripe {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

router.post(
  "/payments/create-order",
  authenticate,
  [
    body("applicationId")
      .isMongoId()
      .withMessage("Valid application ID is required"),
  ],
  validate,
  async (req: AuthRequest, res: any) => {
    try {
      const { applicationId } = req.body as { applicationId: string };

      const application = await Application.findOne({
        _id: applicationId,
        student: req.userId,
      }).populate<{ university: InstanceType<typeof University> }>("university");

      if (!application) {
        return res
          .status(404)
          .json({ success: false, message: "Application not found" });
      }

      if (application.paymentStatus === "paid") {
        return res
          .status(400)
          .json({ success: false, message: "Application fee already paid" });
      }

      const university = application.university as any;
      const amountInCents = Math.round(university.applicationFee * 100);

      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        payment_method: "pm_card_visa",
        confirm: true,
        return_url: "https://globetrek.example.com/payments",
        metadata: {
          applicationId: applicationId,
          studentId: req.userId!,
          universityId: university._id.toString(),
        },
      });

      await Payment.create({
        student: req.userId,
        application: applicationId,
        stripePaymentIntentId: paymentIntent.id,
        amount: university.applicationFee,
        currency: "usd",
        status: paymentIntent.status === "succeeded" ? "succeeded" : "created",
      });

      return res.status(201).json({
        success: true,
        message: "Payment order created",
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amountInCents,
        currency: "usd",
      });
    } catch (err) {
      req.log.error({ err }, "Create payment order error");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

router.post(
  "/payments/verify",
  authenticate,
  [
    body("paymentIntentId")
      .notEmpty()
      .withMessage("paymentIntentId is required"),
  ],
  validate,
  async (req: AuthRequest, res: any) => {
    try {
      const { paymentIntentId } = req.body as { paymentIntentId: string };

      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      const payment = await Payment.findOne({
        stripePaymentIntentId: paymentIntentId,
        student: req.userId,
      });

      if (!payment) {
        return res
          .status(404)
          .json({ success: false, message: "Payment record not found" });
      }

      if (paymentIntent.status === "succeeded" || payment.status === "succeeded") {
        payment.status = "succeeded";
        await payment.save();

        await Application.findByIdAndUpdate(payment.application, {
          paymentStatus: "paid",
        });

        return res.json({
          success: true,
          message: "Payment verified successfully",
          payment,
        });
      }

      payment.status = paymentIntent.status === "canceled" ? "failed" : "created";
      await payment.save();

      return res.json({
        success: false,
        message: `Payment status: ${paymentIntent.status}`,
        payment,
      });
    } catch (err) {
      req.log.error({ err }, "Verify payment error");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

router.get(
  "/payments/history",
  authenticate,
  async (req: AuthRequest, res: any) => {
    try {
      const payments = await Payment.find({ student: req.userId })
        .populate({
          path: "application",
          populate: { path: "university", select: "name country course applicationFee" },
        })
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: payments.length, payments });
    } catch (err) {
      req.log.error({ err }, "Payment history error");
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

export default router;
