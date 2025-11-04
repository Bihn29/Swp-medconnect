# Test Service Payment Flow

## Kiểm tra sau khi thanh toán dịch vụ thành công:

### 1. Kiểm tra Backend Logs:
Sau khi thanh toán thành công, kiểm tra console logs server để xem:
- ✅ `📧 Service payment confirmation email sent for appointment ...` - Email đã gửi
- ✅ `✅ Appointment status updated to "done" after service payment: ...` - Status đã cập nhật
- ✅ `✅ Service payment processed successfully for appointment ...` - Payment đã xử lý thành công

### 2. Kiểm tra Database:
- Appointment status phải là `"done"`
- Payment record phải có:
  - `status: "captured"`
  - `invoiceType: "service"`
  - `orderCode` đã được set

### 3. Kiểm tra Email:
- Kiểm tra inbox của bệnh nhân xem có nhận được email không
- Email phải có subject: `Xác nhận thanh toán dịch vụ - INV-...`
- Kiểm tra spam folder nếu không thấy

### 4. Kiểm tra Frontend:
- Sau khi thanh toán thành công, quay lại trang appointment list
- Appointment phải có status `"done"`
- Không còn hiển thị các nút "Hóa đơn dịch vụ" và "Không dịch vụ"

### 5. Debug nếu không thấy email:
Kiểm tra logs server:
- `⚠️ No email address found for patient` - Patient không có email
- `❌ Error sending service payment confirmation email` - Có lỗi khi gửi email
- `🔍 Service payment email data:` - Kiểm tra patient email có được populate không

