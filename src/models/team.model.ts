import mongoose, { InferSchemaType, Schema } from "mongoose";

export type Position = "GK" | "DEF" | "MID" | "ATT";

const playerSchema = new Schema(
  {
    name: { type: String, required: true },
    position: { type: String, enum: ["GK", "DEF", "MID", "ATT"], required: true },
    price: { type: Number, required: true, min: 0 },
    onTransferList: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true },
);

const teamSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    name: { type: String, required: true },
    budget: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export type PlayerSubDoc = InferSchemaType<typeof playerSchema> & { _id: mongoose.Types.ObjectId };
export type TeamDocument = InferSchemaType<typeof teamSchema> & { _id: mongoose.Types.ObjectId };

export const TeamModel = mongoose.model("Team", teamSchema);
