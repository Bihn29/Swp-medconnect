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
  Rate,
} from "antd";
import {
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  StarOutlined,
  SearchOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import "./Facility.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Facility = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data for facilities
  const facilities = [
    {
      id: 1,
      name: "Bệnh viện Chợ Rẫy",
      type: "hospital",
      location: "TP.HCM",
      address: "201B Nguyễn Chí Thanh, Quận 5, TP.HCM",
      phone: "028 3855 4269",
      specialties: ["Tim mạch", "Thần kinh", "Ung bướu", "Cấp cứu"],
      doctorCount: 450,
      rating: 4.7,
      reviewCount: 289,
      image: "https://via.placeholder.com/100x100",
      description: "Bệnh viện đa khoa hạng đặc biệt, là một trong những bệnh viện lớn nhất miền Nam.",
    },
    {
      id: 2,
      name: "Bệnh viện Việt Đức",
      type: "hospital",
      location: "Hà Nội",
      address: "40 Tràng Thi, Hoàn Kiếm, Hà Nội",
      phone: "024 3825 3531",
      specialties: ["Chấn thương chỉnh hình", "Phẫu thuật", "Cấp cứu"],
      doctorCount: 380,
      rating: 4.6,
      reviewCount: 234,
      image: "https://via.placeholder.com/100x100",
      description: "Bệnh viện chuyên khoa hàng đầu về chấn thương chỉnh hình và phẫu thuật.",
    },
    {
      id: 3,
      name: "Phòng khám Đa khoa Medlatec",
      type: "clinic",
      location: "Hà Nội",
      address: "42-44 Nghĩa Dũng, Ba Đình, Hà Nội",
      phone: "024 7301 6595",
      specialties: ["Khám tổng quát", "Xét nghiệm", "Chẩn đoán hình ảnh"],
      doctorCount: 85,
      rating: 4.5,
      reviewCount: 167,
      image: "https://via.placeholder.com/100x100",
      description: "Hệ thống phòng khám đa khoa hiện đại với trang thiết bị tiên tiến.",
    },
    {
      id: 4,
      name: "Bệnh viện Nhi Đồng 1",
      type: "hospital",
      location: "TP.HCM",
      address: "341 Sư Vạn Hạnh, Quận 10, TP.HCM",
      phone: "028 3865 4270",
      specialties: ["Nhi khoa", "Nhi tim mạch", "Nhi thần kinh"],
      doctorCount: 320,
      rating: 4.8,
      reviewCount: 198,
      image: "https://via.placeholder.com/100x100",
      description: "Bệnh viện nhi đồng hàng đầu với đội ngũ bác sĩ chuyên khoa nhi giàu kinh nghiệm.",
    },
    {
      id: 5,
      name: "Trung tâm Y tế Quận 1",
      type: "center",
      location: "TP.HCM",
      address: "125 Lê Thị Riêng, Quận 1, TP.HCM",
      phone: "028 3829 5432",
      specialties: ["Y tế cơ sở", "Khám tổng quát", "Tiêm chủng"],
      doctorCount: 45,
      rating: 4.3,
      reviewCount: 89,
      image: "https://via.placeholder.com/100x100",
      description: "Trung tâm y tế cung cấp dịch vụ chăm sóc sức khỏe cơ bản cho cộng đồng.",
    },
    {
      id: 6,
      name: "Phòng khám Thẩm mỹ Kangnam",
      type: "clinic",
      location: "TP.HCM",
      address: "158 Pasteur, Quận 3, TP.HCM",
      phone: "028 6299 0055",
      specialties: ["Thẩm mỹ", "Da liễu", "Phẫu thuật thẩm mỹ"],
      doctorCount: 25,
      rating: 4.4,
      reviewCount: 156,
      image: "https://via.placeholder.com/100x100",
      description: "Phòng khám chuyên về thẩm mỹ và điều trị da liễu với công nghệ hiện đại.",
    },
  ];

  // Filter facilities
  const filteredFacilities = facilities.filter((facility) => {
    const matchesSearch = searchTerm === "" || 
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === "all" || facility.type === selectedType;
    const matchesLocation = selectedLocation === "all" || facility.location === selectedLocation;
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  const handleLocationChange = (value) => {
    setSelectedLocation(value);
    setCurrentPage(1);
  };

  const handleFacilityClick = (facilityId) => {
    // Navigate to facility detail or doctors in this facility
    console.log("Navigate to facility detail:", facilityId);
  };

  const FacilityCard = ({ facility }) => (
    <Card
      className="facility-card"
      hoverable
      onClick={() => handleFacilityClick(facility.id)}
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
              background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "white",
            }}
          >
            <EnvironmentOutlined />
          </div>
        </Col>
        <Col flex="auto">
          <div className="facility-info">
            <Title level={4} style={{ margin: "0 0 8px 0", color: "#1890ff" }}>
              {facility.name}
            </Title>
            <Paragraph style={{ color: "#666", margin: "8px 0" }}>
              {facility.description}
            </Paragraph>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Space>
                <EnvironmentOutlined style={{ color: "#45c3d2" }} />
                <Text>{facility.address}</Text>
              </Space>
              <Space>
                <PhoneOutlined style={{ color: "#45c3d2" }} />
                <Text>{facility.phone}</Text>
              </Space>
              <Space>
                <UserOutlined style={{ color: "#45c3d2" }} />
                <Text>{facility.doctorCount} bác sĩ</Text>
                <StarOutlined style={{ color: "#fadb14" }} />
                <Rate disabled defaultValue={facility.rating} style={{ fontSize: "14px" }} />
                <Text>({facility.reviewCount} đánh giá)</Text>
              </Space>
              <Space wrap>
                {facility.specialties.slice(0, 3).map((specialty, index) => (
                  <Tag key={index} color="green-inverse">
                    {specialty}
                  </Tag>
                ))}
                {facility.specialties.length > 3 && (
                  <Tag color="default">+{facility.specialties.length - 3} khác</Tag>
                )}
              </Space>
            </Space>
          </div>
        </Col>
        <Col flex="120px">
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
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
                handleFacilityClick(facility.id);
              }}
            >
              Xem chi tiết
            </Button>
            <Button
              size="large"
              block
              style={{ fontWeight: "500" }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/bac-si?facility=${encodeURIComponent(facility.name)}`);
              }}
            >
              Xem bác sĩ
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="facility-page">
      {/* Search Section */}
      <div className="facility-search-section">
        <div className="container">
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} sm={12} md={8}>
              <Input.Search
                placeholder="Tìm kiếm cơ sở y tế..."
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={handleSearch}
                enterButton="Tìm kiếm"
                style={{ borderRadius: "8px" }}
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Select
                value={selectedType}
                onChange={handleTypeChange}
                style={{ width: "100%" }}
                size="large"
                placeholder="Loại hình"
              >
                <Option value="all">Tất cả</Option>
                <Option value="hospital">Bệnh viện</Option>
                <Option value="clinic">Phòng khám</Option>
                <Option value="center">Trung tâm</Option>
              </Select>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Select
                value={selectedLocation}
                onChange={handleLocationChange}
                style={{ width: "100%" }}
                size="large"
                placeholder="Khu vực"
              >
                <Option value="all">Tất cả</Option>
                <Option value="TP.HCM">TP.HCM</Option>
                <Option value="Hà Nội">Hà Nội</Option>
              </Select>
            </Col>
          </Row>
        </div>
      </div>

      {/* Facility List */}
      <div className="facility-list-section">
        <div className="container">
          <div className="results-header">
            <Title level={3}>Danh sách cơ sở y tế ({filteredFacilities.length})</Title>
          </div>

          <div className="facility-list">
            {filteredFacilities
              .slice((currentPage - 1) * 5, currentPage * 5)
              .map((facility) => (
                <FacilityCard key={facility.id} facility={facility} />
              ))}
          </div>

          {/* Pagination */}
          {filteredFacilities.length > 5 && (
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <Pagination
                current={currentPage}
                total={filteredFacilities.length}
                pageSize={5}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} của ${total} cơ sở`
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Facility;