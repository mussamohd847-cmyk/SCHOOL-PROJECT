import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
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

      const token = body?.data?.token || body?.token;
      const user = body?.data?.user || body?.user;

      if (!token) {
        throw new Error(
          "Authentication token was not returned."
        );
      }

      localStorage.setItem(
        "nia_token",
        token
      );

      localStorage.setItem(
        "nia_user",
        JSON.stringify(user || {})
      );

      localStorage.setItem(
        "nia_logged_in",
        "true"
      );

      navigate("/dashboard", {
        replace: true,
      });
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

        {/* =================================================
            SCHOOL BRAND
        ================================================== */}

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

            <h1>
              NIMBLE INTEGRATED ACADEMY
            </h1>

            <span>
              (NIA)
            </span>

          </div>

        </div>

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="nia-login-header">

          <span>
            SCHOOL & MADRASA
          </span>

          <h2>
            Welcome Back
          </h2>

          <p>
            Sign in to access the NIA School & Madrasa
            Management System.
          </p>

        </div>

        {/* =================================================
            LOGIN FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="nia-login-form"
        >

          {/* USERNAME */}

          <div className="nia-login-input-group">

            <label>
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Enter username"
              autoComplete="username"
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="nia-login-input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
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

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="nia-login-button"
            disabled={loading}
          >

            {loading
              ? "Signing in..."
              : "Sign In"}

            {!loading && (
              <span>
                →
              </span>
            )}

          </button>

        </form>

        {/* =================================================
            REGISTER LINK
        ================================================== */}

        <div className="nia-login-register">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Register
          </Link>

        </div>

        {/* =================================================
            BACK HOME
        ================================================== */}

        <div className="nia-login-back-home">

          <Link
            to="/"
            className="nia-back-home"
          >
            ← Back Home
          </Link>

        </div>

        {/* =================================================
            FOOTER
        ================================================== */}

        <div className="nia-login-footer">

          © 2026 NIMBLE INTEGRATED ACADEMY

        </div>

      </div>

    </main>
  );
}