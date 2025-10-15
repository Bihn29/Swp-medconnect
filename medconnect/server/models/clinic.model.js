/* =======================================================
 * COLLECTION: Clinics
 *  Phòng khám/địa điểm
 * ======================================================= */

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ClinicSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: String,
    latitude: Number,
    longitude: Number,
    phone: String,
    geo: { type: { type: String, enum: ["Point"] }, coordinates: [Number] }, // [lng, lat]
  },
  { timestamps: true, versionKey: false, collection: "Clinics" }
);

ClinicSchema.path("geo").validate(function (v) {
  if (!v) return true;
  return v.type === "Point" && Array.isArray(v.coordinates) && v.coordinates.length === 2;
}, "geo must be GeoJSON Point with [lng, lat]");

ClinicSchema.index({ geo: "2dsphere" });

export default model("Clinic", ClinicSchema);
