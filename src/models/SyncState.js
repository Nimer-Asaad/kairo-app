import mongoose from "mongoose";

const SyncStateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    scope: { type: String, default: "inbox", index: true },
    lastPageToken: { type: String, default: null },
    totalSynced: { type: Number, default: 0 },
    totalSkipped: { type: Number, default: 0 },
    pagesProcessed: { type: Number, default: 0 },
    messagesTotalEstimate: { type: Number, default: null },
  },
  { timestamps: true }
);

SyncStateSchema.index({ userId: 1, scope: 1 }, { unique: true });

export default mongoose.model("SyncState", SyncStateSchema);
