/* =======================================================
 * COLLECTION: Appointments
 *  Lịch hẹn khám
 * ======================================================= */

import mongoose from "mongoose";
const { Schema, model } = mongoose;

/**
 * Appointment: Bệnh nhân chọn mode ở ĐÂY (online/offline).
 * Nếu offline → bắt buộc chọn clinicId hợp lệ (nằm trong danh sách clinic mà bác sĩ làm việc).
 * Khóa slot 1-1 bằng unique partial index trên slotId theo các trạng thái chiếm slot.
 */
const AppointmentSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "DoctorTimeSlot",
      required: true,
    },

    // Mode do bệnh nhân chọn khi đặt
    mode: { type: String, enum: ["online", "offline"], required: true },

    // Nếu offline -> bắt buộc chọn 1 clinic
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: function () {
        return this.mode === "offline";
      },
    },

    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },

    status: {
      type: String,
      enum: [
        "pending_doctor",
        "accepted",
        "rejected",
        "in_progress",
        "cancelled",
        "done",
        "no_show",
        "rescheduled",
      ],
      default: "pending_doctor",
    },

    // Lý do đặt/hủy/từ chối
    reason: String,
    cancelledAt: Date,
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
    cancelReason: String,

    // Reschedule fields
    rescheduledFromId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    rescheduledToId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    rescheduleReason: String,
    rescheduledBy: { type: Schema.Types.ObjectId, ref: "User" },
    rescheduledAt: Date,

    // Tracking thao tác bác sĩ
    acceptedBy: { type: Schema.Types.ObjectId, ref: "Doctor" },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "Doctor" },
    rejectReason: String,

    // Thanh toán (nếu có)
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      unique: true,
      sparse: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentDeadline: {
      type: Date,
      // Deadline cho thanh toán (10 phút từ khi tạo appointment - đủ thời gian cho quá trình thanh toán và xử lý)
    },
    
    // Lưu orderCode tạm khi tạo payment link (chưa thanh toán)
    pendingOrderCode: {
      type: Number,
      sparse: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false, collection: "Appointments" }
);

// Validate thời gian
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
  if (this.isNew && this.scheduledStart && this.scheduledStart < new Date()) {
    this.invalidate("scheduledStart", "scheduledStart must be in the future");
  }
  next();
});

// Index hay dùng
AppointmentSchema.index({ doctorId: 1, scheduledStart: 1 });
AppointmentSchema.index({ patientId: 1, scheduledStart: 1 });
AppointmentSchema.index({ status: 1, scheduledStart: 1 });
AppointmentSchema.index({ mode: 1, scheduledStart: 1 });
AppointmentSchema.index({ clinicId: 1, scheduledStart: 1 });
AppointmentSchema.index({ paymentStatus: 1, paymentDeadline: 1 });

// KHÓA SLOT 1-1 khi còn hiệu lực (slot không thể bị book hai lần, bất kể online/offline)
AppointmentSchema.index(
  { slotId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending_doctor", "accepted", "in_progress", "done"] },
    },
  }
);

export default model("Appointment", AppointmentSchema);
