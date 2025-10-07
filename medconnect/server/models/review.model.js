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
  },
  { timestamps: true, collection: "reviews" }
);

export default model("Review", ReviewSchema);
