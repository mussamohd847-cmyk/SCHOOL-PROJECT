import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:6001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("nia_token");

    if (token) {
      config.headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error(
        "AUTHENTICATION ERROR:",
        error.response?.data || "Authentication failed"
      );
    }

    return Promise.reject(error);
  }
);

export default api;