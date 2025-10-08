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

<<<<<<< HEAD
// 🔴 NEW: index userId + status + createdAt
NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 });

=======
>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
export default model("Notification", NotificationSchema);
