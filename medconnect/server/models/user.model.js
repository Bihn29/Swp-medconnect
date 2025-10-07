import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: true,
    },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    fullName: String,
    phone: { type: String, unique: true, sparse: true },
  },
  { timestamps: true, collection: "users" }
);
const User = model("User", UserSchema);
export default User;
