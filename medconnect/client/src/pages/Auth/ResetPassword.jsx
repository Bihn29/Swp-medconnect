import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { resetPasswordWithToken } from "../../services/userService";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const t = location.state?.token;
    if (t) setToken(t);
  }, [location.state]);

  const onSubmit = async e => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    try {
      setLoading(true);
      await resetPasswordWithToken(token.trim(), password);
      setMessage("Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.");
      setTimeout(() => navigate("/dang-nhap"), 1000);
    } catch (err) {
      setError("Không thể đặt lại mật khẩu. Mã xác thực không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div aria-hidden className="login-bg" />
      <div aria-hidden className="login-overlay" />
      <div className="login-card login-center-fixed">
        <h1 className="login-title">Đặt lại mật khẩu</h1>
        <form onSubmit={onSubmit}>
          <input
            className="login-input"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Mã xác thực đặt lại mật khẩu"
            required
          />
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mật khẩu mới"
            required
          />
          <input
            className="login-input"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Xác nhận mật khẩu mới"
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>Đổi mật khẩu</button>
        </form>
        {message && <div className="info-text" style={{ marginTop: 12 }}>{message}</div>}
        {error && <div className="error-text" style={{ marginTop: 12 }}>{error}</div>}
        <div className="login-links">
          <Link to="/dang-nhap">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}


