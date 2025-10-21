import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Avatar, Tag, Space, Modal, message, Spin, Alert } from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  UserOutlined
} from '@ant-design/icons';
import { getPendingDoctors, getVerifiedDoctors, getRejectedDoctors, approveDoctor, rejectDoctor } from '../../lib/api';
import './VerifyDoctors.scss';

const VerifyDoctors = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [verifiedDoctors, setVerifiedDoctors] = useState([]);
  const [rejectedDoctors, setRejectedDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      // Fetch pending doctors
      const pending = await getPendingDoctors();
      setPendingDoctors(pending.data || pending);

      // Fetch verified doctors
      const verified = await getVerifiedDoctors();
      setVerifiedDoctors(verified.data || verified);

      // Fetch rejected doctors
      const rejected = await getRejectedDoctors();
      setRejectedDoctors(rejected.data || rejected);

    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Không thể tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await approveDoctor(doctorId);
      message.success('Đã phê duyệt bác sĩ thành công');
      fetchDoctors(); // Refresh data
    } catch (err) {
      console.error('Error approving doctor:', err);
      message.error('Có lỗi xảy ra khi phê duyệt');
    }
  };

  const handleReject = async (doctorId) => {
    try {
      await rejectDoctor(doctorId);
      message.success('Đã từ chối bác sĩ');
      fetchDoctors(); // Refresh data
    } catch (err) {
      console.error('Error rejecting doctor:', err);
      message.error('Có lỗi xảy ra khi từ chối');
    }
  };

  const handleViewDetails = (doctor) => {
    Modal.info({
      title: `Chi tiết hồ sơ - ${doctor.name}`,
      content: (
        <div>
          <p><strong>Chuyên khoa:</strong> {doctor.specialty}</p>
          <p><strong>Học vấn:</strong> {doctor.education}</p>
          <p><strong>Kinh nghiệm:</strong> {doctor.experience}</p>
          <p><strong>Bệnh viện:</strong> {doctor.hospital}</p>
          <p><strong>Giấy phép:</strong> {doctor.license}</p>
          {doctor.documents && (
            <div>
              <strong>Tài liệu đính kèm:</strong>
              <ul>
                {doctor.documents.map((doc, index) => (
                  <li key={index}>{doc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
      width: 600,
    });
  };

  const renderDoctorCard = (doctor, status) => (
    <Card key={doctor.id} className="doctor-card">
      <div className="doctor-info">
        <Avatar size={80} src={doctor.avatar} />
        <div className="doctor-details">
          <div className="doctor-name">
            <h3>{doctor.name}</h3>
            <Tag color={status === 'pending' ? 'orange' : status === 'verified' ? 'green' : 'red'}>
              {status === 'pending' ? 'Chờ xác minh' : status === 'verified' ? 'Đã xác minh' : 'Đã từ chối'}
            </Tag>
          </div>
          <p className="specialty">{doctor.specialty}</p>
          <div className="doctor-meta">
            <div className="meta-item">
              <UserOutlined />
              <span>{doctor.education}</span>
            </div>
            <div className="meta-item">
              <CalendarOutlined />
              <span>{doctor.experience}</span>
            </div>
            <div className="meta-item">
              <EnvironmentOutlined />
              <span>{doctor.hospital}</span>
            </div>
            <div className="meta-item">
              <SafetyCertificateOutlined />
              <span>Giấy phép: {doctor.license}</span>
            </div>
          </div>
          {doctor.documents && (
            <div className="documents">
              <p><strong>Tài liệu đính kèm:</strong></p>
              <div className="document-list">
                {doctor.documents.map((doc, index) => (
                  <Button key={index} type="link" icon={<FileTextOutlined />}>
                    {doc}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="submission-info">
            <p><strong>Nộp hồ sơ:</strong> {doctor.submittedDate || doctor.verifiedDate || doctor.rejectedDate}</p>
            {doctor.verifiedBy && <p><strong>Xác minh:</strong> {doctor.verifiedDate} bởi {doctor.verifiedBy}</p>}
            {doctor.rejectedBy && <p><strong>Từ chối:</strong> {doctor.rejectedDate} bởi {doctor.rejectedBy}</p>}
            {doctor.rejectionReason && (
              <div className="rejection-reason">
                <p><strong>Lý do từ chối:</strong></p>
                <div className="reason-box">{doctor.rejectionReason}</div>
              </div>
            )}
          </div>
        </div>
        <div className="doctor-actions">
          <Space direction="vertical" size="small">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetails(doctor)}
            >
              Xem chi tiết
            </Button>
            {status === 'pending' && (
              <>
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(doctor.id)}
                >
                  Phê duyệt
                </Button>
                <Button 
                  danger 
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(doctor.id)}
                >
                  Từ chối
                </Button>
              </>
            )}
            {status === 'verified' && (
              <Button>Xem hồ sơ</Button>
            )}
          </Space>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="verify-doctors">
        <div className="page-header">
          <h1>Xác minh bác sĩ</h1>
          <p>Xem xét và phê duyệt hồ sơ đăng ký bác sĩ</p>
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
      <div className="verify-doctors">
        <div className="page-header">
          <h1>Xác minh bác sĩ</h1>
          <p>Xem xét và phê duyệt hồ sơ đăng ký bác sĩ</p>
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

  const tabItems = [
    {
      key: 'pending',
      label: `Chờ xác minh (${pendingDoctors.length})`,
      children: (
        <div className="doctors-list">
          {pendingDoctors.map(doctor => renderDoctorCard(doctor, 'pending'))}
        </div>
      ),
    },
    {
      key: 'verified',
      label: `Đã xác minh (${verifiedDoctors.length})`,
      children: (
        <div className="doctors-list">
          {verifiedDoctors.map(doctor => renderDoctorCard(doctor, 'verified'))}
        </div>
      ),
    },
    {
      key: 'rejected',
      label: `Đã từ chối (${rejectedDoctors.length})`,
      children: (
        <div className="doctors-list">
          {rejectedDoctors.map(doctor => renderDoctorCard(doctor, 'rejected'))}
        </div>
      ),
    },
  ];

  return (
    <div className="verify-doctors">
      <div className="page-header">
        <h1>Xác minh bác sĩ</h1>
        <p>Xem xét và phê duyệt hồ sơ đăng ký bác sĩ</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="verification-tabs"
      />
    </div>
  );
};

export default VerifyDoctors;
