import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import {
  getDoctorAppointmentsWithFallback,
  updateAppointmentStatus,
} from "../../../lib/api";
import "./AppointmentList.scss";

export default function AppointmentList() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [updatingAppointments, setUpdatingAppointments] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log("🔄 Fetching appointments from API...");
        const response = await getDoctorAppointmentsWithFallback();
        console.log("📥 API Response:", response);

        if (response.success && response.data?.appointments) {
          console.log(
            "📋 Appointments received:",
            response.data.appointments.length
          );
          console.log(
            "🔍 First appointment mode:",
            response.data.appointments[0]?.mode
          );
          setAppointments(response.data.appointments);
        } else {
          console.log("❌ No appointments found");
          setAppointments([]);
        }
      } catch (error) {
        console.error("❌ Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patientId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.patientId?.phone?.includes(searchTerm) ||
      appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    endIndex
  );

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusIcon = (status) => {
    const icons = {
      accepted: <CheckCircle className="w-4 h-4 text-white" />, // Xanh lá đậm
      pending_doctor: <Clock className="w-4 h-4 text-white" />, // Vàng
      rejected: <XCircle className="w-4 h-4 text-white" />, // Đỏ - Bác sĩ từ chối
      cancelled: <XCircle className="w-4 h-4 text-white" />, // Cam - Bệnh nhân hủy
      in_progress: <Clock className="w-4 h-4 text-white" />, // Xanh dương - Đang khám
      done: <CheckCircle className="w-4 h-4 text-white" />, // Xanh lá - Hoàn thành
      no_show: <XCircle className="w-4 h-4 text-white" />, // Xám - Không đến khám
      rescheduled: <Clock className="w-4 h-4 text-white" />, // Xanh dương - Đã dời lịch
      // Fallback for old status names
      confirmed: <CheckCircle className="w-4 h-4 text-white" />,
      pending: <Clock className="w-4 h-4 text-white" />,
      completed: <CheckCircle className="w-4 h-4 text-white" />,
    };
    return icons[status] || null;
  };

  const getStatusColor = (status) => {
    const colors = {
      accepted: "!bg-green-500 !text-white", // Xanh lá đậm - Đã chấp nhận
      pending_doctor: "!bg-purple-500 !text-white", // Tím - Chờ bác sĩ xác nhận
      rejected: "!bg-red-500 !text-white", // Đỏ - Bác sĩ từ chối
      cancelled: "!bg-orange-500 !text-white", // Cam - Bệnh nhân hủy
      in_progress: "!bg-blue-500 !text-white", // Xanh dương - Đang khám
      done: "!bg-emerald-500 !text-white", // Xanh lá - Hoàn thành
      no_show: "!bg-gray-500 !text-white", // Xám - Không đến khám
      rescheduled: "!bg-indigo-500 !text-white", // Xanh dương đậm - Đã dời lịch
      // Fallback for old status names
      confirmed: "!bg-green-500 !text-white",
      pending: "!bg-purple-500 !text-white",
      completed: "!bg-emerald-500 !text-white",
    };
    return colors[status] || "!bg-gray-500 !text-white";
  };

  const getStatusText = (status) => {
    const statusMap = {
      accepted: "Đã chấp nhận",
      pending_doctor: "Chờ bác sĩ xác nhận",
      rejected: "Bác sĩ từ chối",
      cancelled: "Bệnh nhân hủy",
      in_progress: "Đang khám",
      done: "Hoàn thành",
      no_show: "Không đến khám",
      rescheduled: "Đã dời lịch",
      // Fallback for old status names
      confirmed: "Đã xác nhận",
      pending: "Chờ xác nhận",
      completed: "Hoàn thành",
    };
    return statusMap[status] || status;
  };

  const handleAccept = async (appointment) => {
    setUpdatingAppointments((prev) => new Set(prev).add(appointment._id));
    try {
      await updateAppointmentStatus(appointment._id, "accepted");

      // Cập nhật trạng thái ngay lập tức trong UI
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt._id === appointment._id ? { ...apt, status: "accepted" } : apt
        )
      );

      alert(
        `Đã chấp nhận lịch hẹn với ${
          appointment.patientId?.fullName ||
          appointment.patient?.fullName ||
          "bệnh nhân"
        }`
      );

      // Refresh appointments list để đảm bảo đồng bộ
      setTimeout(async () => {
        try {
          const updatedAppointments = await getDoctorAppointmentsWithFallback();
          if (
            updatedAppointments.success &&
            updatedAppointments.data?.appointments
          ) {
            setAppointments(updatedAppointments.data.appointments);
          }
        } catch (error) {
          // Silent error handling
        }
      }, 1000);
    } catch (error) {
      alert("Có lỗi xảy ra khi chấp nhận lịch hẹn: " + error.message);
    } finally {
      setUpdatingAppointments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(appointment._id);
        return newSet;
      });
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailDialogOpen(true);
  };

  const handleReject = (appointment) => {
    setSelectedAppointment(appointment);
    setIsRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (rejectionReason.trim() && selectedAppointment) {
      try {
        await updateAppointmentStatus(
          selectedAppointment._id,
          "rejected",
          rejectionReason
        );

        // Cập nhật trạng thái ngay lập tức trong UI
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt._id === selectedAppointment._id
              ? { ...apt, status: "rejected", rejectReason: rejectionReason }
              : apt
          )
        );

        alert(
          `Đã từ chối lịch hẹn với ${
            selectedAppointment.patientId?.fullName ||
            selectedAppointment.patient?.fullName ||
            "bệnh nhân"
          }. Lý do: ${rejectionReason}`
        );

        setIsRejectDialogOpen(false);
        setRejectionReason("");

        // Refresh appointments list để đảm bảo đồng bộ
        setTimeout(async () => {
          try {
            const updatedAppointments =
              await getDoctorAppointmentsWithFallback();
            if (
              updatedAppointments.success &&
              updatedAppointments.data?.appointments
            ) {
              setAppointments(updatedAppointments.data.appointments);
            }
          } catch (error) {
            console.error("Error refreshing appointments:", error);
          }
        }, 1000);
      } catch (error) {
        alert("Có lỗi xảy ra khi từ chối lịch hẹn: " + error.message);
      }
    }
  };

  const handleStart = async (appointment) => {
    try {
      await updateAppointmentStatus(appointment._id, "in_progress");

      // Cập nhật trạng thái ngay lập tức trong UI
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt._id === appointment._id ? { ...apt, status: "in_progress" } : apt
        )
      );

      alert(
        `Đã bắt đầu khám cho ${
          appointment.patientId?.fullName ||
          appointment.patient?.fullName ||
          "bệnh nhân"
        }`
      );

      // Refresh appointments list để đảm bảo đồng bộ
      setTimeout(async () => {
        try {
          const updatedAppointments = await getDoctorAppointmentsWithFallback();
          if (
            updatedAppointments.success &&
            updatedAppointments.data?.appointments
          ) {
            setAppointments(updatedAppointments.data.appointments);
          }
        } catch (error) {
          // Silent error handling
        }
      }, 1000);
    } catch (error) {
      alert("Có lỗi xảy ra khi bắt đầu khám: " + error.message);
    }
  };

  const handleComplete = (appointment) => {
    console.log("🔍 handleComplete called with appointment:", appointment);
    console.log("🔍 Appointment mode:", appointment?.mode);
    console.log("🔍 Appointment status:", appointment?.status);
    console.log(
      "🔍 Full appointment object:",
      JSON.stringify(appointment, null, 2)
    );
    console.log("🔍 Current time:", new Date().toISOString());

    // Navigate to the appropriate consultation page based on mode
    if (appointment?.mode === "offline") {
      console.log(
        "✅ Navigating to OFFLINE consultation:",
        `/bac-si/kham-truc-tiep/${appointment._id}`
      );
      navigate(`/bac-si/kham-truc-tiep/${appointment._id}`);
    } else {
      console.log(
        "✅ Navigating to ONLINE consultation:",
        `/bac-si/tu-van-truc-tuyen/${appointment._id}`
      );
      navigate(`/bac-si/tu-van-truc-tuyen/${appointment._id}`);
    }
  };

  const handleNoShow = async (appointment) => {
    try {
      await updateAppointmentStatus(
        appointment._id,
        "no_show",
        "Bệnh nhân không đến khám"
      );

      // Cập nhật trạng thái ngay lập tức trong UI
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt._id === appointment._id ? { ...apt, status: "no_show" } : apt
        )
      );

      alert(
        `Đã đánh dấu ${
          appointment.patientId?.fullName ||
          appointment.patient?.fullName ||
          "bệnh nhân"
        } là không đến khám`
      );

      // Refresh appointments list để đảm bảo đồng bộ
      setTimeout(async () => {
        try {
          const updatedAppointments = await getDoctorAppointmentsWithFallback();
          if (
            updatedAppointments.success &&
            updatedAppointments.data?.appointments
          ) {
            setAppointments(updatedAppointments.data.appointments);
          }
        } catch (error) {
          // Silent error handling
        }
      }, 1000);
    } catch (error) {
      alert("Có lỗi xảy ra khi đánh dấu không đến khám: " + error.message);
    }
  };

  return (
    <Card className="appointment-list-card">
      <CardHeader className="appointment-list-header">
        <div className="appointment-list-header-content">
          <CardTitle>Danh sách lịch hẹn</CardTitle>
          <div className="appointment-list-search">
            <Search className="appointment-list-search-icon" />
            <Input
              placeholder="    Tìm kiếm ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="appointment-list-search-input"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="appointment-list-content">
        <div className="appointment-list-table-wrapper">
          <table className="appointment-list-table">
            <thead className="appointment-list-thead">
              <tr className="appointment-list-header-row">
                <th className="appointment-list-th">Bệnh nhân</th>
                <th className="appointment-list-th">Ngày & Giờ</th>
                <th className="appointment-list-th">Loại</th>
                <th className="appointment-list-th">Lý do</th>
                <th className="appointment-list-th">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="appointment-list-tbody">
              {loading ? (
                <tr>
                  <td colSpan="5" className="appointment-list-td text-center">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="appointment-list-td text-center">
                    Không có lịch hẹn nào
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((apt) => (
                  <tr key={apt._id} className="appointment-list-row">
                    <td className="appointment-list-td appointment-list-patient">
                      <span
                        className="appointment-list-patient-name"
                        onClick={() => handleViewDetails(apt)}
                        style={{ cursor: "pointer", color: "#000000" }}
                      >
                        {apt.patientId?.fullName ||
                          apt.patient?.fullName ||
                          "N/A"}
                      </span>
                    </td>
                    <td className="appointment-list-td appointment-list-datetime">
                      {new Date(apt.scheduledStart).toLocaleDateString("vi-VN")}{" "}
                      {new Date(apt.scheduledStart).toLocaleTimeString(
                        "vi-VN",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                      {apt.status === "rescheduled" && apt.rescheduledToId && (
                        <div className="text-xs text-indigo-600 mt-1">
                          → Dời đến:{" "}
                          {apt.rescheduledToId.scheduledStart
                            ? `${new Date(
                                apt.rescheduledToId.scheduledStart
                              ).toLocaleDateString("vi-VN")} ${new Date(
                                apt.rescheduledToId.scheduledStart
                              ).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`
                            : "Đang cập nhật..."}
                        </div>
                      )}
                    </td>
                    <td className="appointment-list-td">
                      <Badge variant="outline">
                        {apt.mode === "online" ? "Trực tuyến" : "Trực tiếp"}
                      </Badge>
                    </td>
                    <td className="appointment-list-td appointment-list-reason">
                      {apt.notes || apt.reason || "N/A"}
                    </td>
                    <td className="appointment-list-td appointment-list-actions">
                      <div className="appointment-list-status-info">
                        <Badge
                          className={getStatusColor(apt.status)}
                          data-status={apt.status}
                        >
                          <span className="appointment-list-status">
                            {getStatusIcon(apt.status)}
                            {getStatusText(apt.status)}
                          </span>
                        </Badge>
                      </div>
                      <div className="appointment-list-status-actions">
                        {apt.status === "pending_doctor" && (
                          <>
                            <Button
                              size="sm"
                              className="appointment-list-accept-btn"
                              onClick={() => handleAccept(apt)}
                              disabled={updatingAppointments.has(apt._id)}
                            >
                              {updatingAppointments.has(apt._id)
                                ? "Đang xử lý..."
                                : "Chấp nhận"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(apt)}
                              disabled={updatingAppointments.has(apt._id)}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                        {apt.status === "accepted" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleStart(apt)}
                              disabled={updatingAppointments.has(apt._id)}
                            >
                              {updatingAppointments.has(apt._id)
                                ? "Đang xử lý..."
                                : "Bắt đầu khám"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleNoShow(apt)}
                              disabled={updatingAppointments.has(apt._id)}
                            >
                              {updatingAppointments.has(apt._id)
                                ? "Đang xử lý..."
                                : "Không đến khám"}
                            </Button>
                          </>
                        )}
                        {apt.status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleComplete(apt)}
                            disabled={updatingAppointments.has(apt._id)}
                          >
                            {updatingAppointments.has(apt._id)
                              ? "Đang xử lý..."
                              : "Hoàn thành"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAppointments.length > 0 && (
          <div className="appointment-list-pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            <span className="pagination-info">
              Trang {currentPage} / {totalPages} ({filteredAppointments.length}{" "}
              lịch hẹn)
            </span>
            <button
              className="pagination-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        )}
      </CardContent>

      {/* Appointment Detail Dialog */}
      {isDetailDialogOpen && (
        <div
          className="appointment-detail-dialog-overlay"
          onClick={() => setIsDetailDialogOpen(false)}
        >
          <div
            className="appointment-detail-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="appointment-detail-dialog-header">
              <h3 className="appointment-detail-dialog-title">
                Chi tiết lịch hẹn
              </h3>
              <button
                className="appointment-detail-dialog-close"
                onClick={() => setIsDetailDialogOpen(false)}
              >
                ×
              </button>
            </div>
            {selectedAppointment && (
              <>
                <div className="appointment-detail">
                  <div className="appointment-detail-item">
                    <p className="appointment-detail-label">Bệnh nhân</p>
                    <p className="appointment-detail-value">
                      {selectedAppointment.patientId?.fullName ||
                        selectedAppointment.patient?.fullName ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="appointment-detail-item">
                    <p className="appointment-detail-label">Số điện thoại</p>
                    <p className="appointment-detail-value">
                      {selectedAppointment.patientId?.phone ||
                        selectedAppointment.patient?.phone ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="appointment-detail-item">
                    <p className="appointment-detail-label">Email</p>
                    <p className="appointment-detail-value">
                      {selectedAppointment.patientId?.email ||
                        selectedAppointment.patient?.email ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="appointment-detail-item">
                    <p className="appointment-detail-label">Ngày sinh</p>
                    <p className="appointment-detail-value">
                      {selectedAppointment.patientId?.dob
                        ? new Date(
                            selectedAppointment.patientId.dob
                          ).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </p>
                  </div>
                  <div className="appointment-detail-item">
                    <p className="appointment-detail-label">Giới tính</p>
                    <p className="appointment-detail-value">
                      {selectedAppointment.patientId?.gender ||
                        selectedAppointment.patient?.gender ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="appointment-detail-item">
                    <p className="appointment-detail-label">Ngày & Giờ hẹn</p>
                    <p className="appointment-detail-value">
                      {new Date(
                        selectedAppointment.scheduledStart
                      ).toLocaleDateString("vi-VN")}{" "}
                      {new Date(
                        selectedAppointment.scheduledStart
                      ).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {selectedAppointment.status === "rescheduled" &&
                        selectedAppointment.rescheduledToId && (
                          <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded">
                            <strong className="text-indigo-700">
                              Lịch mới:
                            </strong>{" "}
                            {selectedAppointment.rescheduledToId.scheduledStart
                              ? `${new Date(
                                  selectedAppointment.rescheduledToId.scheduledStart
                                ).toLocaleDateString("vi-VN")} ${new Date(
                                  selectedAppointment.rescheduledToId.scheduledStart
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`
                              : "Đang cập nhật..."}
                          </div>
                        )}
                    </p>
                  </div>
                  <div className="appointment-detail-item">
                    <p className="appointment-detail-label">Loại khám</p>
                    <p className="appointment-detail-value">
                      {selectedAppointment.appointmentType || "Trực tiếp"}
                    </p>
                  </div>
                  <div className="appointment-detail-item">
                    <p className="appointment-detail-label">Lý do khám</p>
                    <p className="appointment-detail-value">
                      {selectedAppointment.notes ||
                        selectedAppointment.reason ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="appointment-detail-item">
                    <p className="appointment-detail-label">
                      Trạng thái hiện tại
                    </p>
                    <Badge
                      className={getStatusColor(selectedAppointment.status)}
                    >
                      <span className="appointment-list-status">
                        {getStatusIcon(selectedAppointment.status)}
                        {getStatusText(selectedAppointment.status)}
                      </span>
                    </Badge>
                  </div>

                  {/* Thay đổi trạng thái */}
                  <div className="appointment-detail-actions">
                    <h4>Thay đổi trạng thái</h4>
                    <div className="appointment-status-buttons">
                      {selectedAppointment.status === "pending_doctor" && (
                        <>
                          <Button
                            size="sm"
                            className="appointment-list-accept-btn"
                            onClick={() => {
                              handleAccept(selectedAppointment);
                              setIsDetailDialogOpen(false);
                            }}
                          >
                            Chấp nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              handleReject(selectedAppointment);
                              setIsDetailDialogOpen(false);
                            }}
                          >
                            Từ chối
                          </Button>
                        </>
                      )}
                      {selectedAppointment.status === "accepted" && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              try {
                                await updateAppointmentStatus(
                                  selectedAppointment._id,
                                  "in_progress"
                                );
                                alert("Đã bắt đầu khám bệnh");
                                setIsDetailDialogOpen(false);
                                // Refresh appointments
                                const updatedAppointments =
                                  await getDoctorAppointmentsWithFallback();
                                if (
                                  updatedAppointments.success &&
                                  updatedAppointments.data?.appointments
                                ) {
                                  setAppointments(
                                    updatedAppointments.data.appointments
                                  );
                                }
                              } catch (error) {
                                alert("Có lỗi xảy ra: " + error.message);
                              }
                            }}
                          >
                            Bắt đầu khám
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              try {
                                await updateAppointmentStatus(
                                  selectedAppointment._id,
                                  "no_show",
                                  "Bệnh nhân không đến khám"
                                );
                                alert("Đã đánh dấu bệnh nhân không đến khám");
                                setIsDetailDialogOpen(false);
                                // Refresh appointments
                                const updatedAppointments =
                                  await getDoctorAppointmentsWithFallback();
                                if (
                                  updatedAppointments.success &&
                                  updatedAppointments.data?.appointments
                                ) {
                                  setAppointments(
                                    updatedAppointments.data.appointments
                                  );
                                }
                              } catch (error) {
                                alert("Có lỗi xảy ra: " + error.message);
                              }
                            }}
                          >
                            Không đến khám
                          </Button>
                        </>
                      )}
                      {selectedAppointment.status === "in_progress" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            try {
                              await updateAppointmentStatus(
                                selectedAppointment._id,
                                "done"
                              );
                              alert("Đã hoàn thành khám bệnh");
                              setIsDetailDialogOpen(false);
                              // Refresh appointments
                              const updatedAppointments =
                                await getDoctorAppointmentsWithFallback();
                              if (
                                updatedAppointments.success &&
                                updatedAppointments.data?.appointments
                              ) {
                                setAppointments(
                                  updatedAppointments.data.appointments
                                );
                              }
                            } catch (error) {
                              alert("Có lỗi xảy ra: " + error.message);
                            }
                          }}
                        >
                          Hoàn thành khám
                        </Button>
                      )}
                      {selectedAppointment.status === "done" && (
                        <p className="text-green-600 text-sm">
                          Lịch hẹn đã hoàn thành
                        </p>
                      )}
                      {selectedAppointment.status === "rejected" && (
                        <p className="text-red-600 text-sm">
                          Bác sĩ đã từ chối lịch hẹn
                        </p>
                      )}
                      {selectedAppointment.status === "no_show" && (
                        <p className="text-gray-600 text-sm">
                          Bệnh nhân không đến khám
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="appointment-detail-dialog-footer">
                  <Button onClick={() => setIsDetailDialogOpen(false)}>
                    Đóng
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reject Appointment Dialog */}
      {isRejectDialogOpen && (
        <div
          className="appointment-reject-dialog-overlay"
          onClick={() => setIsRejectDialogOpen(false)}
        >
          <div
            className="appointment-reject-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="appointment-reject-dialog-header">
              <h3 className="appointment-reject-dialog-title">
                Từ chối lịch hẹn
              </h3>
              <button
                className="appointment-reject-dialog-close"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="appointment-reject">
              <div className="appointment-reject-item">
                <p className="appointment-reject-label">Bệnh nhân</p>
                <p className="appointment-reject-value">
                  {selectedAppointment?.patientId?.fullName ||
                    selectedAppointment?.patient?.fullName ||
                    "N/A"}
                </p>
              </div>
              <div className="appointment-reject-field">
                <label className="appointment-reject-field-label">
                  Lý do từ chối (bắt buộc)
                </label>
                <textarea
                  placeholder="Nhập lý do từ chối..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="appointment-reject-field-input"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    minHeight: "100px",
                  }}
                />
              </div>
              <div className="appointment-reject-actions">
                <Button
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(false)}
                  className="appointment-reject-cancel"
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmReject}
                  disabled={
                    !rejectionReason.trim() ||
                    updatingAppointments.has(selectedAppointment?._id)
                  }
                  className="appointment-reject-confirm"
                >
                  {updatingAppointments.has(selectedAppointment?._id)
                    ? "Đang từ chối..."
                    : "Xác nhận từ chối"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
