import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Button,
  Tag,
  Empty,
  Spin,
  message,
  Popconfirm,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
} from "@ant-design/icons";
import { api } from "../../../../lib/api";
import "./FavoriteDoctors.scss";

const { Title, Text, Paragraph } = Typography;

const FavoriteDoctors = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [favoriteDoctors, setFavoriteDoctors] = useState([]);
  const [removingIds, setRemovingIds] = useState(new Set());

  useEffect(() => {
    fetchFavoriteDoctors();
  }, []);

  const fetchFavoriteDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/patients/me/favorite-doctors");

      if (response.success) {
        setFavoriteDoctors(response.data.favoriteDoctors || []);
      } else {
        message.error("Không thể tải danh sách bác sĩ ưa thích");
      }
    } catch (error) {
      console.error("Error fetching favorite doctors:", error);
      message.error("Có lỗi xảy ra khi tải danh sách bác sĩ ưa thích");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (doctorId) => {
    try {
      setRemovingIds((prev) => new Set(prev).add(doctorId));
      const response = await api.delete(
        `/api/patients/me/favorite-doctors/${doctorId}`
      );

      if (response.success) {
        message.success("Đã xóa khỏi danh sách ưa thích");
        setFavoriteDoctors((prev) =>
          prev.filter((doctor) => doctor._id !== doctorId)
        );
      } else {
        message.error(
          response.message || "Không thể xóa bác sĩ khỏi danh sách"
        );
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      message.error("Có lỗi xảy ra khi xóa bác sĩ khỏi danh sách");
    } finally {
      setRemovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(doctorId);
        return newSet;
      });
    }
  };

  const handleBookAppointment = (doctor) => {
    navigate("/dat-lich/chon-thoi-gian", {
      state: {
        doctor: doctor,
        specialization: doctor.specializations?.[0] || null,
      },
    });
  };

  const getSpecializationNames = (specializations) => {
    if (!specializations || specializations.length === 0)
      return "Chưa xác định";
    return specializations.map((spec) => spec.name).join(", ");
  };

  const getFullName = (doctor) => {
    const fullName = doctor.fullName || "";
    return fullName.startsWith("BS.") ? fullName : `BS. ${fullName}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải danh sách bác sĩ ưa thích...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="favorite-doctors-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <Title level={2} className="main-title">
              Bác sĩ ưa thích
            </Title>
            <Text className="subtitle">
              Danh sách các bác sĩ bạn đã thêm vào mục ưa thích
            </Text>
          </div>
        </div>
      </div>

      <div className="doctors-content">
        {favoriteDoctors.length === 0 ? (
          <Empty
            description="Bạn chưa có bác sĩ ưa thích nào"
            style={{ margin: "50px 0" }}
          >
            <Button
              type="primary"
              onClick={() => navigate("/benh-nhan/tim-bac-si")}
            >
              Tìm bác sĩ
            </Button>
          </Empty>
        ) : (
          <Row gutter={[24, 24]}>
            {favoriteDoctors.map((doctor) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={doctor._id}>
                <Card
                  hoverable
                  className="favorite-doctor-card"
                  actions={[
                    <Popconfirm
                      title="Xóa khỏi danh sách ưa thích?"
                      description="Bạn có chắc chắn muốn xóa bác sĩ này khỏi danh sách ưa thích?"
                      onConfirm={() => handleRemoveFavorite(doctor._id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{
                        danger: true,
                        loading: removingIds.has(doctor._id),
                      }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<HeartFilled />}
                        loading={removingIds.has(doctor._id)}
                      >
                        Bỏ thích
                      </Button>
                    </Popconfirm>,
                    <Button
                      type="primary"
                      icon={<CalendarOutlined />}
                      onClick={() => handleBookAppointment(doctor)}
                    >
                      Đặt lịch
                    </Button>,
                  ]}
                >
                  <div className="doctor-card-content">
                    <div className="doctor-avatar-container">
                      <Avatar
                        size={100}
                        src={
                          doctor.avatarUrl &&
                          !doctor.avatarUrl.includes("picsum.photos")
                            ? doctor.avatarUrl
                            : undefined
                        }
                        icon={!doctor.avatarUrl && <UserOutlined />}
                        className="doctor-avatar"
                      />
                    </div>

                    <div className="doctor-info">
                      <Title level={4} className="doctor-name">
                        {getFullName(doctor)}
                      </Title>

                      <div className="doctor-specializations">
                        <Tag color="blue">
                          {getSpecializationNames(doctor.specializations)}
                        </Tag>
                      </div>

                      {doctor.yearsExperience && (
                        <div className="doctor-experience">
                          <Text type="secondary">
                            {doctor.yearsExperience} năm kinh nghiệm
                          </Text>
                        </div>
                      )}

                      <div className="doctor-rating">
                        <StarOutlined
                          style={{ color: "#faad14", marginRight: 4 }}
                        />
                        <Text>
                          {doctor.ratingAvg?.toFixed(1) || "0.0"} (
                          {doctor.ratingCount || 0} đánh giá)
                        </Text>
                      </div>

                      {doctor.bio && (
                        <Paragraph
                          ellipsis={{ rows: 2, expandable: false }}
                          className="doctor-bio"
                        >
                          {doctor.bio}
                        </Paragraph>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default FavoriteDoctors;
