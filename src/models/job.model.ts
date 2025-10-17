import mongoose, { InferSchemaType, Schema } from "mongoose";

const jobSchema = new Schema(
  {
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    attempts: { type: Number, default: 0 },
    lastError: { type: String },
    scheduledAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

jobSchema.index({ type: 1, status: 1, scheduledAt: 1 });

export type JobDocument = InferSchemaType<typeof jobSchema> & { _id: mongoose.Types.ObjectId };

export const JobModel = mongoose.model("Job", jobSchema);
