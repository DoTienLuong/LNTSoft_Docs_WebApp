import axios from "axios";
import { getAccessToken } from "../config/session";
import { API_BASE_URL } from "../config/config";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // lấy base URL theo môi trường (VITE_API_URL)
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
