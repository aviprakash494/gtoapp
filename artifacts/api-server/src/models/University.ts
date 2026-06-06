import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IUniversity extends Document {
  name: string;
  country: string;
  course: string;
  applicationFee: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const universitySchema = new Schema<IUniversity>(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    applicationFee: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
  },
  { timestamps: true },
);

const University: Model<IUniversity> = mongoose.model<IUniversity>(
  "University",
  universitySchema,
);
export default University;
