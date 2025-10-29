import mongoose from "mongoose";

const tempOrderSchema = new mongoose.Schema({
  orderCode: { type: Number, unique: true, index: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  amount: { type: Number, required: true },
  description: { type: String, default: "" },
  // Legacy fields for e-commerce (if needed later)
  shippingAddress: String,
  note: String,
  deliveryTime: String,
  shippingFee: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("TempOrder", tempOrderSchema);
