import React, { useState } from "react";
import { Card, Row, Col, Button, Space, DatePicker } from "antd";
import { 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  DollarOutlined,
  DownOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./Statistics.scss";

const Statistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);

  const periods = [
    { key: "today", label: "Hôm Nay" },
    { key: "week", label: "Tuần" },
    { key: "month", label: "Tháng" },
    { key: "year", label: "Năm" },
    { key: "custom", label: "Tùy Chỉnh" },
  ];

  const statCards = [
    {
      title: "Tổng Bác Sĩ",
      value: "0",
      change: "+0 so với tháng trước",
      icon: <UserOutlined />,
      cardClass: "stat-card-blue",
      textColor: "text-blue",
    },
    {
      title: "Tổng Bệnh Nhân",
      value: "0",
      change: "+0 so với tuần trước",
      icon: <TeamOutlined />,
      cardClass: "stat-card-cyan",
      textColor: "text-cyan",
    },
    {
      title: "Khám Hôm Nay",
      value: "0",
      change: "+0 so với hôm qua",
      icon: <CalendarOutlined />,
      cardClass: "stat-card-emerald",
      textColor: "text-emerald",
    },
    {
      title: "Doanh Thu (Tháng)",
      value: "₫0",
      change: "+0% so với tháng trước",
      icon: <DollarOutlined />,
      cardClass: "stat-card-violet",
      textColor: "text-violet",
    },
  ];

  return (
    <div className="statistics">
      {/* Header Section */}
      <div className="statistics-header">
        <div className="header-content">
          <div>
            <h1>Thống kê</h1>
          </div>
          <div className="filter-buttons">
            <Space size="small">
              {periods.map((period) => (
                <div key={period.key} className="filter-btn-wrapper">
                  <Button
                    type={selectedPeriod === period.key ? "primary" : "default"}
                    className={`filter-btn ${selectedPeriod === period.key ? "active" : ""}`}
                    onClick={() => {
                      if (period.key === "custom") {
                        setShowCustomPicker(!showCustomPicker);
                      } else {
                        setSelectedPeriod(period.key);
                        setShowCustomPicker(false);
                        setDateRange([null, null]);
                      }
                    }}
                    icon={period.key === "custom" ? <DownOutlined /> : null}
                  >
                    {period.label}
                  </Button>
                  {period.key === "custom" && showCustomPicker && (
                    <div className="custom-date-picker-dropdown">
                      <div className="custom-date-picker-content">
                        <div className="date-picker-field">
                          <label className="date-picker-label">Từ Ngày</label>
                          <DatePicker
                            format="MM/DD/YYYY"
                            placeholder="mm/dd/yyyy"
                            value={dateRange[0]}
                            onChange={(date) => {
                              setDateRange([date, dateRange[1]]);
                            }}
                            allowClear
                            style={{ width: "100%" }}
                          />
                        </div>
                        <div className="date-picker-field">
                          <label className="date-picker-label">Đến Ngày</label>
                          <DatePicker
                            format="MM/DD/YYYY"
                            placeholder="mm/dd/yyyy"
                            value={dateRange[1]}
                            onChange={(date) => {
                              setDateRange([dateRange[0], date]);
                            }}
                            disabledDate={(current) => {
                              if (!dateRange[0]) return false;
                              return current && dayjs(current).isBefore(dayjs(dateRange[0]).startOf("day"));
                            }}
                            allowClear
                            style={{ width: "100%" }}
                          />
                        </div>
                        <Button
                          type="primary"
                          className="apply-date-btn"
                          onClick={() => {
                            if (dateRange[0] && dateRange[1]) {
                              setSelectedPeriod("custom");
                              setShowCustomPicker(false);
                              // TODO: Apply date range filter here
                            }
                          }}
                          disabled={!dateRange[0] || !dateRange[1]}
                          block
                        >
                          Áp Dụng
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </Space>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="statistics-content">
        {/* Stat Cards */}
        <Row gutter={[16, 16]} className="stat-cards-row">
          {statCards.map((card, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className={`stat-card ${card.cardClass}`}>
                <div className="stat-card-header">
                  <span className={`stat-card-title ${card.textColor}`}>
                    {card.title}
                  </span>
                  <span className={`stat-card-icon ${card.textColor}`}>
                    {card.icon}
                  </span>
                </div>
                <div className="stat-card-content">
                  <div className={`stat-card-value ${card.textColor}`}>
                    {card.value}
                  </div>
                  <p className={`stat-card-change ${card.textColor}`}>
                    {card.change}
                  </p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts Section */}
        <Row gutter={[16, 16]} className="charts-row">
          {/* Top Doctors Online */}
          <Col xs={24} lg={12}>
            <Card 
              className="chart-card"
              title={
                <div>
                  <div className="chart-card-title">Bác Sĩ Khám Online Nhiều Nhất</div>
                  <div className="chart-card-subtitle">Top 3 bác sĩ khám online tháng này</div>
                </div>
              }
            >
              <div className="chart-placeholder">
                <div className="chart-container" style={{ height: "300px" }}>
                  {/* Placeholder for bar chart */}
                  <div className="chart-empty">Biểu đồ sẽ được thêm vào đây</div>
                </div>
                <div className="chart-legend-list">
                  <div className="legend-item">
                    <span className="legend-name">1. Dr. Nguyễn Văn A</span>
                    <span className="legend-value">0 cuộc</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-name">2. Dr. Trần Thị B</span>
                    <span className="legend-value">0 cuộc</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-name">3. Dr. Lê Văn C</span>
                    <span className="legend-value">0 cuộc</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Top Doctors Offline */}
          <Col xs={24} lg={12}>
            <Card 
              className="chart-card"
              title={
                <div>
                  <div className="chart-card-title">Bác Sĩ Khám Offline Nhiều Nhất</div>
                  <div className="chart-card-subtitle">Top 3 bác sĩ khám offline tháng này</div>
                </div>
              }
            >
              <div className="chart-placeholder">
                <div className="chart-container" style={{ height: "300px" }}>
                  {/* Placeholder for bar chart */}
                  <div className="chart-empty">Biểu đồ sẽ được thêm vào đây</div>
                </div>
                <div className="chart-legend-list">
                  <div className="legend-item">
                    <span className="legend-name">1. Dr. Hoàng Văn E</span>
                    <span className="legend-value">0 cuộc</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-name">2. Dr. Vũ Thị F</span>
                    <span className="legend-value">0 cuộc</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-name">3. Dr. Đặng Văn G</span>
                    <span className="legend-value">0 cuộc</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-name">4. Dr. Bùi Thị H</span>
                    <span className="legend-value">0 cuộc</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Top Patients */}
          <Col xs={24} lg={12}>
            <Card 
              className="chart-card"
              title={
                <div>
                  <div className="chart-card-title">Bệnh Nhân Đến Khám Nhiều Nhất</div>
                  <div className="chart-card-subtitle">Top 3 bệnh nhân có lần khám nhiều nhất</div>
                </div>
              }
            >
              <div className="patient-list">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="patient-item">
                    <div className="patient-info">
                      <div className="patient-name">{index}. Bệnh nhân {index}</div>
                      <div className="patient-detail">Khám: 0 lần | Lần cuối: --</div>
                    </div>
                    <div className="patient-spending">
                      <div className="spending-amount">₫0</div>
                      <div className="spending-label">Chi tiêu</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Appointment Type Ratio */}
          <Col xs={24} lg={12}>
            <Card 
              className="chart-card"
              title={
                <div>
                  <div className="chart-card-title">Tỷ Lệ Loại Khám</div>
                  <div className="chart-card-subtitle">Phân bố online vs offline</div>
                </div>
              }
            >
              <div className="pie-chart-placeholder">
                <div className="chart-container" style={{ height: "200px" }}>
                  {/* Placeholder for pie chart */}
                  <div className="chart-empty">Biểu đồ tròn sẽ được thêm vào đây</div>
                </div>
                <div className="pie-legend">
                  <div className="legend-item-center">
                    <span className="legend-dot legend-dot-blue"></span>
                    <span className="legend-label">Online</span>
                    <span className="legend-percentage">0%</span>
                  </div>
                  <div className="legend-item-center">
                    <span className="legend-dot legend-dot-cyan"></span>
                    <span className="legend-label">Offline</span>
                    <span className="legend-percentage">0%</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Revenue Trend Chart */}
        <Row gutter={[16, 16]} className="trend-row">
          <Col xs={24}>
            <Card 
              className="chart-card trend-card"
              title={
                <div>
                  <div className="chart-card-title">Doanh Thu Theo Khoảng Thời Gian</div>
                  <div className="chart-card-subtitle">Xu hướng doanh thu hàng ngày (Online vs Offline)</div>
                </div>
              }
            >
              <div className="trend-chart-placeholder">
                <div className="trend-legend">
                  <div className="legend-item-inline">
                    <span className="legend-line legend-line-cyan"></span>
                    <span>Offline</span>
                  </div>
                  <div className="legend-item-inline">
                    <span className="legend-line legend-line-blue"></span>
                    <span>Online</span>
                  </div>
                  <div className="legend-item-inline">
                    <span className="legend-line legend-line-dashed"></span>
                    <span>Tổng</span>
                  </div>
                </div>
                <div className="chart-container" style={{ height: "400px" }}>
                  {/* Placeholder for line chart */}
                  <div className="chart-empty">Biểu đồ đường sẽ được thêm vào đây</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Statistics;
