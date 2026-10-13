import React, { useState } from "react";
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

      /*
       * Expected backend response:
       *
       * {
       *   success: true,
       *   data: {
       *     token: "...",
       *     user: {
       *       id: 1,
       *       username: "admin",
       *       name: "NIA Administrator",
       *       role: "admin",
       *       status: "active"
       *     }
       *   }
       * }
       */

      const body = response?.data;

      const token = body?.data?.token;
      const user = body?.data?.user;

      if (!token) {
        throw new Error("Authentication token was not returned.");
      }

      if (!user) {
        throw new Error("User information was not returned.");
      }

      if (user.status && String(user.status).toLowerCase() !== "active") {
        throw new Error(
          "Your account is inactive. Please contact the administrator."
        );
      }

      const role = String(user.role || "")
        .trim()
        .toLowerCase();

      const normalizedRole = {
        admin: "ADMIN",
        accountant: "ACCOUNTANT",
        teacher: "TEACHER",
        parent: "PARENT",
        pupil: "PUPIL",
        student: "PUPIL",
      }[role];

      if (!normalizedRole) {
        throw new Error(`Unsupported account role: ${role || "unknown"}`);
      }

      const normalizedUser = {
        ...user,
        role: normalizedRole,
        permissions: Array.isArray(user.permissions) ? user.permissions : [],
      };

      /*
       * Save login information
       */
      // Clear any previous account before saving the new login.
      for (const store of [localStorage, sessionStorage]) {
        store.removeItem("nia_token");
        store.removeItem("nia_user");
        store.removeItem("nia_logged_in");
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("nia_token", token);
      storage.setItem("nia_user", JSON.stringify(normalizedUser));
      storage.setItem("nia_logged_in", "true");

      console.log("NIA LOGIN SUCCESS:", normalizedUser);
      console.log("NIA USER ROLE:", normalizedRole);

      /*
       * Database roles:
       *
       * admin
       * accountant
       * teacher
       * parent
       * pupil
       */

      switch (normalizedRole) {
        case "ADMIN":
          window.location.replace("/dashboard");
          break;

        case "TEACHER":
          window.location.replace("/teacher/dashboard");
          break;

        case "PUPIL":
          window.location.replace("/student/dashboard");
          break;

        case "ACCOUNTANT":
          window.location.replace("/finance");
          break;

        case "PARENT":
          setError("Parent portal haijaunganishwa bado. Tafadhali wasiliana na administrator.");
          break;

        default:
          setError("Unsupported account role.");
      }
    } catch (err) {
      console.error("NIA LOGIN ERROR:", err);

      /*
       * Axios-style error
       */
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.data?.message;

      if (backendMessage) {
        setError(backendMessage);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="nia-login-page">
      <div className="nia-login-card">

        {/* LOGO */}
        <div className="nia-login-brand">
          <Link
            to="/"
            className="nia-login-logo-link"
          >
            <img
              src="/NIA SCHOOLS.jpg"
              alt="Nimble Integrated Academy"
              className="nia-login-logo"
            />
          </Link>

          <div className="nia-login-school-name">
            <h1>NIMBLE INTEGRATED ACADEMY</h1>
            <span>(NIA)</span>
          </div>
        </div>

        {/* HEADER */}
        <div className="nia-login-header">
          <span>SCHOOL &amp; MADRASA</span>

          <h2>Welcome Back</h2>

          <p>
            Sign in to access the NIA School &amp; Madrasa
            Management System.
          </p>
        </div>

        {/* LOGIN FORM */}
        <form
          onSubmit={handleSubmit}
          className="nia-login-form"
          noValidate
        >

          {/* USERNAME */}
          <div className="nia-login-input-group">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
              disabled={loading}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="nia-login-input-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="nia-password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="nia-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
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

          {/* ERROR */}
          {error && (
            <div
              className="nia-login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="nia-login-button"
            disabled={
              loading ||
              !username.trim() ||
              !password
            }
          >
            <span>
              {loading
                ? "Signing in..."
                : "Sign In"}
            </span>

            {!loading && (
              <span aria-hidden="true">
                →
              </span>
            )}
          </button>
        </form>

        {/* REGISTER */}
        <div className="nia-login-register">
          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Register
          </Link>
        </div>

        {/* BACK HOME */}
        <div className="nia-login-back-home">
          <Link
            to="/"
            className="nia-back-home"
          >
            ← Back Home
          </Link>
        </div>

        {/* FOOTER */}
        <div className="nia-login-footer">
          © 2026 NIMBLE INTEGRATED ACADEMY
        </div>

      </div>
    </main>
  );
}
