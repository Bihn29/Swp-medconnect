import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { verifyPasswordOtp } from "../../services/userService";

export default function VerifyOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const e = location.state?.email;
    if (e) setEmail(e);
  }, [location.state]);

  const onSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const res = await verifyPasswordOtp(email.trim(), otp.trim());
      const token = res?.resetToken;
      navigate("/dat-lai-mat-khau", { state: { token } });
    } catch (err) {
      setError("Mã OTP không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div aria-hidden className="login-bg" />
      <div aria-hidden className="login-overlay" />
      <div className="login-card login-center-fixed">
        <h1 className="login-title">Xác minh mã OTP</h1>
        <form onSubmit={onSubmit}>
          <input
            className="login-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
          />
          <input
            className="login-input"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder="Nhập mã OTP"
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>Xác minh</button>
        </form>
        {error && <div className="error-text">{error}</div>}
        <div className="login-links">
          <Link to="/quen-mat-khau">Gửi lại OTP</Link>
        </div>
      </div>
    </div>
  );
}


