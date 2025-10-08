import mongoose from "mongoose";
const { Schema, model } = mongoose;

const isInt = (v) => Number.isInteger(v);

<<<<<<< HEAD
=======
// Một dòng trên hóa đơn (đơn vị: đồng)
>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
const InvoiceItemSchema = new Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
<<<<<<< HEAD
    unitPrice: { type: Number, required: true, min: 0, validate: isInt },
    lineTotal: { type: Number, required: true, min: 0, validate: isInt },
=======
    unitPrice: { type: Number, required: true, min: 0, validate: isInt }, // đồng
    lineTotal: { type: Number, required: true, min: 0, validate: isInt }, // đồng
>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
  },
  { _id: false }
);

<<<<<<< HEAD
=======
// Bên trả tiền
>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
const BillToSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    name: { type: String, required: true },
    email: String,
    phone: String,
  },
  { _id: false }
);

<<<<<<< HEAD
=======
// Bên cung cấp dịch vụ
>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
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
<<<<<<< HEAD
=======
    // Liên kết nghiệp vụ
>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
<<<<<<< HEAD
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    currency: { type: String, default: "VND" },
    issueDate: { type: Date, default: () => new Date() },
    billTo: { type: BillToSchema, required: true },
    billFrom: { type: BillFromSchema, required: true },
=======

    // Hóa đơn
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    currency: { type: String, default: "VND" },
    issueDate: { type: Date, default: () => new Date() },

    billTo: { type: BillToSchema, required: true },
    billFrom: { type: BillFromSchema, required: true },

>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
    items: {
      type: [InvoiceItemSchema],
      required: true,
      validate: (v) => v.length > 0,
    },
<<<<<<< HEAD
=======

    // Tổng tiền (đơn vị đồng, không thuế)
>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
    subtotal: { type: Number, required: true, min: 0, validate: isInt },
    discount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: isInt,
    },
    total: { type: Number, required: true, min: 0, validate: isInt },
<<<<<<< HEAD
=======

    // Thanh toán qua cổng
>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
    method: { type: String, enum: ["vnpay", "momo", "vietqr"], required: true },
    status: {
      type: String,
      enum: ["init", "pending", "paid", "failed", "refunded", "cancelled"],
      default: "init",
    },
<<<<<<< HEAD
    providerTxnId: String,
    paidAt: Date,
    gateway: { type: String, enum: ["vnpay"], default: "vnpay" },
    bankCode: String,
    payUrl: String,
    ipnPayload: Schema.Types.Mixed,
=======
    providerTxnId: { type: String }, // mã giao dịch từ cổng
    paidAt: { type: Date },

    // VNPAY integration
    gateway: { type: String, enum: ["vnpay"], default: "vnpay" },
    bankCode: { type: String }, // VNPAY bankCode
    payUrl: { type: String }, // URL redirect VNPAY
    ipnPayload: Schema.Types.Mixed, // log raw IPN callback từ VNPAY

    // Hoàn tiền
>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
    refundAmount: { type: Number, min: 0, default: 0, validate: isInt },
    refundedAt: Date,
    refundReason: String,
  },
  { timestamps: true, versionKey: false, collection: "payments" }
);

<<<<<<< HEAD
// auto-calc subtotal/total
=======
// Hook tính subtotal/total (không thuế, không làm tròn)
>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
PaymentSchema.pre("validate", function (next) {
  if (this.items?.length) {
    this.subtotal = this.items.reduce(
      (s, it) => s + (it.lineTotal ?? it.quantity * it.unitPrice),
      0
    );
  } else {
    this.subtotal = 0;
  }
<<<<<<< HEAD
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

=======

  if (this.discount == null) this.discount = 0;
  if (this.discount > this.subtotal) this.discount = this.subtotal;

  this.total = Math.max(0, this.subtotal - this.discount);

  // Chặn refund > total
  if (this.refundAmount > this.total) this.refundAmount = this.total;

  next();
});
// real
>>>>>>> 9480e022804b868197ee8c9a464643a6467f711b
export default model("Payment", PaymentSchema);
