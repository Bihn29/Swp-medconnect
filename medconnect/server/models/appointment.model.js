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
      enum: [
        "pending",
        "confirmed",
        "in_progress",
        "cancelled",
        "done",
        "no_show",
      ],
      default: "pending",
    },
    reason: String,
    cancelledAt: Date,
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
    cancelReason: String,
    rescheduledFromId: { type: Schema.Types.ObjectId, ref: "Appointment" },
  },
  { timestamps: true, versionKey: false, collection: "appointments" }
);

// 🔴 NEW: validate start < end
AppointmentSchema.pre("validate", function (next) {
  if (
    this.scheduledStart &&
    this.scheduledEnd &&
    this.scheduledStart >= this.scheduledEnd
  ) {
    this.invalidate(
      "scheduledEnd",
      "scheduledEnd must be after scheduledStart"
    );
  }
  next();
});

AppointmentSchema.index({ doctorId: 1, scheduledStart: 1 });
AppointmentSchema.index({ patientId: 1, scheduledStart: 1 });
AppointmentSchema.index({ status: 1, scheduledStart: 1 });
// 🔴 NEW: thêm index cho mode
AppointmentSchema.index({ mode: 1, scheduledStart: 1 });

AppointmentSchema.index(
  { slotId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "confirmed", "in_progress", "done"] },
    },
  }
);

export default model("Appointment", AppointmentSchema);
