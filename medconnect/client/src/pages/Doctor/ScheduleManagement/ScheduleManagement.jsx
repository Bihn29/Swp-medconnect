"use client"

import { useState } from "react"
import { Plus, Clock, Calendar, Trash2, Edit } from "lucide-react"

const ScheduleManagement = () => {
  const [showSlotForm, setShowSlotForm] = useState(false)
  const [showBlockForm, setShowBlockForm] = useState(false)

  const timeSlots = [
    { id: 1, date: "2025-10-15", startTime: "08:00", endTime: "08:30", status: "available", mode: "online" },
    { id: 2, date: "2025-10-15", startTime: "08:30", endTime: "09:00", status: "booked", mode: "online" },
    { id: 3, date: "2025-10-15", startTime: "09:00", endTime: "09:30", status: "available", mode: "offline" },
    { id: 4, date: "2025-10-15", startTime: "09:30", endTime: "10:00", status: "blocked", mode: "offline" },
  ]

  return (
    <div className="max-w-[1400px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Quản lý lịch làm việc</h1>
        <div className="flex gap-4">
          <button
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => setShowSlotForm(!showSlotForm)}
          >
            <Plus size={18} />
            Tạo slot mới
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => setShowBlockForm(!showBlockForm)}
          >
            <Clock size={18} />
            Chặn thời gian
          </button>
        </div>
      </div>

      {showSlotForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-primary">Tạo slot khám mới</h2>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Ngày</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-colors focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Hình thức</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-colors focus:outline-none focus:border-primary">
                <option value="online">Trực tuyến</option>
                <option value="offline">Tại viện</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Giờ bắt đầu</label>
              <input
                type="time"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-colors focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Giờ kết thúc</label>
              <input
                type="time"
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
              Tạo slot
            </button>
            <button
              className="px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-all"
              onClick={() => setShowSlotForm(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {showBlockForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-orange-500">Chặn thời gian</h2>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Từ ngày</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-colors focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Đến ngày</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-colors focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Lý do</label>
              <textarea
                rows="3"
                placeholder="Nhập lý do chặn thời gian..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-y transition-colors focus:outline-none focus:border-orange-500"
              ></textarea>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all">
              Chặn thời gian
            </button>
            <button
              className="px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-all"
              onClick={() => setShowBlockForm(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Danh sách slot</h2>

        <div className="space-y-3">
          {timeSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center gap-6 p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 text-gray-600 min-w-[120px]">
                <Calendar size={16} />
                <span className="text-sm">{new Date(slot.date).toLocaleDateString("vi-VN")}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 min-w-[150px]">
                <Clock size={16} />
                <span className="text-sm">
                  {slot.startTime} - {slot.endTime}
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  slot.mode === "online" ? "bg-primary/10 text-primary" : "bg-orange-100 text-orange-600"
                }`}
              >
                {slot.mode === "online" ? "Trực tuyến" : "Tại viện"}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  slot.status === "available"
                    ? "bg-green-100 text-green-600"
                    : slot.status === "booked"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-red-100 text-red-600"
                }`}
              >
                {slot.status === "available" ? "Trống" : slot.status === "booked" ? "Đã đặt" : "Đã chặn"}
              </span>

              <div className="flex-1"></div>

              <div className="flex gap-2">
                <button className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors">
                  <Edit size={18} />
                </button>
                <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ScheduleManagement
