import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.scss"; // reuse styles

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(v || "").trim());

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Vui lòng nhập email");
    if (!isValidEmail(email)) return setError("Email không hợp lệ");
    if (!password.trim()) return setError("Vui lòng nhập mật khẩu");
    if (password.length < 8) return setError("Mật khẩu tối thiểu 8 ký tự");
    if (password !== confirm) return setError("Mật khẩu nhập lại không khớp");
    try {
      setLoading(true);
      // TODO: call backend register API
      // const apiUrl = import.meta.env.VITE_API_URL;
      // await fetch(apiUrl + "/api/auth/register", { ... })
      navigate("/dang-nhap");
    } catch (err) {
      setError("Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      {/* reuse layout */}
      <div aria-hidden className="login-bg" />
      <div aria-hidden className="login-overlay" />
      <div className="login-card login-center-fixed">
        <h1 className="login-title">Tạo tài khoản mới</h1>
        <form onSubmit={onSubmit}>
          <input
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
          />
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu (>=8 ký tự)"
            autoComplete="new-password"
          />
          <input
            className="login-input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
          />
          {error && <div className="error-text">{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary">
            Đăng ký
          </button>
        </form>
        <div className="login-links">
          <Link to="/dang-nhap">Đã có tài khoản? Đăng nhập</Link>
          <Link to="/">Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
