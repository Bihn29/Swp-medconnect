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
    // chỉ bắt buộc khi local
    passwordHash: {
      type: String,
      select: false,
      required: function () {
        return this.authProvider === "local";
      },
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    fullName: { type: String, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    // thêm trường này
    authProvider: {
      type: String,
      enum: ["local", "google", "phone"],
      default: "local",
    },
  },
  { timestamps: true, versionKey: false, collection: "Users" }
);

export default model("User", UserSchema);
