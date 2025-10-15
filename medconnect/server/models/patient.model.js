/* =======================================================
 * COLLECTION: Patients
 * Hồ sơ bệnh nhân (hỗ trợ người thân)
 * ======================================================= */


import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PatientSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // NOT unique
    fullName: { type: String, required: true, trim: true },
    dob: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    nationalId: String,
    phone: String,
    address: String,
    wardCode: Number,
    districtCode: Number,
    provinceCode: Number,
    relationshipToOwner: {
      type: String,
      enum: [
        "self",
        "father",
        "mother",
        "spouse",
        "child",
        "grandparent",
        "other",
      ],
      default: "self",
    },
  },
  { timestamps: true, versionKey: false, collection: "Patients" }
);

PatientSchema.index({ userId: 1, fullName: 1 });
PatientSchema.index({ provinceCode: 1, districtCode: 1, wardCode: 1 });

export default model("Patient", PatientSchema);
