import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { Badge } from "../../../components/ui/Badge"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/Select"
import "./BlockTimeManager.scss"

export default function BlockTimeManager() {
  const [blockedTimes, setBlockedTimes] = useState([])
  const [loading, setLoading] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newBlockTime, setNewBlockTime] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  })

  const blockReasons = ["Nghỉ trưa", "Họp với quản lý", "Đào tạo", "Bảo trì hệ thống", "Sự kiện cá nhân", "Khác"]

  // Fetch blocked times from API
  useEffect(() => {
    const fetchBlockedTimes = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/doctors/me/blocked-times', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.blockedTimes) {
            setBlockedTimes(data.data.blockedTimes);
          }
        }
      } catch (error) {
        console.error('Error fetching blocked times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedTimes();
  }, []);

  const handleAddBlockTime = () => {
    if (newBlockTime.date && newBlockTime.startTime && newBlockTime.endTime && newBlockTime.reason) {
      const newBlock = {
        id: Date.now().toString(),
        ...newBlockTime,
        affectedAppointments: Math.floor(Math.random() * 3),
      }
      setBlockedTimes([...blockedTimes, newBlock])
      setNewBlockTime({ date: "", startTime: "", endTime: "", reason: "" })
      setIsDialogOpen(false)
      console.log("Block time added:", newBlock)
    }
  }

  const handleRemoveBlockTime = (id) => {
    setBlockedTimes(blockedTimes.filter((block) => block.id !== id))
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="block-time-manager">
      {/* Add Block Time Button */}
      <div className="block-time-manager-header">
        <Button onClick={() => setIsDialogOpen(true)} className="block-time-manager-add-btn">
          <Plus className="w-4 h-4 mr-2" />
          Thêm thời gian khóa
        </Button>
      </div>

      {/* Blocked Times List */}
      <Card className="block-time-manager-card">
        <CardHeader>
          <CardTitle>Danh sách thời gian khóa</CardTitle>
        </CardHeader>
        <CardContent>
          {blockedTimes.length === 0 ? (
            <div className="block-time-manager-empty">
              <p>Không có thời gian khóa nào. Nhấn "Thêm thời gian khóa" để bắt đầu.</p>
            </div>
          ) : (
            <div className="block-time-manager-list">
              {blockedTimes.map((block) => (
                <div key={block.id} className="block-time-manager-item">
                  <div className="block-time-manager-item-header">
                    <div className="block-time-manager-item-info">
                      <p className="block-time-manager-item-date">{formatDate(block.date)}</p>
                      <p className="block-time-manager-item-time">
                        {block.startTime} - {block.endTime}
                      </p>
                    </div>
                    <Badge variant="outline">{block.reason}</Badge>
                  </div>

                  {block.affectedAppointments > 0 && (
                    <div className="block-time-manager-warning">
                      <AlertCircle className="block-time-manager-warning-icon" />
                      <div>
                        <p className="block-time-manager-warning-title">
                          Ảnh hưởng đến {block.affectedAppointments} lịch hẹn
                        </p>
                        <p className="block-time-manager-warning-desc">
                          Các bệnh nhân sẽ được thông báo về sự thay đổi này
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="block-time-manager-item-actions">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveBlockTime(block.id)}
                      className="block-time-manager-remove-btn"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Block Time Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="block-time-manager-dialog">
          <DialogHeader>
            <DialogTitle>Thêm thời gian khóa</DialogTitle>
          </DialogHeader>
          <div className="block-time-manager-form">
            <div className="block-time-manager-form-field">
              <label className="block-time-manager-form-label">Ngày</label>
              <Input
                type="date"
                value={newBlockTime.date}
                onChange={(e) => setNewBlockTime({ ...newBlockTime, date: e.target.value })}
                className="block-time-manager-form-input"
              />
            </div>

            <div className="block-time-manager-form-grid">
              <div className="block-time-manager-form-field">
                <label className="block-time-manager-form-label">Giờ bắt đầu</label>
                <Input
                  type="time"
                  value={newBlockTime.startTime}
                  onChange={(e) => setNewBlockTime({ ...newBlockTime, startTime: e.target.value })}
                  className="block-time-manager-form-input"
                />
              </div>
              <div className="block-time-manager-form-field">
                <label className="block-time-manager-form-label">Giờ kết thúc</label>
                <Input
                  type="time"
                  value={newBlockTime.endTime}
                  onChange={(e) => setNewBlockTime({ ...newBlockTime, endTime: e.target.value })}
                  className="block-time-manager-form-input"
                />
              </div>
            </div>

            <div className="block-time-manager-form-field">
              <label className="block-time-manager-form-label">Lý do</label>
              <Select
                value={newBlockTime.reason}
                onValueChange={(value) => setNewBlockTime({ ...newBlockTime, reason: value })}
              >
                <SelectTrigger className="block-time-manager-form-select">
                  <SelectValue placeholder="Chọn lý do" />
                </SelectTrigger>
                <SelectContent>
                  {blockReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Hoặc nhập lý do khác"
                value={newBlockTime.reason}
                onChange={(e) => setNewBlockTime({ ...newBlockTime, reason: e.target.value })}
                className="block-time-manager-form-input"
              />
            </div>

            <div className="block-time-manager-notice">
              <p className="block-time-manager-notice-text">
                Các bệnh nhân có lịch hẹn trong khoảng thời gian này sẽ được thông báo tự động.
              </p>
            </div>

            <div className="block-time-manager-form-actions">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="block-time-manager-form-cancel">
                Hủy
              </Button>
              <Button onClick={handleAddBlockTime} className="block-time-manager-form-submit">
                Thêm khóa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
