import { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Award, Calendar } from "lucide-react"
import { getDoctorProfileWithFallback, updateDoctorProfile } from "../../../lib/api"

const ProfileSettings = () => {
  const [doctorInfo, setDoctorInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    address: "",
    bio: "",
    licenseNo: "",
    graduationYear: "",
    yearsExperience: 0,
    ratingAvg: 0,
    ratingCount: 0
  })

  // Fetch doctor info from API
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const doctor = await getDoctorProfileWithFallback();
        if (doctor) {
          setDoctorInfo(doctor);
          setFormData({
            fullName: doctor.userId?.fullName || doctor.fullName || "",
            email: doctor.userId?.email || "",
            phone: doctor.userId?.phone || "",
            specialization: doctor.specializationIds?.[0]?.name || "",
            address: doctor.clinicDefaultId?.address || "",
            bio: doctor.bio || "",
            licenseNo: doctor.licenseNo || "",
            graduationYear: doctor.education?.[0]?.year || "",
            yearsExperience: doctor.yearsExperience || 0,
            ratingAvg: doctor.ratingAvg || 0,
            ratingCount: doctor.ratingCount || 0
          });
        } else {
          console.error('No doctor found');
        }
      } catch (error) {
        console.error('Error fetching doctor info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorInfo();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await updateDoctorProfile(formData);
      if (response) {
        alert('Thông tin đã được cập nhật thành công');
      } else {
        alert('Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px]">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Thông tin cá nhân</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Đang tải thông tin...</div>
        </div>
      </div>
    );
  }

  // Extract initials for avatar
  const fullName = formData.fullName || "";
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase() || "BS";

  return (
    <div className="max-w-[1200px]">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Thông tin cá nhân</h1>

      <div className="grid grid-cols-[300px_1fr] gap-8">
        <div className="bg-white rounded-xl shadow-md p-6 row-span-2">
          <div className="text-center pb-8 border-b border-gray-200 mb-8">
            <div className="w-[120px] h-[120px] rounded-full bg-primary text-white flex items-center justify-center text-[2.5rem] font-bold mx-auto mb-6">
              {initials}
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
              Thay đổi ảnh
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{formData.ratingCount}</div>
              <div className="text-sm text-gray-600">Bệnh nhân</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{formData.yearsExperience}</div>
              <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{formData.ratingAvg.toFixed(1)}</div>
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
                    className="flex-1 border-none outline-none" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-900 text-[15px]">Chuyên khoa</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg focus-within:border-primary transition-colors">
                  <Award size={18} className="text-gray-400 flex-shrink-0" />
                  <input 
                    type="text" 
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className="flex-1 border-none outline-none" 
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
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="flex-1 border-none outline-none" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-900 text-[15px]">Số điện thoại</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg focus-within:border-primary transition-colors">
                  <Phone size={18} className="text-gray-400 flex-shrink-0" />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="flex-1 border-none outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Địa chỉ</label>
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg focus-within:border-primary transition-colors">
                <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="flex-1 border-none outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-900 text-[15px]">Giới thiệu</label>
              <textarea
                rows="4"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-y transition-colors focus:outline-none focus:border-primary"
              ></textarea>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full px-6 py-3 bg-accent hover:bg-accent/90 text-gray-900 rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            Lưu thay đổi
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-primary">
            Thông tin chuyên môn
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <Award className="text-primary flex-shrink-0" size={20} />
              <div>
                <div className="text-sm text-gray-600 mb-1">Bằng cấp</div>
                <div className="font-semibold text-gray-900">
                  {doctorInfo?.education?.[0]?.degree || "Bác sĩ Đa khoa"} - {doctorInfo?.education?.[0]?.school || "ĐH Y Dược"}
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <Calendar className="text-primary flex-shrink-0" size={20} />
              <div>
                <div className="text-sm text-gray-600 mb-1">Năm tốt nghiệp</div>
                <div className="font-semibold text-gray-900">{formData.graduationYear || "N/A"}</div>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <Award className="text-primary flex-shrink-0" size={20} />
              <div>
                <div className="text-sm text-gray-600 mb-1">Chứng chỉ</div>
                <div className="font-semibold text-gray-900">Chứng chỉ hành nghề số {formData.licenseNo || "N/A"}</div>
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
