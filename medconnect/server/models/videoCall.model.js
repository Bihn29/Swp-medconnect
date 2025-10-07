import mongoose from "mongoose";
const { Schema, model } = mongoose;

const VideoCallSchema = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      unique: true,
      required: true,
    },
    provider: { type: String, enum: ["zego", "agora"], required: true },
    roomId: { type: String, required: true },
    joinUrl: String,
    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true, collection: "video_calls" }
);

export default model("VideoCall", VideoCallSchema);
