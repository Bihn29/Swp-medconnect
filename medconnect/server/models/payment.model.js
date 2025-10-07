import mongoose from "mongoose";
const { Schema, model } = mongoose;

const isInt = (v) => Number.isInteger(v);

// Một dòng trên hóa đơn (đơn vị: đồng)
const InvoiceItemSchema = new Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0, validate: isInt }, // đồng
    lineTotal: { type: Number, required: true, min: 0, validate: isInt }, // đồng
  },
  { _id: false }
);

// Bên trả tiền
const BillToSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    name: { type: String, required: true },
    email: String,
    phone: String,
  },
  { _id: false }
);

// Bên cung cấp dịch vụ
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
    // Liên kết nghiệp vụ
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },

    // Hóa đơn
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

    // Tổng tiền (đơn vị đồng, không thuế)
    subtotal: { type: Number, required: true, min: 0, validate: isInt },
    discount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: isInt,
    },
    total: { type: Number, required: true, min: 0, validate: isInt },

    // Thanh toán qua cổng
    method: { type: String, enum: ["vnpay", "momo", "vietqr"], required: true },
    status: {
      type: String,
      enum: ["init", "pending", "paid", "failed", "refunded", "cancelled"],
      default: "init",
    },
    providerTxnId: { type: String }, // mã giao dịch từ cổng
    paidAt: { type: Date },

    // VNPAY integration
    gateway: { type: String, enum: ["vnpay"], default: "vnpay" },
    bankCode: { type: String }, // VNPAY bankCode
    payUrl: { type: String }, // URL redirect VNPAY
    ipnPayload: Schema.Types.Mixed, // log raw IPN callback từ VNPAY

    // Hoàn tiền
    refundAmount: { type: Number, min: 0, default: 0, validate: isInt },
    refundedAt: Date,
    refundReason: String,
  },
  { timestamps: true, versionKey: false, collection: "payments" }
);

// Hook tính subtotal/total (không thuế, không làm tròn)
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

  // Chặn refund > total
  if (this.refundAmount > this.total) this.refundAmount = this.total;

  next();
});

export default model("Payment", PaymentSchema);
