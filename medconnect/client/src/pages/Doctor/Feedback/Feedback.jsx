import { useState } from "react";
import { Star, MessageSquare, Reply } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useDoctorReviews } from "../../../hooks/useDoctor";
import "./Feedback.scss";

// Add Spin component import (assuming it's from antd or similar)
const Spin = ({ size, tip }) => (
  <div className="flex flex-col items-center justify-center">
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${size === 'large' ? 'w-8 h-8' : 'w-4 h-4'}`}></div>
    {tip && <div className="mt-2 text-gray-500">{tip}</div>}
  </div>
);

export default function Feedback() {
  const [filter, setFilter] = useState("all");
  const [showResponseForm, setShowResponseForm] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { reviews, loading, error, respondToReview } = useDoctorReviews();

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getRatingBadge = (rating) => {
    if (rating >= 4.5) return { label: "Xuất sắc", className: "bg-green-100 text-green-700" };
    if (rating >= 3.5) return { label: "Tốt", className: "bg-blue-100 text-blue-700" };
    if (rating >= 2.5) return { label: "Trung bình", className: "bg-yellow-100 text-yellow-700" };
    return { label: "Cần cải thiện", className: "bg-red-100 text-red-700" };
  };

  const getModeBadge = (mode) => {
    switch (mode) {
      case "online":
        return { label: "Trực tuyến", className: "bg-teal-100 text-teal-700" };
      case "offline":
        return { label: "Tại phòng khám", className: "bg-purple-100 text-purple-700" };
      default:
        return { label: "Không xác định", className: "bg-gray-100 text-gray-700" };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const filteredReviews = reviews?.filter((review) => {
    if (filter === "all") return true;
    if (filter === "responded") return review.response !== null;
    if (filter === "pending") return review.response === null;
    return true;
  }) || [];

  const averageRating = reviews?.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = reviews?.reduce((dist, review) => {
    dist[review.rating] = (dist[review.rating] || 0) + 1;
    return dist;
  }, {}) || {};

  const handleSubmitResponse = async (reviewId) => {
    if (!responseText.trim()) return;

    try {
      setSubmitting(true);
      await respondToReview(reviewId, responseText);
      setResponseText("");
      setShowResponseForm(null);
    } catch (error) {
      console.error("Failed to submit response:", error);
      alert("Có lỗi xảy ra khi gửi phản hồi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px]">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Đánh giá & Phản hồi</h1>
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" tip="Đang tải đánh giá..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px]">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Đánh giá & Phản hồi</h1>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-red-500">Có lỗi xảy ra khi tải đánh giá</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px]">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Đánh giá & Phản hồi</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">{averageRating}</div>
          <div className="flex justify-center mb-2">{renderStars(Math.round(parseFloat(averageRating)))}</div>
          <div className="text-sm text-gray-600">Đánh giá trung bình</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">{reviews?.length || 0}</div>
          <div className="text-sm text-gray-600">Tổng số đánh giá</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {reviews?.filter((r) => !r.response).length || 0}
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
                  <span className="text-sm text-gray-600">{review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : "Không có ngày"}</span>
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
            <p className="text-gray-700 mt-2">{review.comment || "Không có bình luận"}</p>
            
            {review.response && review.response.trim() ? (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Reply className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Phản hồi của bác sĩ:</span>
                </div>
                <p className="text-gray-600">{review.response}</p>
                <span className="text-xs text-gray-500">
                  {review.responseDate ? formatDate(review.responseDate) : "Không có ngày"}
                </span>
              </div>
            ) : (
              <div className="mt-4">
                {showResponseForm === review.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Nhập phản hồi của bạn..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSubmitResponse(review.id)}
                        disabled={submitting || !responseText.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                      >
                        {submitting ? "Đang gửi..." : "Gửi phản hồi"}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowResponseForm(null);
                          setResponseText("");
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowResponseForm(review.id)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    <Reply className="w-4 h-4" />
                    Phản hồi
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}