import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CalendarOutlined,
  StarOutlined,
  SearchOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import "./Doctor.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Doctor = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data for doctors
  const doctors = [
    {
      id: 1,
      name: "BS. Nguyễn Văn An",
      specialty: "Tim mạch",
      subSpecialty: "Tim mạch can thiệp",
      hospital: "Bệnh viện Chợ Rẫy",
      location: "TP.HCM",
      experience: "15 năm",
      rating: 4.8,
      reviewCount: 125,
      price: "500.000đ",
      image: "https://via.placeholder.com/100x100",
      description: "Bác sĩ chuyên khoa tim mạch với nhiều năm kinh nghiệm trong điều trị các bệnh lý tim mạch phức tạp và can thiệp tim mạch.",
      phone: "0901234567",
      qualifications: ["Tiến sĩ Y khoa", "Chứng chỉ Tim mạch can thiệp"],
    },
    {
      id: 2,
      name: "BS. Trần Thị Bình",
      specialty: "Da liễu",
      subSpecialty: "Da liễu thẩm mỹ",
      hospital: "Bệnh viện Da liễu TP.HCM",
      location: "TP.HCM",
      experience: "12 năm",
      rating: 4.7,
      reviewCount: 98,
      price: "300.000đ",
      image: "https://via.placeholder.com/100x100",
      description: "Chuyên gia da liễu và thẩm mỹ da, có kinh nghiệm điều trị các bệnh lý da và các thủ thuật thẩm mỹ không xâm lấn.",
      phone: "0912345678",
      qualifications: ["Thạc sĩ Y khoa", "Chứng chỉ Da liễu thẩm mỹ"],
    },
    {
      id: 3,
      name: "BS. Lê Minh Cường",
      specialty: "Nhi khoa",
      subSpecialty: "Nhi tim mạch",
      hospital: "Bệnh viện Nhi Đồng 1",
      location: "TP.HCM",
      experience: "18 năm",
      rating: 4.9,
      reviewCount: 156,
      price: "400.000đ",
      image: "https://via.placeholder.com/100x100",
      description: "Bác sĩ nhi khoa chuyên sâu về tim mạch trẻ em, có nhiều kinh nghiệm trong chẩn đoán và điều trị các bệnh tim bẩm sinh.",
      phone: "0923456789",
      qualifications: ["Tiến sĩ Y khoa", "Chuyên khoa II Nhi"],
    },
    {
      id: 4,
      name: "BS. Phạm Thị Dung",
      specialty: "Thần kinh",
      subSpecialty: "Thần kinh cột sống",
      hospital: "Bệnh viện Thống Nhất",
      location: "TP.HCM",
      experience: "20 năm",
      rating: 4.6,
      reviewCount: 87,
      price: "600.000đ",
      image: "https://via.placeholder.com/100x100",
      description: "Chuyên gia thần kinh với chuyên môn sâu về các bệnh lý cột sống và hệ thần kinh trung ương.",
      phone: "0934567890",
      qualifications: ["Tiến sĩ Y khoa", "Chuyên khoa II Thần kinh"],
    },
    {
      id: 5,
      name: "BS. Hoàng Văn Em",
      specialty: "Chấn thương chỉnh hình",
      subSpecialty: "Phẫu thuật cột sống",
      hospital: "Bệnh viện Việt Đức",
      location: "Hà Nội",
      experience: "22 năm",
      rating: 4.8,
      reviewCount: 134,
      price: "800.000đ",
      image: "https://via.placeholder.com/100x100",
      description: "Phẫu thuật viên chỉnh hình chuyên về cột sống, có nhiều kinh nghiệm trong các ca phẫu thuật phức tạp.",
      phone: "0945678901",
      qualifications: ["Tiến sĩ Y khoa", "Chuyên khoa II Chấn thương chỉnh hình"],
    },
    {
      id: 6,
      name: "BS. Ngô Thị Phượng",
      specialty: "Tim mạch",
      subSpecialty: "Siêu âm tim",
      hospital: "Bệnh viện Tim Hà Nội",
      location: "Hà Nội",
      experience: "14 năm",
      rating: 4.7,
      reviewCount: 112,
      price: "450.000đ",
      image: "https://via.placeholder.com/100x100",
      description: "Bác sĩ chuyên khoa tim mạch, giỏi về chẩn đoán hình ảnh tim mạch và siêu âm tim.",
      phone: "0956789012",
      qualifications: ["Thạc sĩ Y khoa", "Chứng chỉ Siêu âm tim"],
    },
  ];

  // Filter doctors based on search term and specialty
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = searchTerm === "" || 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.subSpecialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  const handleDoctorClick = (doctorId) => {
    // Navigate to doctor detail page
    console.log("Navigate to doctor detail:", doctorId);
  };

  const handleBookAppointment = (e, doctorId) => {
    e.stopPropagation();
    // Handle booking appointment
    console.log("Book appointment with doctor:", doctorId);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setSelectedSpecialty(value);
    setCurrentPage(1);
  };

  const DoctorCard = ({ doctor }) => (
    <Card
      className="doctor-card"
      hoverable
      onClick={() => handleDoctorClick(doctor.id)}
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
            src={doctor.image}
            icon={<UserOutlined />}
            style={{ borderRadius: "8px" }}
          />
        </Col>
        <Col flex="auto">
          <div className="doctor-info">
            <Title level={4} style={{ margin: "0 0 8px 0", color: "#1890ff" }}>
              {doctor.name}
            </Title>
            <Text strong style={{ color: "#666", display: "block", marginBottom: "4px" }}>
              {doctor.specialty} - {doctor.subSpecialty}
            </Text>
            <Paragraph ellipsis={{ rows: 2 }} style={{ color: "#666", margin: "8px 0" }}>
              {doctor.description}
            </Paragraph>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Space>
                <StarOutlined style={{ color: "#fadb14" }} />
                <Rate disabled defaultValue={doctor.rating} style={{ fontSize: "14px" }} />
                <Text>({doctor.reviewCount} đánh giá)</Text>
              </Space>
              <Space>
                <EnvironmentOutlined style={{ color: "#45c3d2" }} />
                <Text>{doctor.hospital} - {doctor.location}</Text>
              </Space>
              <Space>
                <CalendarOutlined style={{ color: "#45c3d2" }} />
                <Text>Kinh nghiệm: {doctor.experience}</Text>
              </Space>
            </Space>
          </div>
        </Col>
        <Col flex="160px">
          <div className="doctor-actions">
            <div className="price" style={{ fontSize: "18px", fontWeight: "600", color: "#f5222d", marginBottom: "8px" }}>
              {doctor.price}
            </div>
            <Button
              type="primary"
              size="large"
              block
              onClick={(e) => handleBookAppointment(e, doctor.id)}
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
                handleDoctorClick(doctor.id);
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
                <Option value="Tim mạch">Tim mạch</Option>
                <Option value="Da liễu">Da liễu</Option>
                <Option value="Nhi khoa">Nhi khoa</Option>
                <Option value="Thần kinh">Thần kinh</Option>
                <Option value="Chấn thương chỉnh hình">Chấn thương chỉnh hình</Option>
              </Select>
            </Col>
          </Row>
        </div>
      </div>

      {/* Doctor List */}
      <div className="doctor-list-section">
        <div className="container">
          <div className="results-header">
            <Title level={3}>Kết quả tìm kiếm ({filteredDoctors.length})</Title>
          </div>

          <div className="doctor-list">
            {filteredDoctors
              .slice((currentPage - 1) * 5, currentPage * 5)
              .map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
          </div>

          {/* Pagination */}
          {filteredDoctors.length > 5 && (
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <Pagination
                current={currentPage}
                total={filteredDoctors.length}
                pageSize={5}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} của ${total} bác sĩ`
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctor;