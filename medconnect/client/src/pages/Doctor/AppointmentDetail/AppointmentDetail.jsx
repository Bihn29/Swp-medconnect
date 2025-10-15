"use client";

import PropTypes from "prop-types";
import { ArrowLeft, Phone, Mail, MapPin, Paperclip } from "lucide-react";

const formatDate = (d) => {
  if (!d) return "--/--/----";
  const t = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  return isNaN(t?.getTime()) ? "--/--/----" : t.toLocaleDateString("vi-VN");
};

const getModeBadge = (mode) => {
  switch ((mode || "").toLowerCase()) {
    case "online":
      return { label: "Trực tuyến", cls: "bg-primary/10 text-primary" };
    case "offline":
    case "inperson":
    case "in-person":
      return { label: "Tại viện", cls: "bg-orange-100 text-orange-600" };
    default:
      return { label: "Không rõ", cls: "bg-gray-100 text-gray-600" };
  }
};

const getStatusBadge = (status) => {
  switch ((status || "").toLowerCase()) {
    case "confirmed":
      return { label: "Đã xác nhận", cls: "bg-green-100 text-green-600" };
    case "pending":
      return { label: "Chờ xác nhận", cls: "bg-yellow-100 text-amber-700" };
    case "cancelled":
    case "canceled":
      return { label: "Đã hủy", cls: "bg-red-100 text-red-600" };
    case "completed":
      return { label: "Hoàn tất", cls: "bg-blue-100 text-blue-600" };
    default:
      return { label: "Không rõ", cls: "bg-gray-100 text-gray-600" };
  }
};

const AppointmentDetail = ({ appointment = {}, onBack = () => {} }) => {
  const {
    mode,
    status,
    patient,
    age,
    gender,
    phone,
    email,
    address,
    date,
    time,
    type,
    reason,
    history,
    attachments,
  } = appointment || {};

  const modeBadge = getModeBadge(mode);
  const statusBadge = getStatusBadge(status);

  return (
    <div className="max-w-[1200px]">
      <button
        className="flex items-center gap-2 px-4 py-2 mb-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-colors"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft size={20} />
        Quay lại
      </button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Chi tiết lịch hẹn</h1>
        <div className="flex gap-2">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${modeBadge.cls}`}>
            {modeBadge.label}
          </span>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusBadge.cls}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Thông tin bệnh nhân */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-primary">
            Thông tin bệnh nhân
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Họ và tên:</span>
              <span className="font-semibold text-gray-900">{patient || "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tuổi:</span>
              <span className="font-semibold text-gray-900">{age != null ? `${age} tuổi` : "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Giới tính:</span>
              <span className="font-semibold text-gray-900">{gender || "—"}</span>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={18} />
              <span>{phone || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={18} />
              <span>{email || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={18} />
              <span>{address || "—"}</span>
            </div>
          </div>
        </div>

        {/* Thông tin lịch hẹn */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-primary">
            Thông tin lịch hẹn
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ngày khám:</span>
              <span className="font-semibold text-gray-900">{formatDate(date)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Giờ khám:</span>
              <span className="font-semibold text-gray-900">{time || "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Loại khám:</span>
              <span className="font-semibold text-gray-900">{type || "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hình thức:</span>
              <span className="font-semibold text-gray-900">{modeBadge.label}</span>
            </div>
          </div>
        </div>

        {/* Lý do & tài liệu */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-primary">Lý do khám</h2>
          <p className="text-gray-900 leading-relaxed mb-6">
            {reason || "—"}
          </p>

          <h3 className="text-base font-semibold text-gray-900 mb-4">Tiền sử bệnh</h3>
          <ul className="list-disc pl-6 text-gray-900 mb-6 space-y-1">
            {(Array.isArray(history) ? history : []).map((h, i) => <li key={i}>{h}</li>)}
            {!history?.length && <li>—</li>}
          </ul>

          <h3 className="text-base font-semibold text-gray-900 mb-4">Tài liệu đính kèm</h3>
          <div className="space-y-2">
            {(Array.isArray(attachments) ? attachments : []).map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg text-primary text-sm cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <Paperclip size={16} />
                <span className="truncate">{f?.name || f}</span>
              </div>
            ))}
            {!attachments?.length && <div className="text-gray-600">Không có tệp đính kèm</div>}
          </div>
        </div>
      </div>

      {/* Hành động theo trạng thái */}
      {String(status).toLowerCase() === "pending" && (
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <button
            type="button"
            className="flex-1 px-6 py-3 bg-accent hover:bg-accent/90 text-gray-900 rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            Chấp nhận lịch hẹn
          </button>
          <button
            type="button"
            className="flex-1 px-6 py-3 bg-white text-red-500 border border-red-500 rounded-lg font-medium hover:bg-red-50 transition-all"
          >
            Từ chối lịch hẹn
          </button>
        </div>
      )}

      {String(status).toLowerCase() === "confirmed" && (
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <button
            type="button"
            className="flex-1 px-6 py-3 bg-accent hover:bg-accent/90 text-gray-900 rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            Bắt đầu khám
          </button>
          <button
            type="button"
            className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            Xem hồ sơ bệnh án
          </button>
        </div>
      )}
    </div>
  );
};

AppointmentDetail.propTypes = {
  appointment: PropTypes.shape({
    mode: PropTypes.string,
    status: PropTypes.string,
    patient: PropTypes.string,
    age: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    gender: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    time: PropTypes.string,
    type: PropTypes.string,
    reason: PropTypes.string,
    history: PropTypes.arrayOf(PropTypes.string),
    attachments: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ name: PropTypes.string })])
    ),
  }),
  onBack: PropTypes.func,
};

AppointmentDetail.defaultProps = {
  appointment: {},
  onBack: () => {},
};

export default AppointmentDetail;
