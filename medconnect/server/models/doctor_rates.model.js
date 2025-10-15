/* =======================================================
 * COLLECTION: doctor_rates
 * PURPOSE: Bảng giá bác sĩ
 * ======================================================= */

/**
 * COLLECTION: doctor_rates — Bảng giá bác sĩ
 * PURPOSE: Prices per doctor + mode (+ clinic when offline).
 * NOTES: Conditional unique indexes for online/offline.
 */
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const DoctorRateSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: function () { return this.mode === "offline"; }, // offline must have clinic
    },
    mode: { type: String, enum: ["online", "offline"], required: true },
    price: { type: Number, min: 0, required: true }, // VND
    currency: { type: String, default: "VND" },
    isActive: { type: Boolean, default: true },
  },
  { collection: "Doctor_rates", timestamps: true, versionKey: false }
);

// ONLINE unique: (doctorId, mode) where clinicId doesn't exist
DoctorRateSchema.index(
  { doctorId: 1, mode: 1 },
  { unique: true, partialFilterExpression: { mode: "online", clinicId: { $exists: false } } }
);
// OFFLINE unique: (doctorId, mode, clinicId) where clinicId exists
DoctorRateSchema.index(
  { doctorId: 1, mode: 1, clinicId: 1 },
  { unique: true, partialFilterExpression: { mode: "offline", clinicId: { $exists: true } } }
);

export default model("DoctorRate", DoctorRateSchema);
