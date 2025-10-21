import React from "react";
import { Video, MessageCircle, Calendar, Clock, User } from "lucide-react";
import { Spin } from "antd";
import { useConsultations } from "../../../../hooks/useConsultations";
import "./OnlineConsultation.scss";

export function OnlineConsultation() {
  const {
    upcomingConsultations,
    consultationHistory,
    loading,
    error,
    refreshConsultations,
  } = useConsultations();

  const handleJoinConsultation = (consultationId) => {
    // Logic để tham gia cuộc tư vấn
    console.log("Joining consultation:", consultationId);
    // Có thể navigate đến trang video call
  };

  const handleMessageDoctor = (doctorId) => {
    // Logic để nhắn tin với bác sĩ
    console.log("Messaging doctor:", doctorId);
    // Có thể mở chat window hoặc navigate đến trang chat
  };

  const renderConsultationCard = (consultation, isHistory = false) => (
    <div key={consultation.id} className="consultation-card">
      <div className="doctor-avatar">
        {consultation.doctor.avatar ? (
          <img
            src={consultation.doctor.avatar}
            alt={consultation.doctor.name}
            className="avatar-image"
          />
        ) : (
          <User className="default-avatar" />
        )}
      </div>

      <div className="consultation-content">
        <div className="doctor-info-section">
          <div className="doctor-name-row">
            <div className="doctor-name">{consultation.doctor.name}</div>
            <div className={`status-badge ${consultation.statusType}`}>
              {consultation.status}
            </div>
          </div>
          <div className="doctor-specialty">
            {consultation.doctor.specialty}
          </div>
        </div>

        <div className="consultation-details">
          <div className="detail-item">
            <Calendar className="detail-icon" />
            <span>{consultation.date}</span>
          </div>
          <div className="detail-item">
            <Clock className="detail-icon" />
            <span>{consultation.time}</span>
          </div>
        </div>

        {!isHistory && (
          <div className="consultation-actions">
            <button
              className="action-button join-button"
              onClick={() => handleJoinConsultation(consultation.id)}
            >
              <Video className="button-icon" />
              Tham gia
            </button>
            <button
              className="action-button message-button"
              onClick={() => handleMessageDoctor(consultation.doctor.id)}
            >
              <MessageCircle className="button-icon" />
              Nhắn tin
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="online-consultation-page">
        <div className="loading-container">
          <Spin size="large">
            <div style={{ padding: "50px" }}>
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                Đang tải dữ liệu tư vấn...
              </div>
            </div>
          </Spin>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="online-consultation-page">
        <div className="container">
          <div className="error-state">
            <h2>Lỗi tải dữ liệu</h2>
            <p>{error}</p>
            <button onClick={refreshConsultations} className="retry-button">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="online-consultation-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Tư vấn trực tuyến</h1>
          <p className="page-description">
            Quản lý các buổi tư vấn video với bác sĩ
          </p>
        </div>

        {/* Upcoming Consultations */}
        <div className="consultation-section">
          <h2 className="section-title">Buổi tư vấn sắp tới</h2>
          <div className="consultations-grid">
            {upcomingConsultations.length > 0 ? (
              upcomingConsultations.map((consultation) =>
                renderConsultationCard(consultation, false)
              )
            ) : (
              <div className="empty-state">
                <p>Không có buổi tư vấn sắp tới nào.</p>
              </div>
            )}
          </div>
        </div>

        {/* Consultation History */}
        <div className="consultation-section">
          <h2 className="section-title">Lịch sử tư vấn</h2>
          <div className="consultations-grid">
            {consultationHistory.length > 0 ? (
              consultationHistory.map((consultation) =>
                renderConsultationCard(consultation, true)
              )
            ) : (
              <div className="empty-state">
                <p>Chưa có lịch sử tư vấn nào.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
