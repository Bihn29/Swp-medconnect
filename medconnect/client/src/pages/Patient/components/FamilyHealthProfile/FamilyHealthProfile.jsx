import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Calendar,
  User,
  Eye,
  FileDown,
  MessageCircle,
  Video,
  X,
  Users,
  ChevronDown,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { useMultipleFamilyConsultationSummaries } from "../../../../hooks/useMultipleFamilyConsultationSummaries";
import { useMultipleFamilyConsultationAdvice } from "../../../../hooks/useMultipleFamilyConsultationAdvice";
import { getFamilyMembers, deleteFamilyMember } from "../../../../lib/api";
import { api } from "../../../../lib/api";
import { DatePicker } from "antd";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
import "./FamilyHealthProfile.scss";

export function FamilyHealthProfile() {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [activeButton, setActiveButton] = useState(null);
  const [activeTab, setActiveTab] = useState("medical");
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [selectedAdvice, setSelectedAdvice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalType, setModalType] = useState("summary");
  const [showSelector, setShowSelector] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState(""); // Filter by doctor name
  const [specializations, setSpecializations] = useState([]); // For specialization filter
  const [showFilters, setShowFilters] = useState(false); // Show/hide advanced filters
  const [selectedSpecialization, setSelectedSpecialization] = useState(""); // Filter by specialization
  const [selectedDateRange, setSelectedDateRange] = useState(""); // Filter by date range (preset)
  const [customDateRange, setCustomDateRange] = useState(null); // Filter by custom date range [from, to]
  const [selectedConsultationType, setSelectedConsultationType] = useState(""); // Filter by consultation type (Video Call, Message)

  // Fetch family members on component mount
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        setIsLoadingMembers(true);
        const response = await getFamilyMembers();
        const members = response.data?.familyMembers || [];

        // Filter out "self" (chỉ hiển thị người thân, không hiển thị bản thân)
        const familyOnly = members.filter(
          (member) => member.relationshipToOwner !== "self"
        );

        // Deduplicate: Chỉ giữ lại 1 bản ghi duy nhất cho mỗi người thân (theo fullName + relationshipToOwner)
        // Ưu tiên giữ bản ghi mới nhất (theo createdAt hoặc _id)
        const uniqueMap = new Map();
        familyOnly.forEach((member) => {
          const key = `${member.fullName}_${member.relationshipToOwner}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, member);
          } else {
            // Nếu đã có, so sánh để giữ bản ghi mới nhất (có _id lớn hơn hoặc createdAt mới hơn)
            const existing = uniqueMap.get(key);
            const existingId = existing._id?.toString() || "";
            const currentId = member._id?.toString() || "";
            // Giữ bản ghi có _id lớn hơn (thường là mới hơn trong MongoDB)
            if (currentId > existingId) {
              uniqueMap.set(key, member);
            }
          }
        });

        // Group all Patient records by fullName + relationshipToOwner
        // Mỗi group đại diện cho một người thân (có thể có nhiều Patient records)
        const groupedMap = new Map();
        familyOnly.forEach((member) => {
          const key = `${member.fullName}_${member.relationshipToOwner}`;
          if (!groupedMap.has(key)) {
            groupedMap.set(key, {
              _id: member._id, // Giữ ID đầu tiên làm ID chính
              fullName: member.fullName,
              dob: member.dob,
              gender: member.gender,
              relationshipToOwner: member.relationshipToOwner,
              phone: member.phone,
              avatarUrl: member.avatarUrl,
              // Lưu tất cả Patient IDs của người này để fetch tất cả lịch sử
              allPatientIds: [member._id.toString()],
            });
          } else {
            // Thêm Patient ID vào danh sách nếu chưa có
            const existing = groupedMap.get(key);
            const memberId = member._id.toString();
            if (!existing.allPatientIds.includes(memberId)) {
              existing.allPatientIds.push(memberId);
            }
            // Giữ bản ghi mới nhất (có _id lớn hơn) làm bản ghi chính
            const existingId = existing._id?.toString() || "";
            const currentId = member._id?.toString() || "";
            if (currentId > existingId) {
              existing._id = member._id;
              existing.dob = member.dob;
              existing.gender = member.gender;
              existing.phone = member.phone;
              existing.avatarUrl = member.avatarUrl;
            }
          }
        });

        const uniqueFamilyMembers = Array.from(groupedMap.values());
        // Sort by relationship order: father, mother, spouse, child, grandparent, other
        const relationshipOrder = {
          father: 1,
          mother: 2,
          spouse: 3,
          child: 4,
          grandparent: 5,
          other: 6,
        };
        uniqueFamilyMembers.sort((a, b) => {
          const orderA = relationshipOrder[a.relationshipToOwner] || 99;
          const orderB = relationshipOrder[b.relationshipToOwner] || 99;
          return orderA - orderB;
        });

        setFamilyMembers(uniqueFamilyMembers);

        // Auto-select first family member if available
        if (uniqueFamilyMembers.length > 0 && !selectedPatientId) {
          setSelectedPatientId(uniqueFamilyMembers[0]._id);
        }
      } catch (error) {
        console.error("Error fetching family members:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchFamilyMembers();
  }, []);

  // Refresh family members after deletion
  const refreshFamilyMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const response = await getFamilyMembers();
      const members = response.data?.familyMembers || [];
      const familyOnly = members.filter(
        (member) => member.relationshipToOwner !== "self"
      );

      const groupedMap = new Map();
      familyOnly.forEach((member) => {
        const key = `${member.fullName}_${member.relationshipToOwner}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            _id: member._id,
            fullName: member.fullName,
            dob: member.dob,
            gender: member.gender,
            relationshipToOwner: member.relationshipToOwner,
            phone: member.phone,
            avatarUrl: member.avatarUrl,
            allPatientIds: [member._id.toString()],
          });
        } else {
          const existing = groupedMap.get(key);
          const memberId = member._id.toString();
          if (!existing.allPatientIds.includes(memberId)) {
            existing.allPatientIds.push(memberId);
          }
          const existingId = existing._id?.toString() || "";
          const currentId = member._id?.toString() || "";
          if (currentId > existingId) {
            existing._id = member._id;
            existing.dob = member.dob;
            existing.gender = member.gender;
            existing.phone = member.phone;
            existing.avatarUrl = member.avatarUrl;
          }
        }
      });

      const uniqueFamilyMembers = Array.from(groupedMap.values());
      const relationshipOrder = {
        father: 1,
        mother: 2,
        spouse: 3,
        child: 4,
        grandparent: 5,
        other: 6,
      };
      uniqueFamilyMembers.sort((a, b) => {
        const orderA = relationshipOrder[a.relationshipToOwner] || 99;
        const orderB = relationshipOrder[b.relationshipToOwner] || 99;
        return orderA - orderB;
      });

      setFamilyMembers(uniqueFamilyMembers);
      if (uniqueFamilyMembers.length > 0 && !selectedPatientId) {
        setSelectedPatientId(uniqueFamilyMembers[0]._id);
      }
    } catch (error) {
      console.error("Error refreshing family members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Fetch specializations for filter
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await api.get("/api/specializations");
        if (response.data && Array.isArray(response.data)) {
          setSpecializations(response.data);
        }
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };
    fetchSpecializations();
  }, []);

  // Reset all filters when selected family member changes
  useEffect(() => {
    setDoctorSearch("");
    setSelectedSpecialization("");
    setSelectedDateRange("");
    setCustomDateRange(null);
    setSelectedConsultationType("");
  }, [selectedPatientId]);

  // Get selected member and all their Patient IDs
  const selectedMember = familyMembers.find(
    (member) => member._id === selectedPatientId
  );
  const allPatientIds = selectedMember?.allPatientIds || [];

  // Fetch consultation summaries for ALL Patient IDs of selected family member
  const {
    consultationSummaries: allSummariesData,
    isLoading,
    error,
  } = useMultipleFamilyConsultationSummaries(allPatientIds, 1, 1000);
  const allMedicalHistory = allSummariesData || [];

  // Fetch consultation advice for ALL Patient IDs of selected family member
  const {
    consultationAdvice: allAdviceData,
    isLoading: isLoadingAdvice,
    error: errorAdvice,
  } = useMultipleFamilyConsultationAdvice(allPatientIds, 1, 1000);
  const allConsultationHistory = allAdviceData || [];

  // Apply all filters to medical history
  const medicalHistory = useMemo(() => {
    let filtered = allMedicalHistory;

    // Filter by doctor name
    if (doctorSearch.trim()) {
      const searchLower = doctorSearch.toLowerCase().trim();
      filtered = filtered.filter((record) => {
        const doctorName = record.doctor?.toLowerCase() || "";
        return doctorName.includes(searchLower);
      });
    }

    // Filter by specialization
    if (selectedSpecialization) {
      filtered = filtered.filter((record) => {
        const recordSpecialty = record.specialty?.toLowerCase() || "";
        const spec = specializations.find(
          (s) => s._id === selectedSpecialization
        );
        return spec && recordSpecialty.includes(spec.name.toLowerCase());
      });
    }

    // Filter by custom date range (priority over preset)
    if (customDateRange && customDateRange.length === 2) {
      const [startDate, endDate] = customDateRange;
      const rangeStart = dayjs(startDate).startOf("day").toDate();
      const rangeEnd = dayjs(endDate).endOf("day").toDate();

      filtered = filtered.filter((record) => {
        // Try multiple date sources with fallbacks
        let dateSource =
          record.fullDetails?.visitDate ||
          record.visitDate ||
          record.appointmentId?.scheduledStart ||
          record.dateTime ||
          record.fullDetails?.startedAt ||
          record.date;

        if (!dateSource) {
          return false;
        }

        // Parse date
        let recordDate;
        if (typeof dateSource === "string" && dateSource.includes("/")) {
          const parts = dateSource.split("/");
          if (parts.length === 3) {
            recordDate = new Date(
              parseInt(parts[2]),
              parseInt(parts[1]) - 1,
              parseInt(parts[0])
            );
          } else {
            recordDate = new Date(dateSource);
          }
        } else {
          recordDate = new Date(dateSource);
        }

        if (!recordDate || isNaN(recordDate.getTime())) {
          return false;
        }

        return recordDate >= rangeStart && recordDate <= rangeEnd;
      });
    }
    // Filter by preset date range (if no custom range)
    else if (selectedDateRange) {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);
      todayEnd.setHours(0, 0, 0, 0);

      // Tuần này: Từ thứ 2 đầu tuần (day 1 = Monday)
      const weekStart = new Date(todayStart);
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Nếu là CN thì lùi 6 ngày, nếu không thì lùi (dayOfWeek - 1) ngày
      weekStart.setDate(weekStart.getDate() - daysToMonday);
      weekStart.setHours(0, 0, 0, 0);

      // Tháng này: Từ ngày 1 của tháng hiện tại
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);

      // Năm nay: Từ ngày 1/1 của năm hiện tại
      const yearStart = new Date(now.getFullYear(), 0, 1);
      yearStart.setHours(0, 0, 0, 0);

      filtered = filtered.filter((record) => {
        // Try multiple date sources with fallbacks
        let dateSource =
          record.fullDetails?.visitDate ||
          record.visitDate ||
          record.appointmentId?.scheduledStart ||
          record.dateTime ||
          record.fullDetails?.startedAt ||
          record.date;

        if (!dateSource) {
          return false;
        }

        // Parse date
        let recordDate;
        if (typeof dateSource === "string" && dateSource.includes("/")) {
          const parts = dateSource.split("/");
          if (parts.length === 3) {
            recordDate = new Date(
              parseInt(parts[2]),
              parseInt(parts[1]) - 1,
              parseInt(parts[0])
            );
          } else {
            recordDate = new Date(dateSource);
          }
        } else {
          recordDate = new Date(dateSource);
        }

        if (!recordDate || isNaN(recordDate.getTime())) {
          return false;
        }

        // Reset time to compare dates only
        const recordDateOnly = new Date(
          recordDate.getFullYear(),
          recordDate.getMonth(),
          recordDate.getDate()
        );
        recordDateOnly.setHours(0, 0, 0, 0);

        switch (selectedDateRange) {
          case "today":
            return recordDateOnly >= todayStart && recordDateOnly < todayEnd;
          case "week":
            return recordDateOnly >= weekStart && recordDateOnly <= todayStart;
          case "month":
            return recordDateOnly >= monthStart && recordDateOnly <= todayStart;
          case "year":
            return recordDateOnly >= yearStart && recordDateOnly <= todayStart;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [
    allMedicalHistory,
    doctorSearch,
    selectedSpecialization,
    selectedDateRange,
    customDateRange,
    specializations,
  ]);

  // Apply all filters to consultation history
  const consultationHistory = useMemo(() => {
    let filtered = allConsultationHistory;

    // Filter by doctor name
    if (doctorSearch.trim()) {
      const searchLower = doctorSearch.toLowerCase().trim();
      filtered = filtered.filter((record) => {
        const doctorName = record.doctor?.toLowerCase() || "";
        return doctorName.includes(searchLower);
      });
    }

    // Filter by specialization
    if (selectedSpecialization) {
      filtered = filtered.filter((record) => {
        const recordSpecialty = record.specialty?.toLowerCase() || "";
        const spec = specializations.find(
          (s) => s._id === selectedSpecialization
        );
        return spec && recordSpecialty.includes(spec.name.toLowerCase());
      });
    }

    // Filter by consultation type (Video Call, Message)
    if (selectedConsultationType) {
      filtered = filtered.filter((record) => {
        const recordType = record.type?.toLowerCase() || "";
        return recordType.includes(selectedConsultationType.toLowerCase());
      });
    }

    // Filter by custom date range (priority over preset)
    if (customDateRange && customDateRange.length === 2) {
      const [startDate, endDate] = customDateRange;
      const rangeStart = dayjs(startDate).startOf("day").toDate();
      const rangeEnd = dayjs(endDate).endOf("day").toDate();

      filtered = filtered.filter((record) => {
        // Try multiple date sources with fallbacks
        let dateSource =
          record.fullDetails?.startedAt ||
          record.startedAt ||
          record.appointmentId?.scheduledStart ||
          record.visitDate ||
          record.dateTime ||
          record.date;

        if (!dateSource) {
          return false;
        }

        // Parse date
        let recordDate;
        if (typeof dateSource === "string" && dateSource.includes("/")) {
          const parts = dateSource.split("/");
          if (parts.length === 3) {
            recordDate = new Date(
              parseInt(parts[2]),
              parseInt(parts[1]) - 1,
              parseInt(parts[0])
            );
          } else {
            recordDate = new Date(dateSource);
          }
        } else {
          recordDate = new Date(dateSource);
        }

        if (!recordDate || isNaN(recordDate.getTime())) {
          return false;
        }

        return recordDate >= rangeStart && recordDate <= rangeEnd;
      });
    }
    // Filter by preset date range (if no custom range)
    else if (selectedDateRange) {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);
      todayEnd.setHours(0, 0, 0, 0);

      // Tuần này: Từ thứ 2 đầu tuần (day 1 = Monday)
      const weekStart = new Date(todayStart);
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Nếu là CN thì lùi 6 ngày, nếu không thì lùi (dayOfWeek - 1) ngày
      weekStart.setDate(weekStart.getDate() - daysToMonday);
      weekStart.setHours(0, 0, 0, 0);

      // Tháng này: Từ ngày 1 của tháng hiện tại
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);

      // Năm nay: Từ ngày 1/1 của năm hiện tại
      const yearStart = new Date(now.getFullYear(), 0, 1);
      yearStart.setHours(0, 0, 0, 0);

      filtered = filtered.filter((record) => {
        // Try multiple date sources with fallbacks
        let dateSource =
          record.fullDetails?.startedAt ||
          record.startedAt ||
          record.appointmentId?.scheduledStart ||
          record.visitDate ||
          record.dateTime ||
          record.date;

        if (!dateSource) {
          return false;
        }

        // Parse date
        let recordDate;
        if (typeof dateSource === "string" && dateSource.includes("/")) {
          const parts = dateSource.split("/");
          if (parts.length === 3) {
            recordDate = new Date(
              parseInt(parts[2]),
              parseInt(parts[1]) - 1,
              parseInt(parts[0])
            );
          } else {
            recordDate = new Date(dateSource);
          }
        } else {
          recordDate = new Date(dateSource);
        }

        if (!recordDate || isNaN(recordDate.getTime())) {
          return false;
        }

        // Reset time to compare dates only
        const recordDateOnly = new Date(
          recordDate.getFullYear(),
          recordDate.getMonth(),
          recordDate.getDate()
        );
        recordDateOnly.setHours(0, 0, 0, 0);

        switch (selectedDateRange) {
          case "today":
            return recordDateOnly >= todayStart && recordDateOnly < todayEnd;
          case "week":
            return recordDateOnly >= weekStart && recordDateOnly <= todayStart;
          case "month":
            return recordDateOnly >= monthStart && recordDateOnly <= todayStart;
          case "year":
            return recordDateOnly >= yearStart && recordDateOnly <= todayStart;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [
    allConsultationHistory,
    doctorSearch,
    selectedSpecialization,
    selectedDateRange,
    customDateRange,
    selectedConsultationType,
    specializations,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setDoctorSearch("");
    setSelectedSpecialization("");
    setSelectedDateRange("");
    setCustomDateRange(null);
    setSelectedConsultationType("");
  };

  const handleViewDetails = (recordId) => {
    console.log("Viewing details for record:", recordId);

    if (activeTab === "medical") {
      const record = medicalHistory.find((item) => item.id === recordId);
      if (record && record.fullDetails) {
        setSelectedSummary(record);
        setSelectedAdvice(null);
        setModalType("summary");
        setShowDetailModal(true);
      }
    } else if (activeTab === "consultation") {
      const record = consultationHistory.find((item) => item.id === recordId);
      if (record && record.fullDetails) {
        setSelectedAdvice(record);
        setSelectedSummary(null);
        setModalType("advice");
        setShowDetailModal(true);
      }
    }

    setActiveButton(activeButton === recordId ? null : recordId);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSummary(null);
    setSelectedAdvice(null);
    setModalType("summary");
  };

  const handleDownloadDocument = (documentName) => {
    console.log("Downloading document:", documentName);
    // Implement document download functionality
  };

  const getRelationshipText = (relationship) => {
    const relationMap = {
      father: "Cha",
      mother: "Mẹ",
      spouse: "Vợ/Chồng",
      child: "Con",
      grandparent: "Ông/Bà",
      other: "Khác",
    };
    return relationMap[relationship] || relationship;
  };

  const handleDeleteMember = async (memberId, memberName, e) => {
    e.stopPropagation(); // Prevent dropdown from closing
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${memberName}? Hành động này sẽ hủy tất cả các lịch hẹn chưa hoàn thành và không thể hoàn tác.`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      // Delete all Patient records for this family member
      const member = familyMembers.find((m) => m._id === memberId);
      if (member && member.allPatientIds) {
        // Delete all Patient IDs associated with this family member
        for (const patientId of member.allPatientIds) {
          await deleteFamilyMember(patientId);
        }
      } else {
        // Fallback: delete by the main ID
        await deleteFamilyMember(memberId);
      }

      // Refresh family members list from server
      await refreshFamilyMembers();

      // If deleted member was selected, select first available or clear selection
      const updatedMembers = familyMembers.filter((m) => m._id !== memberId);
      if (selectedPatientId === memberId) {
        if (updatedMembers.length > 0) {
          setSelectedPatientId(updatedMembers[0]._id);
        } else {
          setSelectedPatientId(null);
        }
      }

      alert("Đã xóa người thân thành công");
      setShowSelector(false);
    } catch (error) {
      console.error("Error deleting family member:", error);
      alert("Có lỗi xảy ra khi xóa người thân. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };

  return (
    <div className="health-profile-container">
      {/* Header */}
      <div className="health-profile-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title" style={{ color: "#000000" }}>
              Hồ sơ khám bệnh người thân
            </h1>
            <p className="page-subtitle">
              Theo dõi và quản lý thông tin sức khỏe của người thân
            </p>
          </div>
          {/* Doctor Search Filter */}
          <div className="doctor-search-filter">
            <Search className="search-icon" size={18} strokeWidth={2.5} />
            <input
              type="text"
              className="doctor-search-input"
              placeholder="Tìm bác sĩ theo tên"
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
            />
            {doctorSearch && (
              <button
                className="clear-search-button"
                onClick={() => setDoctorSearch("")}
                title="Xóa bộ lọc"
              >
                <X className="clear-icon" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {selectedPatientId && selectedMember && (
        <div className="filters-section">
          <div className="filters-header">
            <button
              className="filter-toggle-button"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} style={{ marginRight: "0.5rem" }} />
              Bộ lọc
              <ChevronDown
                size={16}
                style={{
                  marginLeft: "0.5rem",
                  transform: showFilters ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>
            {(selectedSpecialization ||
              selectedDateRange ||
              customDateRange ||
              selectedConsultationType) && (
              <button
                className="clear-filters-button"
                onClick={clearAllFilters}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {showFilters && (
            <div className="filters-content">
              <div className="filters-grid">
                {/* Specialization Filter */}
                <div className="filter-group">
                  <label className="filter-label">Chuyên khoa</label>
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Tất cả chuyên khoa</option>
                    {specializations.map((spec) => (
                      <option key={spec._id} value={spec._id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filter (Preset) */}
                <div className="filter-group">
                  <label className="filter-label">Khoảng thời gian</label>
                  <select
                    value={selectedDateRange}
                    onChange={(e) => {
                      setSelectedDateRange(e.target.value);
                      // Clear custom range when selecting preset
                      if (e.target.value) {
                        setCustomDateRange(null);
                      }
                    }}
                    className="filter-select"
                  >
                    <option value="">Tất cả thời gian</option>
                    <option value="today">Hôm nay</option>
                    <option value="week">Tuần này</option>
                    <option value="month">Tháng này</option>
                    <option value="year">Năm nay</option>
                  </select>
                </div>

                {/* Custom Date Range Filter */}
                <div className="filter-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="filter-label">
                    Chọn khoảng thời gian chi tiết
                  </label>
                  <RangePicker
                    value={
                      customDateRange
                        ? [dayjs(customDateRange[0]), dayjs(customDateRange[1])]
                        : null
                    }
                    onChange={(dates) => {
                      if (dates && dates.length === 2) {
                        setCustomDateRange([
                          dates[0].toDate(),
                          dates[1].toDate(),
                        ]);
                        // Clear preset when selecting custom range
                        setSelectedDateRange("");
                      } else {
                        setCustomDateRange(null);
                      }
                    }}
                    format="DD/MM/YYYY"
                    placeholder={["Từ ngày", "Đến ngày"]}
                    style={{ width: "100%" }}
                    className="custom-date-range-picker"
                  />
                </div>

                {/* Consultation Type Filter (only for consultation tab) */}
                {activeTab === "consultation" && (
                  <div className="filter-group">
                    <label className="filter-label">Loại tư vấn</label>
                    <select
                      value={selectedConsultationType}
                      onChange={(e) =>
                        setSelectedConsultationType(e.target.value)
                      }
                      className="filter-select"
                    >
                      <option value="">Tất cả</option>
                      <option value="Video Call">Video Call</option>
                      <option value="Message">Message</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Family Member Selector */}
      <div className="family-member-selector-section">
        <div className="selector-container">
          <label className="selector-label">
            <Users className="selector-icon" />
            Chọn người thân:
          </label>
          {isLoadingMembers ? (
            <div className="selector-loading">Đang tải...</div>
          ) : familyMembers.length === 0 ? (
            <div className="selector-empty">
              Chưa có người thân nào. Vui lòng thêm người thân trong phần quản
              lý hồ sơ.
            </div>
          ) : (
            <div className="selector-dropdown">
              <button
                className="selector-button"
                onClick={() => setShowSelector(!showSelector)}
              >
                <span>
                  {selectedMember
                    ? `${selectedMember.fullName} (${getRelationshipText(
                        selectedMember.relationshipToOwner
                      )})`
                    : "Chọn người thân"}
                </span>
                <ChevronDown
                  className={`selector-chevron ${showSelector ? "open" : ""}`}
                />
              </button>
              {showSelector && (
                <div className="selector-options">
                  {familyMembers.map((member) => (
                    <div
                      key={member._id}
                      className={`selector-option-wrapper ${
                        selectedPatientId === member._id ? "selected" : ""
                      }`}
                    >
                      <button
                        className={`selector-option ${
                          selectedPatientId === member._id ? "selected" : ""
                        }`}
                        onClick={() => {
                          setSelectedPatientId(member._id);
                          setShowSelector(false);
                          setActiveButton(null);
                          setSelectedSummary(null);
                          setSelectedAdvice(null);
                        }}
                      >
                        <div className="option-info">
                          <div className="option-name">{member.fullName}</div>
                          <div className="option-relation">
                            {getRelationshipText(member.relationshipToOwner)}
                          </div>
                          {member.dob && (
                            <div className="option-dob">
                              {new Date(member.dob).toLocaleDateString("vi-VN")}
                            </div>
                          )}
                        </div>
                      </button>
                      <button
                        className="option-delete-button"
                        onClick={(e) =>
                          handleDeleteMember(member._id, member.fullName, e)
                        }
                        disabled={isDeleting}
                        title="Xóa người thân"
                      >
                        <Trash2 className="delete-icon" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Show content only when a family member is selected */}
      {selectedPatientId && selectedMember ? (
        <>
          {/* History Section with Tabs */}
          <div className="history-section">
            <div className="section-header">
              <h2 className="section-title">Lịch sử</h2>
              <div className="tab-navigation">
                <button
                  className={`tab-button ${
                    activeTab === "medical" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("medical")}
                >
                  <FileText className="tab-icon" />
                  Lịch sử khám bệnh
                </button>
                <button
                  className={`tab-button ${
                    activeTab === "consultation" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("consultation")}
                >
                  <MessageCircle className="tab-icon" />
                  Lịch sử tư vấn
                </button>
              </div>
            </div>

            {/* Medical History Tab */}
            {activeTab === "medical" && (
              <div className="tab-content">
                {isLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Đang tải lịch sử khám bệnh...</p>
                  </div>
                ) : error ? (
                  <div className="error-state">
                    <p>Có lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
                  </div>
                ) : medicalHistory.length === 0 ? (
                  <div className="empty-state">
                    <p>Chưa có lịch sử khám bệnh nào.</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {medicalHistory.map((record) => (
                      <div key={record.id} className="history-card">
                        <div className="card-header">
                          <div className="card-title-section">
                            <div className="card-icon">
                              <FileText className="card-icon-symbol" />
                            </div>
                            <div className="card-title">
                              <div className="specialty-name">
                                {record.specialty}
                              </div>
                              <div className="card-meta">
                                <div className="meta-item">
                                  <Calendar className="meta-icon" />
                                  <span>{record.date}</span>
                                </div>
                                <div className="meta-item">
                                  <User className="meta-icon" />
                                  <span>{record.doctor}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            className={`view-details-button ${
                              activeButton === record.id ? "active" : ""
                            }`}
                            onClick={() => handleViewDetails(record.id)}
                          >
                            <Eye className="view-icon" />
                            Xem chi tiết
                          </button>
                        </div>

                        <div className="card-content">
                          <div className="content-item">
                            <div className="content-label">Chẩn đoán:</div>
                            <div className="content-value">
                              {record.diagnosis}
                            </div>
                          </div>

                          <div className="content-item">
                            <div className="content-label">Đơn thuốc:</div>
                            <div className="content-value">
                              {record.prescription}
                            </div>
                          </div>

                          <div className="content-item">
                            <div className="content-label">
                              Tài liệu đính kèm:
                            </div>
                            <div className="documents-list">
                              {record.documents?.map((doc, index) => (
                                <div key={index} className="document-item">
                                  <FileText className="document-icon" />
                                  <span
                                    className="document-link"
                                    onClick={() =>
                                      handleDownloadDocument(doc.name)
                                    }
                                  >
                                    {doc.name}
                                  </span>
                                  <FileDown className="download-icon" />
                                </div>
                              )) || (
                                <span className="no-documents">
                                  Không có tài liệu
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Consultation History Tab */}
            {activeTab === "consultation" && (
              <div className="tab-content">
                {isLoadingAdvice ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Đang tải lịch sử tư vấn...</p>
                  </div>
                ) : errorAdvice ? (
                  <div className="error-state">
                    <p>Có lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
                  </div>
                ) : consultationHistory.length === 0 ? (
                  <div className="empty-state">
                    <p>Chưa có lịch sử tư vấn nào.</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {consultationHistory.map((record) => (
                      <div
                        key={record.id}
                        className="history-card consultation-card"
                      >
                        <div className="card-header">
                          <div className="card-title-section">
                            <div className="card-icon">
                              {record.type === "Video Call" ? (
                                <Video className="card-icon-symbol" />
                              ) : (
                                <MessageCircle className="card-icon-symbol" />
                              )}
                            </div>
                            <div className="card-title">
                              <div className="specialty-name">
                                {record.specialty}
                              </div>
                              <div className="card-meta">
                                <div className="meta-item">
                                  <Calendar className="meta-icon" />
                                  <span>{record.dateTime || record.date}</span>
                                </div>
                                <div className="meta-item">
                                  <User className="meta-icon" />
                                  <span>{record.doctor}</span>
                                </div>
                                <div className="meta-item">
                                  <span className="consultation-type">
                                    {record.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            className={`view-details-button ${
                              activeButton === record.id ? "active" : ""
                            }`}
                            onClick={() => handleViewDetails(record.id)}
                          >
                            <Eye className="view-icon" />
                            Xem chi tiết
                          </button>
                        </div>

                        <div className="card-content">
                          <div className="content-item">
                            <div className="content-label">Chủ đề tư vấn:</div>
                            <div className="content-value">{record.topic}</div>
                          </div>

                          <div className="content-item">
                            <div className="content-label">Thời gian:</div>
                            <div className="content-value">
                              {record.dateTime
                                ? `${record.dateTime} (${record.duration})`
                                : record.duration}
                            </div>
                          </div>

                          <div className="content-item">
                            <div className="content-label">Tóm tắt:</div>
                            <div className="content-value">
                              {record.summary}
                            </div>
                          </div>

                          <div className="content-item">
                            <div className="content-label">
                              Tài liệu đính kèm:
                            </div>
                            <div className="documents-list">
                              {record.documents?.map((doc, index) => (
                                <div key={index} className="document-item">
                                  <FileText className="document-icon" />
                                  <span
                                    className="document-link"
                                    onClick={() =>
                                      handleDownloadDocument(doc.name)
                                    }
                                  >
                                    {doc.name}
                                  </span>
                                  <FileDown className="download-icon" />
                                </div>
                              )) || (
                                <span className="no-documents">
                                  Không có tài liệu
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detail Modal - Same as HealthProfile */}
          {showDetailModal && (selectedSummary || selectedAdvice) && (
            <div className="modal-overlay" onClick={closeDetailModal}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3 className="modal-title">
                    {modalType === "summary"
                      ? "Chi tiết hồ sơ khám bệnh"
                      : "Chi tiết buổi tư vấn"}
                  </h3>
                  <button className="modal-close" onClick={closeDetailModal}>
                    <X className="close-icon" />
                  </button>
                </div>

                <div className="modal-body">
                  {modalType === "summary" && selectedSummary?.fullDetails && (
                    <div className="detail-content">
                      {/* Basic Info */}
                      <div className="detail-section">
                        <h4>Thông tin cơ bản</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <strong>Ngày khám:</strong>
                            <span>
                              {new Date(
                                selectedSummary.fullDetails.visitDate
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <div className="detail-item">
                            <strong>Lý do khám:</strong>
                            <span>
                              {selectedSummary.fullDetails.reasonForVisit ||
                                "Không có thông tin"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <strong>Kết quả điều trị:</strong>
                            <span>
                              {selectedSummary.fullDetails.treatmentResult ||
                                "Không có thông tin"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Diagnoses */}
                      {selectedSummary.fullDetails.diagnoses &&
                        selectedSummary.fullDetails.diagnoses.length > 0 && (
                          <div className="detail-section">
                            <h4>Chẩn đoán</h4>
                            <div className="diagnoses-list">
                              {selectedSummary.fullDetails.diagnoses.map(
                                (diagnosis, index) => (
                                  <div key={index} className="diagnosis-item">
                                    <strong>{diagnosis.name}</strong>
                                    {diagnosis.icd10 && (
                                      <span className="icd-code">
                                        (ICD-10: {diagnosis.icd10})
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Vitals */}
                      {selectedSummary.fullDetails.vitals && (
                        <div className="detail-section">
                          <h4>Chỉ số sinh học</h4>
                          <div className="vitals-grid">
                            {selectedSummary.fullDetails.vitals.height && (
                              <div className="vital-item">
                                <strong>Chiều cao:</strong>{" "}
                                {selectedSummary.fullDetails.vitals.height} cm
                              </div>
                            )}
                            {selectedSummary.fullDetails.vitals.weight && (
                              <div className="vital-item">
                                <strong>Cân nặng:</strong>{" "}
                                {selectedSummary.fullDetails.vitals.weight} kg
                              </div>
                            )}
                            {selectedSummary.fullDetails.vitals
                              .bloodPressure && (
                              <div className="vital-item">
                                <strong>Huyết áp:</strong>{" "}
                                {
                                  selectedSummary.fullDetails.vitals
                                    .bloodPressure
                                }
                              </div>
                            )}
                            {selectedSummary.fullDetails.vitals.heartRate && (
                              <div className="vital-item">
                                <strong>Nhịp tim:</strong>{" "}
                                {selectedSummary.fullDetails.vitals.heartRate}{" "}
                                bpm
                              </div>
                            )}
                            {selectedSummary.fullDetails.vitals.temperature && (
                              <div className="vital-item">
                                <strong>Nhiệt độ:</strong>{" "}
                                {selectedSummary.fullDetails.vitals.temperature}
                                °C
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Lab Results */}
                      {selectedSummary.fullDetails.labResults &&
                        selectedSummary.fullDetails.labResults.length > 0 && (
                          <div className="detail-section">
                            <h4>Kết quả xét nghiệm</h4>
                            <div className="lab-results">
                              {selectedSummary.fullDetails.labResults.map(
                                (lab, index) => (
                                  <div key={index} className="lab-item">
                                    <div className="lab-header">
                                      <strong>{lab.testName}</strong>
                                      <span className="lab-date">
                                        {new Date(
                                          lab.performedAt
                                        ).toLocaleDateString("vi-VN")}
                                      </span>
                                    </div>
                                    <div className="lab-result">
                                      <span className="result-value">
                                        {lab.result}
                                      </span>
                                      {lab.referenceRange && (
                                        <span className="reference-range">
                                          (Bình thường: {lab.referenceRange})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Imaging Results */}
                      {selectedSummary.fullDetails.imagingResults &&
                        selectedSummary.fullDetails.imagingResults.length >
                          0 && (
                          <div className="detail-section">
                            <h4>Kết quả hình ảnh</h4>
                            <div className="imaging-results">
                              {selectedSummary.fullDetails.imagingResults.map(
                                (img, index) => (
                                  <div key={index} className="imaging-item">
                                    <div className="imaging-header">
                                      <strong>{img.type}</strong>
                                      <span className="imaging-date">
                                        {new Date(
                                          img.performedAt
                                        ).toLocaleDateString("vi-VN")}
                                      </span>
                                    </div>
                                    <div className="imaging-conclusion">
                                      <strong>Kết luận:</strong>{" "}
                                      {img.conclusion}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Medications */}
                      {selectedSummary.fullDetails.medications &&
                        selectedSummary.fullDetails.medications.length > 0 && (
                          <div className="detail-section">
                            <h4>Đơn thuốc</h4>
                            <div className="medications-list">
                              {selectedSummary.fullDetails.medications.map(
                                (med, index) => (
                                  <div key={index} className="medication-item">
                                    <div className="med-name">
                                      <strong>{med.name}</strong>
                                    </div>
                                    <div className="med-details">
                                      <span>Số lượng: {med.quantity}</span>
                                      {med.notes && (
                                        <span>Ghi chú: {med.notes}</span>
                                      )}
                                    </div>
                                    <div className="med-instruction">
                                      <strong>Hướng dẫn:</strong>{" "}
                                      {med.instruction}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Procedures */}
                      {selectedSummary.fullDetails.procedures &&
                        selectedSummary.fullDetails.procedures.length > 0 && (
                          <div className="detail-section">
                            <h4>Thủ thuật</h4>
                            <div className="procedures-list">
                              {selectedSummary.fullDetails.procedures.map(
                                (proc, index) => (
                                  <div key={index} className="procedure-item">
                                    <div className="procedure-header">
                                      <strong>{proc.name}</strong>
                                      <span className="procedure-date">
                                        {new Date(
                                          proc.performedAt
                                        ).toLocaleDateString("vi-VN")}
                                      </span>
                                    </div>
                                    <div className="procedure-description">
                                      {proc.description}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Summary and Instructions */}
                      <div className="detail-section">
                        <h4>Tóm tắt và hướng dẫn</h4>
                        {selectedSummary.fullDetails.summaryText && (
                          <div className="summary-text">
                            <strong>Tóm tắt:</strong>
                            <p>{selectedSummary.fullDetails.summaryText}</p>
                          </div>
                        )}
                        {selectedSummary.fullDetails.treatmentMethod && (
                          <div className="treatment-method">
                            <strong>Phương pháp điều trị:</strong>
                            <p>{selectedSummary.fullDetails.treatmentMethod}</p>
                          </div>
                        )}
                        {selectedSummary.fullDetails.followUpInstructions && (
                          <div className="follow-up">
                            <strong>Hướng dẫn theo dõi:</strong>
                            <p>
                              {selectedSummary.fullDetails.followUpInstructions}
                            </p>
                          </div>
                        )}
                        {selectedSummary.fullDetails.nextAppointmentDate && (
                          <div className="next-appointment">
                            <strong>Lịch hẹn tái khám:</strong>
                            <span>
                              {new Date(
                                selectedSummary.fullDetails.nextAppointmentDate
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {modalType === "advice" && selectedAdvice?.fullDetails && (
                    <div className="detail-content">
                      {/* Basic Info */}
                      <div className="detail-section">
                        <h4>Thông tin cơ bản</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <strong>Ngày tư vấn:</strong>
                            <span>
                              {new Date(
                                selectedAdvice.fullDetails.startedAt
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <div className="detail-item">
                            <strong>Loại tư vấn:</strong>
                            <span>
                              {selectedAdvice.fullDetails.adviceType ===
                              "general"
                                ? "Tư vấn chung"
                                : selectedAdvice.fullDetails.adviceType ===
                                  "follow_up"
                                ? "Tái khám"
                                : selectedAdvice.fullDetails.adviceType ===
                                  "second_opinion"
                                ? "Ý kiến thứ hai"
                                : "Không xác định"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <strong>Thời gian:</strong>
                            <span>
                              {selectedAdvice.fullDetails.durationMinutes
                                ? `${selectedAdvice.fullDetails.durationMinutes} phút`
                                : "Không xác định"}
                            </span>
                          </div>
                          {selectedAdvice.fullDetails.endedAt && (
                            <div className="detail-item">
                              <strong>Kết thúc:</strong>
                              <span>
                                {new Date(
                                  selectedAdvice.fullDetails.endedAt
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="detail-section">
                        <h4>Tóm tắt buổi tư vấn</h4>
                        <div className="summary-text">
                          <p>{selectedAdvice.fullDetails.summary}</p>
                        </div>
                      </div>

                      {/* Diagnoses */}
                      {selectedAdvice.fullDetails.diagnoses &&
                        selectedAdvice.fullDetails.diagnoses.length > 0 && (
                          <div className="detail-section">
                            <h4>Chẩn đoán tham khảo</h4>
                            <div className="diagnoses-list">
                              {selectedAdvice.fullDetails.diagnoses.map(
                                (diagnosis, index) => (
                                  <div key={index} className="diagnosis-item">
                                    <strong>{diagnosis.name}</strong>
                                    {diagnosis.icd10 && (
                                      <span className="icd-code">
                                        (ICD-10: {diagnosis.icd10})
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Medications */}
                      {selectedAdvice.fullDetails.medications &&
                        selectedAdvice.fullDetails.medications.length > 0 && (
                          <div className="detail-section">
                            <h4>Đơn thuốc</h4>
                            <div className="medications-list">
                              {selectedAdvice.fullDetails.medications.map(
                                (med, index) => (
                                  <div key={index} className="medication-item">
                                    <div className="med-name">
                                      <strong>{med.name}</strong>
                                    </div>
                                    <div className="med-details">
                                      <span>Số lượng: {med.quantity}</span>
                                      {med.notes && (
                                        <span>Ghi chú: {med.notes}</span>
                                      )}
                                    </div>
                                    <div className="med-instruction">
                                      <strong>Hướng dẫn:</strong>{" "}
                                      {med.instruction}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Notes */}
                      {selectedAdvice.fullDetails.notes && (
                        <div className="detail-section">
                          <h4>Ghi chú bổ sung</h4>
                          <div className="summary-text">
                            <p>{selectedAdvice.fullDetails.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Attachment */}
                      {selectedAdvice.fullDetails.attachmentUrl && (
                        <div className="detail-section">
                          <h4>Tài liệu đính kèm</h4>
                          <div className="documents-list">
                            <div className="document-item">
                              <FileText className="document-icon" />
                              <span
                                className="document-link"
                                onClick={() =>
                                  handleDownloadDocument("Tài liệu tư vấn.pdf")
                                }
                              >
                                Tài liệu tư vấn.pdf
                              </span>
                              <FileDown className="download-icon" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : !isLoadingMembers && familyMembers.length === 0 ? (
        <div className="no-family-members">
          <p>
            Chưa có người thân nào. Vui lòng thêm người thân trong phần quản lý
            hồ sơ.
          </p>
        </div>
      ) : null}
    </div>
  );
}
