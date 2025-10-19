import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Spin,
  message,
  Input,
  Empty,
  Avatar,
  Rate,
  Tag,
  Space,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  StarOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import NavigationBreadcrumb from "../../components/Breadcrumb/NavigationBreadcrumb";
import { api } from "../../lib/api";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const DoctorSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState(null);

  useEffect(() => {
    if (location.state?.specialization) {
      setSpecialization(location.state.specialization);
      fetchDoctors(location.state.specialization._id);
    } else {
      navigate("/dat-lich/chon-chuyen-khoa");
    }
  }, [location.state]);

  useEffect(() => {
    // Filter doctors based on search term
    if (searchTerm.trim() === "") {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(
        (doctor) =>
          doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doctor.bio &&
            doctor.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDoctors(filtered);
    }
  }, [searchTerm, doctors]);

  const fetchDoctors = async (specializationId) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/doctors?specialization=${specializationId}`
      );

      if (response.success) {
        setDoctors(response.data.doctors);
        setFilteredDoctors(response.data.doctors);
      } else {
        message.error("Không thể tải danh sách bác sĩ");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      message.error("Có lỗi xảy ra khi tải danh sách bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    navigate("/dat-lich/chon-thoi-gian", {
      state: {
        doctor,
        specialization,
      },
    });
  };

  const handleBackToSpecialization = () => {
    navigate("/dat-lich/chon-chuyen-khoa");
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const formatExperience = (years) => {
    if (!years) return "Chưa có thông tin";
    return `${years} năm kinh nghiệm`;
  };

  const getSpecializationNames = (specializationIds) => {
    if (!specializationIds || specializationIds.length === 0) return [];
    return specializationIds.map((spec) => spec.name).join(", ");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
        <Text style={{ marginLeft: 16 }}>Đang tải danh sách bác sĩ...</Text>
      </div>
    );
  }

  return (
    <div className="doctor-selection-page">
      <div className="container">
        {/* Breadcrumb */}
        <NavigationBreadcrumb
          items={[
            {
              label: "Trang chủ",
              path: "/",
            },
            {
              label: "Đặt lịch khám",
              path: "/dat-lich",
            },
            {
              label: "Chọn chuyên khoa",
              path: "/dat-lich/chon-chuyen-khoa",
            },
            {
              label: specialization?.name || "Chuyên khoa",
            },
          ]}
        />

        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-left">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToSpecialization}
                style={{ marginRight: 16 }}
              >
                Quay lại
              </Button>
              <div>
                <Title level={2}>Chọn bác sĩ</Title>
                <Paragraph>
                  Chuyên khoa: <Text strong>{specialization?.name}</Text>
                </Paragraph>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="search-section">
          <Search
            placeholder="Tìm kiếm bác sĩ..."
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 500 }}
          />
        </div>

        {/* Doctors Grid */}
        <div className="doctors-grid">
          {filteredDoctors.length === 0 ? (
            <Empty
              description="Không tìm thấy bác sĩ nào"
              style={{ margin: "50px 0" }}
            />
          ) : (
            <Row gutter={[24, 24]}>
              {filteredDoctors.map((doctor) => (
                <Col xs={24} lg={12} xl={8} key={doctor._id}>
                  <Card
                    hoverable
                    className="doctor-card"
                    actions={[
                      <Button
                        type="primary"
                        icon={<CalendarOutlined />}
                        onClick={() => handleDoctorSelect(doctor)}
                      >
                        Đặt lịch
                      </Button>,
                    ]}
                  >
                    <div className="doctor-content">
                      <div className="doctor-avatar">
                        <Avatar
                          size={80}
                          src={doctor.avatarUrl}
                          icon={<UserOutlined />}
                        />
                      </div>

                      <div className="doctor-info">
                        <Title level={4} className="doctor-name">
                          {doctor.fullName}
                        </Title>

                        <div className="doctor-specializations">
                          <Tag color="blue">
                            {getSpecializationNames(doctor.specializationIds)}
                          </Tag>
                        </div>

                        <div className="doctor-experience">
                          <Text type="secondary">
                            {formatExperience(doctor.yearsExperience)}
                          </Text>
                        </div>

                        {doctor.bio && (
                          <Paragraph
                            className="doctor-bio"
                            ellipsis={{ rows: 2 }}
                          >
                            {doctor.bio}
                          </Paragraph>
                        )}

                        <div className="doctor-rating">
                          <Space>
                            <Rate
                              disabled
                              value={doctor.ratingAvg || 0}
                              style={{ fontSize: 14 }}
                            />
                            <Text type="secondary">
                              ({doctor.ratingCount || 0} đánh giá)
                            </Text>
                          </Space>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Help Text */}
        <div className="help-section">
          <Card>
            <Title level={4}>Hướng dẫn</Title>
            <ul>
              <li>Chọn bác sĩ phù hợp với nhu cầu khám chữa bệnh của bạn</li>
              <li>
                Xem thông tin chi tiết về kinh nghiệm và đánh giá của bác sĩ
              </li>
              <li>
                Sau khi chọn bác sĩ, bạn sẽ được chuyển đến trang chọn thời gian
                khám
              </li>
              <li>
                Bạn có thể chọn khám online hoặc offline tùy theo sở thích
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .doctor-selection-page {
          padding: 24px 0;
          min-height: 100vh;
          background-color: #f5f5f5;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .header-content {
          display: flex;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .search-section {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
        }

        .doctors-grid {
          margin-bottom: 32px;
        }

        .doctor-card {
          height: 100%;
          transition: all 0.3s ease;
        }

        .doctor-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .doctor-content {
          display: flex;
          gap: 16px;
        }

        .doctor-avatar {
          flex-shrink: 0;
        }

        .doctor-info {
          flex: 1;
          min-width: 0;
        }

        .doctor-name {
          margin-bottom: 8px !important;
          color: #262626;
        }

        .doctor-specializations {
          margin-bottom: 8px;
        }

        .doctor-experience {
          margin-bottom: 8px;
        }

        .doctor-bio {
          margin-bottom: 12px !important;
          color: #8c8c8c;
        }

        .doctor-rating {
          margin-top: 8px;
        }

        .help-section {
          margin-top: 32px;
        }

        .help-section ul {
          margin: 0;
          padding-left: 20px;
        }

        .help-section li {
          margin-bottom: 8px;
          color: #595959;
        }
      `}</style>
    </div>
  );
};

export default DoctorSelection;
