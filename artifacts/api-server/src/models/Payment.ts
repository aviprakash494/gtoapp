import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IPayment extends Document {
  student: mongoose.Types.ObjectId;
  application: mongoose.Types.ObjectId;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: "created" | "succeeded" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    stripePaymentIntentId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    status: {
      type: String,
      enum: ["created", "succeeded", "failed"],
      default: "created",
    },
  },
  { timestamps: true },
);

const Payment: Model<IPayment> = mongoose.model<IPayment>(
  "Payment",
  paymentSchema,
);
export default Payment;
