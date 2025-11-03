import React, { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Input";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import "./ServicePriceManagement.scss";

export default function ServicePriceManagement() {
  const [servicePrices, setServicePrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: "",
    price: "",
  });
  const [filterActive, setFilterActive] = useState("all"); // all, active, inactive

  useEffect(() => {
    loadServicePrices();
  }, [filterActive]);

  const loadServicePrices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterActive !== "all") {
        params.append("isActive", filterActive === "active" ? "true" : "false");
      }

      const response = await api.get(
        `/api/managers/service-prices?${params.toString()}`
      );

      if (response.success) {
        setServicePrices(response.data.servicePrices || []);
      } else {
        alert("Không thể tải danh sách giá dịch vụ");
      }
    } catch (error) {
      console.error("Error loading service prices:", error);
      alert("Có lỗi xảy ra khi tải danh sách giá dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ serviceName: "", price: "" });
    setSelectedService(null);
    setShowAddDialog(true);
  };

  const handleEdit = (service) => {
    setFormData({
      serviceName: service.serviceName,
      price: service.price.toString(),
    });
    setSelectedService(service);
    setShowEditDialog(true);
  };

  const handleDelete = (service) => {
    setSelectedService(service);
    setShowDeleteDialog(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    if (!formData.serviceName.trim()) {
      alert("Vui lòng nhập tên dịch vụ");
      return;
    }

    if (!formData.price || isNaN(formData.price) || parseInt(formData.price) < 0) {
      alert("Vui lòng nhập giá hợp lệ (số nguyên dương)");
      return;
    }

    try {
      const response = await api.post("/api/managers/service-prices", {
        serviceName: formData.serviceName.trim(),
        price: parseInt(formData.price),
      });

      if (response.success) {
        alert("Thêm dịch vụ thành công");
        setShowAddDialog(false);
        loadServicePrices();
      } else {
        alert(response.message || "Không thể thêm dịch vụ");
      }
    } catch (error) {
      console.error("Error adding service price:", error);
      alert("Có lỗi xảy ra khi thêm dịch vụ");
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    if (!formData.serviceName.trim()) {
      alert("Vui lòng nhập tên dịch vụ");
      return;
    }

    if (!formData.price || isNaN(formData.price) || parseInt(formData.price) < 0) {
      alert("Vui lòng nhập giá hợp lệ (số nguyên dương)");
      return;
    }

    try {
      const response = await api.put(
        `/api/managers/service-prices/${selectedService._id}`,
        {
          serviceName: formData.serviceName.trim(),
          price: parseInt(formData.price),
        }
      );

      if (response.success) {
        alert("Cập nhật dịch vụ thành công");
        setShowEditDialog(false);
        setSelectedService(null);
        loadServicePrices();
      } else {
        alert(response.message || "Không thể cập nhật dịch vụ");
      }
    } catch (error) {
      console.error("Error updating service price:", error);
      alert("Có lỗi xảy ra khi cập nhật dịch vụ");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await api.delete(
        `/api/managers/service-prices/${selectedService._id}`
      );

      if (response.success) {
        alert("Xóa dịch vụ thành công");
        setShowDeleteDialog(false);
        setSelectedService(null);
        loadServicePrices();
      } else {
        alert(response.message || "Không thể xóa dịch vụ");
      }
    } catch (error) {
      console.error("Error deleting service price:", error);
      alert("Có lỗi xảy ra khi xóa dịch vụ");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="service-price-management">
      <div className="service-price-management-header">
        <h1>Quản lý giá dịch vụ</h1>
        <Button onClick={handleAdd} className="btn-add">
          <Plus className="icon" />
          Thêm dịch vụ
        </Button>
      </div>

      <div className="service-price-management-filters">
        <div className="filter-buttons">
          <Button
            variant={filterActive === "all" ? "primary" : "outline"}
            onClick={() => setFilterActive("all")}
          >
            Tất cả
          </Button>
          <Button
            variant={filterActive === "active" ? "primary" : "outline"}
            onClick={() => setFilterActive("active")}
          >
            Đang hoạt động
          </Button>
          <Button
            variant={filterActive === "inactive" ? "primary" : "outline"}
            onClick={() => setFilterActive("inactive")}
          >
            Đã tắt
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : servicePrices.length === 0 ? (
        <div className="empty-state">
          Chưa có dịch vụ nào. Hãy thêm dịch vụ mới.
        </div>
      ) : (
        <div className="service-price-management-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên dịch vụ</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {servicePrices.map((service, index) => (
                <tr key={service._id}>
                  <td>{index + 1}</td>
                  <td>{service.serviceName}</td>
                  <td>{formatPrice(service.price)}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        service.isActive ? "active" : "inactive"
                      }`}
                    >
                      {service.isActive ? "Đang hoạt động" : "Đã tắt"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="icon" />
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(service)}
                        className="btn-delete"
                      >
                        <Trash2 className="icon" />
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm dịch vụ mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="form-group">
              <label>Tên dịch vụ *</label>
              <Input
                value={formData.serviceName}
                onChange={(e) =>
                  setFormData({ ...formData, serviceName: e.target.value })
                }
                placeholder="Nhập tên dịch vụ"
                required
              />
            </div>
            <div className="form-group">
              <label>Giá (VND) *</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="Nhập giá dịch vụ"
                min="0"
                required
              />
            </div>
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Thêm</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa dịch vụ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="form-group">
              <label>Tên dịch vụ *</label>
              <Input
                value={formData.serviceName}
                onChange={(e) =>
                  setFormData({ ...formData, serviceName: e.target.value })
                }
                placeholder="Nhập tên dịch vụ"
                required
              />
            </div>
            <div className="form-group">
              <label>Giá (VND) *</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="Nhập giá dịch vụ"
                min="0"
                required
              />
            </div>
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setSelectedService(null);
                }}
              >
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p>
            Bạn có chắc chắn muốn xóa dịch vụ "{selectedService?.serviceName}"?
            (Dịch vụ sẽ được ẩn khỏi danh sách)
          </p>
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedService(null);
              }}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              className="btn-delete"
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
