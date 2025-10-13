import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { Button, Card, List, Avatar, Empty } from "antd";
import {
  FileTextOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  AppstoreOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./PatientDashboard.scss";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // demo data placeholders (you can keep your API calls)
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);

  // sidebar state
  const [activeTab, setActiveTab] = useState("all"); // all | records | appointments | payments

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  // Simple render helpers
  const Records = () => (
    <Card className="card section">
      <h3>
        <FileTextOutlined /> Hồ sơ khám điện tử
      </h3>
      {records.length === 0 ? (
        <Empty description="Chưa có hồ sơ" />
      ) : (
        <List
          dataSource={records}
          renderItem={(r) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<FileTextOutlined />} />}
                title={r.title || "Hồ sơ khám"}
                description={r.date || r.hospital}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  const Appointments = () => (
    <Card className="card section">
      <h3>
        <CalendarOutlined /> Lịch hẹn
      </h3>
      {appointments.length === 0 ? (
        <Empty description="Chưa có lịch hẹn" />
      ) : (
        <List
          dataSource={appointments}
          renderItem={(a) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{(a.doctorName || "D").slice(0, 1)}</Avatar>}
                title={a.title || a.doctorName}
                description={a.date}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  const Payments = () => (
    <Card className="card section">
      <h3>
        <CreditCardOutlined /> Lịch sử thanh toán
      </h3>
      {payments.length === 0 ? (
        <Empty description="Chưa có giao dịch" />
      ) : (
        <List
          dataSource={payments}
          renderItem={(p) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<CreditCardOutlined />} />}
                title={p.description || "Thanh toán"}
                description={p.date}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  return (
    <div className="patient-dashboard container">
      <div className="dashboard-top">
        <div className="welcome">
          <h2>Chào, {user?.displayName || user?.email || "Bệnh nhân"} 👋</h2>
          <p>Quản lý Hồ sơ, Lịch hẹn và Thanh toán của bạn.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <aside className="dashboard-sidebar">
          <div className="sidebar-user">
            <Avatar size={48} icon={<UserOutlined />} />
            <div className="user-info">
              <div className="name">{user?.displayName || "Bệnh nhân"}</div>
              <div className="email">{user?.email || ""}</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <ul>
              <li
                className={activeTab === "all" ? "active" : ""}
                onClick={() => setActiveTab("all")}
              >
                <AppstoreOutlined /> Tất cả
              </li>
              <li
                className={activeTab === "records" ? "active" : ""}
                onClick={() => setActiveTab("records")}
              >
                <FileTextOutlined /> Hồ sơ khám
              </li>
              <li
                className={activeTab === "appointments" ? "active" : ""}
                onClick={() => setActiveTab("appointments")}
              >
                <CalendarOutlined /> Lịch hẹn
              </li>
              <li
                className={activeTab === "payments" ? "active" : ""}
                onClick={() => setActiveTab("payments")}
              >
                <CreditCardOutlined /> Lịch sử thanh toán
              </li>
            </ul>
          </nav>

          <div className="sidebar-footer">
            <Button type="link" onClick={() => navigate("/ho-so")}>
              Xem hồ sơ
            </Button>
          </div>
        </aside>

        <main className="main-col">
          {activeTab === "all" && (
            <>
              <Records />
              <Appointments />
              <Payments />
            </>
          )}
          {activeTab === "records" && <Records />}
          {activeTab === "appointments" && <Appointments />}
          {activeTab === "payments" && <Payments />}
        </main>

        <aside className="side-col">
          <Card className="card tips-card">
            <h4>Gợi ý</h4>
            <ul>
              <li>Kiểm tra hồ sơ trước khi đến khám</li>
              <li>Hủy lịch trước 24 giờ để không mất phí</li>
              <li>Liên hệ hotline nếu cần hỗ trợ</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
