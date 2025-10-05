import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AppointmentSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    slotId: { type: Schema.Types.ObjectId, ref: "DoctorTimeSlot" },
    mode: { type: String, enum: ["online", "offline"], required: true },
    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "done"],
      default: "pending",
    },
    reason: String,
  },
  { timestamps: true, collection: "appointments" }
);

export default model("Appointment", AppointmentSchema);
