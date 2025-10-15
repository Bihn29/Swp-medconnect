/* =======================================================
 * COLLECTION: Doctor_time_slots
 *  Slot làm việc cụ thể
 * ======================================================= */

import mongoose from "mongoose";
const { Schema, model } = mongoose;

/**
 * DoctorTimeSlot: Slot cụ thể đã sinh ra từ rule.
 * TRUNG TÍNH: không chứa mode/clinicId. 1 slot = 1 tài nguyên thời gian duy nhất.
 * Hệ quả: một thời điểm bác sĩ chỉ có thể nhận 1 cuộc hẹn (online HOẶC offline).
 */
const DoctorTimeSlotSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },

    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    status: {
      type: String,
      enum: ["available", "blocked", "booked"],
      default: "available",
    },
  },
  { timestamps: true, versionKey: false, collection: "Doctor_time_slots" }
);

DoctorTimeSlotSchema.pre("validate", function (next) {
  if (this.startAt && this.endAt && this.startAt >= this.endAt) {
    this.invalidate("endAt", "endAt must be after startAt");
  }
  next();
});

// 1 slot duy nhất cho 1 khoảng thời gian
DoctorTimeSlotSchema.index(
  { doctorId: 1, startAt: 1, endAt: 1 },
  { unique: true }
);
// Lọc theo ngày/tuần
DoctorTimeSlotSchema.index({ doctorId: 1, startAt: 1 });

export default model("DoctorTimeSlot", DoctorTimeSlotSchema);
