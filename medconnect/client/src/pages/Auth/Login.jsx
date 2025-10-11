import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, signInWithGoogle } from "../../lib/firebase";
import { signInWithCustomToken, signOut, updateProfile } from "firebase/auth";
import "./Login.scss";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const setAuthAllowed = (v) =>
    v
      ? sessionStorage.setItem("auth_allowed", "1")
      : sessionStorage.removeItem("auth_allowed");

  const toE164 = (raw, country = "+84") => {
    const num = String(raw || "").replace(/\D/g, "");
    if (!num) return "";
    if (country === "+84" && num.startsWith("0")) return country + num.slice(1);
    if (num.startsWith("+")) return num;
    return country + num;
  };
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(v || "").trim());
  const isValidVNPhone = (raw) => /^\+84\d{9}$/.test(toE164(raw));
  const isValidPassword = (v) => String(v || "").length >= 8;

  const goByRole = (role) => {
    switch ((role || "").toUpperCase()) {
      case "PATIENT":
        navigate("/benh-nhan");
        break;
      case "DOCTOR":
        navigate("/bac-si");
        break;
      case "ADMIN":
        navigate("/quan-tri");
        break;
      default:
        navigate("/");
        break;
    }
  };

  async function passwordLogin(identifier, pwd) {
    setGeneralError("");

    const r = await fetch(`${apiUrl}/api/auth/login-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ identifier, password: pwd }),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      if (r.status === 404) {
        setGeneralError("Bạn chưa có tài khoản. Vui lòng đăng ký tài khoản.");
        return;
      }
      if (r.status === 401) throw new Error("Email/SĐT hoặc mật khẩu không đúng");
      throw new Error(data?.error || "Không đăng nhập được");
    }

    const token = data?.customToken ?? data?.data?.customToken;
    const roleFromLogin = data?.role ?? data?.data?.role;
    const fullNameFromLogin = data?.user?.fullName ?? data?.data?.user?.fullName;

    if (!token) throw new Error("Thiếu customToken từ server");

    const cred = await signInWithCustomToken(auth, token);

    if (fullNameFromLogin) {
      try {
        await updateProfile(cred.user, { displayName: fullNameFromLogin });
      } catch (err) {
        console.warn("updateProfile failed:", err);
      }
    }

    const idToken = await cred.user.getIdToken();

    const r2 = await fetch(`${apiUrl}/api/auth/session`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!r2.ok) throw new Error("Không tạo được phiên đăng nhập");

    let roleFromMe;
    let fullNameFromMe;

    try {
      const meRes = await fetch(`${apiUrl}/api/auth/me`, { credentials: "include" });
      const meData = await meRes.json().catch(() => ({}));
      roleFromMe = meData?.data?.user?.role ?? meData?.user?.role ?? null;
      fullNameFromMe =
        meData?.data?.profile?.fullName ?? meData?.profile?.fullName ?? null;
      const finalName = fullNameFromLogin || fullNameFromMe || "";
      if (finalName) sessionStorage.setItem("mc_fullname", finalName);
    } catch (err) {
      console.warn("Fetch /me failed:", err);
    }

    const finalRole = roleFromLogin ?? roleFromMe;
    if (!finalRole) {
      setGeneralError("Không xác định được vai trò người dùng.");
      return;
    }

    setAuthAllowed(true);
    goByRole(finalRole);
  }

  const validateForm = () => {
    setEmailError("");
    setPhoneError("");
    setPasswordError("");

    if (!password.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu.");
      return false;
    }
    if (!isValidPassword(password)) {
      setPasswordError("Mật khẩu phải tối thiểu 8 ký tự.");
      return false;
    }

    if (mode === "email") {
      if (!email.trim()) {
        setEmailError("Vui lòng nhập email.");
        return false;
      }
      if (!isValidEmail(email)) {
        setEmailError("Email không đúng định dạng.");
        return false;
      }
    } else {
      if (!phone.trim()) {
        setPhoneError("Vui lòng nhập số điện thoại.");
        return false;
      }
      if (!isValidVNPhone(phone)) {
        setPhoneError("Số điện thoại không đúng định dạng (VD: 0xxxxxxxxx hoặc +84xxxxxxxxx).");
        return false;
      }
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      const identifier = mode === "email" ? email.trim() : toE164(phone);
      await passwordLogin(identifier, password);
    } catch (err) {
      console.error("Login error:", err);
      setGeneralError(err?.message || "Không đăng nhập được");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setLoading(true);
    setGeneralError("");
    try {
      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();

      const r = await fetch(`${apiUrl}/api/auth/google-login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (r.status === 403) {
        setAuthAllowed(false);
        try {
          await signOut(auth);
        } catch (err) {
          setGeneralError("Bạn chưa có tài khoản. Vui lòng đăng ký tài khoản.");
        }
        return;
      }

      if (!r.ok) {
        setAuthAllowed(false);
        try {
          await signOut(auth);
        } catch (err) {
          throw new Error("Lỗi đăng nhập Google");
        }
      }

      const data = await r.json().catch(() => ({}));

      let roleFromMe;
      let fullNameFromMe;

      try {
        const meRes = await fetch(`${apiUrl}/api/auth/me`, { credentials: "include" });
        const meData = await meRes.json().catch(() => ({}));
        roleFromMe = meData?.data?.user?.role ?? meData?.user?.role ?? null;
        fullNameFromMe =
          meData?.data?.profile?.fullName ?? meData?.profile?.fullName ?? null;
        if (fullNameFromMe) sessionStorage.setItem("mc_fullname", fullNameFromMe);
      } catch (err) {
        console.warn("Fetch /me failed:", err);
      }

      const finalRole = data?.role ?? data?.data?.role ?? roleFromMe;
      if (!finalRole) {
        setGeneralError("Không xác định được vai trò người dùng.");
        return;
      }

      setAuthAllowed(true);
      goByRole(finalRole);
    } catch (err) {
      setAuthAllowed(false);
      try {
        await signOut(auth);
      } catch (err) {
      setGeneralError(err?.message || "Lỗi đăng nhập Google");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div aria-hidden className="login-bg" />
      <div aria-hidden className="login-overlay" />
      <div className="login-card login-center-fixed">
        <h1 className="login-title">Chào mừng đến với MedConnect</h1>
        <form onSubmit={onSubmit}>
          {mode === "email" ? (
            <>
              <input
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
              />
              {emailError && <div className="error-text">{emailError}</div>}
            </>
          ) : (
            <>
              <input
                className="login-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại"
                autoComplete="tel"
              />
              {phoneError && <div className="error-text">{phoneError}</div>}
            </>
          )}

          <div className="password-group">
            <input
              className="login-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              autoComplete="current-password"
            />
            <i
              className={`bi ${showPassword ? "bi-eye-fill" : "bi-eye-slash-fill"} password-toggle`}
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          {passwordError && <div className="error-text">{passwordError}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="separator">
          <span>Hoặc</span>
        </div>

        <div className="login-alt">
          <button
            type="button"
            onClick={() => setMode(mode === "email" ? "phone" : "email")}
            className="btn btn-outline btn-full"
          >
            <i className="bi bi-phone-vibrate" />
            {mode === "email" ? "Đăng nhập bằng điện thoại" : "Đăng nhập bằng email"}
          </button>

          <button type="button" onClick={onGoogle} disabled={loading} className="btn btn-google btn-full">
            <i className="bi bi-google" />
            Đăng nhập bằng Google
          </button>
        </div>

        {generalError && <div className="error-text">{generalError}</div>}

        <div className="login-links">
          <Link to="/quen-mat-khau">Quên mật khẩu</Link>
          <Link to="/dang-ky">Đăng ký tài khoản mới</Link>
        </div>
      </div>
    </div>
  );
}
