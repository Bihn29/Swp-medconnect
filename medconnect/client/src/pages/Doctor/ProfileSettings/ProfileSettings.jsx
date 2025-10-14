import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Award, Calendar } from "lucide-react";
import { useDoctor } from "../../../hooks/useDoctor.js";

const ProfileSettings = () => {
  const { doctor, loading, error, updateProfile } = useDoctor();
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    yearsExperience: "",
    licenseNo: "",
    avatarUrl: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        fullName: doctor.fullName || "",
        bio: doctor.bio || "",
        yearsExperience: doctor.yearsExperience || "",
        licenseNo: doctor.licenseNo || "",
        avatarUrl: doctor.avatarUrl || ""
      });
    }
  }, [doctor]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px]">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải thông tin...</div>
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
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Thông tin cá nhân</h1>

      <div className="grid grid-cols-[300px_1fr] gap-8">
        <div className="bg-white rounded-xl shadow-md p-6 row-span-2">
          <div className="text-center pb-8 border-b border-gray-200 mb-8">
            <div className="w-[120px] h-[120px] rounded-full bg-primary text-white flex items-center justify-center text-[2.5rem] font-bold mx-auto mb-6">
              {doctor?.avatarUrl ? (
                <img 
                  src={doctor.avatarUrl} 
                  alt="Doctor Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                "BS"
              )}
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
              Thay đổi ảnh
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{doctor?.ratingCount || 0}</div>
              <div className="text-sm text-gray-600">Bệnh nhân</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{doctor?.yearsExperience || 0}</div>
              <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{doctor?.ratingAvg?.toFixed(1) || "0.0"}</div>
              <div className="text-sm text-gray-600">Đánh giá</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-primary">Thông tin cơ bản</h2>

          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-900 text-[15px]">Họ và tên</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg focus-within:border-primary transition-colors">
                  <User size={18} className="text-gray-400 flex-shrink-0" />
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={!isEditing}
                    className="flex-1 border-none outline-none disabled:bg-gray-50" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-900 text-[15px]">Chuyên khoa</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg focus-within:border-primary transition-colors">
                  <Award size={18} className="text-gray-400 flex-shrink-0" />
                  <input 
                    type="text" 
                    value={doctor?.specializationIds?.map(spec => spec.name).join(", ") || ""}
                    disabled
                    className="flex-1 border-none outline-none disabled:bg-gray-50" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-900 text-[15px]">Email</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg focus-within:border-primary transition-colors">
                  <Mail size={18} className="text-gray-400 flex-shrink-0" />
                  <input 
                    type="email" 
                    value={doctor?.userId?.email || ""}
                    disabled
                    className="flex-1 border-none outline-none disabled:bg-gray-50" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-900 text-[15px]">Số điện thoại</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg focus-within:border-primary transition-colors">
                  <Phone size={18} className="text-gray-400 flex-shrink-0" />
                  <input 
                    type="tel" 
                    value={doctor?.userId?.phone || ""}
                    disabled
                    className="flex-1 border-none outline-none disabled:bg-gray-50" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-900 text-[15px]">Năm kinh nghiệm</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg focus-within:border-primary transition-colors">
                  <Calendar size={18} className="text-gray-400 flex-shrink-0" />
                  <input 
                    type="number" 
                    value={formData.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                    disabled={!isEditing}
                    className="flex-1 border-none outline-none disabled:bg-gray-50" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-900 text-[15px]">Số chứng chỉ hành nghề</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg focus-within:border-primary transition-colors">
                  <Award size={18} className="text-gray-400 flex-shrink-0" />
                  <input 
                    type="text" 
                    value={formData.licenseNo}
                    onChange={(e) => handleInputChange('licenseNo', e.target.value)}
                    disabled={!isEditing}
                    className="flex-1 border-none outline-none disabled:bg-gray-50" 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Giới thiệu</label>
              <textarea
                rows="4"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-y transition-colors focus:outline-none focus:border-primary disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="flex gap-4">
            {!isEditing ? (
              <button 
                className="flex-1 px-6 py-3 bg-accent hover:bg-accent/90 text-gray-900 rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa thông tin
              </button>
            ) : (
              <>
                <button 
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button 
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-all"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    if (doctor) {
                      setFormData({
                        fullName: doctor.fullName || "",
                        bio: doctor.bio || "",
                        yearsExperience: doctor.yearsExperience || "",
                        licenseNo: doctor.licenseNo || "",
                        avatarUrl: doctor.avatarUrl || ""
                      });
                    }
                  }}
                >
                  Hủy
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-primary">
            Thông tin chuyên môn
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <Award className="text-primary flex-shrink-0" size={20} />
              <div>
                <div className="text-sm text-gray-600 mb-1">Chuyên khoa</div>
                <div className="font-semibold text-gray-900">
                  {doctor?.specializationIds?.map(spec => spec.name).join(", ") || "Chưa cập nhật"}
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <Calendar className="text-primary flex-shrink-0" size={20} />
              <div>
                <div className="text-sm text-gray-600 mb-1">Năm kinh nghiệm</div>
                <div className="font-semibold text-gray-900">{doctor?.yearsExperience || 0} năm</div>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <Award className="text-primary flex-shrink-0" size={20} />
              <div>
                <div className="text-sm text-gray-600 mb-1">Chứng chỉ hành nghề</div>
                <div className="font-semibold text-gray-900">
                  {doctor?.licenseNo || "Chưa cập nhật"}
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <Award className="text-primary flex-shrink-0" size={20} />
              <div>
                <div className="text-sm text-gray-600 mb-1">Trạng thái xác minh</div>
                <div className="font-semibold text-gray-900">
                  {doctor?.isVerified ? "Đã xác minh" : "Chờ xác minh"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-primary">Bảo mật</h2>

          <div className="space-y-6 mb-8">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Mật khẩu hiện tại</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-colors focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Mật khẩu mới</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-colors focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-colors focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button className="w-full px-6 py-3 bg-accent hover:bg-accent/90 text-gray-900 rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md">
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
