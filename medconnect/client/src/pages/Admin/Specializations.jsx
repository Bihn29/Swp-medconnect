import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, message, Row, Col, Spin, Alert } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HeartOutlined,
  BankOutlined,
  SkinOutlined,
  CrownOutlined,
  SoundOutlined,
  EyeOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { getAdminSpecializations, addSpecialization, updateSpecialization, deleteSpecialization } from '../../lib/api';
import './Specializations.scss';

const Specializations = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSpecialization, setEditingSpecialization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      setLoading(true);
      const data = await getAdminSpecializations();
      setSpecializations(data.data || data);
    } catch (err) {
      console.error('Error fetching specializations:', err);
      setError('Không thể tải danh sách chuyên khoa');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialization = () => {
    setEditingSpecialization(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditSpecialization = (specialization) => {
    setEditingSpecialization(specialization);
    form.setFieldsValue({
      name: specialization.name,
      color: specialization.color
    });
    setIsModalVisible(true);
  };

  const handleDeleteSpecialization = async (id) => {
    try {
      await deleteSpecialization(id);
      message.success('Đã xóa chuyên khoa thành công');
      fetchSpecializations(); // Refresh data
    } catch (err) {
      console.error('Error deleting specialization:', err);
      message.error('Có lỗi xảy ra khi xóa chuyên khoa');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingSpecialization) {
        // Edit existing specialization
        await updateSpecialization(editingSpecialization.id, values);
        message.success('Đã cập nhật chuyên khoa thành công');
      } else {
        // Add new specialization
        await addSpecialization(values);
        message.success('Đã thêm chuyên khoa thành công');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      fetchSpecializations(); // Refresh data
    } catch (err) {
      console.error('Error saving specialization:', err);
      message.error('Có lỗi xảy ra');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const getIconForSpecialization = (name, color) => {
    const iconMap = {
      'Tim mạch': <HeartOutlined style={{ color }} />,
      'Nội khoa': <BankOutlined style={{ color }} />,
      'Da liễu': <SkinOutlined style={{ color }} />,
      'Nha khoa': <CrownOutlined style={{ color }} />,
      'Tai mũi họng': <SoundOutlined style={{ color }} />,
      'Mắt': <EyeOutlined style={{ color }} />,
      'Thần kinh': <UserOutlined style={{ color }} />,
      'Nhi khoa': <TeamOutlined style={{ color }} />
    };
    return iconMap[name] || <UserOutlined style={{ color }} />;
  };

  if (loading) {
    return (
      <div className="specializations">
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1>Quản lý chuyên khoa</h1>
              <p>Thêm và quản lý các chuyên khoa y tế</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddSpecialization}
              className="add-button"
            >
              Thêm chuyên khoa
            </Button>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="specializations">
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1>Quản lý chuyên khoa</h1>
              <p>Thêm và quản lý các chuyên khoa y tế</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddSpecialization}
              className="add-button"
            >
              Thêm chuyên khoa
            </Button>
          </div>
        </div>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          style={{ margin: '20px 0' }}
        />
      </div>
    );
  }

  return (
    <div className="specializations">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1>Quản lý chuyên khoa</h1>
            <p>Thêm và quản lý các chuyên khoa y tế</p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddSpecialization}
            className="add-button"
          >
            Thêm chuyên khoa
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]} className="specializations-grid">
        {specializations.map(specialization => (
          <Col xs={24} sm={12} md={8} lg={6} key={specialization.id}>
            <Card className="specialization-card" hoverable>
              <div className="card-content">
                <div className="specialization-icon">
                  {getIconForSpecialization(specialization.name, specialization.color)}
                </div>
                <div className="specialization-info">
                  <h3>{specialization.name}</h3>
                  <div className="doctor-count">
                    <UserOutlined />
                    <span>{specialization.doctorCount || 0} bác sĩ</span>
                  </div>
                </div>
                <div className="card-actions">
                  <Button 
                    type="text" 
                    icon={<EditOutlined />}
                    onClick={() => handleEditSpecialization(specialization)}
                    className="action-btn edit-btn"
                  >
                    Sửa
                  </Button>
                  <Button 
                    type="text" 
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteSpecialization(specialization.id)}
                    className="action-btn delete-btn"
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingSpecialization ? 'Chỉnh sửa chuyên khoa' : 'Thêm chuyên khoa mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
        className="specialization-modal"
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Tên chuyên khoa"
            rules={[
              { required: true, message: 'Vui lòng nhập tên chuyên khoa' },
              { min: 2, message: 'Tên chuyên khoa phải có ít nhất 2 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên chuyên khoa" />
          </Form.Item>

          <Form.Item
            name="color"
            label="Màu sắc"
            rules={[{ required: true, message: 'Vui lòng chọn màu sắc' }]}
          >
            <Input type="color" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Specializations;
