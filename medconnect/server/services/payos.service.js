import { PayOS } from "@payos/node";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import Clinic from "../models/clinic.model.js";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import { sendMail } from "../utils/email.js";

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
    returnUrl: `${process.env.FRONTEND_URL}/dat-lich/payment-result?status=success&orderCode=${orderCode}`,
    cancelUrl: `${process.env.FRONTEND_URL}/dat-lich/payment-result?status=failed&cancel=true&orderCode=${orderCode}`,
    // webhookUrl có thể cấu hình trực tiếp trên PayOS dashboard
  };

  const link = await payos.paymentRequests.create(payosPaymentData);
  return link.checkoutUrl;
};

/**
 * Xử lý webhook từ PayOS
 * @param {object} webhookBody - Dữ liệu webhook từ PayOS
 * @param {boolean} skipVerification - Bỏ qua verify chữ ký (cho fallback manual)
 * @returns {object} - Kết quả xử lý
 */
export const handlePayosWebhook = async (webhookBody, skipVerification = false) => {
  try {
    // Verify chữ ký - throws nếu sai (trừ khi skipVerification = true)
    const verified = skipVerification ? webhookBody : await payos.webhooks.verify(webhookBody);
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

      // Gửi email thông báo thanh toán thành công cho khách hàng
      try {
        await sendPaymentConfirmationEmail(appointment, payment, patient, doctor);
        console.log(`📧 Payment confirmation email sent for appointment ${appointment._id}`);
      } catch (emailError) {
        console.error("❌ Error sending payment confirmation email:", emailError);
        // Không throw error vì email không ảnh hưởng đến quá trình thanh toán
      }

      console.log(`✅ Payment processed successfully for appointment ${appointment._id}`);
      return { 
        paid: true, 
        orderCode, 
        appointmentId: appointment._id, 
        paymentId: payment._id 
      };
    } else {
      // Payment failed - XÓA appointment và giải phóng slot
      console.log(`❌ Payment failed for orderCode: ${orderCode}`);
      
      // Xóa appointment và giải phóng time slot
      if (appointment) {
        try {
          // Giải phóng time slot trước
          if (appointment.slotId) {
            await DoctorTimeSlot.findByIdAndUpdate(appointment.slotId, {
              status: "available",
            });
            console.log(`🔓 Released time slot ${appointment.slotId} for failed payment`);
          }
          
          // Xóa appointment
          await Appointment.findByIdAndDelete(appointment._id);
          console.log(`🗑️ Deleted appointment ${appointment._id} due to failed payment`);
        } catch (deleteError) {
          console.error(`❌ Error deleting appointment ${appointment._id}:`, deleteError);
        }
      }
      
      return { paid: false, orderCode, appointmentDeleted: true };
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
    console.log(`✅ PayOS payment request cancelled for orderCode: ${orderCode}`);
  } catch (error) {
    // PayOS có thể trả lỗi nếu đã cancel rồi hoặc chưa tồn tại
    // Không throw error vì chúng ta vẫn cần cleanup appointment
    console.log(`⚠️ PayOS cancel status: ${error.message}`);
  }
  
  // Tìm appointment có pendingOrderCode này
  const appointment = await Appointment.findOne({ pendingOrderCode: orderCode });
  
  if (appointment) {
    // Nếu appointment chưa thanh toán, XÓA appointment và giải phóng slot
    if (appointment.paymentStatus === "unpaid" && !appointment.paymentId) {
      try {
        // Giải phóng time slot trước
        if (appointment.slotId) {
          await DoctorTimeSlot.findByIdAndUpdate(appointment.slotId, {
            status: "available",
          });
          console.log(`🔓 Released time slot ${appointment.slotId} for cancelled payment`);
        }
        
        // Xóa appointment
        await Appointment.findByIdAndDelete(appointment._id);
        console.log(`🗑️ Deleted appointment ${appointment._id} due to cancelled payment`);
      } catch (deleteError) {
        console.error(`❌ Error deleting appointment ${appointment._id}:`, deleteError);
        throw deleteError;
      }
    } else {
      // Nếu đã thanh toán, chỉ xóa pendingOrderCode
      appointment.pendingOrderCode = undefined;
      await appointment.save();
      console.log(`ℹ️ Cleared pendingOrderCode for paid appointment ${appointment._id}`);
    }
  } else {
    console.log(`ℹ️ No appointment found for orderCode: ${orderCode}`);
  }
  
  return { success: true, orderCode };
};

/**
 * Gửi email xác nhận thanh toán và thông tin lịch hẹn cho khách hàng
 * @param {object} appointment - Appointment object
 * @param {object} payment - Payment object
 * @param {object} patient - Patient object
 * @param {object} doctor - Doctor object
 */
async function sendPaymentConfirmationEmail(appointment, payment, patient, doctor) {
  try {
    const patientEmail = patient.userId?.email;
    if (!patientEmail) {
      console.log("⚠️ No email address found for patient, skipping email");
      return;
    }

    // Lấy thông tin specialization
    const Specialization = (await import("../models/specialization.model.js")).default;
    let specializationName = "Chuyên khoa";
    if (doctor.specializationIds && doctor.specializationIds.length > 0) {
      const spec = await Specialization.findById(doctor.specializationIds[0]);
      if (spec) {
        specializationName = spec.name;
      }
    }

    // Format ngày giờ
    const appointmentDate = new Date(appointment.scheduledStart);
    const formattedDate = appointmentDate.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = appointmentDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Format số tiền
    const formattedAmount = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(payment.total);

    // Template email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận thanh toán - MedConnect</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px 20px;
          }
          .success-badge {
            display: inline-block;
            background-color: #52c41a;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .info-section {
            background-color: #f9f9f9;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .info-section h3 {
            margin-top: 0;
            color: #667eea;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            color: #666;
          }
          .info-value {
            color: #333;
          }
          .invoice-section {
            background-color: #fff8e1;
            border: 2px solid #ffc107;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .invoice-section h3 {
            margin-top: 0;
            color: #f57c00;
          }
          .invoice-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
          .invoice-total {
            border-top: 2px solid #f57c00;
            margin-top: 10px;
            padding-top: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #f57c00;
          }
          .button {
            display: inline-block;
            background-color: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 10px 10px 0;
            text-align: center;
          }
          .button:hover {
            background-color: #5568d3;
          }
          .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MedConnect</h1>
            <p style="margin: 10px 0 0 0;">Hệ thống đặt lịch khám bệnh trực tuyến</p>
          </div>
          
          <div class="content">
            <div class="success-badge">✓ Thanh toán thành công</div>
            
            <p>Xin chào <strong>${patient.fullName || "Khách hàng"}</strong>,</p>
            
            <p>Cảm ơn bạn đã sử dụng dịch vụ của MedConnect. Thanh toán của bạn đã được xác nhận thành công. Lịch hẹn khám của bạn đã được đặt và đang chờ bác sĩ xác nhận.</p>
            
            <div class="info-section">
              <h3>📅 Thông tin lịch hẹn</h3>
              <div class="info-row">
                <span class="info-label">Ngày hẹn:</span>
                <span class="info-value">${formattedDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Giờ hẹn:</span>
                <span class="info-value">${formattedTime}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Bác sĩ:</span>
                <span class="info-value">${doctor.fullName || "Unknown Doctor"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Chuyên khoa:</span>
                <span class="info-value">${specializationName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Hình thức khám:</span>
                <span class="info-value">${appointment.mode === "online" ? "Khám trực tuyến" : "Khám tại phòng khám"}</span>
              </div>
              ${appointment.clinicId && appointment.clinicId.name ? `
              <div class="info-row">
                <span class="info-label">Phòng khám:</span>
                <span class="info-value">${appointment.clinicId.name}</span>
              </div>
              ` : ""}
              ${appointment.reason ? `
              <div class="info-row">
                <span class="info-label">Lý do khám:</span>
                <span class="info-value">${appointment.reason}</span>
              </div>
              ` : ""}
            </div>
            
            <div class="invoice-section">
              <h3>🧾 Hóa đơn thanh toán</h3>
              <div class="invoice-row">
                <span class="info-label">Mã đơn hàng:</span>
                <span class="info-value">${payment.orderCode}</span>
              </div>
              <div class="invoice-row">
                <span class="info-label">Mã hóa đơn:</span>
                <span class="info-value">${payment.invoiceNumber}</span>
              </div>
              <div class="invoice-row">
                <span class="info-label">Ngày thanh toán:</span>
                <span class="info-value">${new Date(payment.paidAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <div class="invoice-row">
                <span class="info-label">Phương thức thanh toán:</span>
                <span class="info-value">PayOS (QR Code)</span>
              </div>
              <div class="invoice-row">
                <span class="info-label">Dịch vụ:</span>
                <span class="info-value">Tư vấn y tế</span>
              </div>
              <div class="invoice-row invoice-total">
                <span class="info-label">Tổng tiền:</span>
                <span class="info-value">${formattedAmount}</span>
              </div>
            </div>
            
            <div style="margin: 30px 0;">
              <p><strong>Lưu ý quan trọng:</strong></p>
              <ul style="color: #666;">
                <li>Vui lòng đến khám đúng giờ hẹn hoặc chuẩn bị sẵn sàng cho cuộc gọi trực tuyến</li>
                <li>Mang theo CMND/CCCD khi khám tại phòng khám</li>
                <li>Bác sĩ có thể liên hệ với bạn trước giờ hẹn</li>
                <li>Bạn có thể theo dõi trạng thái lịch hẹn trong ứng dụng</li>
              </ul>
            </div>
            
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline hỗ trợ.</p>
            
            <p>Chúc bạn sức khỏe tốt!</p>
            <p><strong>Trân trọng,<br>Đội ngũ MedConnect</strong></p>
          </div>
          
          <div class="footer">
            <p>Email này được gửi tự động từ hệ thống MedConnect.</p>
            <p>© ${new Date().getFullYear()} MedConnect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendMail({
      to: patientEmail,
      subject: `Xác nhận thanh toán và lịch hẹn - ${payment.invoiceNumber}`,
      html: emailHtml,
    });

    console.log(`📧 Payment confirmation email sent successfully to ${patientEmail}`);
  } catch (error) {
    console.error("❌ Error in sendPaymentConfirmationEmail:", error);
    throw error;
  }
}

