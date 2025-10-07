import mongoose from "mongoose";
const { Schema, model } = mongoose;

const DoctorTimeSlotSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    slotDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    mode: { type: String, enum: ["online", "offline"], required: true },
    status: {
      type: String,
      enum: ["available", "blocked", "booked"],
      default: "available",
    },
  },
  { timestamps: true, collection: "doctor_time_slots" }
);

DoctorTimeSlotSchema.index(
  { doctorId: 1, slotDate: 1, startTime: 1, endTime: 1, mode: 1 },
  { unique: true }
);

export default model("DoctorTimeSlot", DoctorTimeSlotSchema);
