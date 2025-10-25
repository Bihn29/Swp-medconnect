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
      unique: true,
      required: true,
    },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    tags: [{ type: String }], // Tags like "professional", "friendly", "knowledgeable"
    isAnonymous: { type: Boolean, default: false },
    doctorResponse: String, // Doctor's response to the review
    doctorResponseAt: Date, // When doctor responded
    helpfulCount: { type: Number, default: 0 }, // How many people found this review helpful
    verified: { type: Boolean, default: true }, // Whether this review is verified (from actual appointment)
  },
  { timestamps: true, collection: "Reviews" }
);

export default model("Review", ReviewSchema);
