import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ClinicSchema = new Schema(
  {
    name: { type: String, required: true },
    address: String,
    latitude: Number,
    longitude: Number,
    phone: String,
    geo: {
      type: { type: String, enum: ["Point"] },
      coordinates: [Number], // [lng, lat]
    },
  },
  { timestamps: true, collection: "clinics" }
);

ClinicSchema.index({ geo: "2dsphere" });
export default model("Clinic", ClinicSchema);
