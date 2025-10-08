import mongoose from "mongoose";
const { Schema, model } = mongoose;

const isInt = (v) => Number.isInteger(v);

const InvoiceItemSchema = new Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0, validate: isInt },
    lineTotal: { type: Number, required: true, min: 0, validate: isInt },
  },
  { _id: false }
);

const BillToSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    name: { type: String, required: true },
    email: String,
    phone: String,
  },
  { _id: false }
);

const BillFromSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    doctorName: { type: String, required: true },
    clinicName: String,
  },
  { _id: false }
);

const PaymentSchema = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    currency: { type: String, default: "VND" },
    issueDate: { type: Date, default: () => new Date() },
    billTo: { type: BillToSchema, required: true },
    billFrom: { type: BillFromSchema, required: true },
    items: {
      type: [InvoiceItemSchema],
      required: true,
      validate: (v) => v.length > 0,
    },
    subtotal: { type: Number, required: true, min: 0, validate: isInt },
    discount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: isInt,
    },
    total: { type: Number, required: true, min: 0, validate: isInt },
    method: { type: String, enum: ["vnpay", "momo", "vietqr"], required: true },
    status: {
      type: String,
      enum: ["init", "pending", "paid", "failed", "refunded", "cancelled"],
      default: "init",
    },
    providerTxnId: String,
    paidAt: Date,
    gateway: { type: String, enum: ["vnpay"], default: "vnpay" },
    bankCode: String,
    payUrl: String,
    ipnPayload: Schema.Types.Mixed,
    refundAmount: { type: Number, min: 0, default: 0, validate: isInt },
    refundedAt: Date,
    refundReason: String,
  },
  { timestamps: true, versionKey: false, collection: "payments" }
);

// auto-calc subtotal/total
PaymentSchema.pre("validate", function (next) {
  if (this.items?.length) {
    this.subtotal = this.items.reduce(
      (s, it) => s + (it.lineTotal ?? it.quantity * it.unitPrice),
      0
    );
  } else {
    this.subtotal = 0;
  }
  if (this.discount == null) this.discount = 0;
  if (this.discount > this.subtotal) this.discount = this.subtotal;
  this.total = Math.max(0, this.subtotal - this.discount);
  if (this.refundAmount > this.total) this.refundAmount = this.total;
  next();
});

// 🔴 NEW: index phục vụ tra cứu
PaymentSchema.index({ appointmentId: 1 }, { unique: true });
PaymentSchema.index({ invoiceNumber: 1 }, { unique: true });
PaymentSchema.index({ status: 1, createdAt: -1 });

export default model("Payment", PaymentSchema);
