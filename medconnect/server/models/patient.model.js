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
    fullName: { type: String, required: true, trim: true },
    dob: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    nationalId: String,
    phone: String,
    address: String,
    wardCode: Number,
    districtCode: Number,
    provinceCode: Number,
  },
  { timestamps: true, versionKey: false, collection: "patients" }
);

PatientSchema.index({ provinceCode: 1, districtCode: 1, wardCode: 1 });

export default model("Patient", PatientSchema);
