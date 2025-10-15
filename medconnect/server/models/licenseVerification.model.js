/* =======================================================
 * COLLECTION: License_verifications
 *  Duyệt giấy phép
 * ======================================================= */


import mongoose from "mongoose";
const { Schema, model } = mongoose;

const VerificationDocSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["license", "cert", "idcard", "degree", "other"],
      required: true,
    },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    expiryDate: Date,
    meta: Schema.Types.Mixed,
  },
  { _id: false }
);

const LicenseVerificationSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    status: {
      type: String,
      enum: ["pending", "needs_more_info", "approved", "rejected", "expired"],
      default: "pending",
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    reviewerId: { type: Schema.Types.ObjectId, ref: "User" },
    notes: String,
    version: { type: Number, default: 1 },
    documents: [VerificationDocSchema],
  },
  { timestamps: true, collection: "License_verifications" }
);

export default model("LicenseVerification", LicenseVerificationSchema);
