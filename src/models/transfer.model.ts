import mongoose, { InferSchemaType, Schema } from "mongoose";

const transferListingSchema = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, required: true, ref: "Player" }, // subdoc id from Team.players
    playerName: { type: String, required: true },
    position: { type: String, enum: ["GK", "DEF", "MID", "ATT"], required: true },
    askingPrice: { type: Number, required: true, min: 0 },
    sellerTeamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    sellerTeamName: { type: String, required: true },
  },
  { timestamps: true },
);

transferListingSchema.index({ playerName: "text" });

export type TransferListingDocument = InferSchemaType<typeof transferListingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TransferListingModel = mongoose.model("TransferListing", transferListingSchema);
