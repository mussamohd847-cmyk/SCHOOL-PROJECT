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

// =============================================================
// TOKEN STORAGE HELPERS - hupata token kutoka mahali popote
// =============================================================

function getStoredToken() {
  return (
    localStorage.getItem("nia_token") ||
    sessionStorage.getItem("nia_token") ||
    null
  );
}

export function clearStoredAuth() {
  ["nia_token", "nia_user", "nia_logged_in"].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

// =============================================================
// REQUEST INTERCEPTOR - kuweka Authorization kwenye kila request
// =============================================================

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =============================================================
// RESPONSE INTERCEPTOR - kushughulikia 401 (token expired/invalid)
// =============================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error(
        "AUTHENTICATION ERROR:",
        error.response?.data || "Authentication failed"
      );
      clearStoredAuth();
      // Elekeza kwenye login kama bado haupo
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
