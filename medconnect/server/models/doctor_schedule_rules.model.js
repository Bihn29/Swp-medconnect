/**
 * COLLECTION: doctor_schedule_rules — Quy tắc lịch định kỳ
 * PURPOSE: Generate concrete Doctor_time_slots for next N days.
 */
import mongoose from "mongoose";
const { Schema, model } = mongoose;

/**
 * DoctorScheduleRule
 * ------------------
 * Bảng lưu quy tắc lịch làm việc của bác sĩ.
 *
 *  KHÔNG chứa mode (online/offline) hay clinicId.
 *  Bác sĩ chỉ định nghĩa khung giờ rảnh, hệ thống sẽ tự sinh slot cụ thể (trung tính).
 *  Khi bệnh nhân đặt lịch -> mới chọn mode (online/offline) ở bảng appointments.
 *
 * Ví dụ:
 *   Thứ 2, 08:00–11:00, mỗi slot 45' (30' khám + 15' buffer)
 *   => Cron job sinh ra 08:00–08:45, 08:45–09:30, 09:30–10:15, 10:15–11:00
 */
const DoctorScheduleRuleSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Ngày trong tuần mà rule này áp dụng (0=Chủ Nhật, 1=Thứ 2, ..., 6=Thứ 7)
    weekday: {
      type: Number,
      min: 0,
      max: 6,
      required: true,
    },

    // Giờ bắt đầu - kết thúc trong ngày (dạng "HH:mm")
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]\d|2[0-3]):([0-5]\d)$/, // validate định dạng 24h
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]\d|2[0-3]):([0-5]\d)$/,
    },

    // Cấu hình slot
    // slotBlockMinutes: tổng thời lượng mỗi slot (bao gồm khám + nghỉ)
    // consultMinutes: thời lượng khám thực tế (dùng để hiển thị hoặc tính phí)
    slotBlockMinutes: {
      type: Number,
      default: 45, // 30' khám + 15' buffer
      min: 5,
    },
    consultMinutes: {
      type: Number,
      default: 30,
      min: 5,
    },

    // Thời gian hiệu lực của rule
    effectiveFrom: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    effectiveTo: {
      type: Date,
    },

    // Trạng thái rule
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "doctor_schedule_rules",
  }
);

/**
 *  Business Logic:
 * - Cron job sẽ đọc rule này mỗi đêm, tạo slot trong bảng doctor_time_slots cho 30 ngày tới.
 * - Slot sinh ra sẽ trung tính (không chứa mode/clinic).
 * - 1 slot chỉ có thể được đặt 1 lần, bất kể là Online hay Offline.
 */

DoctorScheduleRuleSchema.pre("validate", function (next) {
  // Kiểm tra giờ bắt đầu phải nhỏ hơn giờ kết thúc
  if (this.startTime >= this.endTime) {
    this.invalidate("endTime", "endTime must be after startTime");
  }
  // Nếu có cả effectiveFrom và effectiveTo
  if (this.effectiveTo && this.effectiveFrom > this.effectiveTo) {
    this.invalidate("effectiveTo", "effectiveTo must be after effectiveFrom");
  }
  next();
});

// Index giúp truy vấn nhanh theo bác sĩ và thứ trong tuần
DoctorScheduleRuleSchema.index({ doctorId: 1, weekday: 1, isActive: 1 });

export default model("DoctorScheduleRule", DoctorScheduleRuleSchema);
