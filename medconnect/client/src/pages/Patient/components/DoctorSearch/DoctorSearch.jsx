import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
import { message, Spin, Input } from "antd";
import "./DoctorSearch.scss";

export function DoctorSearch() {
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Additional filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        await Promise.all([
          filterDoctors(true), // Initial load
          fetchSpecializations(),
        ]);
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, []);

  // Search with debounce when searchTerm changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterDoctors();
    }, 300); // Reduce debounce to 300ms for better responsiveness

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  // Separate useEffect for other filters
  useEffect(() => {
    filterDoctors();
  }, [
    selectedSpecialty,
    selectedExperience,
    selectedRating,
    selectedPriceRange,
    selectedLocation,
    selectedAvailability,
  ]);

  const fetchSpecializations = async () => {
    try {
      const response = await api.get("/api/specializations");

      if (response.success) {
        setSpecializations(response.data || []);
      } else {
        message.error("Không thể tải danh sách chuyên khoa");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải danh sách chuyên khoa");
    }
  };

  const filterDoctors = async (isInitialLoad = false) => {
    try {
      if (!isInitialLoad) {
        setLoading(true);
      }
      setIsSearching(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedSpecialty) params.append("specialization", selectedSpecialty);
      if (selectedExperience) params.append("experience", selectedExperience);
      if (selectedRating) params.append("rating", selectedRating);
      if (selectedPriceRange) params.append("priceRange", selectedPriceRange);
      if (selectedLocation) params.append("location", selectedLocation);
      if (selectedAvailability)
        params.append("availability", selectedAvailability);
      params.append("limit", "50"); // Increase limit to get more data for filtering

      const response = await api.get(`/api/doctors?${params.toString()}`);

      if (response.success) {
        let doctors = response.data.doctors || [];

        // Filter by search term locally (like SearchPage)
        if (searchTerm && searchTerm.trim()) {
          const searchQuery = searchTerm.trim().toLowerCase();
          doctors = doctors.filter((doctor) => {
            const doctorName = (doctor.userId?.fullName || doctor.fullName)?.toLowerCase() || "";
            const specialty =
              doctor.specializationIds?.[0]?.name?.toLowerCase() || "";
            const bio = doctor.bio?.toLowerCase() || "";

            return (
              doctorName.includes(searchQuery) ||
              specialty.includes(searchQuery) ||
              bio.includes(searchQuery)
            );
          });
        }

        setFilteredDoctors(doctors);
      } else {
        message.error("Không thể tải danh sách bác sĩ");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi tìm kiếm bác sĩ");
    } finally {
      if (!isInitialLoad) {
        setLoading(false);
      }
      setIsSearching(false);
    }
  };

  const handleBookAppointment = (doctorId) => {
    // Find the doctor object from filteredDoctors
    const selectedDoctor = filteredDoctors.find((doc) => doc._id === doctorId);

    if (selectedDoctor) {
      // Navigate to time slot selection with doctor and specialization info
      navigate("/dat-lich/chon-thoi-gian", {
        state: {
          doctor: selectedDoctor,
          specialization: selectedDoctor.specializationIds?.[0] || null,
        },
      });
    } else {
      message.error("Không tìm thấy thông tin bác sĩ");
    }
  };

  const handleOnlineConsultation = (doctorId) => {
    // Navigate to online consultation page
    navigate(`/tu-van-truc-tuyen?doctorId=${doctorId}`);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedSpecialty("");
    setSelectedExperience("");
    setSelectedRating("");
    setSelectedPriceRange("");
    setSelectedLocation("");
    setSelectedAvailability("");
    setShowFilters(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    // filterDoctors() will be called by useEffect
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // Clear any pending timeout and search immediately
      filterDoctors();
    }
  };

  const applyFilters = () => {
    filterDoctors();
    setShowFilters(false);
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

  // Memoize filtered doctors to prevent unnecessary re-renders
  const memoizedFilteredDoctors = useMemo(() => {
    return filteredDoctors;
  }, [filteredDoctors]);

  if (loading) {
    return (
      <div className="doctor-search-page">
        <div className="loading-container">
          <Spin size="large">
            <div style={{ padding: "50px" }}>
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                Đang tải danh sách bác sĩ...
              </div>
            </div>
          </Spin>
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
            <input
              type="text"
              placeholder="Tìm kiếm bác sĩ, chuyên khoa..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
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
              {specializations.length > 0 ? (
                specializations.map((spec) => (
                  <option key={spec._id} value={spec._id}>
                    {spec.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Đang tải chuyên khoa...
                </option>
              )}
            </select>
            <ChevronDown className="select-arrow" />
          </div>

          <button
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="filter-icon" />
            Bộ lọc
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="advanced-filters">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Kinh nghiệm</label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả</option>
                  <option value="1-3">1-3 năm</option>
                  <option value="3-5">3-5 năm</option>
                  <option value="5-10">5-10 năm</option>
                  <option value="10+">Trên 10 năm</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Đánh giá</label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả</option>
                  <option value="4.5+">4.5+ sao</option>
                  <option value="4.0+">4.0+ sao</option>
                  <option value="3.5+">3.5+ sao</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Mức phí</label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả</option>
                  <option value="0-300000">Dưới 300k</option>
                  <option value="300000-500000">300k - 500k</option>
                  <option value="500000-1000000">500k - 1M</option>
                  <option value="1000000+">Trên 1M</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Khu vực</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả</option>
                  <option value="quan-1">Quận 1</option>
                  <option value="quan-2">Quận 2</option>
                  <option value="quan-3">Quận 3</option>
                  <option value="quan-7">Quận 7</option>
                  <option value="quan-10">Quận 10</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Tình trạng</label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tất cả</option>
                  <option value="available-today">Có lịch hôm nay</option>
                  <option value="available-week">Có lịch tuần này</option>
                  <option value="online">Tư vấn online</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                Xóa bộ lọc
              </button>
              <button className="apply-filters-btn" onClick={applyFilters}>
                Áp dụng
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="results-count">
          Tìm thấy {memoizedFilteredDoctors.length} bác sĩ
        </div>

        {/* Doctors Grid */}
        <div className="doctors-grid">
          {memoizedFilteredDoctors.length === 0 ? (
            <div className="empty-state">
              <p>Không tìm thấy bác sĩ nào phù hợp với tiêu chí tìm kiếm.</p>
            </div>
          ) : (
            memoizedFilteredDoctors.map((doctor) => (
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
                        alt={doctor.userId?.fullName || doctor.fullName}
                        className="avatar-image"
                      />
                    ) : (
                      <User className="default-avatar" />
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="doctor-info">
                    <h3 className="doctor-name">BS. {doctor.userId?.fullName || doctor.fullName}</h3>
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
