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
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Calendar,
  SortAsc,
  SortDesc,
  CheckSquare,
} from "lucide-react";
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
  const itemsPerPage = 1000; // Hiển thị tất cả appointments

  // Filter and sort states
  const [filters, setFilters] = useState({
    status: "all",
    mode: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [sortBy, setSortBy] = useState("scheduledStart");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Fetch all appointments without pagination limit
        const response = await getDoctorAppointmentsWithFallback({
          limit: 1000,
        });

        if (response.success && response.data?.appointments) {
          console.log("📋 Appointments data:", response.data.appointments);
          console.log(
            "📋 First appointment mode:",
            response.data.appointments[0]?.mode
          );
          setAppointments(response.data.appointments);
        } else {
          console.log("❌ No appointments found");
          setAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Filter and sort appointments
  const filteredAppointments = appointments
    .filter((appointment) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        appointment.patientId?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.patientId?.phone?.includes(searchTerm) ||
        appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        filters.status === "all" || appointment.status === filters.status;

      // Mode filter
      const matchesMode =
        filters.mode === "all" || appointment.mode === filters.mode;

      // Date filter
      let matchesDate = true;
      if (filters.dateFrom) {
        const appointmentDate = new Date(appointment.scheduledStart);
        const fromDate = new Date(filters.dateFrom);
        matchesDate = matchesDate && appointmentDate >= fromDate;
      }
      if (filters.dateTo) {
        const appointmentDate = new Date(appointment.scheduledStart);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        matchesDate = matchesDate && appointmentDate <= toDate;
      }

      return matchesSearch && matchesStatus && matchesMode && matchesDate;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "scheduledStart":
          aValue = new Date(a.scheduledStart);
          bValue = new Date(b.scheduledStart);
          break;
        case "patientName":
          aValue = a.patientId?.fullName || a.patient?.fullName || "";
          bValue = b.patientId?.fullName || b.patient?.fullName || "";
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.scheduledStart);
          bValue = new Date(b.scheduledStart);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  console.log("📊 Appointments debug:");
  console.log("- Total appointments:", appointments.length);
  console.log("- Filtered appointments:", filteredAppointments.length);

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
      pending_doctor: "Chờ xác nhận",
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
          const updatedAppointments = await getDoctorAppointmentsWithFallback({
            limit: 1000,
          });
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
            const updatedAppointments = await getDoctorAppointmentsWithFallback(
              { limit: 1000 }
            );
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
          const updatedAppointments = await getDoctorAppointmentsWithFallback({
            limit: 1000,
          });
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
          const updatedAppointments = await getDoctorAppointmentsWithFallback({
            limit: 1000,
          });
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

  // Accept all pending appointments
  const handleAcceptAll = async () => {
    const pendingAppointments = appointments.filter(
      (apt) => apt.status === "pending_doctor"
    );

    if (pendingAppointments.length === 0) {
      alert("Không có lịch hẹn nào đang chờ xác nhận");
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn chấp nhận tất cả ${pendingAppointments.length} lịch hẹn đang chờ xác nhận?`
    );
    if (!confirmed) return;

    try {
      // Add all pending appointment IDs to updating set
      setUpdatingAppointments(
        (prev) =>
          new Set([...prev, ...pendingAppointments.map((apt) => apt._id)])
      );

      // Update all appointments
      const updatePromises = pendingAppointments.map((appointment) =>
        updateAppointmentStatus(appointment._id, "accepted")
      );

      await Promise.all(updatePromises);

      // Update UI immediately
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt.status === "pending_doctor" ? { ...apt, status: "accepted" } : apt
        )
      );

      alert(`Đã chấp nhận ${pendingAppointments.length} lịch hẹn`);

      // Refresh appointments list
      setTimeout(async () => {
        try {
          const updatedAppointments = await getDoctorAppointmentsWithFallback({
            limit: 1000,
          });
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
      alert("Có lỗi xảy ra khi chấp nhận toàn bộ lịch hẹn: " + error.message);
    } finally {
      // Clear updating state
      setUpdatingAppointments((prev) => {
        const newSet = new Set(prev);
        pendingAppointments.forEach((apt) => newSet.delete(apt._id));
        return newSet;
      });
    }
  };

  return (
    <Card className="appointment-list-card">
      <CardHeader className="appointment-list-header">
        <div className="appointment-list-header-content">
          <CardTitle>Danh sách lịch hẹn</CardTitle>
          <div className="appointment-list-controls">
            <div className="appointment-list-search">
              <Search className="appointment-list-search-icon" />
              <Input
                placeholder="    Tìm kiếm ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="appointment-list-search-input"
              />
            </div>
            <div className="appointment-list-control-buttons">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="appointment-list-filter-btn"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="appointment-list-accept-all-btn"
                disabled={
                  appointments.filter((apt) => apt.status === "pending_doctor")
                    .length === 0
                }
              >
                <CheckSquare className="w-4 h-4" />
                Chấp nhận toàn bộ
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="appointment-list-filter-panel">
            <div className="appointment-list-filter-row">
              <div className="appointment-list-filter-group">
                <label>Trạng thái:</label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="appointment-list-filter-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="pending_doctor">Chờ xác nhận</option>
                  <option value="accepted">Đã chấp nhận</option>
                  <option value="in_progress">Đang khám</option>
                  <option value="done">Hoàn thành</option>
                  <option value="rejected">Từ chối</option>
                  <option value="cancelled">Hủy</option>
                  <option value="no_show">Không đến khám</option>
                </select>
              </div>

              <div className="appointment-list-filter-group">
                <label>Loại khám:</label>
                <select
                  value={filters.mode}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, mode: e.target.value }))
                  }
                  className="appointment-list-filter-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="online">Trực tuyến</option>
                  <option value="offline">Trực tiếp</option>
                </select>
              </div>

              <div className="appointment-list-filter-group">
                <label>Từ ngày:</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: e.target.value,
                    }))
                  }
                  className="appointment-list-filter-input"
                />
              </div>

              <div className="appointment-list-filter-group">
                <label>Đến ngày:</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                  className="appointment-list-filter-input"
                />
              </div>
            </div>

            <div className="appointment-list-sort-row">
              <div className="appointment-list-sort-group">
                <label>Sắp xếp theo:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appointment-list-filter-select"
                >
                  <option value="scheduledStart">Ngày giờ</option>
                  <option value="patientName">Tên bệnh nhân</option>
                  <option value="status">Trạng thái</option>
                </select>
              </div>

              <div className="appointment-list-sort-group">
                <label>Thứ tự:</label>
                <Button
                  variant="outline"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="appointment-list-sort-btn"
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                  {sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    status: "all",
                    mode: "all",
                    dateFrom: "",
                    dateTo: "",
                  });
                  setSortBy("scheduledStart");
                  setSortOrder("desc");
                }}
                className="appointment-list-reset-btn"
              >
                Đặt lại
              </Button>
            </div>
          </div>
        )}
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
                <th className="appointment-list-th">Hành động</th>
              </tr>
            </thead>
            <tbody className="appointment-list-tbody">
              {loading ? (
                <tr>
                  <td colSpan="6" className="appointment-list-td text-center">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="appointment-list-td text-center">
                    Không có lịch hẹn nào
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
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
                        {apt.mode === "online"
                          ? "Trực tuyến"
                          : apt.mode === "offline"
                          ? "Trực tiếp"
                          : apt.mode || "Không xác định"}
                      </Badge>
                    </td>
                    <td className="appointment-list-td appointment-list-reason">
                      {apt.notes || apt.reason || "N/A"}
                    </td>
                    <td className="appointment-list-td appointment-list-status">
                      <Badge
                        className={getStatusColor(apt.status)}
                        data-status={apt.status}
                      >
                        <span className="appointment-list-status">
                          {getStatusIcon(apt.status)}
                          {getStatusText(apt.status)}
                        </span>
                      </Badge>
                    </td>
                    <td className="appointment-list-td appointment-list-actions">
                      <div className="appointment-list-action-buttons">
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
                        {(apt.status === "done" ||
                          apt.status === "rejected" ||
                          apt.status === "cancelled" ||
                          apt.status === "no_show") && (
                          <span className="appointment-list-no-action">-</span>
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
            <div className="pagination-info">
              Hiển thị tất cả {filteredAppointments.length} lịch hẹn
            </div>
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
                        selectedAppointment.patientId?.userId?.email ||
                        selectedAppointment.patient?.email ||
                        selectedAppointment.patient?.user?.email ||
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
                                  await getDoctorAppointmentsWithFallback({
                                    limit: 1000,
                                  });
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
                                  await getDoctorAppointmentsWithFallback({
                                    limit: 1000,
                                  });
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
                          onClick={() => {
                            setIsDetailDialogOpen(false);
                            handleComplete(selectedAppointment);
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
