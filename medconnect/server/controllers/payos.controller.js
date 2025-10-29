import {
  createPayosPaymentLink,
  handlePayosWebhook,
  checkPaymentStatus,
  cancelPaymentLink,
} from "../services/payos.service.js";

/**
 * Controller tạo link thanh toán PayOS
 * POST /api/payments/payos/create-payment
 * body: { appointmentId, amount, description }
 */
export const createPayosPaymentLinkController = async (req, res) => {
  try {
    const { appointmentId, amount, description } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID không được trống",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền không hợp lệ",
      });
    }

    // req.user được set từ auth middleware (decoded token)
    // decoded có uid (Firebase UID) hoặc app_user_id (MongoDB User ID)
    const userId = req.user?.app_user_id || req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found",
      });
    }

    const payUrl = await createPayosPaymentLink(userId, {
      appointmentId,
      amount,
      description,
    });

    return res.status(200).json({
      success: true,
      data: { payUrl },
      message: "Tạo link thanh toán PayOS thành công",
    });
  } catch (err) {
    console.error("❌ Error creating PayOS payment link:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal error",
    });
  }
};

/**
 * Controller xử lý webhook từ PayOS
 * POST /api/payments/payos/webhook
 */
export const handlePayosWebhookController = async (req, res) => {
  try {
    const result = await handlePayosWebhook(req.body);
    
    // Trả 200 để PayOS không retry
    return res.status(200).json({
      success: true,
      data: result || {},
      message: "Xử lý webhook PayOS thành công",
    });
  } catch (error) {
    console.error("❌ Lỗi xử lý webhook PayOS:", error.message);
    
    // Vẫn trả 200 để ngăn retry (tùy chiến lược)
    return res.status(200).json({
      success: false,
      message: "Đã nhận webhook nhưng có lỗi nội bộ",
      error: error.message,
    });
  }
};

/**
 * Controller kiểm tra trạng thái thanh toán
 * GET /api/payments/payos/check-status/:orderCode
 */
export const checkPaymentStatusController = async (req, res) => {
  try {
    const { orderCode } = req.params;
    
    if (!orderCode) {
      return res.status(400).json({
        success: false,
        message: "Order code không được trống",
      });
    }

    const paymentInfo = await checkPaymentStatus(Number(orderCode));

    return res.status(200).json({
      success: true,
      data: paymentInfo,
      message: "Lấy thông tin thanh toán thành công",
    });
  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal error",
    });
  }
};

/**
 * Controller hủy link thanh toán
 * POST /api/payments/payos/cancel/:orderCode
 */
export const cancelPaymentLinkController = async (req, res) => {
  try {
    const { orderCode } = req.params;
    
    if (!orderCode) {
      return res.status(400).json({
        success: false,
        message: "Order code không được trống",
      });
    }

    const result = await cancelPaymentLink(Number(orderCode));

    return res.status(200).json({
      success: true,
      data: result,
      message: "Hủy link thanh toán thành công",
    });
  } catch (error) {
    console.error("❌ Error canceling payment link:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal error",
    });
  }
};

