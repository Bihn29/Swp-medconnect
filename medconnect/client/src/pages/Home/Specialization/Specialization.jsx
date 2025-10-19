import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Button,
  Input,
  Select,
  Pagination,
  Tag,
  Spin,
  message,
  Empty,
} from "antd";
import {
  MedicineBoxOutlined,
  UserOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import NavigationBreadcrumb from "../../../components/Breadcrumb/NavigationBreadcrumb";
import { api } from "../../../lib/api";
import "./Specialization.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Specialization = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [totalSpecializations, setTotalSpecializations] = useState(0);

  // Fetch specializations from API
  const fetchSpecializations = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 6,
      };

      // Add search term if exists
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add category filter if not "all"
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      const response = await api.getAllSpecializations(params);

      if (response.success) {
        setSpecializations(response.data.specializations || response.data);
        setTotalSpecializations(
          response.data.pagination?.total || response.data.length
        );
      } else {
        message.error("Không thể tải danh sách chuyên khoa");
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
      message.error("Có lỗi xảy ra khi tải danh sách chuyên khoa");
    } finally {
      setLoading(false);
    }
  };

  // Fetch specializations when component mounts or dependencies change
  useEffect(() => {
    fetchSpecializations();
  }, [currentPage, searchTerm, selectedCategory]);

  // Specializations are already filtered by API, so we use them directly
  const filteredSpecializations = specializations;

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleSpecializationClick = (specId) => {
    // Navigate to doctors filtered by specialization
    navigate(`/danh-sach-bac-si?specialty=${encodeURIComponent(specId)}`);
  };

  const SpecializationCard = ({ specialization }) => (
    <Card
      className="specialization-card"
      hoverable
      style={{
        marginBottom: "16px",
        borderRadius: "12px",
        border: "1px solid #f0f0f0",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Row gutter={16} align="middle">
        <Col flex="100px">
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #45c3d2 0%, #3ba8b8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "white",
            }}
          >
            <MedicineBoxOutlined />
          </div>
        </Col>
        <Col flex="auto">
          <div className="specialization-info">
            <Title level={4} style={{ margin: "0 0 8px 0", color: "#1890ff" }}>
              {specialization.name}
            </Title>
            <Paragraph style={{ color: "#666", margin: "8px 0" }}>
              {specialization.description}
            </Paragraph>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Space>
                <UserOutlined style={{ color: "#45c3d2" }} />
                <Text>{specialization.doctorCount || "Nhiều"} bác sĩ</Text>
                <EnvironmentOutlined style={{ color: "#45c3d2" }} />
                <Text>{specialization.facilityCount || "Nhiều"} cơ sở</Text>
              </Space>
              <Space wrap>
                {specialization.popularServices?.map((service, index) => (
                  <Tag key={index} color="blue-inverse">
                    {service}
                  </Tag>
                )) || <Tag color="blue-inverse">{specialization.name}</Tag>}
              </Space>
            </Space>
          </div>
        </Col>
        <Col flex="120px">
          <Button
            type="primary"
            size="large"
            block
            style={{
              backgroundColor: "#45c3d2",
              borderColor: "#45c3d2",
              fontWeight: "500",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleSpecializationClick(specialization._id);
            }}
          >
            Xem bác sĩ
          </Button>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="specialization-page">
      {/* Breadcrumb */}
      <div className="container">
        <NavigationBreadcrumb
          items={[
            {
              label: "Trang chủ",
              path: "/",
              icon: <HomeOutlined />,
            },
            {
              label: "Chuyên khoa",
            },
          ]}
        />
      </div>

      {/* Search Section */}
      <div className="specialization-search-section">
        <div className="container">
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} sm={18} md={12} lg={10}>
              <Input.Search
                placeholder="Tìm kiếm chuyên khoa..."
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
                value={selectedCategory}
                onChange={handleCategoryChange}
                style={{ width: "100%" }}
                size="large"
                placeholder="Loại chuyên khoa"
              >
                <Option value="all">Tất cả</Option>
                <Option value="internal">Nội khoa</Option>
                <Option value="external">Ngoại khoa</Option>
                <Option value="surgical">Phẫu thuật</Option>
                <Option value="pediatric">Nhi khoa</Option>
              </Select>
            </Col>
          </Row>
        </div>
      </div>

      {/* Specialization List */}
      <div className="specialization-list-section">
        <div className="container">
          <div className="results-header">
            <Title level={3}>
              Danh sách chuyên khoa ({filteredSpecializations.length})
            </Title>
          </div>

          <div className="specialization-list">
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large" />
                <Text style={{ marginLeft: 16 }}>
                  Đang tải danh sách chuyên khoa...
                </Text>
              </div>
            ) : filteredSpecializations.length === 0 ? (
              <Empty
                description="Không tìm thấy chuyên khoa nào"
                style={{ margin: "50px 0" }}
              />
            ) : (
              filteredSpecializations.map((specialization) => (
                <SpecializationCard
                  key={specialization._id}
                  specialization={specialization}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && totalSpecializations > 6 && (
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <Pagination
                current={currentPage}
                total={totalSpecializations}
                pageSize={6}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} của ${total} chuyên khoa`
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Specialization;
