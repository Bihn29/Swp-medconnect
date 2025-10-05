// models/User.js

import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    zip: { type: String, trim: true },
  },
  { _id: false }
);

const MetadataSchema = new mongoose.Schema(
  {
    createdAt: { type: Date, default: () => new Date() },
    source: { type: String, default: "generated-sample" },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    age: { type: Number, min: 0, max: 120 },
    active: { type: Boolean, default: true },
    roles: { type: [String], default: ["user"] },
    address: { type: AddressSchema, default: {} },
    tags: { type: [String], default: [] },
    metadata: { type: MetadataSchema, default: () => ({}) },
  },
  {
    timestamps: true, // createdAt, updatedAt managed by Mongoose
  }
);

// Optional: pre-save hook to ensure uid exists (if you want to use mongoose-generated _id, keep uid)

// If you prefer to use uid as the Mongo _id (string) instead of ObjectId,
// uncomment the following lines and remove the `uid` field above:
// const UserSchema = new mongoose.Schema({
//   _id: { type: String, required: true }, // will store uid here
//   name: ...
// }, { timestamps: true });
// Then when creating a user, set _id = uid.

const User = mongoose.model("User", UserSchema, "user");
export default User;
