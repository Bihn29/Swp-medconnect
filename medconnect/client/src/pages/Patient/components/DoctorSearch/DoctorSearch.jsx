import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Video,
  Calendar,
  User,
  ChevronDown,
} from "lucide-react";
import { api } from "../../../../lib/api";
import { message, Spin } from "antd";
import "./DoctorSearch.scss";

export function DoctorSearch() {
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  useEffect(() => {
    filterDoctors(); // Initial load
    fetchSpecializations();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterDoctors();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSpecialty]);

  const fetchSpecializations = async () => {
    try {
      const response = await api.get("/api/specializations");

      if (response.success) {
        setSpecializations(response.data.specializations || []);
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  };

  const filterDoctors = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedSpecialty) params.append("specialization", selectedSpecialty);
      params.append("limit", "20");

      const response = await api.get(`/api/doctors?${params.toString()}`);

      if (response.success) {
        setFilteredDoctors(response.data.doctors || []);
      } else {
        message.error("Không thể tải danh sách bác sĩ");
      }
    } catch (error) {
      console.error("Error filtering doctors:", error);
      message.error("Có lỗi xảy ra khi tìm kiếm bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctorId) => {
    navigate(`/dat-lich/chon-bac-si?doctorId=${doctorId}`);
  };

  const handleOnlineConsultation = (doctorId) => {
    // Navigate to online consultation page
    navigate(`/tu-van-truc-tuyen?doctorId=${doctorId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusText = (doctor) => {
    // Simple logic to determine if doctor is available today
    return "Có lịch hôm nay";
  };

  if (loading) {
    return (
      <div className="doctor-search-page">
        <div className="loading-container">
          <Spin size="large" tip="Đang tải danh sách bác sĩ..." />
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-search-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Tìm bác sĩ</h1>
          <p className="page-description">
            Tìm kiếm và đặt lịch với các bác sĩ chuyên khoa
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-input-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm bác sĩ, chuyên khoa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-container">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="specialty-select"
            >
              <option value="">Tất cả chuyên khoa</option>
              {specializations.map((spec) => (
                <option key={spec._id} value={spec._id}>
                  {spec.name}
                </option>
              ))}
            </select>
            <ChevronDown className="select-arrow" />
          </div>

          <button className="filter-button">
            <Filter className="filter-icon" />
            Bộ lọc
          </button>
        </div>

        {/* Results Count */}
        <div className="results-count">
          Tìm thấy {filteredDoctors.length} bác sĩ
        </div>

        {/* Doctors Grid */}
        <div className="doctors-grid">
          {filteredDoctors.length === 0 ? (
            <div className="empty-state">
              <p>Không tìm thấy bác sĩ nào phù hợp với tiêu chí tìm kiếm.</p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <div key={doctor._id} className="doctor-card">
                {/* Verification Badge */}
                <div className="verification-badge">Đã xác minh</div>

                {/* Doctor Content */}
                <div className="doctor-content">
                  {/* Doctor Avatar */}
                  <div className="doctor-avatar">
                    {doctor.avatarUrl ? (
                      <img
                        src={doctor.avatarUrl}
                        alt={doctor.fullName}
                        className="avatar-image"
                      />
                    ) : (
                      <User className="default-avatar" />
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="doctor-info">
                    <h3 className="doctor-name">BS. {doctor.fullName}</h3>
                    <p className="doctor-specialty">
                      {doctor.specializationIds?.[0]?.name || "Chưa xác định"}
                    </p>
                    <p className="doctor-experience">
                      {doctor.yearsExperience || 0} năm kinh nghiệm
                    </p>

                    {/* Rating */}
                    <div className="doctor-rating">
                      <Star className="star-icon" />
                      <span className="rating-text">
                        {doctor.ratingAvg?.toFixed(1) || "0.0"} (
                        {doctor.ratingCount || 0})
                      </span>
                    </div>

                    {/* Status */}
                    <div className="doctor-status">
                      <span className="status-badge">
                        {getStatusText(doctor)}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="doctor-location">
                      <MapPin className="location-icon" />
                      <span className="location-text">
                        {doctor.clinicDefaultId?.name ||
                          "Bệnh viện Đa khoa Trung ương"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fee and Actions Section */}
                <div className="fee-actions-section">
                  {/* Consultation Fee */}
                  <div className="consultation-fee">
                    <span className="fee-label">Phí khám</span>
                    <span className="fee-amount">
                      {formatPrice(doctor.consultationFee || 500000)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="doctor-actions">
                    <button
                      className="action-button online-button"
                      onClick={() => handleOnlineConsultation(doctor._id)}
                    >
                      <Video className="button-icon" />
                      Online
                    </button>
                    <button
                      className="action-button book-button"
                      onClick={() => handleBookAppointment(doctor._id)}
                    >
                      <Calendar className="button-icon" />
                      Đặt lịch
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
