import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 RUKA LOGIN KAMA USER AMESHAINGIA (instant)
  useEffect(() => {
    const token =
      localStorage.getItem("nia_token") ||
      sessionStorage.getItem("nia_token");
    const userRaw =
      localStorage.getItem("nia_user") ||
      sessionStorage.getItem("nia_user");
    const loggedIn =
      localStorage.getItem("nia_logged_in") ||
      sessionStorage.getItem("nia_logged_in");

    if (token && userRaw && loggedIn === "true") {
      try {
        const user = JSON.parse(userRaw);
        const role = String(user.role || "").toUpperCase();
        if (role === "ADMIN") window.location.replace("/dashboard");
        else if (role === "TEACHER") window.location.replace("/teacher/dashboard");
        else if (role === "STUDENT") window.location.replace("/student/dashboard");
      } catch (e) {}
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        username: cleanUsername,
        password: password,
      });

      const body = response?.data;
      const token = body?.data?.token;
      const user = body?.data?.user;

      if (!token) throw new Error("Authentication token was not returned.");
      if (!user) throw new Error("User information was not returned.");

      if (user.status && String(user.status).toLowerCase() !== "active") {
        throw new Error("Your account is inactive. Please contact the administrator.");
      }

      const role = String(user.role || "").trim().toLowerCase();
      const normalizedRole = {
        admin: "ADMIN",
        teacher: "TEACHER",
        pupil: "STUDENT",
        student: "STUDENT",
      }[role];

      if (!normalizedRole) {
        throw new Error(`Unsupported account role: ${role || "unknown"}`);
      }

      const normalizedUser = {
        ...user,
        role: normalizedRole,
        permissions: Array.isArray(user.permissions) ? user.permissions : [],
      };

      for (const store of [localStorage, sessionStorage]) {
        store.removeItem("nia_token");
        store.removeItem("nia_user");
        store.removeItem("nia_logged_in");
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("nia_token", token);
      storage.setItem("nia_user", JSON.stringify(normalizedUser));
      storage.setItem("nia_logged_in", "true");

      // 🔥 NENDA DASHBOARD MARA MOJA (bila kusubiri)
      if (normalizedRole === "ADMIN") window.location.replace("/dashboard");
      else if (normalizedRole === "TEACHER") window.location.replace("/teacher/dashboard");
      else if (normalizedRole === "STUDENT") window.location.replace("/student/dashboard");
      else setError("Unsupported account role.");
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.data?.message;

      if (backendMessage) setError(backendMessage);
      else if (err?.message) setError(err.message);
      else setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="nia-login-page">
      <div className="nia-login-card">
        <div className="nia-login-brand">
          <Link to="/" className="nia-login-logo-link">
            <img src="/NIA SCHOOLS.jpg" alt="Nimble Integrated Academy" className="nia-login-logo" />
          </Link>
          <div className="nia-login-school-name">
            <h1>NIMBLE INTEGRATED ACADEMY</h1>
            <span>(NIA)</span>
          </div>
        </div>

        <div className="nia-login-header">
          <span>SCHOOL &amp; MADRASA</span>
          <h2>Welcome Back</h2>
          <p>Sign in to access the NIA School &amp; Madrasa Management System.</p>
        </div>

        <form onSubmit={handleSubmit} className="nia-login-form" noValidate>
          <div className="nia-login-input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
              disabled={loading}
              required
            />
          </div>

          <div className="nia-login-input-group">
            <label htmlFor="password">Password</label>
            <div className="nia-password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="nia-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <label className="nia-remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span>Remember Me</span>
            </label>
          </div>

          {error && (
            <div className="nia-login-error" role="alert">{error}</div>
          )}

          <button
            type="submit"
            className="nia-login-button"
            disabled={loading || !username.trim() || !password}
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <div className="nia-login-register">
          <span>Don't have an account?</span>
          <Link to="/register">Register</Link>
        </div>

        <div className="nia-login-back-home">
          <Link to="/" className="nia-back-home">← Back Home</Link>
        </div>

        <div className="nia-login-footer">© 2026 NIMBLE INTEGRATED ACADEMY</div>
      </div>
    </main>
  );
}
