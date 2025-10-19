import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Avatar,
  Button,
  Tag,
  Rate,
  Divider,
  Input,
  Select,
  Pagination,
  Spin,
  message,
  Empty,
} from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CalendarOutlined,
  StarOutlined,
  SearchOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import NavigationBreadcrumb from "../../../components/Breadcrumb/NavigationBreadcrumb";
import { api } from "../../../lib/api";
import "./DoctorList.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const DoctorList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);

  // Fetch doctors and specializations from API
  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  // Initialize filter from query param ?specialty=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qSpecialty = params.get("specialty");
    if (qSpecialty) {
      setSelectedSpecialty(qSpecialty);
      setCurrentPage(1);
    }
  }, [location.search]);

  // Fetch doctors when page or filter changes
  useEffect(() => {
    if (doctors.length > 0 || currentPage > 1) {
      fetchDoctors();
    }
  }, [currentPage, selectedSpecialty, searchTerm]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", 10);

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (selectedSpecialty && selectedSpecialty !== "all") {
        // Find specialization ID by name
        const spec = specializations.find((s) => s.name === selectedSpecialty);
        if (spec) {
          params.append("specialization", spec._id);
        }
      }

      const response = await api.get(`/api/doctors?${params.toString()}`);

      if (response.success) {
        setDoctors(response.data.doctors);
        setTotalDoctors(response.data.pagination.total);
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

  const fetchSpecializations = async () => {
    try {
      const response = await api.get("/api/specializations");
      if (response.success) {
        setSpecializations(response.data);
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  };

  // Get breadcrumb items based on current context
  const getBreadcrumbItems = () => {
    const params = new URLSearchParams(location.search);
    const qSpecialty = params.get("specialty");

    const items = [
      {
        label: "Trang chủ",
        path: "/",
        icon: <HomeOutlined />,
      },
    ];

    // If coming from specialization page, add specialization to breadcrumb
    if (qSpecialty && qSpecialty !== "all") {
      items.push({
        label: qSpecialty,
        path: "/chuyen-khoa",
      });
    }

    // Always add "Bác sĩ" as the last item
    items.push({
      label: "Bác sĩ",
      path: "/danh-sach-bac-si",
    });

    return items;
  };

  // Helper function to get specialization names
  const getSpecializationNames = (specializationIds) => {
    if (!specializationIds || specializationIds.length === 0)
      return "Chưa xác định";
    return specializationIds
      .map((spec) => {
        return typeof spec === "object" ? spec.name : spec;
      })
      .join(", ");
  };

  const handleDoctorClick = (doctorId) => {
    // Navigate to doctor detail page
    console.log("Navigate to doctor detail:", doctorId);
  };

  const handleBookAppointment = (e, doctor) => {
    e.stopPropagation();

    // Check if user is logged in
    if (!user) {
      // If not logged in, redirect to login page
      navigate("/dang-nhap", {
        state: {
          from: "/dat-lich-kham",
          doctor: doctor,
          message: "Vui lòng đăng nhập để đặt lịch khám",
        },
      });
      return;
    }

    // If logged in, navigate to appointment booking page with doctor data
    navigate("/dat-lich-kham", {
      state: {
        doctor: doctor,
      },
    });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setSelectedSpecialty(value);
    setCurrentPage(1);
    // update URL query param for shareable state
    const params = new URLSearchParams(location.search);
    if (value === "all") {
      params.delete("specialty");
    } else {
      params.set("specialty", value);
    }
    navigate({ pathname: location.pathname, search: params.toString() });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const DoctorCard = ({ doctor }) => (
    <Card
      className="doctor-card"
      hoverable
      onClick={() => handleDoctorClick(doctor._id)}
      style={{
        marginBottom: "16px",
        borderRadius: "12px",
        border: "1px solid #f0f0f0",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Row gutter={16} align="middle">
        <Col flex="120px">
          <Avatar
            size={100}
            src={doctor.avatarUrl || "/default-avatar.png"}
            icon={<UserOutlined />}
            style={{ borderRadius: "8px" }}
          />
        </Col>
        <Col flex="auto">
          <div className="doctor-info">
            <Title level={4} style={{ margin: "0 0 8px 0", color: "#1890ff" }}>
              {doctor.fullName}
            </Title>
            <Text
              strong
              style={{ color: "#666", display: "block", marginBottom: "4px" }}
            >
              {getSpecializationNames(doctor.specializationIds)}
            </Text>
            {doctor.bio && (
              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{ color: "#666", margin: "8px 0" }}
              >
                {doctor.bio}
              </Paragraph>
            )}
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Space>
                <StarOutlined style={{ color: "#fadb14" }} />
                <Rate
                  disabled
                  defaultValue={doctor.ratingAvg || 0}
                  style={{ fontSize: "14px" }}
                />
                <Text>({doctor.ratingCount || 0} đánh giá)</Text>
              </Space>
              {doctor.yearsExperience && (
                <Space>
                  <CalendarOutlined style={{ color: "#45c3d2" }} />
                  <Text>Kinh nghiệm: {doctor.yearsExperience} năm</Text>
                </Space>
              )}
            </Space>
          </div>
        </Col>
        <Col flex="160px">
          <div className="doctor-actions">
            <div
              className="price"
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#f5222d",
                marginBottom: "8px",
              }}
            >
              350.000đ
            </div>
            <Button
              type="primary"
              size="large"
              block
              onClick={(e) => handleBookAppointment(e, doctor)}
              style={{
                backgroundColor: "#45c3d2",
                borderColor: "#45c3d2",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Đặt lịch khám
            </Button>
            <Button
              size="large"
              block
              onClick={(e) => {
                e.stopPropagation();
                handleDoctorClick(doctor._id);
              }}
              style={{ fontWeight: "500" }}
            >
              Xem thông tin
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="doctor-page">
      {/* Breadcrumb */}
      <div className="container">
        <NavigationBreadcrumb items={getBreadcrumbItems()} />
      </div>

      {/* Search Section */}
      <div className="doctor-search-section">
        <div className="container">
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} sm={18} md={12} lg={10}>
              <Input.Search
                placeholder="Nhập tên bác sĩ hoặc chuyên khoa..."
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={handleSearch}
                enterButton="Tìm kiếm"
                style={{ borderRadius: "8px" }}
              />
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select
                value={selectedSpecialty}
                onChange={handleFilterChange}
                style={{ width: "100%" }}
                size="large"
                placeholder="Chuyên khoa"
              >
                <Option value="all">Tất cả chuyên khoa</Option>
                {specializations.map((spec) => (
                  <Option key={spec._id} value={spec.name}>
                    {spec.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>
      </div>

      {/* Doctor List */}
      <div className="doctor-list-section">
        <div className="container">
          <div className="results-header">
            <Title level={3}>Kết quả tìm kiếm ({totalDoctors})</Title>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <Spin size="large" />
              <Text style={{ marginLeft: 16 }}>
                Đang tải danh sách bác sĩ...
              </Text>
            </div>
          ) : doctors.length === 0 ? (
            <Empty
              description="Không tìm thấy bác sĩ nào"
              style={{ margin: "50px 0" }}
            />
          ) : (
            <>
              <div className="doctor-list">
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor._id} doctor={doctor} />
                ))}
              </div>

              {/* Pagination */}
              {totalDoctors > 10 && (
                <div style={{ textAlign: "center", marginTop: "32px" }}>
                  <Pagination
                    current={currentPage}
                    total={totalDoctors}
                    pageSize={10}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} của ${total} bác sĩ`
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorList;
