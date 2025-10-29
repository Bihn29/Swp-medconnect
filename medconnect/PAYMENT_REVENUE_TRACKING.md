# 💰 Tracking Doanh Thu Từ Thanh Toán

## ✅ Đã Implement

Sau khi thanh toán thành công trên PayOS, webhook tự động lưu payment vào database.

## 📊 Payment Record Structure

Mỗi thanh toán thành công sẽ tạo 1 record trong collection **Payments**:

```javascript
{
  _id: ObjectId,
  appointmentId: ObjectId,          // Link đến appointment
  invoiceNumber: "INV-PAYOS-1234567890",
  currency: "VND",
  issueDate: ISODate,
  
  // Thông tin người thanh toán
  billTo: {
    patientId: ObjectId,
    name: "Ngô Thanh Bình",
    email: "thanh.binh@email.com",
    phone: "0987654321"
  },
  
  // Thông tin bác sĩ/phòng khám
  billFrom: {
    doctorId: ObjectId,
    clinicId: ObjectId,
    doctorName: "BS. Nguyễn Văn Anh",
    clinicName: "MedConnect Clinic Thủ Đức"
  },
  
  // Chi tiết hóa đơn
  items: [{
    description: "Medical Consultation",
    quantity: 1,
    unitPrice: 10000,      // Số tiền bạn vừa set
    lineTotal: 10000
  }],
  
  subtotal: 10000,
  discount: 0,
  total: 10000,           // ← TỔNG TIỀN (để tính doanh thu)
  
  // Thông tin thanh toán
  gateway: "payos",
  method: "qr",
  status: "captured",     // Đã thanh toán thành công
  providerTxnId: "1234567890",
  paidAt: ISODate,
  capturedAt: ISODate,
  
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 🔧 Webhook Handler Code

File: `server/services/payos.service.js` (lines 130-174)

```javascript
// Tạo Payment record
const payment = new Payment({
  appointmentId: appointment._id,
  invoiceNumber: `INV-PAYOS-${orderCode}`,
  currency: "VND",
  issueDate: new Date(),
  
  billTo: {
    patientId: patient._id,
    name: patient.fullName || patient.userId?.fullName || "Unknown",
    email: patient.userId?.email,
    phone: patient.userId?.phoneNumber,
  },
  
  billFrom: {
    doctorId: doctor._id,
    clinicId: appointment.clinicId?._id,
    doctorName: doctor.fullName || "Unknown Doctor",
    clinicName: appointment.clinicId?.name || "Online Consultation",
  },
  
  items: [{
    description: tempOrder.description || "Medical Consultation",
    quantity: 1,
    unitPrice: parseInt(amount),
    lineTotal: parseInt(amount),
  }],
  
  subtotal: parseInt(amount),
  discount: 0,
  total: parseInt(amount),  // ← SỐ TIỀN ĐƯỢC LƯU
  
  gateway: "payos",
  method: "qr",
  status: "captured",
  providerTxnId: String(orderCode),
  paidAt: new Date(),
  capturedAt: new Date(),
});

await payment.save();  // ← LƯU VÀO DATABASE

// Cập nhật appointment
appointment.paymentStatus = "paid";
appointment.paymentId = payment._id;
await appointment.save();
```

## 📈 Query Để Tính Doanh Thu

### 1. Tổng Doanh Thu Toàn Hệ Thống
```javascript
db.Payments.aggregate([
  { $match: { status: "captured" } },
  { $group: { 
      _id: null, 
      totalRevenue: { $sum: "$total" },
      count: { $sum: 1 }
  }}
])
```

### 2. Doanh Thu Theo Bác Sĩ
```javascript
db.Payments.aggregate([
  { $match: { status: "captured" } },
  { $group: { 
      _id: "$billFrom.doctorId", 
      doctorName: { $first: "$billFrom.doctorName" },
      totalRevenue: { $sum: "$total" },
      appointmentCount: { $sum: 1 }
  }},
  { $sort: { totalRevenue: -1 } }
])
```

### 3. Doanh Thu Theo Phòng Khám
```javascript
db.Payments.aggregate([
  { $match: { 
      status: "captured",
      "billFrom.clinicId": { $exists: true }
  }},
  { $group: { 
      _id: "$billFrom.clinicId", 
      clinicName: { $first: "$billFrom.clinicName" },
      totalRevenue: { $sum: "$total" },
      appointmentCount: { $sum: 1 }
  }}
])
```

### 4. Doanh Thu Theo Tháng
```javascript
db.Payments.aggregate([
  { $match: { status: "captured" } },
  { $group: { 
      _id: { 
        year: { $year: "$paidAt" },
        month: { $month: "$paidAt" }
      },
      totalRevenue: { $sum: "$total" },
      count: { $sum: 1 }
  }},
  { $sort: { "_id.year": -1, "_id.month": -1 } }
])
```

### 5. Doanh Thu Theo Ngày (Tuần/Tháng Hiện Tại)
```javascript
// Doanh thu 7 ngày gần đây
db.Payments.aggregate([
  { $match: { 
      status: "captured",
      paidAt: { 
        $gte: new Date(Date.now() - 7*24*60*60*1000) 
      }
  }},
  { $group: { 
      _id: { 
        $dateToString: { format: "%Y-%m-%d", date: "$paidAt" }
      },
      totalRevenue: { $sum: "$total" },
      count: { $sum: 1 }
  }},
  { $sort: { _id: -1 } }
])
```

## 🧪 Test Webhook

### Bước 1: Thực Hiện Thanh Toán Test
1. Đặt lịch khám (amount: 10,000 VND)
2. Thanh toán trên PayOS (dùng test mode)
3. Hoàn tất thanh toán

### Bước 2: Check Database
Mở MongoDB Compass → Collection **Payments** → Refresh

**Kết quả mong đợi:**
```javascript
{
  _id: ObjectId("..."),
  appointmentId: ObjectId("..."),
  invoiceNumber: "INV-PAYOS-...",
  total: 10000,
  status: "captured",
  gateway: "payos",
  paidAt: ISODate("2025-10-29T...")
}
```

### Bước 3: Verify Appointment Updated
Collection **Appointments** → Tìm appointment vừa tạo:
```javascript
{
  _id: ObjectId("..."),
  paymentStatus: "paid",        // ✅ Đã update
  paymentId: ObjectId("..."),   // ✅ Link đến payment
}
```

## ⚠️ Lưu Ý Quan Trọng

### 1. Webhook URL
Để webhook hoạt động, cần config trên PayOS dashboard:
```
Webhook URL: https://your-domain.com/api/payments/payos/webhook
```

**Local development:** Dùng ngrok hoặc localtunnel
```bash
# Install ngrok
ngrok http 3000

# Copy public URL
https://abc123.ngrok.io
```

Webhook URL: `https://abc123.ngrok.io/api/payments/payos/webhook`

### 2. Test Mode vs Production
- **Test mode:** Payment được tạo nhưng không có tiền thật
- **Production:** Cần activate PayOS account và dùng live credentials

### 3. Idempotency
Webhook handler đã xử lý duplicate webhooks:
```javascript
const existingPayment = await Payment.findOne({ appointmentId });
if (existingPayment && existingPayment.status === "captured") {
  throw new Error("Appointment already paid");
}
```

## 📊 API Endpoints Để Lấy Doanh Thu

### Tạo API Endpoint (Đề xuất)

**File:** `server/controllers/paymentController.js` (NEW)

```javascript
import Payment from "../models/payment.model.js";

// Tổng doanh thu
export async function getTotalRevenue(req, res) {
  try {
    const result = await Payment.aggregate([
      { $match: { status: "captured" } },
      { $group: { 
          _id: null, 
          totalRevenue: { $sum: "$total" },
          count: { $sum: 1 }
      }}
    ]);
    
    res.json({
      success: true,
      data: result[0] || { totalRevenue: 0, count: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Doanh thu theo bác sĩ
export async function getRevenueByDoctor(req, res) {
  try {
    const result = await Payment.aggregate([
      { $match: { status: "captured" } },
      { $group: { 
          _id: "$billFrom.doctorId", 
          doctorName: { $first: "$billFrom.doctorName" },
          totalRevenue: { $sum: "$total" },
          appointmentCount: { $sum: 1 }
      }},
      { $sort: { totalRevenue: -1 } }
    ]);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Doanh thu theo tháng
export async function getRevenueByMonth(req, res) {
  try {
    const result = await Payment.aggregate([
      { $match: { status: "captured" } },
      { $group: { 
          _id: { 
            year: { $year: "$paidAt" },
            month: { $month: "$paidAt" }
          },
          totalRevenue: { $sum: "$total" },
          count: { $sum: 1 }
      }},
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
```

## 🎯 Tóm Tắt

### ✅ Đã Có
1. Payment model với đầy đủ fields
2. Webhook handler tự động lưu payment
3. Link payment với appointment
4. Tracking đầy đủ thông tin: patient, doctor, clinic, amount

### 📝 Cần Làm (Optional)
1. Config webhook URL trên PayOS dashboard
2. Tạo API endpoints để query doanh thu
3. Tạo dashboard hiển thị báo cáo doanh thu
4. Export reports ra Excel/PDF

### 💡 Next Steps
1. Test webhook bằng cách thanh toán thực
2. Check MongoDB Compass xem payment có được lưu không
3. Tạo admin dashboard để xem báo cáo doanh thu

---

**Webhook đã sẵn sàng! Chỉ cần thanh toán và check database.** 🚀

