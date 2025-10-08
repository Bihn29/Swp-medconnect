import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PasswordResetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    codeHash: { type: String, required: true },
    type: { type: String, enum: ["reset", "verify"], required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "password_resets" }
);

<<<<<<< HEAD
// 🔴 NEW: TTL index
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// 🔴 NEW: 1 code active / user / type
PasswordResetSchema.index(
  { userId: 1, type: 1, used: 1, expiresAt: 1 },
  { partialFilterExpression: { used: false }, name: "one_active_code_per_type" }
);

=======
>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
export default model("PasswordReset", PasswordResetSchema);
