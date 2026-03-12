// src/api/auth.js
import api from "./client";

// LƯU Ý: ở đây endpoint có prefix /api
export const registerUser = (payload) => api.post(`/auth/register`, payload);
export const loginUser    = (payload) => api.post(`/auth/login`, payload);
export const refreshToken = ()         => api.post(`/auth/refresh`);
export const meProfile    = ()         => api.get (`/auth/me`);
export const changePass   = (payload)  => api.post(`/auth/change-password`, payload);
export const logoutUser   = ()         => api.post(`/auth/logout`);

// Admin user management
export const adminListUsers     = ()                => api.get(`/auth/admin/users`);
export const adminUpdateUser    = (id, payload)     => api.put(`/auth/admin/user/${id}`, payload);
export const adminResetPassword = (id, new_password)=> api.post(`/auth/admin/user/${id}/reset-password`, { new_password });
