import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ConsultationSummarySchema = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      unique: true,
      required: true,
    },
    summaryText: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  },
  { timestamps: true, collection: "Consultation_summaries" }
);

export default model("ConsultationSummary", ConsultationSummarySchema);
