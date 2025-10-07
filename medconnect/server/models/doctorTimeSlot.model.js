import mongoose from "mongoose";
const { Schema, model } = mongoose;

const DoctorTimeSlotSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    mode: { type: String, enum: ["online", "offline"], required: true },
    status: {
      type: String,
      enum: ["available", "blocked", "booked"],
      default: "available",
    },
  },
  { timestamps: true, versionKey: false, collection: "doctor_time_slots" }
);

DoctorTimeSlotSchema.index(
  { doctorId: 1, startAt: 1, endAt: 1, mode: 1 },
  { unique: true }
);
DoctorTimeSlotSchema.index({ doctorId: 1, status: 1, startAt: 1 });

export default model("DoctorTimeSlot", DoctorTimeSlotSchema);
