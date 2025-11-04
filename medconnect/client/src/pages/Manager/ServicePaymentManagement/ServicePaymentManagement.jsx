import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { DollarSign, CreditCard, Search, X, FileText, Check, AlertCircle } from "lucide-react";
import "./ServicePaymentManagement.scss";

export default function ServicePaymentManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [page]);

  // Xử lý returnUrl sau khi thanh toán PayOS (chạy riêng khi component mount)
  useEffect(() => {
    const orderCode = searchParams.get("orderCode");
    const status = searchParams.get("status");
    
    if (orderCode && status) {
      handlePaymentResult(orderCode, status);
    }
  }, []); // Chỉ chạy 1 lần khi mount

  const handlePaymentResult = async (orderCode, status) => {
    try {
      // Kiểm tra payment status từ server
      const response = await api.get(`/api/payments/payos/check-status/${orderCode}`);
      
      if (response.success && response.data) {
        if (status === "success" && response.data.paid) {
          alert("Thanh toán thành công!");
          // Xóa params ngay để tránh xử lý lại khi reload
          setSearchParams({});
          // Reload danh sách để cập nhật
          await loadPayments();
        } else if (status === "failed") {
          alert("Thanh toán thất bại. Vui lòng thử lại.");
          setSearchParams({});
        }
      } else {
        // Nếu chưa có webhook, đợi một chút rồi check lại (max 3 lần)
        let retryCount = 0;
        const maxRetries = 3;
        
        const checkPaymentStatus = async () => {
          if (retryCount >= maxRetries) {
            alert("Đang xử lý thanh toán. Vui lòng đợi vài giây rồi tải lại trang.");
            setSearchParams({});
            return;
          }
          
          retryCount++;
          setTimeout(async () => {
            try {
              const retryResponse = await api.get(`/api/payments/payos/check-status/${orderCode}`);
              if (retryResponse.success && retryResponse.data?.paid) {
                alert("Thanh toán thành công!");
                setSearchParams({});
                await loadPayments();
              } else if (retryCount < maxRetries) {
                // Retry again
                checkPaymentStatus();
              } else {
                setSearchParams({});
              }
            } catch (retryError) {
              console.error("Error retrying payment check:", retryError);
              if (retryCount >= maxRetries) {
                setSearchParams({});
              }
            }
          }, 2000);
        };
        
        checkPaymentStatus();
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setSearchParams({});
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");

      const response = await api.get(
        `/api/managers/service-payments/pending?${params.toString()}`
      );

      if (response.success) {
        setPayments(response.data.payments || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        console.error("Failed to load payments:", response.message);
        alert("Không thể tải danh sách yêu cầu thanh toán");
      }
    } catch (error) {
      console.error("Error loading payments:", error);
      alert("Có lỗi xảy ra khi tải danh sách yêu cầu thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCashPayment = (payment) => {
    setSelectedPayment(payment);
    setAmountPaid(payment.total.toString());
    setShowCashModal(true);
  };

  const handleBankTransfer = async (payment) => {
    // Nếu đã có payUrl và đang ở trạng thái initiated, chỉ hiển thị modal với link hiện có
    if (payment.payUrl && payment.status === "initiated") {
      setSelectedPayment(payment);
      setShowBankModal(true);
      return;
    }

    try {
      setProcessing(true);
      const response = await api.post(
        `/api/managers/service-payments/${payment._id}/bank-transfer`
      );

      if (response.success) {
        setSelectedPayment({
          ...payment,
          payUrl: response.data.payment.payUrl,
          orderCode: response.data.payment.orderCode,
        });
        setShowBankModal(true);
        // Reload để cập nhật trạng thái
        loadPayments();
      } else {
        alert(response.message || "Không thể tạo link thanh toán");
      }
    } catch (error) {
      console.error("Error creating bank transfer link:", error);
      alert("Có lỗi xảy ra khi tạo link thanh toán");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmCashPayment = async () => {
    if (!selectedPayment) return;

    const amount = parseInt(amountPaid);
    if (!amount || amount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (amount > selectedPayment.total) {
      alert("Số tiền thanh toán không được vượt quá tổng tiền");
      return;
    }

    // Confirm dialog
    const confirmMessage = `Xác nhận thanh toán tiền mặt?\n\n` +
      `Mã hóa đơn: ${selectedPayment.invoiceNumber}\n` +
      `Tổng tiền: ${formatCurrency(selectedPayment.total)}\n` +
      `Số tiền nhận: ${formatCurrency(amount)}\n` +
      (amount < selectedPayment.total 
        ? `Còn lại: ${formatCurrency(selectedPayment.total - amount)}\n` 
        : ``) +
      (amount > selectedPayment.total 
        ? `Số tiền thừa: ${formatCurrency(amount - selectedPayment.total)}\n` 
        : ``);

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setProcessing(true);
      const response = await api.post(
        `/api/managers/service-payments/${selectedPayment._id}/cash`,
        { amountPaid: amount }
      );

      if (response.success) {
        alert(response.message || "Thanh toán tiền mặt thành công");
        setShowCashModal(false);
        setSelectedPayment(null);
        setAmountPaid("");
        loadPayments(); // Reload danh sách
      } else {
        alert(response.message || "Không thể xử lý thanh toán tiền mặt");
      }
    } catch (error) {
      console.error("Error processing cash payment:", error);
      alert("Có lỗi xảy ra khi xử lý thanh toán tiền mặt");
    } finally {
      setProcessing(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      payment.invoiceNumber?.toLowerCase().includes(term) ||
      payment.patientName?.toLowerCase().includes(term) ||
      payment.doctorName?.toLowerCase().includes(term)
    );
  });

  const balance = selectedPayment
    ? Math.max(0, selectedPayment.total - parseInt(amountPaid || 0))
    : 0;

  return (
    <div className="service-payment-management">
      <div className="service-payment-header">
        <div className="header-left">
          <h1>
            <DollarSign className="icon" />
            Thanh toán hóa đơn
          </h1>
          <p className="header-description">
            Xử lý yêu cầu thanh toán hóa đơn dịch vụ từ bác sĩ
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <Input
            type="text"
            placeholder="Tìm theo mã hóa đơn, tên bệnh nhân, bác sĩ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Payments List */}
      <div className="payments-section">
        {loading ? (
          <div className="loading-state">
            <p>Đang tải danh sách yêu cầu thanh toán...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="empty-state">
            <FileText className="w-12 h-12" />
            <p>Không có yêu cầu thanh toán nào</p>
          </div>
        ) : (
          <div className="payments-table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Mã hóa đơn</th>
                  <th>Bệnh nhân</th>
                  <th>Bác sĩ</th>
                  <th>Ngày yêu cầu</th>
                  <th>Tổng tiền</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.invoiceNumber}</td>
                    <td>{payment.patientName}</td>
                    <td>{payment.doctorName}</td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td className="amount-cell">
                      {formatCurrency(payment.total)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCashPayment(payment)}
                          disabled={payment.status === "captured" || payment.status === "initiated"}
                          className="btn-cash"
                        >
                          <DollarSign className="w-4 h-4" />
                          Tiền mặt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBankTransfer(payment)}
                          disabled={processing || payment.status === "captured"}
                          className="btn-bank"
                        >
                          <CreditCard className="w-4 h-4" />
                          {payment.status === "initiated" && payment.payUrl 
                            ? "Thanh toán" 
                            : "Chuyển khoản"}
                        </Button>
                        {payment.status === "captured" && (
                          <span className="payment-status-badge paid">
                            Đã thanh toán
                          </span>
                        )}
                        {payment.status === "initiated" && payment.payUrl && (
                          <span className="payment-status-badge pending">
                            Đang chờ thanh toán
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trước
          </Button>
          <span>
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Cash Payment Modal */}
      {showCashModal && selectedPayment && (
        <CashPaymentModal
          payment={selectedPayment}
          amountPaid={amountPaid}
          setAmountPaid={setAmountPaid}
          balance={balance}
          onConfirm={handleConfirmCashPayment}
          onClose={() => {
            setShowCashModal(false);
            setSelectedPayment(null);
            setAmountPaid("");
          }}
          processing={processing}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Bank Transfer Modal */}
      {showBankModal && selectedPayment && (
        <BankTransferModal
          payment={selectedPayment}
          onClose={() => {
            setShowBankModal(false);
            setSelectedPayment(null);
            loadPayments();
          }}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

function CashPaymentModal({
  payment,
  amountPaid,
  setAmountPaid,
  balance,
  onConfirm,
  onClose,
  processing,
  formatCurrency,
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thanh toán tiền mặt</h2>
          <button onClick={onClose}>
            <X className="icon" />
          </button>
        </div>
        <div className="modal-body">
          {/* Invoice Details */}
          <div className="invoice-section">
            <h3>Thông tin hóa đơn</h3>
            <div className="invoice-details">
              <div className="detail-row">
                <span>Mã hóa đơn:</span>
                <span>{payment.invoiceNumber}</span>
              </div>
              <div className="detail-row">
                <span>Bệnh nhân:</span>
                <span>{payment.patientName}</span>
              </div>
              <div className="detail-row">
                <span>Bác sĩ:</span>
                <span>{payment.doctorName}</span>
              </div>
            </div>

            {/* Items */}
            {payment.items && payment.items.length > 0 && (
              <div className="items-section">
                <h4>Chi tiết dịch vụ</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Dịch vụ</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payment.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>{formatCurrency(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="total-section">
              <div className="total-row">
                <span>Tổng tiền:</span>
                <span className="total-amount">
                  {formatCurrency(payment.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Input */}
          <div className="payment-input-section">
            <h3>Nhập số tiền thanh toán</h3>
            <div className="input-group">
              <label>Số tiền nhận (VND):</label>
              <Input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Nhập số tiền"
                min="0"
              />
            </div>
            
            {/* Số tiền thừa */}
            {parseInt(amountPaid || 0) > payment.total && (
              <div className="change-info">
                <span>Số tiền thừa:</span>
                <span className="change-amount">
                  {formatCurrency(parseInt(amountPaid || 0) - payment.total)}
                </span>
              </div>
            )}
            
            {/* Còn lại */}
            {balance > 0 && balance < payment.total && (
              <div className="balance-info">
                <span>Còn lại:</span>
                <span className="balance-amount">
                  {formatCurrency(balance)}
                </span>
              </div>
            )}
            
            {/* Validation messages */}
            {parseInt(amountPaid || 0) > payment.total && (
              <div className="error-message">
                Số tiền thanh toán không được vượt quá tổng tiền
              </div>
            )}
            {parseInt(amountPaid || 0) > 0 && parseInt(amountPaid || 0) < payment.total && (
              <div className="warning-message">
                Thanh toán một phần. Bệnh nhân còn nợ {formatCurrency(balance)}.
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={onClose} disabled={processing}>
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={
              processing ||
              !amountPaid ||
              parseInt(amountPaid) <= 0 ||
              parseInt(amountPaid) > payment.total
            }
            className="btn-confirm"
          >
            {processing ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BankTransferModal({ payment, onClose, formatCurrency }) {
  const handlePayNow = () => {
    if (payment.payUrl) {
      // Redirect to PayOS payment page
      window.location.href = payment.payUrl;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bank-transfer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thanh toán chuyển khoản</h2>
          <button onClick={onClose}>
            <X className="icon" />
          </button>
        </div>
        <div className="modal-body">
          <div className="invoice-section">
            <h3>Thông tin hóa đơn</h3>
            <div className="invoice-details">
              <div className="detail-row">
                <span>Mã hóa đơn:</span>
                <span>{payment.invoiceNumber}</span>
              </div>
              <div className="detail-row">
                <span>Bệnh nhân:</span>
                <span>{payment.patientName}</span>
              </div>
              <div className="detail-row">
                <span>Bác sĩ:</span>
                <span>{payment.doctorName}</span>
              </div>
              <div className="detail-row">
                <span>Tổng tiền:</span>
                <span className="total-amount">
                  {formatCurrency(payment.total)}
                </span>
              </div>
            </div>

            {/* Items */}
            {payment.items && payment.items.length > 0 && (
              <div className="items-section">
                <h4>Chi tiết dịch vụ</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Dịch vụ</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payment.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>{formatCurrency(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="payment-action-section">
            {payment.payUrl ? (
              <>
                <div className="payment-info">
                  <Check className="icon" />
                  <span>
                    Link thanh toán đã được tạo. Bấm nút bên dưới để chuyển đến trang thanh toán PayOS.
                  </span>
                </div>
                <div className="payment-button-wrapper">
                  <Button 
                    onClick={handlePayNow} 
                    className="btn-pay-now"
                    size="large"
                  >
                    <CreditCard className="w-5 h-5" />
                    Thanh toán
                  </Button>
                </div>
              </>
            ) : (
              <div className="no-link">Chưa có link thanh toán</div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

