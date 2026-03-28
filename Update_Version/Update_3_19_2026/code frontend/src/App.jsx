import React, { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminModules from "./pages/admin/AdminModules";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminContents from "./pages/admin/AdminContents";
import AdminAccounts from "./pages/admin/AdminAccounts";
import { authService } from "./services/authService";

const App = () => {
  const [user, setUser] = useState(null); // lưu thông tin user sau login
  // useEffect(() => {
  //   // Khi reload, nếu có token → gọi API /api/auth/me để lấy user
  //   const token = localStorage.getItem("accessToken");
  //   if (token) {
  //     fetch("http://localhost:4000/api/auth/me", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         if (data.success) setUser(data.user);
  //         else localStorage.removeItem("accessToken");
  //       })
  //       .catch(() => localStorage.removeItem("accessToken"));
  //   }
  // }, []);
  // Tạo handler logout dùng lại cho mọi nơi và đảm bảo về đường dẫn gốc
  const handleLogout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    // Đảm bảo quay về đúng base path (vd: /docs/) khi deploy dưới subfolder IIS
    const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || "/";
    const redirectTo = basePath === "/" ? "/" : `${basePath}/`;
    try { window.location.replace(redirectTo); } catch { window.location.href = redirectTo; }
  }, []);

  // Public browsing: no login required for HomePage.
  // Admin routes remain guarded by role.

  // Guard cho route admin
  const RequireAdmin = ({ element }) => {
    return user?.role === 'admin' ? element : <Navigate to="/" replace />;
  };

  // Đã login → dùng router để truy cập trực tiếp /admin-demo
  const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        {/** Deep-link routes for module/category/content by ID */}
        <Route path="/m/:moduleId/c/:categoryId" element={<HomePage user={user} onLogout={handleLogout} />} />
        <Route path="/m/:moduleId/c/:categoryId/i/:contentId" element={<HomePage user={user} onLogout={handleLogout} />} />
        <Route path="/admin" element={<RequireAdmin element={<AdminModules user={user} onLogout={handleLogout} />} />} />
        <Route path="/admin/modules" element={<RequireAdmin element={<AdminModules user={user} onLogout={handleLogout} />} />} />
        <Route path="/admin/categories" element={<RequireAdmin element={<AdminCategories user={user} onLogout={handleLogout} />} />} />
        <Route path="/admin/contents" element={<RequireAdmin element={<AdminContents user={user} onLogout={handleLogout} />} />} />
        <Route path="/admin/accounts" element={<RequireAdmin element={<AdminAccounts user={user} onLogout={handleLogout} />} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
