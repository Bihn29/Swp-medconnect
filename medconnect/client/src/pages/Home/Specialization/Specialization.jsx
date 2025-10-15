import React, { useState } from "react";
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
} from "antd";
import {
  MedicineBoxOutlined,
  UserOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import NavigationBreadcrumb from "../../../components/Breadcrumb/NavigationBreadcrumb";
import "./Specialization.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Specialization = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data for specializations
  const specializations = [
    {
      id: 1,
      name: "Tim mạch",
      description: "Chuyên khoa điều trị các bệnh lý về tim và mạch máu",
      doctorCount: 45,
      facilityCount: 12,
      image: "https://via.placeholder.com/80x80",
      category: "internal",
      popularServices: ["Khám tim", "Siêu âm tim", "Điện tâm đồ"],
    },
    {
      id: 2,
      name: "Da liễu",
      description: "Chuyên khoa điều trị các bệnh về da và thẩm mỹ",
      doctorCount: 32,
      facilityCount: 8,
      image: "https://via.placeholder.com/80x80",
      category: "external",
      popularServices: ["Khám da", "Điều trị mụn", "Laser thẩm mỹ"],
    },
    {
      id: 3,
      name: "Nhi khoa",
      description: "Chuyên khoa chăm sóc sức khỏe trẻ em từ 0-16 tuổi",
      doctorCount: 38,
      facilityCount: 10,
      image: "https://via.placeholder.com/80x80",
      category: "pediatric",
      popularServices: ["Khám nhi", "Tiêm chủng", "Dinh dưỡng"],
    },
    {
      id: 4,
      name: "Thần kinh",
      description: "Chuyên khoa điều trị các bệnh lý hệ thần kinh",
      doctorCount: 28,
      facilityCount: 7,
      image: "https://via.placeholder.com/80x80",
      category: "internal",
      popularServices: ["Khám thần kinh", "MRI não", "Điều trị đau đầu"],
    },
    {
      id: 5,
      name: "Chấn thương chỉnh hình",
      description: "Chuyên khoa điều trị chấn thương và phục hồi chức năng",
      doctorCount: 35,
      facilityCount: 9,
      image: "https://via.placeholder.com/80x80",
      category: "surgical",
      popularServices: [
        "Phẫu thuật xương",
        "Vật lý trị liệu",
        "Phục hồi chức năng",
      ],
    },
    {
      id: 6,
      name: "Mắt",
      description: "Chuyên khoa điều trị các bệnh lý về mắt và thị lực",
      doctorCount: 25,
      facilityCount: 6,
      image: "https://via.placeholder.com/80x80",
      category: "external",
      popularServices: [
        "Khám mắt",
        "Phẫu thuật cận thị",
        "Điều trị đục thủy tinh thể",
      ],
    },
  ];

  // Filter specializations
  const filteredSpecializations = specializations.filter((spec) => {
    const matchesSearch =
      searchTerm === "" ||
      spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || spec.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
    navigate(
      `/bac-si?specialty=${encodeURIComponent(
        specializations.find((s) => s.id === specId)?.name
      )}`
    );
  };

  const SpecializationCard = ({ specialization }) => (
    <Card
      className="specialization-card"
      hoverable
      onClick={() => handleSpecializationClick(specialization.id)}
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
                <Text>{specialization.doctorCount} bác sĩ</Text>
                <EnvironmentOutlined style={{ color: "#45c3d2" }} />
                <Text>{specialization.facilityCount} cơ sở</Text>
              </Space>
              <Space wrap>
                {specialization.popularServices.map((service, index) => (
                  <Tag key={index} color="blue-inverse">
                    {service}
                  </Tag>
                ))}
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
              handleSpecializationClick(specialization.id);
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
            {filteredSpecializations
              .slice((currentPage - 1) * 6, currentPage * 6)
              .map((specialization) => (
                <SpecializationCard
                  key={specialization.id}
                  specialization={specialization}
                />
              ))}
          </div>

          {/* Pagination */}
          {filteredSpecializations.length > 6 && (
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <Pagination
                current={currentPage}
                total={filteredSpecializations.length}
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
