import mongoose from "mongoose";
const { Schema, model } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: String,
    title: String,
    content: String,
    status: { type: String, enum: ["unread", "read"], default: "unread" },
    sentAt: Date,
  },
  { timestamps: true, collection: "notifications" }
);

export default model("Notification", NotificationSchema);
