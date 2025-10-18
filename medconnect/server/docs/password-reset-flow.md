# Password Reset Flow với OTP

## Tổng quan
Hệ thống reset password sử dụng OTP (One-Time Password) 6 số ngẫu nhiên từ 100000 đến 999999, được lưu trữ trong bảng `Password_Resets`.

## Luồng hoạt động

### 1. Yêu cầu reset password (`POST /api/auth/forgot`)
- **Input**: `{ email }`
- **Process**:
  - Tìm user theo email
  - Kiểm tra xem có OTP đang hoạt động không (tối đa 5 lần thử)
  - Tạo OTP 6 số ngẫu nhiên (100000-999999)
  - Lưu vào bảng `Password_Resets` với:
    - `userId`: ID của user
    - `email`: Email của user
    - `codeHash`: Hash của OTP (để bảo mật)
    - `otp`: OTP thực (để so sánh)
    - `type`: "reset"
    - `expiresAt`: Thời gian hết hạn (10 phút)
    - `used`: false
    - `attempts`: 0
  - Gửi email chứa OTP
- **Output**: `{ ok: true }` (luôn trả về thành công để tránh lộ thông tin)

### 2. Xác thực OTP (`POST /api/auth/verify-otp`)
- **Input**: `{ email, otp }`
- **Process**:
  - Tìm user theo email
  - Tìm record trong `Password_Resets` với:
    - `userId` khớp với user
    - `email` khớp
    - `type`: "reset"
    - `used`: false
    - `expiresAt` > thời gian hiện tại
  - Kiểm tra số lần thử (tối đa 5 lần)
  - So sánh OTP nhập vào với `otp` đã lưu
  - Nếu đúng: tạo JWT reset token và cập nhật record
  - Nếu sai: tăng `attempts` lên 1
- **Output**: `{ resetToken }` (JWT token để reset password)

### 3. Reset password (`POST /api/auth/reset`)
- **Input**: `{ token, newPassword }`
- **Process**:
  - Verify JWT token
  - Tìm record trong `Password_Resets` với `codeHash` khớp với token
  - Tìm user theo `userId`
  - Hash password mới và cập nhật
  - Đánh dấu record đã được sử dụng (`used: true`)
- **Output**: `{ ok: true, message: "Đổi mật khẩu thành công" }`

## Bảo mật

1. **Rate Limiting**: Tối đa 5 lần thử OTP
2. **Expiration**: OTP hết hạn sau 10 phút
3. **One-time use**: Mỗi OTP chỉ được sử dụng một lần
4. **Token expiration**: Reset token hết hạn sau 15 phút
5. **Secure storage**: OTP được hash và lưu trữ an toàn

## Database Schema

### Password_Resets Collection
```javascript
{
  userId: ObjectId,        // Reference to User
  email: String,          // User's email
  codeHash: String,       // Hashed OTP or JWT token hash
  otp: String,           // Actual OTP (6 digits)
  type: String,          // "reset" or "verify"
  expiresAt: Date,       // Expiration time
  used: Boolean,         // Whether this record has been used
  attempts: Number,      // Number of failed attempts
  createdAt: Date        // Creation timestamp
}
```

## API Endpoints

- `POST /api/auth/forgot` - Request password reset OTP
- `POST /api/auth/verify-otp` - Verify OTP and get reset token
- `POST /api/auth/reset` - Reset password with token
- `GET /api/auth/test-email` - Test email configuration


