import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Calendar,
  User,
  Eye,
  MessageCircle,
  Video,
  X,
  FileDown,
} from "lucide-react";
import { api } from "../../../lib/api";
import "./MedicalHistory.scss";

export default function MedicalHistory() {
  const [consultationAdvice, setConsultationAdvice] = useState([]);
  const [consultationSummaries, setConsultationSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("medical"); // "medical" or "consultation"
  const [activeButton, setActiveButton] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [selectedAdvice, setSelectedAdvice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalType, setModalType] = useState("summary"); // "summary" or "advice"

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [adviceResponse, summariesResponse] = await Promise.all([
        api.get("/api/doctors/me/consultation-advice", { params: { limit: 1000 } }),
        api.get("/api/doctors/me/consultation-summaries", { params: { limit: 1000 } }),
      ]);

      // API response structure: { success: true, data: { advice: [...], pagination: {...} } }
      // Backend returns: ok(res, { advice, pagination: {...} })
      if (adviceResponse.success && adviceResponse.data?.advice) {
        setConsultationAdvice(Array.isArray(adviceResponse.data.advice) ? adviceResponse.data.advice : []);
      } else {
        setConsultationAdvice([]);
      }

      if (summariesResponse.success && summariesResponse.data?.summaries) {
        setConsultationSummaries(Array.isArray(summariesResponse.data.summaries) ? summariesResponse.data.summaries : []);
      } else {
        setConsultationSummaries([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Có lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
      setConsultationAdvice([]);
      setConsultationSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDoc = (date) => {
    if (!date) return "Không có";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  const generateDocHTML = (record, type) => {
    if (type === "medical") {
      const patientName = record.patientId?.fullName || "Không có";
      const patientPhone = record.patientId?.phone || "Không có";
      const visitDate = formatDateForDoc(record.visitDate || record.createdAt);
  return `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:v="urn:schemas-microsoft-com:vml" xmlns="http://www.w3.org/TR/REC-html40">
<head></head>
<meta charset="utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word">
<meta name="Originator" content="Microsoft Word">
<title>Hồ sơ khám bệnh</title>
<style>
  :root{
    --ink:#1f2937;
    --muted:#6b7280;
    --border:#e5e7eb;
    --accent:#0ea5e9;
    --bg:#ffffff;
    --chip-bg:#eef6ff;
    --chip-text:#0b5fb8;
  }
  *{box-sizing:border-box}
  html,body{background:#fff}
  body{font-family:"Times New Roman",serif; color:var(--ink); margin:32px; line-height:1.45; font-size:13.5pt}
  h1{font-size:20pt; margin:0 0 8px; letter-spacing:.3px}
  .sub{color:var(--muted); font-size:11pt}
  .header{display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding-bottom:12px; border-bottom:2px solid #000}
  .brand h2{margin:0; font-size:13pt; font-weight:600}
  .meta{text-align:right}
  .section{margin-top:18px; border:1px solid var(--border); border-radius:10px; padding:14px 16px; background:var(--bg); page-break-inside:avoid}
  .section h2{font-size:14.5pt; margin:0 0 10px; color:#111; border-left:3px solid var(--accent); padding-left:10px}
  .kv{width:100%; border-collapse:collapse}
  .kv td{padding:8px 10px; border:1px solid var(--border); vertical-align:top}
  .kv td.key{background:#f9fafb; font-weight:700; width:220px}
  .table{width:100%; border-collapse:collapse; font-size:13pt}
  .table th,.table td{border:1px solid var(--border); padding:8px 10px; vertical-align:top}
  .table th{background:#f3f4f6; text-align:left; font-weight:700}
  .table.zebra tbody tr:nth-child(odd){background:#fafafa}
  .chips{display:flex; flex-wrap:wrap; gap:8px}
  .chip{background:var(--chip-bg); color:var(--chip-text); border:1px solid #d6e8ff; padding:6px 10px; border-radius:999px; font-size:12pt}
  .muted{color:var(--muted)}
  .note{padding:10px 12px; background:#f9fafb; border:1px dashed var(--border); border-radius:8px}
  .sign{display:flex; gap:28px; margin-top:24px}
  .sign .box{flex:1; text-align:center; padding-top:40px}
  .sign .label{display:block; margin-top:6px; color:var(--muted); font-size:11.5pt}
  img{max-width:520px; margin:10px 0; display:block}
  /* In A4 */
  @page{size:A4; margin:20mm}
  @media print{
    body{margin:0; font-size:12pt}
    .section{page-break-inside:avoid}
    .header{border-bottom:1px solid #000}
    .note{border-color:#ddd}
  }
  /* Word VML behaviors */
  v:*{behavior:url(#default#VML)} o:*{behavior:url(#default#VML)} w:*{behavior:url(#default#VML)}
</style>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/><w:ValidateAgainstSchemas/></w:WordDocument></xml><![endif]-->
</head>
<body>

  <div class="header">
    <div class="brand">
      <h1>HỒ SƠ KHÁM BỆNH</h1>
      <div class="sub">Mã hồ sơ: ${record._id || "—"}</div>
    </div>
    <div class="meta">
      <div class="sub">Ngày tạo: ${formatDateForDoc(new Date())}</div>
      ${record.mode ? `<div class="sub">Hình thức: ${record.mode === "online" ? "Trực tuyến" : "Trực tiếp"}</div>` : "" }
    </div>
  </div>

  <div class="section">
    <h2>Thông tin bệnh nhân</h2>
    <table class="kv">
      <tr><td class="key">Họ và tên</td><td>${patientName}</td></tr>
      <tr><td class="key">Số điện thoại</td><td>${patientPhone}</td></tr>
      <tr><td class="key">Ngày khám</td><td>${visitDate}</td></tr>
      ${record.patientId?.dob ? `<tr><td class="key">Ngày sinh</td><td>${formatDate(record.patientId.dob)}</td></tr>` : ""}
      ${record.patientId?.gender ? `<tr><td class="key">Giới tính</td><td>${record.patientId.gender === "male" ? "Nam" : record.patientId.gender === "female" ? "Nữ" : record.patientId.gender}</td></tr>` : ""}
    </table>
  </div>

  ${record.reasonForVisit ? `
  <div class="section">
    <h2>Lý do khám</h2>
    <div class="note">${record.reasonForVisit}</div>
  </div>` : ""}

  <div class="section">
    <h2>Chẩn đoán</h2>
    ${record.diagnoses?.length ? `
      <div class="chips">
        ${record.diagnoses.map(d => `<span class="chip">${d.name || d}</span>`).join("")}
      </div>` : `<span class="muted">Không có</span>`}
  </div>

  <div class="section">
    <h2>Đơn thuốc</h2>
    ${record.medications?.length ? `
      <table class="table zebra">
        <thead><tr><th>Tên thuốc</th><th>Số lượng</th><th>Hướng dẫn</th></tr></thead>
        <tbody>
          ${record.medications.map(m => `
            <tr>
              <td>${m.name || "Không có"}</td>
              <td>${m.quantity || "Không có"}</td>
              <td>${m.instruction || "Không có"}</td>
            </tr>`).join("")}
        </tbody>
      </table>` : `<span class="muted">Không có đơn thuốc</span>`}
  </div>

  ${record.treatmentResult || record.summaryText || record.treatmentMethod || record.followUpInstructions || record.nextAppointmentDate ? `
  <div class="section">
    <h2>Kết quả & Hướng dẫn</h2>
    ${record.treatmentResult ? `<p><strong>Kết quả điều trị:</strong> ${
      record.treatmentResult === "recovered" ? "Khỏi" :
      record.treatmentResult === "improved" ? "Cải thiện" :
      record.treatmentResult === "unchanged" ? "Không thay đổi" :
      record.treatmentResult
    }</p>` : ""}
    ${record.summaryText ? `<p><strong>Tóm tắt:</strong> ${record.summaryText}</p>` : ""}
    ${record.treatmentMethod ? `<p><strong>Phương pháp điều trị:</strong> ${record.treatmentMethod}</p>` : ""}
    ${record.followUpInstructions ? `<p><strong>Hướng dẫn theo dõi:</strong> ${record.followUpInstructions}</p>` : ""}
    ${record.nextAppointmentDate ? `<p><strong>Lịch hẹn tái khám:</strong> ${formatDate(record.nextAppointmentDate)}</p>` : ""}
  </div>` : ""}

  ${record.vitals ? `
  <div class="section">
    <h2>Chỉ số sinh học</h2>
    <table class="kv">
      ${record.vitals.height ? `<tr><td class="key">Chiều cao</td><td>${record.vitals.height} cm</td></tr>` : ""}
      ${record.vitals.weight ? `<tr><td class="key">Cân nặng</td><td>${record.vitals.weight} kg</td></tr>` : ""}
      ${record.vitals.bloodPressure ? `<tr><td class="key">Huyết áp</td><td>${record.vitals.bloodPressure}</td></tr>` : ""}
      ${record.vitals.heartRate ? `<tr><td class="key">Nhịp tim</td><td>${record.vitals.heartRate} bpm</td></tr>` : ""}
      ${record.vitals.temperature ? `<tr><td class="key">Nhiệt độ</td><td>${record.vitals.temperature}°C</td></tr>` : ""}
    </table>
  </div>` : ""}

  ${record.labResults?.length ? `
  <div class="section">
    <h2>Kết quả xét nghiệm</h2>
    <table class="table zebra">
      <thead><tr><th>Xét nghiệm</th><th>Kết quả</th></tr></thead>
      <tbody>
        ${record.labResults.map(l => `<tr><td>${l.testName || "Xét nghiệm"}</td><td>${l.result || "Không có"}</td></tr>`).join("")}
      </tbody>
    </table>
  </div>` : ""}

  <div class="sign">
    <div class="box">
      <div><strong>Bệnh nhân</strong></div>
      <span class="label">(Ký và ghi rõ họ tên)</span>
    </div>
    <div class="box">
      <div><strong>Bác sĩ phụ trách</strong></div>
      <span class="label">${record.doctorName ? "(" + record.doctorName + ")" : "(Ký và ghi rõ họ tên)"}</span>
    </div>
  </div>

</body>
</html>`;
} else {
  const patientName = record.patientId?.fullName || "Không có";
  const patientPhone = record.patientId?.phone || "Không có";
  const appointmentDate = formatDateForDoc(record.appointmentDate || record.createdAt);
  return `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:v="urn:schemas-microsoft-com:vml" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word">
<meta name="Originator" content="Microsoft Word">
<title>Buổi tư vấn</title>
<style>
  :root{
    --ink:#1f2937; --muted:#6b7280; --border:#e5e7eb; --accent:#0ea5e9; --bg:#ffffff;
    --chip-bg:#eef6ff; --chip-text:#0b5fb8;
  }
  *{box-sizing:border-box}
  body{font-family:"Times New Roman",serif; color:var(--ink); margin:32px; line-height:1.45; font-size:13.5pt}
  h1{font-size:20pt; margin:0 0 8px}
  .sub{color:var(--muted); font-size:11pt}
  .header{display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding-bottom:12px; border-bottom:2px solid #000}
  .section{margin-top:18px; border:1px solid var(--border); border-radius:10px; padding:14px 16px; background:var(--bg); page-break-inside:avoid}
  .section h2{font-size:14.5pt; margin:0 0 10px; color:#111; border-left:3px solid var(--accent); padding-left:10px}
  .kv{width:100%; border-collapse:collapse}
  .kv td{padding:8px 10px; border:1px solid var(--border)}
  .kv td.key{background:#f9fafb; font-weight:700; width:220px}
  .chips{display:flex; flex-wrap:wrap; gap:8px}
  .chip{background:var(--chip-bg); color:var(--chip-text); border:1px solid #d6e8ff; padding:6px 10px; border-radius:999px; font-size:12pt}
  .table{width:100%; border-collapse:collapse}
  .table th,.table td{border:1px solid var(--border); padding:8px 10px}
  .table th{background:#f3f4f6; text-align:left}
  .note{padding:10px 12px; background:#f9fafb; border:1px dashed var(--border); border-radius:8px}
  .sign{display:flex; gap:28px; margin-top:24px}
  .sign .box{flex:1; text-align:center; padding-top:40px}
  .sign .label{display:block; margin-top:6px; color:var(--muted); font-size:11.5pt}
  @page{size:A4; margin:20mm}
  @media print{ body{margin:0; font-size:12pt} .section{page-break-inside:avoid} }
  v:*{behavior:url(#default#VML)} o:*{behavior:url(#default#VML)} w:*{behavior:url(#default#VML)}
</style>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/><w:ValidateAgainstSchemas/></w:WordDocument></xml><![endif]-->
</head>
<body>

  <div class="header">
    <div>
      <h1>BUỔI TƯ VẤN</h1>
      <div class="sub">Mã phiên: ${record._id || "—"}</div>
    </div>
    <div class="sub" style="text-align:right">
      Ngày tạo: ${formatDateForDoc(new Date())}<br/>
      Hình thức: ${record.mode === "online" ? "Trực tuyến" : "Trực tiếp"}
    </div>
  </div>

  <div class="section">
    <h2>Thông tin bệnh nhân</h2>
    <table class="kv">
      <tr><td class="key">Họ và tên</td><td>${patientName}</td></tr>
      <tr><td class="key">Số điện thoại</td><td>${patientPhone}</td></tr>
      <tr><td class="key">Ngày tư vấn</td><td>${appointmentDate}</td></tr>
      ${record.patientId?.dob ? `<tr><td class="key">Ngày sinh</td><td>${formatDate(record.patientId.dob)}</td></tr>` : ""}
      ${record.patientId?.gender ? `<tr><td class="key">Giới tính</td><td>${record.patientId.gender === "male" ? "Nam" : record.patientId.gender === "female" ? "Nữ" : record.patientId.gender}</td></tr>` : ""}
    </table>
  </div>

  ${record.notes ? `
  <div class="section">
    <h2>Tóm tắt buổi tư vấn</h2>
    <div class="note">${record.notes}</div>
  </div>` : ""}

  ${record.diagnoses?.length ? `
  <div class="section">
    <h2>Chẩn đoán tham khảo</h2>
    <div class="chips">
      ${record.diagnoses.map(d => `<span class="chip">${d.name || d}</span>`).join("")}
    </div>
  </div>` : ""}

  ${record.medications?.length ? `
  <div class="section">
    <h2>Đơn thuốc</h2>
    <table class="table">
      <thead><tr><th>Tên thuốc</th><th>Số lượng</th><th>Hướng dẫn</th></tr></thead>
      <tbody>
        ${record.medications.map(m => `
          <tr>
              <td>${m.name || "Không có"}</td>
              <td>${m.quantity || "Không có"}</td>
              <td>${m.instruction || "Không có"}</td>
          </tr>`).join("")}
      </tbody>
    </table>
  </div>` : ""}

  <div class="sign">
    <div class="box">
      <div><strong>Người được tư vấn</strong></div>
      <span class="label">(Ký và ghi rõ họ tên)</span>
    </div>
    <div class="box">
      <div><strong>Chuyên gia tư vấn</strong></div>
      <span class="label">${record.doctorName ? "(" + record.doctorName + ")" : "(Ký và ghi rõ họ tên)"}</span>
    </div>
  </div>

</body>
</html>`;
  }
  };

  const handleDownload = async (record) => {
    try {
      let htmlContent = '';
      let fileName = '';
      
      if (activeTab === "medical" && record) {
        htmlContent = generateDocHTML(record, "medical");
        fileName = `ho-so-kham-${record.visitDate ? new Date(record.visitDate).toISOString().split('T')[0] : 'unknown'}.doc`;
      } else if (activeTab === "consultation" && record) {
        htmlContent = generateDocHTML(record, "consultation");
        fileName = `tu-van-${record.appointmentDate ? new Date(record.appointmentDate).toISOString().split('T')[0] : 'unknown'}.doc`;
      } else {
        return;
      }

      // Create blob with HTML content that Word can open
      // Use both UTF-8 BOM and proper HTML structure for better image support
      const blob = new Blob(['\ufeff', htmlContent], { 
        type: 'application/msword;charset=utf-8' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Có lỗi khi tải xuống file. Vui lòng thử lại.");
    }
  };

  const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      const fullUrl = getImageUrl(fileUrl);
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || fileUrl.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Có lỗi khi tải xuống file");
    }
  };

  const handleViewDetails = (recordId, record) => {
    if (activeTab === "medical") {
      setSelectedSummary(record);
      setSelectedAdvice(null);
      setModalType("summary");
      setShowDetailModal(true);
    } else if (activeTab === "consultation") {
      setSelectedAdvice(record);
      setSelectedSummary(null);
      setModalType("advice");
      setShowDetailModal(true);
    }

    // Toggle active state
    setActiveButton(activeButton === recordId ? null : recordId);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSummary(null);
    setSelectedAdvice(null);
    setModalType("summary");
  };


  const formatDate = (date) => {
    if (!date) return "Không có";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "Không có";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

    return (
    <div className="health-profile-container">
      {/* Header */}
      <div className="health-profile-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title" style={{ color: "#000000" }}>
              Hồ sơ khám
            </h1>
            <p className="page-subtitle">
              Quản lý và xem lịch sử khám bệnh và tư vấn
            </p>
          </div>
      </div>
      </div>

      {/* Tab Navigation - Horizontal Layout */}
      <div className="tab-navigation-horizontal">
        <button
          className={`tab-button-horizontal ${
            activeTab === "medical" ? "active" : ""
          }`}
          onClick={() => setActiveTab("medical")}
        >
          <FileText className="tab-icon" />
          <span>Lịch sử khám bệnh</span>
          <span className="tab-badge">
            {consultationSummaries.length}
          </span>
        </button>
        <button
          className={`tab-button-horizontal ${
            activeTab === "consultation" ? "active" : ""
          }`}
          onClick={() => setActiveTab("consultation")}
        >
          <MessageCircle className="tab-icon" />
          <span>Lịch sử tư vấn</span>
          <span className="tab-badge">
            {consultationAdvice.length}
          </span>
        </button>
      </div>

      {/* History Section */}
      <div className="history-section">
        <div className="section-header">
          <h2 className="section-title">
            {activeTab === "medical" ? "Lịch sử khám bệnh" : "Lịch sử tư vấn"}
          </h2>
        </div>

        {/* Medical History Tab */}
        {activeTab === "medical" && (
          <div className="tab-content">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải lịch sử khám bệnh...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
              </div>
            ) : consultationSummaries.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có lịch sử khám bệnh nào.</p>
              </div>
            ) : (
              <div className="history-list">
                {consultationSummaries.map((summary) => {
                  const primaryDiagnosis =
                    summary.diagnoses && summary.diagnoses.length > 0
                      ? summary.diagnoses[0].name
                      : "Không có";

                  const medicationsText =
                    summary.medications && summary.medications.length > 0
                      ? summary.medications
                          .map(
                            (med) =>
                              `${med.name || "Không có"} - ${med.quantity || "Không có"} - ${med.instruction || ""}`
                          )
                          .join(", ")
                      : "Không có đơn thuốc";


                  return (
                    <div key={summary._id} className="history-card">
                      <div className="card-header">
                        <div className="card-title-section">
                          <div className="card-icon">
                            <FileText className="card-icon-symbol" />
                          </div>
                          <div className="card-title">
                            <div className="specialty-name">
                              Bệnh nhân: {summary.patientId?.fullName || "Không xác định"}
                            </div>
                            <div className="card-meta">
                              <div className="meta-item">
                                <Calendar className="meta-icon" />
                                <span>{formatDate(summary.visitDate || summary.createdAt)}</span>
                              </div>
                              <div className="meta-item">
                                <User className="meta-icon" />
                                <span>SĐT: {summary.patientId?.phone || "Không có"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card-actions">
                          <button
                            className={`view-details-button ${
                              activeButton === summary._id ? "active" : ""
                            }`}
                            onClick={() => handleViewDetails(summary._id, summary)}
                          >
                            <Eye className="view-icon" />
                            Xem chi tiết
                          </button>
                          <button
                            className="download-button-card"
                            onClick={() => handleDownload(summary)}
                            title="Tải xuống hồ sơ"
                          >
                            <Download className="download-icon" />
                            Tải xuống
                          </button>
                        </div>
                      </div>

                      <div className="card-content">
                        {summary.reasonForVisit && (
                          <div className="content-item">
                            <div className="content-label">Lý do khám:</div>
                            <div className="content-value">{summary.reasonForVisit}</div>
                          </div>
                        )}

                        {(summary.diagnoses?.length > 0) && (
                          <div className="content-item">
                            <div className="content-label">Chẩn đoán:</div>
                            <div className="content-value">
                              {primaryDiagnosis}
                              {summary.diagnoses.length > 1 && (
                                <span className="more-diagnoses">
                                  {" "}+ {summary.diagnoses.length - 1} chẩn đoán khác
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {(summary.medications?.length > 0) && (
                          <div className="content-item">
                            <div className="content-label">Đơn thuốc:</div>
                            <div className="content-value">
                              {medicationsText}
                            </div>
                          </div>
                        )}

                        {summary.treatmentResult && (
                          <div className="content-item">
                            <div className="content-label">Kết quả điều trị:</div>
                            <div className="content-value">
                              {summary.treatmentResult === "recovered"
                                ? "Khỏi"
                                : summary.treatmentResult === "improved"
                                ? "Cải thiện"
                                : summary.treatmentResult === "unchanged"
                                ? "Không thay đổi"
                                : summary.treatmentResult}
                            </div>
                          </div>
                        )}

                        {(() => {
                          const validLabResults = summary.labResults?.filter(lab => lab.testName && lab.result) || [];
                          if (validLabResults.length > 0) {
                            return (
                              <div className="content-item">
                                <div className="content-label">Xét nghiệm:</div>
                                <div className="documents-list">
                                  {validLabResults.map((lab, index) => (
                                    <div key={`lab-${index}`} className="document-item">
                                      <FileText className="document-icon" />
                                      <span className="document-text">
                                        {lab.testName} - {lab.result}
                                      </span>
                                    </div>
                                  ))}
                                </div>
      </div>
    );
  }
                          return null;
                        })()}

                        <div className="content-item">
                          <div className="content-label">Hình ảnh chẩn đoán:</div>
                          {(() => {
                            // Chỉ hiển thị những item có imageUrl thực sự
                            const validImagingResults = summary.imagingResults?.filter(img => img.imageUrl && img.imageUrl.trim() !== '') || [];
                            if (validImagingResults.length > 0) {
    return (
                                <div className="documents-list">
                                  {validImagingResults.map((img, index) => (
                                    <div key={`img-${index}`} className="document-item">
                                      <FileText className="document-icon" />
                                      <span className="document-text">
                                        {img.type ? `${img.type}${img.conclusion ? ` - ${img.conclusion}` : ''}` : img.conclusion || `Hình ảnh ${index + 1}`}
                                      </span>
                                      <div className="document-actions">
                                        <a
                                          href={getImageUrl(img.imageUrl)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="document-link"
                                        >
                                          Xem hình ảnh
                                        </a>
                                        <button
                                          className="download-file-button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadFile(img.imageUrl, `${img.type || 'hinh-anh'}-${index + 1}.${img.imageUrl.split('.').pop() || 'png'}`);
                                          }}
                                          title="Tải xuống hình ảnh"
                                        >
                                          <FileDown className="download-icon-small" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
      </div>
    );
  }
                            return (
                              <div className="content-value" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                Không có hình ảnh chẩn đoán
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
        )}

        {/* Consultation History Tab */}
        {activeTab === "consultation" && (
          <div className="tab-content">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải lịch sử tư vấn...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
              </div>
            ) : consultationAdvice.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có lịch sử tư vấn nào.</p>
              </div>
            ) : (
              <div className="history-list">
                {consultationAdvice.map((advice) => {
                  const primaryDiagnosis =
                    advice.diagnoses && advice.diagnoses.length > 0
                      ? advice.diagnoses[0].name
                      : "Không có";

                  const medicationsText =
                    advice.medications && advice.medications.length > 0
                      ? advice.medications
                          .map(
                            (med) =>
                              `${med.name || "Không có"} - ${med.quantity || "Không có"} - ${med.instruction || ""}`
                          )
                          .join(", ")
                      : "Không có đơn thuốc";


  return (
                    <div key={advice._id} className="history-card consultation-card">
                      <div className="card-header">
                        <div className="card-title-section">
                          <div className="card-icon">
                            {advice.mode === "online" ? (
                              <Video className="card-icon-symbol" />
                            ) : (
                              <MessageCircle className="card-icon-symbol" />
                            )}
                          </div>
                          <div className="card-title">
                            <div className="specialty-name">
                              Bệnh nhân: {advice.patientId?.fullName || "Không xác định"}
                            </div>
                            <div className="card-meta">
                              <div className="meta-item">
                                <Calendar className="meta-icon" />
                                <span>{formatDate(advice.appointmentDate || advice.createdAt)}</span>
                              </div>
                              <div className="meta-item">
                                <User className="meta-icon" />
                                <span>SĐT: {advice.patientId?.phone || "Không có"}</span>
                              </div>
                              <div className="meta-item">
                                <span className="consultation-type">
                                  {advice.mode === "online" ? "Trực tuyến" : "Trực tiếp"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card-actions">
        <button
                            className={`view-details-button ${
                              activeButton === advice._id ? "active" : ""
                            }`}
                            onClick={() => handleViewDetails(advice._id, advice)}
                          >
                            <Eye className="view-icon" />
                            Xem chi tiết
        </button>
        <button
                            className="download-button-card"
                            onClick={() => handleDownload(advice)}
                            title="Tải xuống hồ sơ"
        >
                            <Download className="download-icon" />
                            Tải xuống
        </button>
                        </div>
      </div>

                      <div className="card-content">
                        {advice.notes && (
                          <div className="content-item">
                            <div className="content-label">Ghi chú:</div>
                            <div className="content-value">
                              {advice.notes.length > 150
                                ? advice.notes.substring(0, 150) + "..."
                                : advice.notes}
                            </div>
                          </div>
                        )}

                        {primaryDiagnosis !== "Không có" && (
                          <div className="content-item">
                            <div className="content-label">Chẩn đoán:</div>
                            <div className="content-value">
                              {primaryDiagnosis}
                              {advice.diagnoses && advice.diagnoses.length > 1 && (
                                <span className="more-diagnoses">
                                  {" "}+ {advice.diagnoses.length - 1} chẩn đoán khác
                                </span>
                              )}
              </div>
              </div>
                        )}

                        {medicationsText !== "Không có đơn thuốc" && (
                          <div className="content-item">
                            <div className="content-label">Thuốc kê đơn:</div>
                            <div className="content-value">{medicationsText}</div>
              </div>
                        )}

                        <div className="content-item">
                          <div className="content-label">File đính kèm:</div>
                          {advice.attachmentUrl && advice.attachmentUrl.trim() !== '' ? (
                            <div className="documents-list">
                              <div className="document-item">
                                <FileText className="document-icon" />
                                <div className="document-actions">
                                  <a
                                    href={getImageUrl(advice.attachmentUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="document-link"
                                  >
                                    {advice.attachmentUrl.split('/').pop() || advice.attachmentUrl}
                                  </a>
                                  <button
                                    className="download-file-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadFile(advice.attachmentUrl, advice.attachmentUrl.split('/').pop() || 'file.pdf');
                                    }}
                                    title="Tải xuống file"
                                  >
                                    <FileDown className="download-icon-small" />
                                  </button>
              </div>
            </div>
                            </div>
                          ) : (
                            <div className="content-value" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                              Không có file đính kèm
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (selectedSummary || selectedAdvice) && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              {modalType === "summary" && selectedSummary && (
                <div className="detail-content">
                  {/* Basic Info */}
                  <div className="detail-section">
                    <h4>Thông tin cơ bản</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Bệnh nhân:</strong>
                        <span>
                          {selectedSummary.patientId?.fullName || "Không có"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <strong>Số điện thoại:</strong>
                        <span>
                          {selectedSummary.patientId?.phone || "Không có"}
                        </span>
                    </div>
                      {selectedSummary.patientId?.dob && (
                        <div className="detail-item">
                          <strong>Ngày sinh:</strong>
                          <span>
                            {formatDate(selectedSummary.patientId.dob)}
                          </span>
                        </div>
                      )}
                      {selectedSummary.patientId?.gender && (
                        <div className="detail-item">
                          <strong>Giới tính:</strong>
                          <span>
                            {selectedSummary.patientId.gender === "male"
                              ? "Nam"
                              : selectedSummary.patientId.gender === "female"
                              ? "Nữ"
                              : selectedSummary.patientId.gender}
                          </span>
                        </div>
                      )}
                      <div className="detail-item">
                        <strong>Ngày khám:</strong>
                        <span>
                          {formatDateTime(
                            selectedSummary.visitDate || selectedSummary.createdAt
                          )}
                        </span>
                      </div>
                      {selectedSummary.reasonForVisit && (
                        <div className="detail-item">
                          <strong>Lý do khám:</strong>
                          <span>{selectedSummary.reasonForVisit}</span>
                        </div>
                      )}
                      {selectedSummary.treatmentResult && (
                        <div className="detail-item">
                          <strong>Kết quả điều trị:</strong>
                          <span>
                            {selectedSummary.treatmentResult === "recovered"
                              ? "Khỏi"
                              : selectedSummary.treatmentResult === "improved"
                              ? "Cải thiện"
                              : selectedSummary.treatmentResult === "unchanged"
                              ? "Không thay đổi"
                              : selectedSummary.treatmentResult}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Diagnoses */}
                  {selectedSummary.diagnoses &&
                    selectedSummary.diagnoses.length > 0 && (
                      <div className="detail-section">
                        <h4>Chẩn đoán</h4>
                        <div className="diagnoses-list">
                          {selectedSummary.diagnoses.map((diagnosis, index) => (
                            <div key={index} className="diagnosis-item">
                              <strong>{diagnosis.name || "Không xác định"}</strong>
                  </div>
                          ))}
                        </div>
                  </div>
                    )}

                  {/* Vitals */}
                  {selectedSummary.vitals && (
                    <div className="detail-section">
                      <h4>Chỉ số sinh học</h4>
                      <div className="vitals-grid">
                        {selectedSummary.vitals.height && (
                          <div className="vital-item">
                            <strong>Chiều cao:</strong>{" "}
                            {selectedSummary.vitals.height} cm
                          </div>
                        )}
                        {selectedSummary.vitals.weight && (
                          <div className="vital-item">
                            <strong>Cân nặng:</strong>{" "}
                            {selectedSummary.vitals.weight} kg
                          </div>
                        )}
                        {selectedSummary.vitals.bloodPressure && (
                          <div className="vital-item">
                            <strong>Huyết áp:</strong>{" "}
                            {selectedSummary.vitals.bloodPressure}
                          </div>
                        )}
                        {selectedSummary.vitals.heartRate && (
                          <div className="vital-item">
                            <strong>Nhịp tim:</strong>{" "}
                            {selectedSummary.vitals.heartRate} bpm
                          </div>
                        )}
                        {selectedSummary.vitals.temperature && (
                          <div className="vital-item">
                            <strong>Nhiệt độ:</strong>{" "}
                            {selectedSummary.vitals.temperature}°C
                          </div>
            )}
          </div>
        </div>
      )}

                  {/* Lab Results */}
                  {(() => {
                    const validLabResults = selectedSummary.labResults?.filter(lab => lab.testName && lab.result) || [];
                    if (validLabResults.length > 0) {
                      return (
                        <div className="detail-section">
                          <h4>Kết quả xét nghiệm</h4>
                          <div className="lab-results">
                            {validLabResults.map((lab, index) => (
                              <div key={index} className="lab-item">
                                <div className="lab-header">
                                  <strong>{lab.testName}</strong>
                                  {lab.performedAt && (
                                    <span className="lab-date">
                                      {formatDate(lab.performedAt)}
                    </span>
                                  )}
                                </div>
                                <div className="lab-result">
                                  <span className="result-value">
                                    {lab.result}
                    </span>
                                </div>
                              </div>
                ))}
              </div>
            </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Imaging Results */}
                  <div className="detail-section">
                    <h4>Kết quả hình ảnh</h4>
                    {(() => {
                      // Chỉ hiển thị những item có imageUrl thực sự
                      const validImagingResults = selectedSummary.imagingResults?.filter(img => img.imageUrl && img.imageUrl.trim() !== '') || [];
                      if (validImagingResults.length > 0) {
                        return (
                          <div className="imaging-results">
                            {validImagingResults.map((img, index) => (
                              <div key={index} className="imaging-item">
                                {img.type && (
                                  <div className="imaging-header">
                                    <strong>{img.type}</strong>
                                    {img.performedAt && (
                                      <span className="imaging-date">
                                        {formatDate(img.performedAt)}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {img.conclusion && (
                                  <div className="imaging-conclusion">
                                    <strong>Kết luận:</strong> {img.conclusion}
                                  </div>
                                )}
                                <div className="imaging-image-container">
                                  {(() => {
                                    const fullImageUrl = getImageUrl(img.imageUrl);
                                    return (
                                      <>
                                        <div className="imaging-image-wrapper">
                                          <a
                                            href={fullImageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="imaging-image-link"
                                          >
                                            <img
                                              src={fullImageUrl}
                                              alt={img.type || img.conclusion || `Hình ảnh ${index + 1}`}
                                              className="imaging-image"
                                              onError={(e) => {
                                                e.target.style.display = 'none';
                                                if (e.target.nextSibling) {
                                                  e.target.nextSibling.style.display = 'block';
                                                }
                                              }}
                                            />
                                          </a>
                                          <button
                                            className="download-image-button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDownloadFile(img.imageUrl, `${img.type || 'hinh-anh'}-${index + 1}.${img.imageUrl.split('.').pop() || 'png'}`);
                                            }}
                                            title="Tải xuống hình ảnh"
                                          >
                                            <Download className="download-icon" />
                                            Tải xuống
                                          </button>
                    </div>
                                        <div className="imaging-image-fallback" style={{ display: 'none' }}>
                                          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                                            Không thể tải hình ảnh
                                          </p>
                                          <div className="document-actions">
                                            <a
                                              href={fullImageUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="document-link"
                                            >
                                              Mở link hình ảnh
                                            </a>
                                            <button
                                              className="download-file-button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadFile(img.imageUrl, `${img.type || 'hinh-anh'}-${index + 1}.${img.imageUrl.split('.').pop() || 'png'}`);
                                              }}
                                              title="Tải xuống hình ảnh"
                                            >
                                              <FileDown className="download-icon-small" />
                                            </button>
                                          </div>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return (
                        <div style={{ color: '#9ca3af', fontStyle: 'italic', padding: '1rem' }}>
                          Không có hình ảnh chẩn đoán
                        </div>
                      );
                    })()}
                    </div>

                  {/* Medications */}
                  {selectedSummary.medications &&
                    selectedSummary.medications.length > 0 && (
                      <div className="detail-section">
                        <h4>Đơn thuốc</h4>
                        <div className="medications-list">
                          {selectedSummary.medications.map((med, index) => (
                            <div key={index} className="medication-item">
                              <div className="med-name">
                                <strong>{med.name || "Không có"}</strong>
                    </div>
                              <div className="med-details">
                                <span>Số lượng: {med.quantity || "Không có"}</span>
                              </div>
                              {med.instruction && (
                                <div className="med-instruction">
                                  <strong>Hướng dẫn:</strong> {med.instruction}
                                </div>
                              )}
                              {med.notes && (
                                <div className="med-notes">
                                  <strong>Ghi chú:</strong> {med.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                    </div>
                    )}

                  {/* Summary and Instructions */}
                  {(selectedSummary.summaryText || 
                    selectedSummary.treatmentMethod || 
                    selectedSummary.followUpInstructions || 
                    selectedSummary.nextAppointmentDate) && (
                    <div className="detail-section">
                      <h4>Tóm tắt và hướng dẫn</h4>
                      {selectedSummary.summaryText && (
                        <div className="summary-text">
                          <strong>Tóm tắt:</strong>
                          <p>{selectedSummary.summaryText}</p>
                    </div>
                      )}
                      {selectedSummary.treatmentMethod && (
                        <div className="treatment-method">
                          <strong>Phương pháp điều trị:</strong>
                          <p>{selectedSummary.treatmentMethod}</p>
                        </div>
                      )}
                      {selectedSummary.followUpInstructions && (
                        <div className="follow-up">
                          <strong>Hướng dẫn theo dõi:</strong>
                          <p>{selectedSummary.followUpInstructions}</p>
                        </div>
                      )}
                      {selectedSummary.nextAppointmentDate && (
                        <div className="next-appointment">
                          <strong>Lịch hẹn tái khám:</strong>
                          <span>
                            {formatDate(selectedSummary.nextAppointmentDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                    </div>
              )}

              {modalType === "advice" && selectedAdvice && (
                <div className="detail-content">
                  {/* Basic Info */}
                  <div className="detail-section">
                    <h4>Thông tin cơ bản</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Bệnh nhân:</strong>
                        <span>
                          {selectedAdvice.patientId?.fullName || "Không có"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <strong>Số điện thoại:</strong>
                        <span>
                          {selectedAdvice.patientId?.phone || "Không có"}
                        </span>
                      </div>
                      {selectedAdvice.patientId?.dob && (
                        <div className="detail-item">
                          <strong>Ngày sinh:</strong>
                          <span>
                            {formatDate(selectedAdvice.patientId.dob)}
                          </span>
                        </div>
                      )}
                      {selectedAdvice.patientId?.gender && (
                        <div className="detail-item">
                          <strong>Giới tính:</strong>
                          <span>
                            {selectedAdvice.patientId.gender === "male"
                              ? "Nam"
                              : selectedAdvice.patientId.gender === "female"
                              ? "Nữ"
                              : selectedAdvice.patientId.gender}
                          </span>
                    </div>
                      )}
                      <div className="detail-item">
                        <strong>Ngày tư vấn:</strong>
                        <span>
                          {formatDateTime(
                            selectedAdvice.appointmentDate || selectedAdvice.createdAt
                          )}
                        </span>
                      </div>
                      <div className="detail-item">
                        <strong>Hình thức:</strong>
                        <span>{selectedAdvice.mode === "online" ? "Trực tuyến" : "Trực tiếp"}</span>
                      </div>
                      </div>
                    </div>

                  {/* Notes/Summary */}
                  {selectedAdvice.notes && (
                    <div className="detail-section">
                      <h4>Tóm tắt buổi tư vấn</h4>
                      <div className="summary-text">
                        <p>{selectedAdvice.notes}</p>
                    </div>
                    </div>
                  )}

                  {/* Diagnoses */}
                  {selectedAdvice.diagnoses &&
                    selectedAdvice.diagnoses.length > 0 && (
                      <div className="detail-section">
                        <h4>Chẩn đoán tham khảo</h4>
                        <div className="diagnoses-list">
                          {selectedAdvice.diagnoses.map((diagnosis, index) => (
                            <div key={index} className="diagnosis-item">
                              <strong>{diagnosis.name || "Không xác định"}</strong>
                    </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Medications */}
                  {selectedAdvice.medications &&
                    selectedAdvice.medications.length > 0 && (
                      <div className="detail-section">
                        <h4>Đơn thuốc</h4>
                        <div className="medications-list">
                          {selectedAdvice.medications.map((med, index) => (
                            <div key={index} className="medication-item">
                              <div className="med-name">
                                <strong>{med.name || "Không có"}</strong>
                              </div>
                              <div className="med-details">
                                <span>Số lượng: {med.quantity || "Không có"}</span>
                              </div>
                              {med.instruction && (
                                <div className="med-instruction">
                                  <strong>Hướng dẫn:</strong> {med.instruction}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Attachment */}
                  <div className="detail-section">
                    <h4>File đính kèm</h4>
                    {selectedAdvice.attachmentUrl && selectedAdvice.attachmentUrl.trim() !== '' ? (
                      <div className="documents-list">
                        <div className="document-item">
                          <FileText className="document-icon" />
                          <div className="document-actions">
                            <a
                              href={getImageUrl(selectedAdvice.attachmentUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="document-link"
                            >
                              {selectedAdvice.attachmentUrl.split('/').pop() || selectedAdvice.attachmentUrl}
                            </a>
                            <button
                              className="download-file-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadFile(selectedAdvice.attachmentUrl, selectedAdvice.attachmentUrl.split('/').pop() || 'file.pdf');
                              }}
                              title="Tải xuống file"
                            >
                              <FileDown className="download-icon-small" />
                            </button>
                    </div>
                  </div>
                      </div>
                    ) : (
                      <div style={{ color: '#9ca3af', fontStyle: 'italic', padding: '1rem' }}>
                        Không có file đính kèm
              </div>
            )}
                  </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}