import mongoose from "mongoose";
const { Schema, model } = mongoose;

// 1 dòng trên hóa đơn
const InvoiceItemSchema = new Schema(
  {
    description: { type: String, required: true }, // VD: "Khám tim mạch online 30'"
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 }, // VND
    lineTotal: { type: Number, required: true, min: 0 }, // = quantity * unitPrice
  },
  { _id: false }
);

// Snapshot người trả tiền tại thời điểm xuất hóa đơn (tránh lệ thuộc thay đổi về sau)
const BillToSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    name: { type: String, required: true }, // tên bệnh nhân tại thời điểm xuất HĐ
    email: { type: String }, // tùy chọn
    phone: { type: String }, // tùy chọn (E.164 nếu có)
  },
  { _id: false }
);

// Snapshot nơi cung cấp dịch vụ (bác sĩ/clinic) tại thời điểm xuất hóa đơn
const BillFromSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    doctorName: { type: String, required: true },
    clinicName: { type: String }, // nếu có
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

    // Thông tin hóa đơn
    invoiceNumber: { type: String, required: true, unique: true, trim: true }, // số HĐ duy nhất (tự sinh theo prefix của bạn)
    currency: { type: String, default: "VND" },
    issueDate: { type: Date, default: () => new Date() }, // ngày phát hành hóa đơn (không thuế)

    billTo: { type: BillToSchema, required: true },
    billFrom: { type: BillFromSchema, required: true },

    items: {
      type: [InvoiceItemSchema],
      required: true,
      validate: (v) => v.length > 0,
    },

    // Tổng tiền (không thuế)
    subtotal: { type: Number, required: true, min: 0 }, // tổng lineTotal
    discount: { type: Number, required: true, min: 0, default: 0 }, // giảm giá nếu có
    total: { type: Number, required: true, min: 0 }, // = subtotal - discount

    // Thanh toán qua cổng
    method: { type: String, enum: ["vnpay", "momo", "vietqr"], required: true },
    status: {
      type: String,
      enum: ["init", "pending", "paid", "failed", "refunded", "cancelled"],
      default: "init",
    },
    providerTxnId: { type: String }, // mã GD từ cổng thanh toán
    paidAt: { type: Date }, // set khi status = "paid"
  },
  { timestamps: true, collection: "payments" }
);

// Gợi ý logic tính toán trước khi save
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
  this.total = Math.max(0, this.subtotal - this.discount);
  next();
});

export default model("Payment", PaymentSchema);
