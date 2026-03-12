import React from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/auth/Login";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const handleLogin = (user) => {
    try {
      if (typeof onLogin === 'function') onLogin(user);
    } finally {
      // Luôn điều hướng về giao diện khách hàng sau đăng nhập
      navigate('/', { replace: true });
    }
  };
  return <Login onLogin={handleLogin} />;
}
