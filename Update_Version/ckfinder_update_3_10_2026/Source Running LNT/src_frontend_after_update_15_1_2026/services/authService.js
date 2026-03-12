// src/services/authService.js
import {
  registerUser,
  loginUser,
  refreshToken as apiRefresh,
  meProfile,
  changePass,
  logoutUser,
} from "../api/auth";
import { setAccessToken, getAccessToken, setUser, getUser, clearSession } from "../config/session";
import { adminListUsers, adminUpdateUser, adminResetPassword } from "../api/auth";

export const authService = {
  register: async ({ username, email, password, role }) => {
    const res = await registerUser({ username, email, password, role });
    return res.data; // { success, message }
  },

  login: async (usernameOrEmail, password) => {
    const res = await loginUser({ usernameOrEmail, password });
    const { accessToken, user } = res.data;
    setAccessToken(accessToken);
    setUser(user);
    // console.log(user);
    return user;
  },

  tryRefreshOnBoot: async () => {
    // khởi động app: nếu chưa có AT nhưng có cookie refresh -> xin AT
    if (!getAccessToken()) {
      try {
        const res = await apiRefresh();
        const { accessToken } = res.data;
        setAccessToken(accessToken);
        const me = await meProfile();
        setUser({ id: me.data.user.id, username: me.data.user.username, role: me.data.user.role });
      } catch {
        clearSession(); // không có refresh hợp lệ
      }
    } else if (!getUser()) {
      try {
        const me = await meProfile();
        setUser({ id: me.data.user.id, username: me.data.user.username, role: me.data.user.role });
      } catch {
        // sẽ được interceptor lo khi gọi API khác
      }
    }
  },

  me: async () => {
    const res = await meProfile(); // header Bearer đã có từ interceptor
    return res.data.user;          // { id, username, role, ... }
  },

  changePassword: async ({ current_password, new_password }) => {
    const res = await changePass({ current_password, new_password });
    // BE đã cấp lại accessToken & refresh cookie
    if (res.data?.accessToken) setAccessToken(res.data.accessToken);
    return res.data; // { success, message, accessToken? }
  },

  logout: async () => {
    try { await logoutUser(); } catch {}
    clearSession();
  },

  // Admin: User management
  adminListUsers: async () => {
    const res = await adminListUsers();
    return res.data?.users || [];
  },
  adminUpdateUser: async (id, data) => {
    const res = await adminUpdateUser(id, data);
    return res.data; // { success, message }
  },
  adminResetPassword: async (id, new_password) => {
    const res = await adminResetPassword(id, new_password);
    return res.data; // { success, message }
  },
};
