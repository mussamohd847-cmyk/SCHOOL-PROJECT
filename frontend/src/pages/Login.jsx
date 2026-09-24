import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        username: username.trim(),
        password,
      });

      const body = response.data;

      const token = body?.data?.token;
      const user = body?.data?.user;

      if (!token) {
        throw new Error("Authentication token was not returned.");
      }

      if (!user) {
        throw new Error("User information was not returned.");
      }

      // Save authentication data
      localStorage.setItem("nia_token", token);
      localStorage.setItem("nia_user", JSON.stringify(user));
      localStorage.setItem("nia_logged_in", "true");

      // Get actual backend role
      const role = String(user.role || "")
        .trim()
        .toUpperCase();

      console.log("LOGIN SUCCESS:", user);
      console.log("USER ROLE:", role);

      // Role-based navigation
      switch (role) {
        case "ADMIN":
          navigate("/dashboard", { replace: true });
          break;

        case "STUDENT":
          navigate("/student/dashboard", { replace: true });
          break;

        case "TEACHER":
          navigate("/teacher/dashboard", { replace: true });
          break;

        case "ACCOUNTANT":
          navigate("/accountant/dashboard", { replace: true });
          break;

        case "PARENT":
          navigate("/parent/dashboard", { replace: true });
          break;

        default:
          localStorage.removeItem("nia_token");
          localStorage.removeItem("nia_user");
          localStorage.removeItem("nia_logged_in");

          setError(
            `Your account role "${role || "UNKNOWN"}" is not recognized.`
          );
          break;
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="nia-login-page">
      <div className="nia-login-card">

        {/* LOGO */}
        <div className="nia-login-brand">
          <Link to="/" className="nia-login-logo-link">
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
          <span>SCHOOL & MADRASA</span>

          <h2>Welcome Back</h2>

          <p>
            Sign in to access the NIA School & Madrasa
            Management System.
          </p>
        </div>

        {/* LOGIN FORM */}
        <form
          onSubmit={handleSubmit}
          className="nia-login-form"
        >
          {/* USERNAME */}
          <div className="nia-login-input-group">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="nia-login-input-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="nia-login-error">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="nia-login-button"
            disabled={loading}
          >
            <span>
              {loading ? "Signing in..." : "Sign In"}
            </span>

            {!loading && <span>→</span>}
          </button>
        </form>

        {/* REGISTER */}
        <div className="nia-login-register">
          <span>Don't have an account?</span>
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