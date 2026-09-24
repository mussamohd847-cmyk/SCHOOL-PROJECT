import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    console.log(
      "Registration Data:",
      formData
    );

    // Backend API itaunganishwa hapa

    navigate("/login");
  };

  return (
    <main className="nia-register-page">

      <div className="nia-register-card">

        {/* =================================================
            LOGO
        ================================================== */}

        <div className="nia-register-logo">

          <Link to="/">
            <img
              src="/NIA SCHOOLS.jpg"
              alt="Nimble Integrated Academy"
            />
          </Link>

        </div>

        {/* =================================================
            SCHOOL NAME
        ================================================== */}

        <div className="nia-register-school">

          <h1>
            NIMBLE INTEGRATED ACADEMY
          </h1>

          <span>
            (NIA)
          </span>

        </div>

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="nia-register-header">

          <span>
            SCHOOL & MADRASA
          </span>

          <h2>
            Create Account
          </h2>

          <p>
            Register your child at Nimble Integrated
            Academy.
          </p>

        </div>

        {/* =================================================
            REGISTER FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="nia-register-form"
        >

          {/* STUDENT FULL NAME */}

          <div className="nia-input-group">

            <label>
              Student Full Name
            </label>

            <input
              type="text"
              name="studentName"
              placeholder="Enter student full name"
              value={formData.studentName}
              onChange={handleChange}
              required
            />

          </div>

          {/* PARENT / GUARDIAN NAME */}

          <div className="nia-input-group">

            <label>
              Parent / Guardian Name
            </label>

            <input
              type="text"
              name="parentName"
              placeholder="Enter parent or guardian name"
              value={formData.parentName}
              onChange={handleChange}
              required
            />

          </div>

          {/* PHONE NUMBER */}

          <div className="nia-input-group">

            <label>
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              placeholder="+255 XXX XXX XXX"
              value={formData.phone}
              onChange={handleChange}
              required
            />

          </div>

          {/* EMAIL ADDRESS */}

          <div className="nia-input-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="nia-input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="nia-input-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

          </div>

          {/* ERROR MESSAGE */}

          {error && (
            <div className="nia-register-error">
              {error}
            </div>
          )}

          {/* CREATE ACCOUNT */}

          <button
            type="submit"
            className="nia-register-button"
          >
            <span>
              Create Account
            </span>

            <span>
              →
            </span>
          </button>

        </form>

        {/* =================================================
            LOGIN LINK
        ================================================== */}

        <div className="nia-register-login">

          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Login
          </Link>

        </div>

        {/* =================================================
            BACK HOME
        ================================================== */}

        <div className="nia-register-back-home">

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

        <div className="nia-register-footer">

          © 2026 NIMBLE INTEGRATED ACADEMY

        </div>

      </div>

    </main>
  );
}

export default Register;