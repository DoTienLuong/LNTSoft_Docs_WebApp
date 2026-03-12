import axios from "axios";
import { getAccessToken } from "../config/session";
// import { API_BASE_URL } from "../config/config";

const api = axios.create({
  // If served under sub-path (e.g., /docs), prefix API with BASE_URL
  baseURL: `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/api`,
  // baseURL: `${(import.meta.env.VITE_API_URL || '/').replace(/\/$/, '')}/api`,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true, // gửi cookie refresh khi cần
});

// Gắn Authorization từ session nếu có
api.interceptors.request.use((config) => {
  const at = getAccessToken?.();
  if (at) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${at}` };
  return config;
});

export default api;
