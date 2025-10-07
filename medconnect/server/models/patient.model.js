import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PatientSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true },
    dob: Date,
    gender: String,
    nationalId: String,
    phone: String,
    address: String,
    wardCode: Number,
    districtCode: Number,
    provinceCode: Number,
  },
  { timestamps: true, collection: "patients" }
);

export default model("Patient", PatientSchema);
