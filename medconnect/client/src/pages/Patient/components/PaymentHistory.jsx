import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  CreditCardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const payments = [
  {
    id: "TXN-2025-001234",
    date: "10 Tháng 4, 2025",
    amount: "500,000 ₫",
    method: "VNPAY",
    status: "paid",
    description: "Khám Tim mạch - BS. Nguyễn Văn An",
  },
  {
    id: "TXN-2025-001189",
    date: "25 Tháng 3, 2025",
    amount: "350,000 ₫",
    method: "MoMo",
    status: "paid",
    description: "Khám Tai mũi họng - BS. Hoàng Minh Tuấn",
  },
  {
    id: "TXN-2025-001156",
    date: "15 Tháng 3, 2025",
    amount: "300,000 ₫",
    method: "VietQR",
    status: "refunded",
    description: "Khám Nhi khoa - BS. Nguyễn Thu Hà (Đã hủy)",
  },
];

export function PaymentHistory() {
  return (
    <Card className="medical-card fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold">
          Lịch sử thanh toán
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          Xem tất cả
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <CreditCardOutlined
                    style={{ fontSize: "16px", color: "hsl(var(--primary))" }}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {payment.description}
                  </p>
                  <p className="text-xs text-muted-foreground">{payment.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {payment.date}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="font-semibold text-foreground">
                  {payment.amount}
                </p>
                <Badge variant="outline" className="text-xs">
                  {payment.method}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              {payment.status === "paid" ? (
                <>
                  <CheckCircleOutlined
                    style={{ fontSize: "16px", color: "#16a34a" }}
                  />
                  <span className="text-xs text-green-600 font-medium">
                    Đã thanh toán
                  </span>
                </>
              ) : (
                <>
                  <CloseCircleOutlined
                    style={{ fontSize: "16px", color: "#d97706" }}
                  />
                  <span className="text-xs text-amber-600 font-medium">
                    Đã hoàn tiền
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
