import { useState } from "react";
import { Star, MessageSquare, Reply } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useDoctorReviews } from "../../../hooks/useDoctor";
import "./Feedback.scss";

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
    if (filter === "unresponded") return !review.response;
    if (filter === "low_rating") return review.rating < 3;
    return review.rating >= parseInt(filter);
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
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang tải đánh giá...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1 className="feedback-title">Đánh giá từ bệnh nhân</h1>
        <div className="feedback-stats">
          <div className="rating-summary">
            <span className="average-rating">{averageRating}</span>
            <div className="rating-stars">
              {getRatingStars(Math.round(averageRating))}
            </div>
            <span className="total-reviews">({reviews?.length || 0} đánh giá)</span>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <Card className="rating-distribution">
        <h3 className="distribution-title">Phân bố đánh giá</h3>
        <div className="distribution-bars">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="distribution-bar">
              <span className="star-label">{star} sao</span>
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${((ratingDistribution[star] || 0) / (reviews?.length || 1)) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="bar-count">{ratingDistribution[star] || 0}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <div className="feedback-filters">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="w-48 px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="all">Tất cả đánh giá</option>
          <option value="unresponded">Chưa phản hồi</option>
          <option value="low_rating">Đánh giá thấp (&lt; 3 sao)</option>
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {filteredReviews.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có đánh giá
            </h3>
            <p className="text-gray-500">
              {filter === "all" 
                ? "Bạn chưa có đánh giá nào" 
                : `Không có đánh giá phù hợp với bộ lọc`}
            </p>
          </Card>
        ) : (
          filteredReviews.map((review) => {
            const ratingBadge = getRatingBadge(review.rating);
            const modeBadge = getModeBadge(review.appointmentType);

            return (
              <Card key={review._id} className="review-item">
                <div className="review-header">
                  <div className="review-patient-info">
                    <h3 className="patient-name">
                      {review.patientId?.fullName || "Bệnh nhân"}
                    </h3>
                    <div className="review-meta">
                      <span className="appointment-date">
                        {formatDate(review.appointmentDate)}
                      </span>
                      <Badge className={modeBadge.className}>
                        {modeBadge.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="review-rating">
                    <div className="rating-stars">
                      {getRatingStars(review.rating)}
                    </div>
                    <Badge className={ratingBadge.className}>
                      {ratingBadge.label}
                    </Badge>
                  </div>
                </div>

                <div className="review-content">
                  <p className="review-comment">{review.comment}</p>
                  
                  {review.response ? (
                    <div className="review-response">
                      <div className="response-header">
                        <h4 className="response-title">Phản hồi của bác sĩ:</h4>
                        <span className="response-date">
                          {formatDate(review.responseDate)}
                        </span>
                      </div>
                      <p className="response-text">{review.response}</p>
                    </div>
                  ) : (
                    <div className="response-actions">
                      {showResponseForm === review._id ? (
                        <div className="response-form">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Nhập phản hồi của bạn..."
                            className="mb-3 w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                            rows={3}
                          />
                          <div className="form-actions">
                            <Button
                              onClick={() => handleSubmitResponse(review._id)}
                              disabled={submitting || !responseText.trim()}
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              {submitting ? "Đang gửi..." : "Gửi phản hồi"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowResponseForm(null);
                                setResponseText("");
                              }}
                            >
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowResponseForm(review._id)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Reply className="w-4 h-4" />
                          Phản hồi
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}