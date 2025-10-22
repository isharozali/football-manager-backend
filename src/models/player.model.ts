import mongoose, { InferSchemaType, Schema } from "mongoose";

export type Position = "GK" | "DEF" | "MID" | "ATT";

const playerSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    name: { type: String, required: true, index: true },
    position: { type: String, enum: ["GK", "DEF", "MID", "ATT"], required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    onTransferList: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

playerSchema.index({ teamId: 1, position: 1 });

export type PlayerDocument = InferSchemaType<typeof playerSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PlayerModel = mongoose.model("Player", playerSchema);
