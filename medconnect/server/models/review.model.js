/* =======================================================
 * COLLECTION: Reviews
 *  Đánh giá bác sĩ
 * ======================================================= */

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ReviewSchema = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true, // nên index thay vì unique để query nhanh theo appointment
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    // Đánh giá định lượng
    rating: { type: Number, min: 1, max: 5, required: true },

    // Nhận xét định tính
    comment: { type: String, trim: true },

    // Các trường mở rộng (optional)
    tags: [{ type: String, trim: true }], // Ví dụ: ["professional", "friendly", "knowledgeable"]
    isAnonymous: { type: Boolean, default: false },

    // Phản hồi từ bác sĩ (optional)
    doctorResponse: { type: String, trim: true },
    doctorResponseAt: { type: Date },

    // Hỗ trợ thống kê (optional)
    helpfulCount: { type: Number, default: 0, min: 0 },
    verified: { type: Boolean, default: true }, // đánh giá xác thực từ lịch hẹn thật
  },
  {
    timestamps: true, // tạo createdAt, updatedAt
    versionKey: false,
    collection: "reviews", // nên viết thường để đồng bộ với MongoDB Compass
  }
);

// Index kết hợp để tránh trùng review cùng appointment + patient
ReviewSchema.index({ appointmentId: 1, patientId: 1 }, { unique: true });

export default model("Review", ReviewSchema);
