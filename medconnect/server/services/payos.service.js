import { PayOS } from "@payos/node";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import Clinic from "../models/clinic.model.js";

dotenv.config();

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

/**
 * Tạo link thanh toán PayOS cho appointment
 * @param {string} userId - ID của user
 * @param {object} paymentData - Dữ liệu thanh toán {appointmentId, amount, description}
 * @returns {string} - URL thanh toán
 */
export const createPayosPaymentLink = async (userId, paymentData) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid User ID");
  }

  const { appointmentId, amount, description = "Payment for appointment" } = paymentData || {};

  if (!appointmentId) throw new Error("Appointment ID không được trống");
  if (!amount || amount <= 0) throw new Error("Số tiền không hợp lệ");

  // Kiểm tra appointment tồn tại và thuộc về user
  const appointment = await Appointment.findById(appointmentId)
    .populate("patientId")
    .populate("doctorId")
    .populate("clinicId");

  if (!appointment) throw new Error("Appointment not found");
  
  // Kiểm tra xem patient có thuộc về user này không
  const patient = await Patient.findOne({ userId: userId }).populate("userId");
  if (!patient) throw new Error("Patient not found");
  
  if (appointment.patientId._id.toString() !== patient._id.toString()) {
    throw new Error("Unauthorized: Appointment does not belong to this user");
  }

  // Kiểm tra trạng thái appointment
  if (appointment.status === "cancelled") {
    throw new Error("Cannot pay for cancelled appointment");
  }

  // Tạo orderCode 10 chữ số (int)
  const orderCode = Number(String(Date.now()).slice(-10));

  // Kiểm tra xem đã thanh toán thành công chưa
  const existingPayment = await Payment.findOne({ appointmentId });
  if (existingPayment && ["captured", "authorized"].includes(existingPayment.status)) {
    throw new Error("Appointment already paid");
  }

  // Lưu orderCode vào appointment (chưa tạo payment record)
  appointment.pendingOrderCode = orderCode;
  await appointment.save();

  const payosPaymentData = {
    orderCode,
    amount: parseInt(amount),
    description: `MedConnect ${String(orderCode).slice(-8)}`, // Max 25 chars (18 chars)
    returnUrl: `${process.env.FRONTEND_URL}/dat-lich/payment-result?status=success`,
    cancelUrl: `${process.env.FRONTEND_URL}/dat-lich/payment-result?status=failed`,
    // webhookUrl có thể cấu hình trực tiếp trên PayOS dashboard
  };

  const link = await payos.paymentRequests.create(payosPaymentData);
  return link.checkoutUrl;
};

/**
 * Xử lý webhook từ PayOS
 * @param {object} webhookBody - Dữ liệu webhook từ PayOS
 * @returns {object} - Kết quả xử lý
 */
export const handlePayosWebhook = async (webhookBody) => {
  try {
    // Verify chữ ký - throws nếu sai
    const verified = await payos.webhooks.verify(webhookBody);
    const { data } = verified || {};
    const { orderCode, description, code, amount } = data || {};

    if (!orderCode) throw new Error("Missing orderCode in webhook data");

    // Chỉ xử lý payment cho appointment
    if (!String(description || "").includes("MedConnect")) {
      return { ignored: true, message: "Not an appointment payment" };
    }

    // Tìm Appointment bằng pendingOrderCode
    const appointment = await Appointment.findOne({ pendingOrderCode: orderCode })
      .populate("patientId")
      .populate("doctorId")
      .populate("clinicId");

    if (!appointment) {
      console.log(`⚠️ Appointment not found for orderCode: ${orderCode}. Possibly already processed.`);
      return { already: true, orderCode };
    }

    // Kiểm tra xem đã có payment chưa (idempotent)
    const existingPayment = await Payment.findOne({ appointmentId: appointment._id });
    if (existingPayment && existingPayment.status === "captured") {
      console.log(`ℹ️ Payment already captured for appointment: ${appointment._id}`);
      return { already: true, orderCode, paymentId: existingPayment._id };
    }

    const isPaid = String(code) === "00" || verified.success === true || String(data.code) === "00";

    if (isPaid) {
      // Lấy thông tin patient và doctor
      const patient = await Patient.findById(appointment.patientId._id).populate("userId");
      const doctor = await Doctor.findById(appointment.doctorId._id);

      // TẠO Payment record MỚI khi thanh toán thành công
      const invoiceNumber = `INV-PAYOS-${orderCode}`;
      
      const payment = new Payment({
        appointmentId: appointment._id,
        invoiceNumber,
        currency: "VND",
        issueDate: new Date(),
        billTo: {
          patientId: patient._id,
          name: patient.fullName || patient.userId?.fullName || "Unknown",
          email: patient.userId?.email,
          phone: patient.userId?.phoneNumber,
        },
        billFrom: {
          doctorId: doctor._id,
          clinicId: appointment.clinicId?._id,
          doctorName: doctor.fullName || "Unknown Doctor",
          clinicName: appointment.clinicId?.name || "Online Consultation",
        },
        items: [
          {
            description: "Medical Consultation",
            quantity: 1,
            unitPrice: parseInt(amount),
            lineTotal: parseInt(amount),
          },
        ],
        subtotal: parseInt(amount),
        discount: 0,
        total: parseInt(amount),
        gateway: "payos",
        method: "qr",
        status: "captured", // Lưu luôn với status captured
        orderCode: orderCode,
        providerTxnId: String(orderCode),
        paidAt: new Date(),
        capturedAt: new Date(),
      });

      await payment.save();

      // Cập nhật trạng thái thanh toán của appointment
      appointment.paymentStatus = "paid";
      appointment.paymentId = payment._id;
      appointment.pendingOrderCode = undefined; // Xóa pendingOrderCode
      await appointment.save();

      console.log(`✅ Payment processed successfully for appointment ${appointment._id}`);
      return { 
        paid: true, 
        orderCode, 
        appointmentId: appointment._id, 
        paymentId: payment._id 
      };
    } else {
      // Payment failed - không tạo payment record, chỉ log
      console.log(`❌ Payment failed for orderCode: ${orderCode}`);
      return { paid: false, orderCode };
    }
  } catch (error) {
    console.error("❌ Error in handlePayosWebhook:", error);
    throw error;
  }
};

/**
 * Kiểm tra trạng thái thanh toán
 * @param {number} orderCode - Mã đơn hàng
 * @returns {object} - Thông tin thanh toán
 */
export const checkPaymentStatus = async (orderCode) => {
  try {
    const paymentInfo = await payos.paymentRequests.get(orderCode);
    return paymentInfo;
  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    throw error;
  }
};

/**
 * Hủy link thanh toán
 * @param {number} orderCode - Mã đơn hàng
 * @returns {object} - Kết quả hủy
 */
export const cancelPaymentLink = async (orderCode) => {
  try {
    const result = await payos.paymentRequests.cancel(orderCode);
    
    // Xóa pendingOrderCode trong appointment nếu có
    const appointment = await Appointment.findOne({ pendingOrderCode: orderCode });
    if (appointment) {
      appointment.pendingOrderCode = undefined;
      await appointment.save();
    }
    
    return result;
  } catch (error) {
    console.error("❌ Error canceling payment link:", error);
    throw error;
  }
};

