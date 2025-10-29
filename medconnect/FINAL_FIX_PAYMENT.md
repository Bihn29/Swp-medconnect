# ✅ FIX CUỐI CÙNG - Lỗi Description PayOS

## 🐛 Lỗi Tìm Thấy

Console hiển thị:
```
Error creating payment: Error: HTTP 200, description: Mô tả tối đa 25 kí tự (code: 20)
```

**PayOS giới hạn description ≤ 25 ký tự**

## 🔍 Nguyên Nhân

### Lỗi ở 2 nơi:

1. **Client** ❌ (đã sửa)
```javascript
description: `Thanh toán khám bệnh - ${doctor.fullName}` 
// Ví dụ: "Thanh toán khám bệnh - BS. Nguyễn Văn Anh" = 43 ký tự
```

2. **Server** ❌ (vừa mới sửa)
```javascript
description: `Payment-Appointment-${appointmentId.slice(-10)}`
// Ví dụ: "Payment-Appointment-67342a1b5c" = 31 ký tự
```

## ✅ Đã Sửa

### Client (TimeSlotSelection.jsx)
```javascript
description: `Kham benh MedConnect` // 22 ký tự ✅
```

### Server (payos.service.js)
```javascript
description: `MedConnect ${orderCode.slice(-8)}` // ~18 ký tự ✅
// Ví dụ: "MedConnect 12345678"
```

## 🚀 HƯỚNG DẪN - LÀM NGAY

### Bước 1: STOP Server Hiện Tại
Trong terminal server, nhấn **Ctrl+C**

### Bước 2: Restart Server
```bash
cd server
npm run dev
```

**Đợi thấy:**
```
✅ Kết nối đến MongoDB thành công
✅ Appointment cleanup cron job started
🚀 Server đang chạy tại: http://localhost:3000
```

### Bước 3: Clear Cache & Reload Client
Trong browser:
- Nhấn **Ctrl+Shift+R** (hard reload)
- Hoặc **F12** → Network tab → Check "Disable cache" → **F5**

### Bước 4: Test Lại
1. Đặt lịch khám
2. Bấm "Xác nhận đặt lịch"
3. **Kết quả mong đợi:**
   - Message: "Đang chuyển đến trang thanh toán..."
   - Redirect → PayOS payment page

## 📊 Flow Sau Khi Fix

```
User bấm "Xác nhận đặt lịch"
↓
POST /api/patients/appointments
→ Response: { appointment: { _id: "...", paymentStatus: "unpaid" } }
↓
POST /api/payments/payos/create-payment
Body: {
  appointmentId: "...",
  amount: 200000,
  description: "Kham benh MedConnect"  // ✅ 22 chars
}
↓
Server creates PayOS payment:
{
  orderCode: 1234567890,
  amount: 200000,
  description: "MedConnect 67890"  // ✅ 18 chars
  returnUrl: "http://localhost:5173/dat-lich/payment-result?status=success"
}
↓
Response: { 
  success: true, 
  data: { payUrl: "https://pay.payos.vn/web/..." } 
}
↓
window.location.href = payUrl
↓
✅ User thấy trang PayOS với QR code thanh toán
```

## 🔍 Kiểm Tra Server Logs

Sau khi restart server và test, bạn sẽ thấy:

**Thành công:**
```
POST /api/patients/appointments 200
POST /api/payments/payos/create-payment 200
✅ Payment link created successfully
```

**Thất bại (nếu còn lỗi khác):**
```
POST /api/payments/payos/create-payment 500
❌ Error creating PayOS payment link: [lỗi cụ thể]
```

## 🎯 Các Lỗi Có Thể Còn

### 1. Lỗi CORS
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Fix:** Check `server/index.js` - CORS config

### 2. Lỗi Auth
```
401 Unauthorized - User ID not found
```
**Fix:** Logout → Login lại

### 3. Lỗi MongoDB
```
Appointment not found
```
**Fix:** Check MongoDB connection

### 4. Lỗi PayOS Credentials
```
PayOS API error: Invalid credentials
```
**Fix:** Check `.env` file

## 📝 Checklist

- [x] Sửa description trong client → "Kham benh MedConnect"
- [x] Sửa description trong server → "MedConnect {orderCode}"
- [x] Cập nhật webhook handler để check "MedConnect"
- [ ] **RESTART SERVER** ← Làm ngay bước này!
- [ ] Hard reload browser (Ctrl+Shift+R)
- [ ] Test đặt lịch
- [ ] Verify redirect đến PayOS

## 💡 Tại Sao Cần Restart Server?

Server đã cache code cũ trong memory. Kể cả khi bạn sửa file `.js`, server vẫn dùng code cũ cho đến khi restart.

**nodemon** sẽ tự động restart khi detect file changes, NHƯNG nếu bạn có nhiều node processes đang chạy, cần kill hết và restart lại.

## 🚨 Nếu Vẫn Lỗi Sau Khi Restart

### Check 1: Server có đang chạy code mới không?
Thêm log vào server để verify:

```javascript
// server/services/payos.service.js (line 77)
console.log("🔍 PayOS payment data:", payosPaymentData);
```

Restart server và test → Check terminal xem description có đúng không

### Check 2: Client có gọi đúng không?
Mở F12 → Network → Tìm request `create-payment` → Check request body

### Check 3: Response từ PayOS
F12 → Network → Click vào request `create-payment` → Check response

## 🎉 Kết Quả Mong Đợi

**Sau khi làm đúng các bước:**

1. ✅ Bấm "Xác nhận đặt lịch"
2. ✅ Loading 2-3 giây
3. ✅ Message: "Đang chuyển đến trang thanh toán..."
4. ✅ Browser tự động redirect
5. ✅ Thấy trang PayOS với:
   - Số tiền: 200,000 VND
   - QR code để scan
   - Hoặc form nhập thông tin thẻ

---

**HÃY RESTART SERVER NGAY VÀ TEST!** 🚀

