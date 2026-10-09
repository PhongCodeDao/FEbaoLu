import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, InputAdornment } from "@mui/material";
import {
  PhoneAndroid,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { Button } from "antd";

import { loginApi } from "../../../api/axios/Auth/authApi";
import shield from "../../../src/assets/LoginImage/shield.svg";

import AuthNotify from "../../utils/Common/AuthNotify";
import LoginLoaderPay from "../../utils/LoginLoader/LoginLoaderPay";

import "./login.css";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const redirectByRole = {
    admin: "/admin",
    manager: "/manager",
    rescueteam: "/rescueTeam",
    coordinator: "/coordinator",
  };

  /* ================= VALIDATE ================= */

  const phoneRegex = /^\d{10}$/;

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    const err = {};

    /* PHONE */

    if (!phone.trim()) {
      err.phone = "Nhập số điện thoại";
    } else if (!phoneRegex.test(phone)) {
      err.phone = "Số điện thoại phải đủ 10 chữ số";
    }

    /* PASSWORD */

    if (!password.trim()) {
      err.password = "Nhập mật khẩu";
    }

    setErrors(err);

    if (Object.keys(err).length) return;

    try {
      /* HIỆN LOADER */

      setLoading(true);

      /* CHO REACT 1 FRAME RENDER LOADER */

      await new Promise((resolve) => setTimeout(resolve, 50));

      const res = await loginApi({ phone, password });

      console.log("LOGIN RESPONSE:", res);

      if (!res || !res.user || !res.token) {
        AuthNotify.error("Sai số điện thoại hoặc mật khẩu");

        return;
      }

      /* LƯU SESSION */

      sessionStorage.setItem("accessToken", res.token);
      sessionStorage.setItem("user", JSON.stringify(res.user));
      sessionStorage.setItem("role", res.user.roleName.toLowerCase());
      sessionStorage.setItem("isAuth", "true");

      AuthNotify.success(
        "Đăng nhập thành công",
        `Chào mừng ${res.user.fullName}`
      );

      const role = res.user.roleName.toLowerCase();

      navigate(redirectByRole[role], { replace: true });
    } catch (error) {
      console.error(error);

      AuthNotify.error("Sai số điện thoại hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* LOADER */}

      {loading && <LoginLoaderPay />}

      {/* LEFT */}

      <div className="login-hero">
        <video className="hero-video" autoPlay loop muted playsInline>
          <source src="/Videonen.mp4" type="video/mp4" />
        </video>

        <div className="hero-overlay">
          <div className="hero-top">
            <img src={shield} alt="" />
            <span>PREMIUM COMMAND</span>
          </div>

          <h1>
            HỆ THỐNG <br />
            QUẢN LÝ & <span>BẢO MẬT</span>
          </h1>

          <div className="hero-metrics">
            <span>24/7 VẬN HÀNH</span>
            <span>AES-256</span>
            <span>REALTIME</span>
          </div>
        </div>
      </div>

      {/* RIGHT */}

      <div className="login-card">
        <h2>Đăng nhập</h2>

        <div className="login-line" />

        <p className="login-desc">
          Truy cập hệ thống quản trị vận hành cao cấp
        </p>

        <div className="login-form">
          {/* PHONE */}

          <div className="form-group">
            <label className="login-label">TÀI KHOẢN NỘI BỘ</label>

            <TextField
              fullWidth
              variant="filled"
              placeholder="Số điện thoại"
              value={phone}
              autoComplete="new-phone"
              name="phone_login_fake"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");

                if (value.length <= 10) {
                  setPhone(value);

                  setErrors((prev) => ({
                    ...prev,
                    phone: null,
                  }));
                }
              }}
              error={!!errors.phone}
              inputProps={{
                maxLength: 10,
                inputMode: "numeric",
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneAndroid />
                  </InputAdornment>
                ),
              }}
            />

            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          {/* PASSWORD */}

          <div className="form-group">
            <label className="login-label">MẬT KHẨU HỆ THỐNG</label>

            <TextField
              fullWidth
              variant="filled"
              type={show ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              autoComplete="new-password"
              name="password_login_fake"
              onChange={(e) => {
                setPassword(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  password: null,
                }));
              }}
              error={!!errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment
                    position="end"
                    className="eye"
                    onClick={() => setShow(!show)}
                  >
                    {show ? <VisibilityOff /> : <Visibility />}
                  </InputAdornment>
                ),
              }}
            />

            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <Button
            block
            size="large"
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            TRUY CẬP QUẢN TRỊ →
          </Button>
        </div>
      </div>
    </div>
  );
}
