import mongoose from "mongoose";
const { Schema, model } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { 
      type: String, 
      enum: ["appointment", "payment", "system", "message", "video"], 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    priority: { 
      type: String, 
      enum: ["low", "medium", "high"], 
      default: "medium" 
    },
    relatedId: { type: Schema.Types.ObjectId }, // ID của appointment, payment, etc.
    relatedType: { type: String }, // appointment, payment, etc.
    metadata: { type: Schema.Types.Mixed }, // Additional data
  },
  { timestamps: true, versionKey: false, collection: "notifications" }
);

// Indexes for performance
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

export default model("Notification", NotificationSchema);