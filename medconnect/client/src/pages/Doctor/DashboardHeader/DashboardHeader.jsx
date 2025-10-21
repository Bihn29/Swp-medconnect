import { Bell, Search, Settings } from "lucide-react"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { useNavigate } from "react-router-dom"
import "./DashboardHeader.scss"

export default function DashboardHeader() {
  const navigate = useNavigate()

  return (
    <div className="dashboard-header">
      <div className="dashboard-header-content">
        <h2 className="dashboard-header-title">Chào mừng trở lại, TS.BS. Sarah</h2>
        <p className="dashboard-header-subtitle">Đây là những gì đang xảy ra trong phòng khám của bạn hôm nay</p>
      </div>
      <div className="dashboard-header-actions">
        <div className="dashboard-header-search">
          <Search className="dashboard-header-search-icon" />
          <Input placeholder="Tìm kiếm bệnh nhân..." className="dashboard-header-search-input" />
        </div>
        <Button variant="ghost" size="icon" className="dashboard-header-notification">
          <Bell className="h-5 w-5" />
          <span className="dashboard-header-notification-badge" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
          className="dashboard-header-settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
