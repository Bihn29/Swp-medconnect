import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    refreshTokenHash: { type: String, required: true },
    ip: String,
    userAgent: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
  },
  { collection: "sessions" }
);

// 🔴 NEW: TTL auto delete
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// 🔴 NEW: index để tra cứu nhanh
SessionSchema.index({ userId: 1, revoked: 1, createdAt: -1 });

export default model("Session", SessionSchema);
