import React, { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { FileText, Search, Calendar, Download } from "lucide-react";
import "./InvoiceManagement.scss";

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, booking, service
  const [statusFilter, setStatusFilter] = useState("all"); // all, captured, failed, etc.
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadInvoices();
  }, [activeTab, statusFilter, page, startDate, endDate]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Set invoiceType based on active tab
      if (activeTab === "booking") {
        params.append("invoiceType", "booking");
      } else if (activeTab === "service") {
        params.append("invoiceType", "service");
      }
      // "all" tab doesn't filter by invoiceType
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      
      if (startDate) {
        params.append("startDate", startDate);
      }
      
      if (endDate) {
        params.append("endDate", endDate);
      }
      
      params.append("page", page.toString());
      params.append("limit", "20");

      const response = await api.get(
        `/api/managers/invoices?${params.toString()}`
      );

      if (response.success) {
        setInvoices(response.data.invoices || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        console.error("Failed to load invoices:", response.message);
        alert("Không thể tải danh sách hóa đơn");
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
      alert("Có lỗi xảy ra khi tải danh sách hóa đơn");
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

  const getStatusColor = (status) => {
    const colors = {
      captured: "bg-green-500 text-white",
      initiated: "bg-yellow-500 text-white",
      failed: "bg-red-500 text-white",
      refunded: "bg-gray-500 text-white",
      cancelled: "bg-gray-400 text-white",
    };
    return colors[status] || "bg-gray-300 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      captured: "Đã thanh toán",
      initiated: "Đang xử lý",
      failed: "Thất bại",
      refunded: "Đã hoàn tiền",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  const getInvoiceTypeText = (type) => {
    return type === "booking" ? "Thanh toán đặt lịch" : "Thanh toán dịch vụ";
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      invoice.invoiceNumber?.toLowerCase().includes(term) ||
      invoice.patientName?.toLowerCase().includes(term) ||
      invoice.doctorName?.toLowerCase().includes(term) ||
      invoice.orderCode?.toString().includes(term)
    );
  });

  return (
    <div className="invoice-management">
      <div className="invoice-management-header">
        <h1>
          <FileText className="w-6 h-6" />
          Quản lý hóa đơn
        </h1>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-item">
            <Search className="w-4 h-4" />
            <Input
              type="text"
              placeholder="Tìm theo mã hóa đơn, tên bệnh nhân, bác sĩ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-item">
            <Calendar className="w-4 h-4" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="date-input"
            />
            <span>đến</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="date-input"
            />
          </div>

          <div className="filter-item">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="status-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="captured">Đã thanh toán</option>
              <option value="initiated">Đang xử lý</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-section">
        <div className="tabs-list">
          <button
            className={`tab-button ${activeTab === "all" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("all");
              setPage(1);
            }}
          >
            Tất cả hóa đơn
          </button>
          <button
            className={`tab-button ${activeTab === "booking" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("booking");
              setPage(1);
            }}
          >
            Thanh toán đặt lịch
          </button>
          <button
            className={`tab-button ${activeTab === "service" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("service");
              setPage(1);
            }}
          >
            Thanh toán dịch vụ
          </button>
        </div>

        <div className="tab-content">
          <InvoiceTable
            invoices={filteredInvoices}
            loading={loading}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            getInvoiceTypeText={getInvoiceTypeText}
          />
        </div>
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
    </div>
  );
}

function InvoiceTable({
  invoices,
  loading,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusText,
  getInvoiceTypeText,
}) {
  if (loading) {
    return (
      <div className="loading-state">
        <p>Đang tải danh sách hóa đơn...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="empty-state">
        <FileText className="w-12 h-12" />
        <p>Không có hóa đơn nào</p>
      </div>
    );
  }

  return (
    <div className="invoice-table-container">
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Mã hóa đơn</th>
            <th>Loại</th>
            <th>Bệnh nhân</th>
            <th>Bác sĩ</th>
            <th>Ngày tạo</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice._id}>
              <td>{invoice.invoiceNumber}</td>
              <td>
                <span className={`invoice-type-badge ${invoice.invoiceType}`}>
                  {getInvoiceTypeText(invoice.invoiceType)}
                </span>
              </td>
              <td>{invoice.patientName}</td>
              <td>{invoice.doctorName}</td>
              <td>{formatDate(invoice.createdAt)}</td>
              <td className="amount-cell">{formatCurrency(invoice.total)}</td>
              <td>
                <span className={`status-badge ${getStatusColor(invoice.status)}`}>
                  {getStatusText(invoice.status)}
                </span>
              </td>
              <td>
                <InvoiceDetailModal invoice={invoice} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceDetailModal({ invoice }) {
  const [showModal, setShowModal] = useState(false);

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

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowModal(true)}
      >
        Xem
      </Button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết hóa đơn</h2>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="invoice-detail-section">
                <h3>Thông tin hóa đơn</h3>
                <div className="detail-row">
                  <span>Mã hóa đơn:</span>
                  <span>{invoice.invoiceNumber}</span>
                </div>
                <div className="detail-row">
                  <span>Loại:</span>
                  <span>
                    {invoice.invoiceType === "booking"
                      ? "Thanh toán đặt lịch"
                      : "Thanh toán dịch vụ"}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Order Code:</span>
                  <span>{invoice.orderCode || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span>Trạng thái:</span>
                  <span>{invoice.status}</span>
                </div>
                <div className="detail-row">
                  <span>Ngày tạo:</span>
                  <span>{formatDate(invoice.createdAt)}</span>
                </div>
                {invoice.paidAt && (
                  <div className="detail-row">
                    <span>Ngày thanh toán:</span>
                    <span>{formatDate(invoice.paidAt)}</span>
                  </div>
                )}
              </div>

              <div className="invoice-detail-section">
                <h3>Thông tin bệnh nhân</h3>
                <div className="detail-row">
                  <span>Tên:</span>
                  <span>{invoice.patientName}</span>
                </div>
                {invoice.patientPhone && (
                  <div className="detail-row">
                    <span>Điện thoại:</span>
                    <span>{invoice.patientPhone}</span>
                  </div>
                )}
              </div>

              <div className="invoice-detail-section">
                <h3>Thông tin bác sĩ</h3>
                <div className="detail-row">
                  <span>Tên:</span>
                  <span>{invoice.doctorName}</span>
                </div>
                {invoice.clinicName && (
                  <div className="detail-row">
                    <span>Phòng khám:</span>
                    <span>{invoice.clinicName}</span>
                  </div>
                )}
              </div>

              {invoice.items && invoice.items.length > 0 && (
                <div className="invoice-detail-section">
                  <h3>Chi tiết dịch vụ</h3>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Mô tả</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => (
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

              <div className="invoice-detail-section">
                <h3>Tổng thanh toán</h3>
                <div className="detail-row">
                  <span>Tổng phụ:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="detail-row">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                <div className="detail-row total-row">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

