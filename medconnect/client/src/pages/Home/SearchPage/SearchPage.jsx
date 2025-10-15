import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Divider,
  Tag,
  Avatar,
  Rate,
  Empty,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  PhoneOutlined,
  CalendarOutlined,
  StarOutlined,
} from "@ant-design/icons";
import "./SearchPage.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Lấy type từ URL params
  const searchParams = new URLSearchParams(location.search);
  const urlType = searchParams.get("type") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState(urlType);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Cập nhật filterType khi URL thay đổi
  useEffect(() => {
    setFilterType(urlType);
  }, [urlType]);

  // Mock data - Bác sĩ
  const doctors = [
    {
      id: 1,
      name: "BS.CKI Nguyễn Văn An",
      specialty: "Tim mạch",
      hospital: "Bệnh viện Đa khoa Medconnect",
      location: "Quận 1, TP.HCM",
      experience: "15 năm",
      rating: 4.9,
      price: "500,000đ",
      avatar: "https://via.placeholder.com/80x80?text=Dr+An",
      schedule: "Thứ 2-6: 7:00-17:00",
      type: "doctor",
    },
    {
      id: 2,
      name: "BS.CKII Trần Thị Bình",
      specialty: "Nội khoa",
      hospital: "Bệnh viện Đa khoa Medconnect",
      location: "Quận 3, TP.HCM",
      experience: "12 năm",
      rating: 4.8,
      price: "400,000đ",
      avatar: "https://via.placeholder.com/80x80?text=Dr+Binh",
      schedule: "Thứ 2-7: 8:00-16:00",
      type: "doctor",
    },
    {
      id: 3,
      name: "PGS.TS Lê Văn Cường",
      specialty: "Ngoại khoa",
      hospital: "Bệnh viện Chuyên khoa Tim",
      location: "Quận 5, TP.HCM",
      experience: "20 năm",
      rating: 5.0,
      price: "800,000đ",
      avatar: "https://via.placeholder.com/80x80?text=Dr+Cuong",
      schedule: "Thứ 3-6: 9:00-15:00",
      type: "doctor",
    },
  ];

  // Mock data - Chuyên khoa
  const specialties = [
    {
      id: 1,
      name: "Tim mạch",
      description: "Khám và điều trị các bệnh về tim mạch",
      doctorCount: 25,
      icon: "❤️",
      type: "specialty",
    },
    {
      id: 2,
      name: "Nội khoa",
      description: "Khám nội tổng quát, điều trị nội khoa",
      doctorCount: 40,
      icon: "🩺",
      type: "specialty",
    },
    {
      id: 3,
      name: "Ngoại khoa",
      description: "Phẫu thuật và điều trị ngoại khoa",
      doctorCount: 18,
      icon: "🔬",
      type: "specialty",
    },
    {
      id: 4,
      name: "Sản phụ khoa",
      description: "Chăm sóc sức khỏe phụ nữ và trẻ em",
      doctorCount: 15,
      icon: "👶",
      type: "specialty",
    },
  ];

  // Mock data - Địa điểm khám
  const locations = [
    {
      id: 1,
      name: "Bệnh viện Đa khoa Medconnect",
      address: "123 Nguyễn Văn Cừ, Quận 1, TP.HCM",
      phone: "028-3829-1234",
      rating: 4.8,
      specialties: ["Tim mạch", "Nội khoa", "Ngoại khoa"],
      type: "location",
    },
    {
      id: 2,
      name: "Bệnh viện Chuyên khoa Tim",
      address: "456 Võ Văn Tần, Quận 3, TP.HCM",
      phone: "028-3829-5678",
      rating: 4.9,
      specialties: ["Tim mạch", "Phẫu thuật tim"],
      type: "location",
    },
  ];

  // Mock data - Lý do khám
  const reasons = [
    {
      id: 1,
      name: "Đau tim, khó thở",
      specialty: "Tim mạch",
      description: "Triệu chứng liên quan đến tim mạch",
      type: "reason",
    },
    {
      id: 2,
      name: "Đau bụng, khó tiêu",
      specialty: "Tiêu hóa",
      description: "Triệu chứng liên quan đến hệ tiêu hóa",
      type: "reason",
    },
    {
      id: 3,
      name: "Đau đầu, chóng mặt",
      specialty: "Thần kinh",
      description: "Triệu chứng liên quan đến thần kinh",
      type: "reason",
    },
  ];

  // Lọc dữ liệu theo filter
  const getFilteredData = () => {
    let allData = [];

    if (filterType === "all" || filterType === "doctor") {
      allData = [...allData, ...doctors];
    }
    if (filterType === "all" || filterType === "specialty") {
      allData = [...allData, ...specialties];
    }
    if (filterType === "all" || filterType === "location") {
      allData = [...allData, ...locations];
    }
    if (filterType === "all" || filterType === "reason") {
      allData = [...allData, ...reasons];
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      allData = allData.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.specialty &&
            item.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return allData;
  };

  const filteredData = getFilteredData();

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setFilterType(value);
    setCurrentPage(1);

    // Cập nhật URL khi thay đổi filter
    if (value === "all") {
      navigate("/tim-kiem");
    } else {
      navigate(`/tim-kiem?type=${value}`);
    }
  };

  const handleBookAppointment = (doctor) => {
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

  // Render item theo type
  const renderSearchItem = (item) => {
    switch (item.type) {
      case "doctor":
        return (
          <Card className="search-item doctor-item" hoverable>
            <Row gutter={16}>
              <Col flex="80px">
                <Avatar size={64} src={item.avatar} />
              </Col>
              <Col flex="auto">
                <div className="item-content">
                  <Title level={4} style={{ margin: 0 }}>
                    {item.name}
                  </Title>
                  <Space direction="vertical" size="small">
                    <Tag color="blue">{item.specialty}</Tag>
                    <Text>
                      <EnvironmentOutlined /> {item.hospital}
                    </Text>
                    <Text>
                      <CalendarOutlined /> {item.schedule}
                    </Text>
                    <Space>
                      <Rate disabled defaultValue={item.rating} />
                      <Text>({item.rating})</Text>
                      <Text strong style={{ color: "#1890ff" }}>
                        {item.price}
                      </Text>
                    </Space>
                  </Space>
                </div>
              </Col>
              <Col flex="120px">
                <Space direction="vertical" size="small">
                  <Button
                    type="primary"
                    block
                    icon={<CalendarOutlined />}
                    onClick={() => handleBookAppointment(item)}
                  >
                    Đặt lịch
                  </Button>
                  <Button block icon={<PhoneOutlined />}>
                    Gọi ngay
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        );

      case "specialty":
        return (
          <Card className="search-item specialty-item" hoverable>
            <Row gutter={16}>
              <Col flex="60px">
                <div className="specialty-icon">{item.icon}</div>
              </Col>
              <Col flex="auto">
                <Title level={4} style={{ margin: 0 }}>
                  {item.name}
                </Title>
                <Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
                <Text type="secondary">{item.doctorCount} bác sĩ</Text>
              </Col>
              <Col flex="100px">
                <Button type="primary" block>
                  Xem bác sĩ
                </Button>
              </Col>
            </Row>
          </Card>
        );

      case "location":
        return (
          <Card className="search-item location-item" hoverable>
            <Row gutter={16}>
              <Col flex="auto">
                <Title level={4} style={{ margin: 0 }}>
                  {item.name}
                </Title>
                <Space direction="vertical" size="small">
                  <Text>
                    <EnvironmentOutlined /> {item.address}
                  </Text>
                  <Text>
                    <PhoneOutlined /> {item.phone}
                  </Text>
                  <Space>
                    <Rate disabled defaultValue={item.rating} />
                    <Text>({item.rating})</Text>
                  </Space>
                  <div>
                    {item.specialties.map((spec, index) => (
                      <Tag key={index} color="green">
                        {spec}
                      </Tag>
                    ))}
                  </div>
                </Space>
              </Col>
              <Col flex="120px">
                <Space direction="vertical" size="small">
                  <Button type="primary" block>
                    Xem chi tiết
                  </Button>
                  <Button block icon={<PhoneOutlined />}>
                    Gọi ngay
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        );

      case "reason":
        return (
          <Card className="search-item reason-item" hoverable>
            <Row gutter={16}>
              <Col flex="auto">
                <Title level={4} style={{ margin: 0 }}>
                  {item.name}
                </Title>
                <Space direction="vertical" size="small">
                  <Tag color="orange">{item.specialty}</Tag>
                  <Text type="secondary">{item.description}</Text>
                </Space>
              </Col>
              <Col flex="120px">
                <Button type="primary" block>
                  Tìm bác sĩ
                </Button>
              </Col>
            </Row>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="search-page">
      {/* Search Header */}
      <div className="search-header">
        <div className="container">
          <Title level={2} style={{ textAlign: "center", marginBottom: 30 }}>
            Tìm kiếm dịch vụ y tế
          </Title>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <Select
                value={filterType}
                onChange={handleFilterChange}
                style={{ width: "100%" }}
                size="large"
              >
                <Option value="all">
                  <SearchOutlined /> Tất cả
                </Option>
                <Option value="doctor">
                  <UserOutlined /> Bác sĩ
                </Option>
                <Option value="specialty">
                  <MedicineBoxOutlined /> Chuyên khoa
                </Option>
                <Option value="location">
                  <EnvironmentOutlined /> Địa điểm khám
                </Option>
                <Option value="reason">
                  <HeartOutlined /> Lý do khám
                </Option>
              </Select>
            </Col>
            <Col xs={24} sm={18}>
              <Input.Search
                placeholder="Nhập từ khóa tìm kiếm..."
                size="large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
                enterButton="Tìm kiếm"
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* Search Results */}
      <div className="search-results">
        <div className="container">
          <div className="results-header">
            <Title level={3}>Kết quả tìm kiếm ({filteredData.length})</Title>
            {searchQuery && (
              <Text>
                Kết quả cho: "<strong>{searchQuery}</strong>"
              </Text>
            )}
          </div>

          <Divider />

          {filteredData.length > 0 ? (
            <div className="results-list">
              {filteredData
                .slice((currentPage - 1) * 10, currentPage * 10)
                .map((item) => (
                  <div key={`${item.type}-${item.id}`} className="result-item">
                    {renderSearchItem(item)}
                  </div>
                ))}
            </div>
          ) : (
            <Empty
              description="Không tìm thấy kết quả nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}

          {filteredData.length > 10 && (
            <div style={{ textAlign: "center", marginTop: 30 }}>
              <Pagination
                current={currentPage}
                total={filteredData.length}
                pageSize={10}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} của ${total} kết quả`
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
