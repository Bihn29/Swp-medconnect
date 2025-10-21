"use client"

import { useState, useEffect } from "react"
import { Star, MessageSquare } from "lucide-react"
import { api } from "../../../lib/api"
import { Spin, message } from "antd"

const Feedback = () => {
  const [filter, setFilter] = useState("all")
  const [showResponseForm, setShowResponseForm] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/doctors/me/reviews")
      
      if (response.success) {
        setReviews(response.data.reviews || [])
      } else {
        message.error("Không thể tải đánh giá")
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      message.error("Có lỗi xảy ra khi tải đánh giá")
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={16} className={star <= rating ? "fill-accent text-accent" : "text-gray-300"} />
        ))}
      </div>
    )
  }

  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true
    if (filter === "responded") return review.response !== null
    if (filter === "pending") return review.response === null
    return true
  })

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "0.0"

  if (loading) {
    return (
      <div className="max-w-[1200px]">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Đánh giá & Phản hồi</h1>
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" tip="Đang tải đánh giá..." />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px]">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Đánh giá & Phản hồi</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">{averageRating}</div>
          <div className="flex justify-center mb-2">{renderStars(Math.round(averageRating))}</div>
          <div className="text-sm text-gray-600">Đánh giá trung bình</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">{reviews.length}</div>
          <div className="text-sm text-gray-600">Tổng số đánh giá</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {reviews.filter((r) => r.response === null).length}
          </div>
          <div className="text-sm text-gray-600">Chờ phản hồi</div>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "all" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setFilter("all")}
        >
          Tất cả
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "pending" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setFilter("pending")}
        >
          Chờ phản hồi
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "responded" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setFilter("responded")}
        >
          Đã phản hồi
        </button>
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.patientId?.fullName || "Bệnh nhân"}</h3>
                <div className="flex items-center gap-4 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-600">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      review.mode === "online" ? "bg-primary/10 text-primary" : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {review.mode === "online" ? "Trực tuyến" : "Tại viện"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {review.appointmentId?.reason || "Khám bệnh"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-900 mb-4">{review.comment}</p>

            {review.response ? (
              <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={16} className="text-primary" />
                  <span className="text-sm font-semibold text-primary">Phản hồi của bạn:</span>
                </div>
                <p className="text-gray-900 text-sm">{review.response}</p>
              </div>
            ) : (
              <>
                {showResponseForm === review.id ? (
                  <div className="space-y-4">
                    <textarea
                      rows="3"
                      placeholder="Nhập phản hồi của bạn..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-y transition-colors focus:outline-none focus:border-primary"
                    ></textarea>
                    <div className="flex gap-4">
                      <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all">
                        Gửi phản hồi
                      </button>
                      <button
                        className="px-6 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-all"
                        onClick={() => setShowResponseForm(null)}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-gray-900 rounded-lg font-medium transition-all"
                    onClick={() => setShowResponseForm(review.id)}
                  >
                    <MessageSquare size={16} />
                    Phản hồi
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Feedback
