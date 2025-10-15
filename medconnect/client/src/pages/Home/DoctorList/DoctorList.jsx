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
import "./DoctorList.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const DoctorList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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
      description:
        "Bác sĩ chuyên khoa tim mạch với nhiều năm kinh nghiệm trong điều trị các bệnh lý tim mạch phức tạp và can thiệp tim mạch.",
      phone: "0901234567",
      qualifications: ["Tiến sĩ Y khoa", "Chứng chỉ Tim mạch can thiệp"],
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      // Time slots for different days
      timeSlots: {
        // Monday (Thứ 2)
        1: [
          { time: "08:00 - 08:30", available: true },
          { time: "08:30 - 09:00", available: true },
          { time: "09:00 - 09:30", available: false },
          { time: "09:30 - 10:00", available: true },
          { time: "14:00 - 14:30", available: true },
          { time: "14:30 - 15:00", available: true },
          { time: "15:00 - 15:30", available: false },
          { time: "15:30 - 16:00", available: true },
        ],
        // Tuesday (Thứ 3)
        2: [
          { time: "08:00 - 08:30", available: true },
          { time: "08:30 - 09:00", available: false },
          { time: "09:00 - 09:30", available: true },
          { time: "09:30 - 10:00", available: true },
          { time: "14:00 - 14:30", available: true },
          { time: "14:30 - 15:00", available: true },
          { time: "15:00 - 15:30", available: true },
          { time: "15:30 - 16:00", available: false },
        ],
        // Wednesday (Thứ 4)
        3: [
          { time: "08:00 - 08:30", available: true },
          { time: "08:30 - 09:00", available: true },
          { time: "09:00 - 09:30", available: true },
          { time: "09:30 - 10:00", available: false },
          { time: "14:00 - 14:30", available: false },
          { time: "14:30 - 15:00", available: true },
          { time: "15:00 - 15:30", available: true },
          { time: "15:30 - 16:00", available: true },
        ],
        // Thursday (Thứ 5)
        4: [
          { time: "08:00 - 08:30", available: false },
          { time: "08:30 - 09:00", available: true },
          { time: "09:00 - 09:30", available: true },
          { time: "09:30 - 10:00", available: true },
          { time: "14:00 - 14:30", available: true },
          { time: "14:30 - 15:00", available: false },
          { time: "15:00 - 15:30", available: true },
          { time: "15:30 - 16:00", available: true },
        ],
        // Friday (Thứ 6)
        5: [
          { time: "17:30 - 18:00", available: true },
          { time: "18:00 - 18:30", available: true },
          { time: "18:30 - 19:00", available: true },
          { time: "19:00 - 19:30", available: true },
          { time: "19:30 - 20:00", available: false },
          { time: "20:00 - 20:30", available: true },
          { time: "20:30 - 21:00", available: true },
          { time: "21:00 - 21:30", available: false },
        ],
        // Saturday (Thứ 7)
        6: [
          { time: "08:00 - 08:30", available: true },
          { time: "08:30 - 09:00", available: true },
          { time: "09:00 - 09:30", available: true },
          { time: "09:30 - 10:00", available: true },
          { time: "10:00 - 10:30", available: false },
          { time: "10:30 - 11:00", available: true },
          { time: "11:00 - 11:30", available: true },
          { time: "11:30 - 12:00", available: true },
        ],
        // Sunday (Chủ nhật)
        0: [
          { time: "14:00 - 14:30", available: true },
          { time: "14:30 - 15:00", available: true },
          { time: "15:00 - 15:30", available: false },
          { time: "15:30 - 16:00", available: true },
          { time: "16:00 - 16:30", available: true },
          { time: "16:30 - 17:00", available: true },
          { time: "17:00 - 17:30", available: false },
          { time: "17:30 - 18:00", available: true },
        ],
      },
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
      description:
        "Chuyên gia da liễu và thẩm mỹ da, có kinh nghiệm điều trị các bệnh lý da và các thủ thuật thẩm mỹ không xâm lấn.",
      phone: "0912345678",
      qualifications: ["Thạc sĩ Y khoa", "Chứng chỉ Da liễu thẩm mỹ"],
      address: "456 Lê Văn Việt, Quận 9, TP.HCM",
      // Time slots for different days
      timeSlots: {
        // Monday (Thứ 2)
        1: [
          { time: "08:00 - 08:30", available: true },
          { time: "08:30 - 09:00", available: true },
          { time: "09:00 - 09:30", available: false },
          { time: "09:30 - 10:00", available: true },
          { time: "14:00 - 14:30", available: true },
          { time: "14:30 - 15:00", available: true },
          { time: "15:00 - 15:30", available: false },
          { time: "15:30 - 16:00", available: true },
        ],
        // Tuesday (Thứ 3)
        2: [
          { time: "08:00 - 08:30", available: true },
          { time: "08:30 - 09:00", available: false },
          { time: "09:00 - 09:30", available: true },
          { time: "09:30 - 10:00", available: true },
          { time: "14:00 - 14:30", available: true },
          { time: "14:30 - 15:00", available: true },
          { time: "15:00 - 15:30", available: true },
          { time: "15:30 - 16:00", available: false },
        ],
        // Wednesday (Thứ 4)
        3: [
          { time: "08:00 - 08:30", available: true },
          { time: "08:30 - 09:00", available: true },
          { time: "09:00 - 09:30", available: true },
          { time: "09:30 - 10:00", available: false },
          { time: "14:00 - 14:30", available: false },
          { time: "14:30 - 15:00", available: true },
          { time: "15:00 - 15:30", available: true },
          { time: "15:30 - 16:00", available: true },
        ],
        // Thursday (Thứ 5)
        4: [
          { time: "08:00 - 08:30", available: false },
          { time: "08:30 - 09:00", available: true },
          { time: "09:00 - 09:30", available: true },
          { time: "09:30 - 10:00", available: true },
          { time: "14:00 - 14:30", available: true },
          { time: "14:30 - 15:00", available: false },
          { time: "15:00 - 15:30", available: true },
          { time: "15:30 - 16:00", available: true },
        ],
        // Friday (Thứ 6)
        5: [
          { time: "17:30 - 18:00", available: true },
          { time: "18:00 - 18:30", available: true },
          { time: "18:30 - 19:00", available: true },
          { time: "19:00 - 19:30", available: true },
          { time: "19:30 - 20:00", available: false },
          { time: "20:00 - 20:30", available: true },
          { time: "20:30 - 21:00", available: true },
          { time: "21:00 - 21:30", available: false },
        ],
        // Saturday (Thứ 7)
        6: [
          { time: "08:00 - 08:30", available: true },
          { time: "08:30 - 09:00", available: true },
          { time: "09:00 - 09:30", available: true },
          { time: "09:30 - 10:00", available: true },
          { time: "10:00 - 10:30", available: false },
          { time: "10:30 - 11:00", available: true },
          { time: "11:00 - 11:30", available: true },
          { time: "11:30 - 12:00", available: true },
        ],
        // Sunday (Chủ nhật)
        0: [
          { time: "14:00 - 14:30", available: true },
          { time: "14:30 - 15:00", available: true },
          { time: "15:00 - 15:30", available: false },
          { time: "15:30 - 16:00", available: true },
          { time: "16:00 - 16:30", available: true },
          { time: "16:30 - 17:00", available: true },
          { time: "17:00 - 17:30", available: false },
          { time: "17:30 - 18:00", available: true },
        ],
      },
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
      description:
        "Bác sĩ nhi khoa chuyên sâu về tim mạch trẻ em, có nhiều kinh nghiệm trong chẩn đoán và điều trị các bệnh tim bẩm sinh.",
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
      description:
        "Chuyên gia thần kinh với chuyên môn sâu về các bệnh lý cột sống và hệ thần kinh trung ương.",
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
      description:
        "Phẫu thuật viên chỉnh hình chuyên về cột sống, có nhiều kinh nghiệm trong các ca phẫu thuật phức tạp.",
      phone: "0945678901",
      qualifications: [
        "Tiến sĩ Y khoa",
        "Chuyên khoa II Chấn thương chỉnh hình",
      ],
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
      description:
        "Bác sĩ chuyên khoa tim mạch, giỏi về chẩn đoán hình ảnh tim mạch và siêu âm tim.",
      phone: "0956789012",
      qualifications: ["Thạc sĩ Y khoa", "Chứng chỉ Siêu âm tim"],
    },
  ];

  // Initialize filter from query param ?specialty=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qSpecialty = params.get("specialty");
    if (qSpecialty) {
      setSelectedSpecialty(qSpecialty);
      setCurrentPage(1);
    }
  }, [location.search]);

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
      path: "/bac-si",
    });

    return items;
  };

  // Filter doctors based on search term and specialty
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      searchTerm === "" ||
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.subSpecialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

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
            <Text
              strong
              style={{ color: "#666", display: "block", marginBottom: "4px" }}
            >
              {doctor.specialty} - {doctor.subSpecialty}
            </Text>
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ color: "#666", margin: "8px 0" }}
            >
              {doctor.description}
            </Paragraph>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Space>
                <StarOutlined style={{ color: "#fadb14" }} />
                <Rate
                  disabled
                  defaultValue={doctor.rating}
                  style={{ fontSize: "14px" }}
                />
                <Text>({doctor.reviewCount} đánh giá)</Text>
              </Space>
              <Space>
                <EnvironmentOutlined style={{ color: "#45c3d2" }} />
                <Text>
                  {doctor.hospital} - {doctor.location}
                </Text>
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
            <div
              className="price"
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#f5222d",
                marginBottom: "8px",
              }}
            >
              {doctor.price}
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
                <Option value="Tim mạch">Tim mạch</Option>
                <Option value="Da liễu">Da liễu</Option>
                <Option value="Nhi khoa">Nhi khoa</Option>
                <Option value="Thần kinh">Thần kinh</Option>
                <Option value="Chấn thương chỉnh hình">
                  Chấn thương chỉnh hình
                </Option>
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

export default DoctorList;
