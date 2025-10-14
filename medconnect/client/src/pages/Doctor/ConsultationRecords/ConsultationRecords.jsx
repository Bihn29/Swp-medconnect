"use client"

import { useState } from "react"
import { Search, Plus, FileText, Calendar } from "lucide-react"
import { useConsultationRecords } from "../../../hooks/useDoctor.js"

const ConsultationRecords = () => {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Get consultation records with summaries and prescriptions
  const { records, loading, error } = useConsultationRecords({
    limit: 50
  })

  const filteredRecords = records?.filter(record => 
    record.patientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (loading) {
    return (
      <div className="max-w-[1200px]">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải hồ sơ khám bệnh...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px]">
        <div className="text-center py-8 text-red-500">Có lỗi xảy ra: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Hồ sơ khám bệnh</h1>
        <button
          className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-gray-900 rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Tạo hồ sơ mới
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-primary">
            Tạo hồ sơ khám bệnh
          </h2>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Bệnh nhân</label>
              <input
                type="text"
                placeholder="Nhập tên bệnh nhân"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-colors focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Ngày khám</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-colors focus:outline-none focus:border-primary"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Chẩn đoán</label>
              <textarea
                rows="3"
                placeholder="Nhập chẩn đoán..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-y transition-colors focus:outline-none focus:border-primary"
              ></textarea>
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Phương pháp điều trị</label>
              <textarea
                rows="4"
                placeholder="Nhập phương pháp điều trị..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-y transition-colors focus:outline-none focus:border-primary"
              ></textarea>
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Đơn thuốc</label>
              <textarea
                rows="4"
                placeholder="Nhập đơn thuốc..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-y transition-colors focus:outline-none focus:border-primary"
              ></textarea>
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Lịch tái khám</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-colors focus:outline-none focus:border-primary"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Ghi chú</label>
              <textarea
                rows="3"
                placeholder="Ghi chú thêm..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-y transition-colors focus:outline-none focus:border-primary"
              ></textarea>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button className="px-6 py-3 bg-accent hover:bg-accent/90 text-gray-900 rounded-lg font-medium transition-all">
              Lưu hồ sơ
            </button>
            <button
              className="px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-all"
              onClick={() => setShowForm(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-600">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm hồ sơ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none outline-none text-[15px]" 
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không có hồ sơ khám bệnh nào</div>
        ) : (
          filteredRecords.map((record) => (
          <div
            key={record._id}
            className="bg-white rounded-xl shadow-md p-6 flex items-start gap-6 hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <FileText size={24} />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {record.patientId?.fullName || "Bệnh nhân"}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  {new Date(record.scheduledStart).toLocaleDateString("vi-VN")}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-600 min-w-[100px]">Lý do khám:</span>
                  <span className="text-gray-900">{record.reason || "Khám tổng quát"}</span>
                </div>
                {record.summary && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-gray-600 min-w-[100px]">Tóm tắt:</span>
                    <span className="text-gray-900">{record.summary}</span>
                  </div>
                )}
                {record.prescription?.diagnosis && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-gray-600 min-w-[100px]">Chẩn đoán:</span>
                    <span className="text-gray-900">{record.prescription.diagnosis}</span>
                  </div>
                )}
                {record.prescription?.note && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-gray-600 min-w-[100px]">Ghi chú:</span>
                    <span className="text-gray-900">{record.prescription.note}</span>
                  </div>
                )}
              </div>
            </div>

            <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all whitespace-nowrap">
              Xem chi tiết
            </button>
          </div>
        ))
        )}
      </div>
    </div>
  )
}

export default ConsultationRecords
