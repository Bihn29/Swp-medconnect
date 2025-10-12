import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SpecializationSchema = new Schema(
  {
    code: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    description: String,
  },
  { timestamps: true, collection: "Specializations" }
);

export default model("Specialization", SpecializationSchema);
