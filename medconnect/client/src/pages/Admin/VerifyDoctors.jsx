import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Avatar, Tag, Space, Modal, message, Spin, Alert, Image, Input } from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { getPendingDoctors, getVerifiedDoctors, getRejectedDoctors, approveDoctor, rejectDoctor } from '../../lib/api';
import './VerifyDoctors.scss';

// Helper function to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  // If URL is already absolute (starts with http:// or https://), return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // If URL starts with /, it's a server path, prepend API base URL
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
  return `${apiBase}${url.startsWith("/") ? url : `/${url}`}`;
};

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
    // Use a controlled component approach
    let rejectionReasonValue = '';
    
    return new Promise((resolve) => {
      Modal.confirm({
        title: 'Từ chối bác sĩ',
        width: 600,
        content: (
          <div>
            <p style={{ marginBottom: '12px' }}>Vui lòng nhập lý do từ chối:</p>
            <Input.TextArea
              rows={5}
              placeholder="Nhập lý do từ chối bác sĩ này..."
              onChange={(e) => {
                rejectionReasonValue = e.target.value;
              }}
              autoFocus
            />
            <p style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
              Lưu ý: Lý do từ chối sẽ được gửi đến email của bác sĩ
            </p>
          </div>
        ),
        okText: 'Xác nhận từ chối',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: async () => {
          if (!rejectionReasonValue.trim()) {
            message.error('Vui lòng nhập lý do từ chối');
            resolve(false);
            return Promise.reject();
          }
          
          try {
            await rejectDoctor(doctorId, rejectionReasonValue.trim());
            message.success('Đã từ chối bác sĩ thành công');
            fetchDoctors(); // Refresh data
            resolve(true);
          } catch (err) {
            console.error('Error rejecting doctor:', err);
            let errorMessage = 'Có lỗi xảy ra khi từ chối';
            try {
              const errorData = JSON.parse(err.message);
              errorMessage = errorData.message || errorMessage;
            } catch {
              if (err.message) {
                errorMessage = err.message;
              }
            }
            message.error(errorMessage);
            resolve(false);
            return Promise.reject();
          }
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });
  };

  const handleViewDetails = (doctor) => {
    Modal.info({
      title: `Chi tiết hồ sơ - ${doctor.name}`,
      content: (
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: '16px' }}>
            {/* Thông tin cơ bản */}
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
              <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Thông tin cơ bản</h4>
              <p><strong>Họ và tên:</strong> {doctor.name || 'Chưa có tên'}</p>
              <p><strong>Email:</strong> {doctor.email || 'Chưa có email'}</p>
              <p><strong>Số điện thoại:</strong> {doctor.phone || 'Chưa có số điện thoại'}</p>
              <p><strong>Chuyên khoa:</strong> {doctor.specialty || 'Chưa chọn chuyên khoa'}</p>
              <p><strong>Kinh nghiệm:</strong> {doctor.experience || '0 năm kinh nghiệm'}</p>
            </div>

            {/* Học vấn */}
            {doctor.education && doctor.education !== 'Chưa cập nhật' && (
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Học vấn</h4>
                <p>{doctor.education}</p>
              </div>
            )}

            {/* Bệnh viện/Phòng khám */}
            {doctor.hospital && doctor.hospital !== 'Chưa cập nhật' && (
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Bệnh viện/Phòng khám</h4>
                <p>{doctor.hospital}</p>
              </div>
            )}

            {/* Giấy phép */}
            {doctor.licenseImageUrl && (
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Giấy phép hành nghề</h4>
                <p><strong>Ảnh chứng chỉ hành nghề:</strong></p>
                <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                  <Image
                    src={getImageUrl(doctor.licenseImageUrl)}
                    alt="Chứng chỉ hành nghề"
                    style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
                    preview={{
                      mask: 'Xem ảnh',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Mô tả */}
            {doctor.bio && doctor.bio !== 'Chưa có mô tả' && (
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Mô tả</h4>
                <p style={{ whiteSpace: 'pre-wrap', marginLeft: '0' }}>{doctor.bio}</p>
              </div>
            )}

            {/* Chứng chỉ */}
            {doctor.certifications && Array.isArray(doctor.certifications) && doctor.certifications.length > 0 && (
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Chứng chỉ</h4>
                <ul style={{ marginLeft: '16px', padding: 0 }}>
                  {doctor.certifications.map((cert, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>{cert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ngày nộp hồ sơ */}
            {doctor.submittedDate && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>Thông tin đăng ký</h4>
                <p><strong>Ngày nộp hồ sơ:</strong> {doctor.submittedDate}</p>
              </div>
            )}
          </div>
        </div>
      ),
      width: 700,
      okText: 'Thoát',
      okButtonProps: { type: 'default' },
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
            {doctor.email && (
              <div className="meta-item">
                <UserOutlined />
                <span>Email: {doctor.email}</span>
              </div>
            )}
            {doctor.phone && (
              <div className="meta-item">
                <UserOutlined />
                <span>Điện thoại: {doctor.phone}</span>
              </div>
            )}
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
          {doctor.licenseImageUrl && (
            <div className="license-image" style={{ marginTop: '12px', marginBottom: '12px' }}>
              <p><strong>Ảnh chứng chỉ hành nghề:</strong></p>
              <div style={{ marginTop: '8px' }}>
                <Image
                  src={getImageUrl(doctor.licenseImageUrl)}
                  alt="Chứng chỉ hành nghề"
                  width={200}
                  height={150}
                  style={{ objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                  preview={{
                    mask: <div><PictureOutlined /> Xem ảnh</div>,
                  }}
                />
              </div>
            </div>
          )}
          {doctor.bio && (
            <div className="doctor-bio" style={{ marginTop: '12px', marginBottom: '12px' }}>
              <p><strong>Mô tả:</strong> {doctor.bio.length > 100 ? doctor.bio.substring(0, 100) + '...' : doctor.bio}</p>
            </div>
          )}
          {doctor.certifications && doctor.certifications.length > 0 && (
            <div className="certifications" style={{ marginTop: '8px', marginBottom: '8px' }}>
              <p><strong>Chứng chỉ:</strong> {doctor.certifications.length} chứng chỉ</p>
            </div>
          )}
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
