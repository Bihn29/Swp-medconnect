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
  { collection: "Password_Resets" }
);

export default model("PasswordReset", PasswordResetSchema);
