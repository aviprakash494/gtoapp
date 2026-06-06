import mongoose, { type Document, type Model, Schema } from "mongoose";

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "accepted"
  | "rejected";

export interface IApplication extends Document {
  student: mongoose.Types.ObjectId;
  university: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  statement?: string;
  paymentStatus: "unpaid" | "paid";
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "accepted", "rejected"],
      default: "pending",
    },
    statement: { type: String, trim: true },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
  },
  { timestamps: true },
);

const Application: Model<IApplication> = mongoose.model<IApplication>(
  "Application",
  applicationSchema,
);
export default Application;
