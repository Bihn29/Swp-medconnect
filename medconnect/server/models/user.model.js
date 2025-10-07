import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: true,
    },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    fullName: { type: String, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
  },
  { timestamps: true, versionKey: false, collection: "users" }
);

export default model("User", UserSchema);
