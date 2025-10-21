import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Avatar, Tag, Button, Space, Dropdown, Spin, Alert } from 'antd';
import {
  SearchOutlined,
  MoreOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { getAdminUsers, suspendUser, activateUser, deleteUser } from '../../lib/api';
import './UserManagement.scss';

const UserManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, [searchText, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (searchText) params.search = searchText;
      if (roleFilter !== 'all') params.role = roleFilter;
      
      const data = await getAdminUsers(params);
      setUsers(data.data || data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'all', label: 'Tất cả vai trò' },
    { value: 'patient', label: 'Bệnh nhân' },
    { value: 'doctor', label: 'Bác sĩ' },
    { value: 'admin', label: 'Quản trị viên' }
  ];

  const getRoleTag = (role) => {
    const roleConfig = {
      patient: { color: 'blue', text: 'Bệnh nhân' },
      doctor: { color: 'green', text: 'Bác sĩ' },
      admin: { color: 'red', text: 'Quản trị viên' }
    };
    return roleConfig[role] || { color: 'default', text: role };
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'green', text: 'Hoạt động' },
      inactive: { color: 'orange', text: 'Không hoạt động' },
      suspended: { color: 'red', text: 'Tạm khóa' }
    };
    return statusConfig[status] || { color: 'default', text: status };
  };

  const handleUserAction = async (action, userId) => {
    try {
      switch (action) {
        case 'suspend':
          await suspendUser(userId);
          break;
        case 'activate':
          await activateUser(userId);
          break;
        case 'delete':
          await deleteUser(userId);
          break;
        default:
          return;
      }
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error(`Error ${action} user:`, err);
    }
  };

  const userMenuItems = (userId, userStatus) => [
    {
      key: 'view',
      label: 'Xem chi tiết',
      onClick: () => handleUserAction('view', userId)
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      onClick: () => handleUserAction('edit', userId)
    },
    {
      key: userStatus === 'active' ? 'suspend' : 'activate',
      label: userStatus === 'active' ? 'Tạm khóa' : 'Kích hoạt',
      onClick: () => handleUserAction(userStatus === 'active' ? 'suspend' : 'activate', userId)
    },
    {
      key: 'delete',
      label: 'Xóa',
      danger: true,
      onClick: () => handleUserAction('delete', userId)
    }
  ];

  if (loading) {
    return (
      <div className="user-management">
        <div className="page-header">
          <h1>Quản lý người dùng</h1>
          <p>Xem và quản lý tất cả người dùng trong hệ thống</p>
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
      <div className="user-management">
        <div className="page-header">
          <h1>Quản lý người dùng</h1>
          <p>Xem và quản lý tất cả người dùng trong hệ thống</p>
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
    <div className="user-management">
      <div className="page-header">
        <h1>Quản lý người dùng</h1>
        <p>Xem và quản lý tất cả người dùng trong hệ thống</p>
      </div>

      <div className="search-filters">
        <Input
          placeholder="Tìm theo tên hoặc email..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        <Select
          value={roleFilter}
          onChange={setRoleFilter}
          options={roleOptions}
          className="role-select"
        />
      </div>

      <div className="results-info">
        <p>Tìm thấy {users.length} người dùng</p>
      </div>

      <div className="users-list">
        {users.map(user => {
          const roleConfig = getRoleTag(user.role);
          const statusConfig = getStatusTag(user.status);

          return (
            <Card key={user.id} className="user-card">
              <div className="user-info">
                <Avatar size={60} src={user.avatar} />
                <div className="user-details">
                  <div className="user-name">
                    <h3>{user.name}</h3>
                    <Tag color={roleConfig.color}>{roleConfig.text}</Tag>
                    <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                  </div>
                  <p className="user-email">{user.email}</p>
                  <div className="user-meta">
                    <div className="meta-item">
                      <CalendarOutlined />
                      <span>Tham gia: {user.joinDate}</span>
                    </div>
                    <div className="meta-item">
                      <UserOutlined />
                      <span>Hoạt động: {user.lastActive}</span>
                    </div>
                  </div>
                </div>
                <div className="user-actions">
                  <Dropdown
                    menu={{ items: userMenuItems(user.id, user.status) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserManagement;
