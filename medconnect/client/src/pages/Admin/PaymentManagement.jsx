import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Spin, Alert, Table, Tag, Dropdown, DatePicker, Space } from "antd";
import { DollarOutlined, ShoppingOutlined, ArrowUpOutlined, DownOutlined, FileTextOutlined } from "@ant-design/icons";
import { getPaymentRevenueStats, getAdminInvoices } from "../../lib/api";
import dayjs from "dayjs";
import "./PaymentManagement.scss";

const PaymentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCompletedOrders: 0,
    revenueChange: 0,
    ordersChange: 0,
    revenueByChannel: [],
    orderStatus: {
      paid: 0,
      cancelled: 0,
      total: 0,
    },
    revenueTrend: [],
  });
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [customDateRange, setCustomDateRange] = useState(null);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const periods = [
    { key: "today", label: "Hôm nay" },
    { key: "thisWeek", label: "Tuần này" },
    { key: "thisMonth", label: "Tháng này" },
    { key: "threeMonths", label: "Ba tháng gần nhất" },
    { key: "thisYear", label: "Năm nay" },
  ];

  const customPeriods = [
    { key: "24hours", label: "24 giờ" },
    { key: "7days", label: "7 ngày" },
    { key: "30days", label: "30 ngày" },
    { key: "1year", label: "1 năm" },
    { key: "customDate", label: "Tùy chỉnh" },
    { key: "all", label: "Tất cả" },
  ];

  useEffect(() => {
    fetchRevenueData();
    fetchInvoices();
  }, [selectedPeriod, customDateRange]);

  const handleCustomPeriodSelect = (key) => {
    if (key === "customDate") {
      setShowCustomPicker(true);
    } else if (key === "all") {
      setSelectedPeriod("all");
      setCustomDateRange(null);
      setShowCustomPicker(false);
    } else {
      setSelectedPeriod(key);
      setCustomDateRange(null);
      setShowCustomPicker(false);
    }
  };

  const handleCustomDateApply = (dates) => {
    if (dates && dates.length === 2) {
      setCustomDateRange(dates);
      setSelectedPeriod("custom");
      setShowCustomPicker(false);
    }
  };

  const handleCustomDateReset = () => {
    setCustomDateRange(null);
    setShowCustomPicker(false);
    setSelectedPeriod("today");
  };

  const fetchInvoices = async () => {
    try {
      setInvoicesLoading(true);
      const period = customDateRange && customDateRange[0] && customDateRange[1] ? "custom" : selectedPeriod;
      const params = { period };
      if (customDateRange && customDateRange[0] && customDateRange[1]) {
        params.startDate = dayjs.isDayjs(customDateRange[0]) ? customDateRange[0].format("YYYY-MM-DD") : dayjs(customDateRange[0]).format("YYYY-MM-DD");
        params.endDate = dayjs.isDayjs(customDateRange[1]) ? customDateRange[1].format("YYYY-MM-DD") : dayjs(customDateRange[1]).format("YYYY-MM-DD");
      }
      const data = await getAdminInvoices(params);
      setInvoices(data.data || data || []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const period = customDateRange && customDateRange[0] && customDateRange[1] ? "custom" : selectedPeriod;
      const params = { period };
      if (customDateRange && customDateRange[0] && customDateRange[1]) {
        params.startDate = dayjs.isDayjs(customDateRange[0]) ? customDateRange[0].format("YYYY-MM-DD") : dayjs(customDateRange[0]).format("YYYY-MM-DD");
        params.endDate = dayjs.isDayjs(customDateRange[1]) ? customDateRange[1].format("YYYY-MM-DD") : dayjs(customDateRange[1]).format("YYYY-MM-DD");
      }
      const data = await getPaymentRevenueStats(params);
      setStats(data.data || data);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError("Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount || 0) + " VNĐ";
  };

  const calculatePercentage = (current, previous) => {
    if (!previous || previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Calculate order status percentages
  const paidPercentage = stats.orderStatus.total > 0
    ? Math.round((stats.orderStatus.paid / stats.orderStatus.total) * 100)
    : 0;
  const cancelledPercentage = stats.orderStatus.total > 0
    ? Math.round((stats.orderStatus.cancelled / stats.orderStatus.total) * 100)
    : 0;

  // Donut chart calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const paidArcLength = (paidPercentage / 100) * circumference;
  const paidOffset = circumference - paidArcLength;

  if (loading) {
    return (
      <div className="payment-management">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px" }}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-management">
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="payment-management">
      <div className="page-header">
        <h1>Quản lí doanh thu</h1>
        <p>Xem và quản lý tất cả các thanh toán trong hệ thống</p>
      </div>

      {/* Date Range Selector */}
      <div className="period-selector">
        {periods.map((period) => (
          <Button
            key={period.key}
            type={selectedPeriod === period.key ? "primary" : "default"}
            className={`period-btn ${selectedPeriod === period.key ? "active" : ""}`}
            onClick={() => {
              setSelectedPeriod(period.key);
              setCustomDateRange(null);
              setShowCustomPicker(false);
            }}
          >
            {period.label}
          </Button>
        ))}
        
        {/* Custom Period Dropdown */}
        <Dropdown
          menu={{
            items: customPeriods.map((item) => ({
              key: item.key,
              label: item.label,
              onClick: () => handleCustomPeriodSelect(item.key),
            })),
          }}
          open={showCustomPicker && selectedPeriod === "custom" ? false : undefined}
          trigger={["click"]}
        >
          <Button
            type={selectedPeriod === "custom" ? "primary" : "default"}
            className={`period-btn ${selectedPeriod === "custom" ? "active" : ""}`}
            icon={<DownOutlined />}
            onClick={(e) => {
              if (selectedPeriod !== "custom") {
                e.preventDefault();
              }
            }}
          >
            Tùy chỉnh
          </Button>
        </Dropdown>

        {/* Custom Date Picker */}
        {showCustomPicker && (
          <div className="custom-date-picker">
            <div className="custom-picker-content">
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <div>
                  <div className="picker-label">Từ</div>
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày bắt đầu"
                    value={customDateRange && customDateRange[0] ? dayjs(customDateRange[0]) : null}
                    onChange={(date) => {
                      if (customDateRange) {
                        setCustomDateRange([date, customDateRange[1]]);
                      } else {
                        setCustomDateRange([date, null]);
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="picker-label">Đến</div>
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày kết thúc"
                    value={customDateRange && customDateRange[1] ? dayjs(customDateRange[1]) : null}
                    onChange={(date) => {
                      if (customDateRange) {
                        setCustomDateRange([customDateRange[0], date]);
                      } else {
                        setCustomDateRange([null, date]);
                      }
                    }}
                  />
                </div>
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                  <Button onClick={handleCustomDateReset}>Đặt lại</Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      if (customDateRange && customDateRange[0] && customDateRange[1]) {
                        handleCustomDateApply(customDateRange);
                      }
                    }}
                    disabled={!customDateRange || !customDateRange[0] || !customDateRange[1]}
                  >
                    Áp dụng
                  </Button>
                </Space>
              </Space>
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <Row gutter={[24, 24]} className="metric-cards">
        <Col xs={24} sm={12} lg={12}>
          <Card className="metric-card revenue-card">
            <div className="metric-header">
              <span className="metric-title">Tổng doanh thu {periods.find(p => p.key === selectedPeriod)?.label.toLowerCase()}</span>
            </div>
            <div className="metric-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="metric-change positive">
              <ArrowUpOutlined />
              <span>{stats.revenueChange > 0 ? "+" : ""}{stats.revenueChange}%</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={12}>
          <Card className="metric-card orders-card">
            <div className="metric-header">
              <span className="metric-title">Tổng đơn hoàn thành {periods.find(p => p.key === selectedPeriod)?.label.toLowerCase()}</span>
            </div>
            <div className="metric-value">{stats.totalCompletedOrders} đơn hàng</div>
            <div className="metric-change positive">
              <ArrowUpOutlined />
              <span>{stats.ordersChange > 0 ? "+" : ""}{stats.ordersChange}%</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Middle Section */}
      <Row gutter={[24, 24]} className="middle-section">
        {/* Invoice Management */}
        <Col xs={24} lg={12}>
          <Card className="invoice-card" title="Quản lí hóa đơn">
            <div className="invoice-list">
              {invoicesLoading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin />
                </div>
              ) : invoices && invoices.length > 0 ? (
                <div className="invoice-items">
                  {invoices.slice(0, 5).map((invoice, index) => (
                    <div key={index} className="invoice-item">
                      <div className="invoice-header">
                        <FileTextOutlined className="invoice-icon" />
                        <div className="invoice-info">
                          <div className="invoice-code">Mã đơn: {invoice.orderCode || invoice._id}</div>
                          <div className="invoice-number">{invoice.invoiceNumber}</div>
                        </div>
                      </div>
                      <div className="invoice-details">
                        <div className="invoice-detail-row">
                          <span className="detail-label">Ngày thanh toán:</span>
                          <span className="detail-value">
                            {new Date(invoice.paidAt || invoice.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="invoice-detail-row">
                          <span className="detail-label">Phương thức:</span>
                          <Tag color="blue">
                            {invoice.gateway === "payos" ? "PayOS" : invoice.gateway?.toUpperCase()} ({invoice.method === "qr" ? "QR Code" : invoice.method?.toUpperCase()})
                          </Tag>
                        </div>
                        <div className="invoice-detail-row">
                          <span className="detail-label">Dịch vụ:</span>
                          <span className="detail-value">Tư vấn y tế</span>
                        </div>
                      </div>
                      <div className="invoice-total">
                        <span className="total-label">Tổng tiền:</span>
                        <span className="total-amount">{formatCurrency(invoice.total)}</span>
                      </div>
                    </div>
                  ))}
                  {invoices.length > 5 && (
                    <div className="invoice-more">
                      <Button type="link" onClick={() => {/* TODO: Navigate to full invoice list */}}>
                        Xem thêm {invoices.length - 5} hóa đơn khác...
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-invoices">Chưa có hóa đơn</div>
              )}
            </div>
          </Card>
        </Col>

        {/* Order Status Statistics */}
        <Col xs={24} lg={12}>
          <Card className="status-card" title="Thống kê trạng thái đơn hàng">
            <div className="status-chart-container">
              <div className="donut-chart">
                <svg width="150" height="150" viewBox="0 0 150 150">
                  {/* Background circle */}
                  <circle
                    cx="75"
                    cy="75"
                    r={radius}
                    fill="none"
                    stroke="#e6f7ff"
                    strokeWidth="20"
                  />
                  {/* Paid segment */}
                  {paidPercentage > 0 && (
                    <circle
                      cx="75"
                      cy="75"
                      r={radius}
                      fill="none"
                      stroke="#1890ff"
                      strokeWidth="20"
                      strokeDasharray={circumference}
                      strokeDashoffset={paidOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 75 75)"
                    />
                  )}
                  {/* Cancelled segment */}
                  {cancelledPercentage > 0 && (
                    <circle
                      cx="75"
                      cy="75"
                      r={radius}
                      fill="none"
                      stroke="#40a9ff"
                      strokeWidth="20"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - (cancelledPercentage / 100) * circumference}
                      strokeLinecap="round"
                      transform={`rotate(${-90 + (paidPercentage / 100) * 360} 75 75)`}
                    />
                  )}
                </svg>
                <div className="donut-center">
                  <div className="donut-label">Tổng đơn hàng</div>
                  <div className="donut-value">{stats.orderStatus.total}</div>
                </div>
              </div>
              <div className="status-legend">
                <div className="legend-item">
                  <span className="legend-dot paid"></span>
                  <span className="legend-label">Đã thanh toán ({paidPercentage}%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot cancelled"></span>
                  <span className="legend-label">Hủy ({cancelledPercentage}%)</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default PaymentManagement;