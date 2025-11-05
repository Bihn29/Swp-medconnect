import React, { useState, useEffect } from 'react';
import { Tabs, Button, Avatar, Tag, Modal, message, Spin, Alert, Image, Row, Col, Input } from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { getPendingDoctors, getVerifiedDoctors, getRejectedDoctors, approveDoctor, rejectDoctor } from '../../lib/api';
import './VerifyDoctors.scss';

// Helper function to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
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
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      const pending = await getPendingDoctors();
      setPendingDoctors(pending.data || pending || []);

      const verified = await getVerifiedDoctors();
      setVerifiedDoctors(verified.data || verified || []);

      const rejected = await getRejectedDoctors();
      setRejectedDoctors(rejected.data || rejected || []);

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
      fetchDoctors();
      setDetailModalVisible(false);
    } catch (err) {
      console.error('Error approving doctor:', err);
      message.error('Có lỗi xảy ra khi phê duyệt');
    }
  };

  const handleReject = async (doctorId) => {
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
            fetchDoctors();
            setDetailModalVisible(false);
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
    setSelectedDoctor(doctor);
    setDetailModalVisible(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag icon={<ClockCircleOutlined />} color="processing">Chờ xác minh</Tag>;
      case 'verified':
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã xác minh</Tag>;
      case 'rejected':
        return <Tag icon={<ExclamationCircleOutlined />} color="error">Đã từ chối</Tag>;
      default:
        return null;
    }
  };

  const renderDoctorRow = (doctor, status) => (
    <div key={doctor.id || doctor._id} className="doctor-row">
      <div className="doctor-row-content">
        <Avatar size={64} src={doctor.avatar || doctor.avatarUrl} className="doctor-avatar" />
        <div className="doctor-info">
          <div className="doctor-name">{doctor.name || doctor.fullName}</div>
          <div className="doctor-specialty">{doctor.specialty || doctor.specializationName}</div>
        </div>
        <div className="doctor-actions-row">
          {status === 'pending' && (
            <Button 
              type="default" 
              icon={<ClockCircleOutlined />}
              className="action-btn status-btn"
              disabled
            >
              Chờ xác minh
            </Button>
          )}
          <Button 
            type="default" 
            icon={<EyeOutlined />}
            className="action-btn view-btn"
            onClick={() => handleViewDetails(doctor)}
            >
            Xem chi tiết
          </Button>
          {status === 'pending' && (
            <>
              <Button 
                type="primary" 
                icon={<CheckOutlined />}
                className="action-btn approve-btn"
                onClick={() => handleApprove(doctor.id || doctor._id)}
              >
                Phê duyệt
              </Button>
              <Button 
                danger 
                icon={<CloseOutlined />}
                className="action-btn reject-btn"
                onClick={() => handleReject(doctor.id || doctor._id)}
              >
                Từ chối
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderDetailModal = () => {
    if (!selectedDoctor) return null;

    const doctor = selectedDoctor;
    const documents = [];
    
    // Collect all documents
    if (doctor.licenseImageUrl || doctor.licenseNo) {
      documents.push({
        name: doctor.licenseNo || 'license.png',
        url: doctor.licenseImageUrl || doctor.licenseNo
      });
    }
    if (doctor.degreeImageUrl || doctor.degreeNo) {
      documents.push({
        name: doctor.degreeNo || 'degree.png',
        url: doctor.degreeImageUrl || doctor.degreeNo
      });
    }
    if (doctor.documents && Array.isArray(doctor.documents)) {
      doctor.documents.forEach(doc => {
        documents.push(typeof doc === 'string' ? { name: doc, url: doc } : doc);
      });
    }

    return (
      <Modal
        title={
          <div className="detail-modal-header">
            <span className="modal-title">Chi tiết bác sĩ</span>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={() => setDetailModalVisible(false)}
              className="close-btn"
            />
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
        className="doctor-detail-modal"
      >
        <div className="doctor-detail-content">
          {/* Header with avatar, name, specialty, status */}
          <div className="doctor-detail-header">
            <Avatar size={80} src={doctor.avatar || doctor.avatarUrl} className="detail-avatar" />
            <div className="detail-header-info">
              <div className="detail-name">{doctor.name || doctor.fullName}</div>
              <div className="detail-specialty-row">
                <span className="detail-specialty">{doctor.specialty || doctor.specializationName}</span>
                {getStatusTag('pending')}
              </div>
              {doctor.submittedDate && (
                <div className="submission-date">Ngày nộp: {formatDate(doctor.submittedDate)}</div>
              )}
            </div>
          </div>

          {/* Contact and Professional Information */}
          <div className="detail-info-section">
            <Row gutter={24}>
              <Col span={12}>
                <div className="info-item">
                  <label>Email</label>
                  <div>{doctor.email || 'Chưa có'}</div>
                </div>
                <div className="info-item">
                  <label>Chuyên khoa</label>
                  <div>{doctor.specialty || doctor.specializationName || 'Chưa có'}</div>
                </div>
                <div className="info-item">
                  <label>Bệnh viện / Cơ sở</label>
                  <div>{doctor.hospital || doctor.clinicName || doctor.clinicDefaultName || 'Chưa có'}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-item">
                  <label>Điện thoại</label>
                  <div>{doctor.phone || 'Chưa có'}</div>
                </div>
                <div className="info-item">
                  <label>Kinh nghiệm</label>
                  <div>{doctor.experience || doctor.yearsExperience ? `${doctor.experience || doctor.yearsExperience} năm kinh nghiệm` : 'Chưa có'}</div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Attached Documents */}
          {documents.length > 0 && (
            <div className="detail-documents-section">
              <h4 className="section-title">Tài liệu đính kèm</h4>
              <div className="documents-list">
                {documents.map((doc, index) => {
                  const docUrl = getImageUrl(doc.url || doc.name);
                  const handleDownload = () => {
                    if (docUrl) {
                      window.open(docUrl, '_blank');
                    }
                  };
                  
                  return (
                    <div key={index} className="document-item" onClick={handleDownload}>
                      <DownloadOutlined className="download-icon" />
                      <span className="document-name">{doc.name}</span>
                      <DownloadOutlined className="download-icon" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {activeTab === 'pending' && (
            <div className="detail-action-buttons">
              <Button 
                danger 
                icon={<CloseOutlined />}
                size="large"
                className="reject-profile-btn"
                onClick={() => handleReject(doctor.id || doctor._id)}
              >
                Từ chối hồ sơ
              </Button>
              <Button 
                type="primary"
                icon={<CheckOutlined />}
                size="large"
                className="approve-profile-btn"
                onClick={() => handleApprove(doctor.id || doctor._id)}
              >
                Phê duyệt hồ sơ
              </Button>
            </div>
          )}
        </div>
      </Modal>
    );
  };

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
      label: (
        <span className="tab-label">
          <ClockCircleOutlined /> Chờ xác minh ({pendingDoctors.length})
        </span>
      ),
      children: (
        <div className="doctors-list">
          {pendingDoctors.length === 0 ? (
            <div className="empty-state">Không có bác sĩ nào chờ xác minh</div>
          ) : (
            pendingDoctors.map(doctor => renderDoctorRow(doctor, 'pending'))
          )}
        </div>
      ),
    },
    {
      key: 'verified',
      label: (
        <span className="tab-label">
          <CheckCircleOutlined /> Đã xác minh ({verifiedDoctors.length})
        </span>
      ),
      children: (
        <div className="doctors-list">
          {verifiedDoctors.length === 0 ? (
            <div className="empty-state">Không có bác sĩ nào đã xác minh</div>
          ) : (
            verifiedDoctors.map(doctor => renderDoctorRow(doctor, 'verified'))
          )}
        </div>
      ),
    },
    {
      key: 'rejected',
      label: (
        <span className="tab-label">
          <ExclamationCircleOutlined /> Đã từ chối ({rejectedDoctors.length})
        </span>
      ),
      children: (
        <div className="doctors-list">
          {rejectedDoctors.length === 0 ? (
            <div className="empty-state">Không có bác sĩ nào bị từ chối</div>
          ) : (
            rejectedDoctors.map(doctor => renderDoctorRow(doctor, 'rejected'))
          )}
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

      {renderDetailModal()}
    </div>
  );
};

export default VerifyDoctors;
