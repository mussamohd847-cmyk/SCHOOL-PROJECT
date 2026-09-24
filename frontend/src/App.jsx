import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";

/* =========================================================
   PUBLIC WEBSITE PAGES
========================================================= */

import Home from "./pages/public/Home";
import About from "./pages/public/About";
import AcademicsPublic from "./pages/public/Academics";
import School from "./pages/public/School";
import MadrasaPublic from "./pages/public/Madrasa";
import Contact from "./pages/public/Contact";

/* =========================================================
   LOGIN & REGISTER
========================================================= */

import Login from "./pages/Login";
import Register from "./pages/Register";

/* =========================================================
   MANAGEMENT SYSTEM PAGES
========================================================= */

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Academics from "./pages/Academics";
import Finance from "./pages/Finance";
import Madrasa from "./pages/Madrasa";
import Timetable from "./pages/Timetable";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Activity from "./pages/Activity";

/* =========================================================
   MANAGEMENT MENU
========================================================= */

const menu = [
  [
    "dashboard",
    "Dashboard",
    "⌂",
    ["ADMIN", "ACCOUNTANT", "TEACHER", "PARENT", "PUPIL"],
  ],

  [
    "students",
    "Students",
    "♙",
    ["ADMIN", "ACCOUNTANT", "TEACHER"],
  ],

  [
    "teachers",
    "Teachers",
    "♟",
    ["ADMIN"],
  ],

  [
    "academics",
    "Academics",
    "▣",
    ["ADMIN", "TEACHER"],
  ],

  [
    "finance",
    "Finance",
    "▤",
    ["ADMIN", "ACCOUNTANT"],
  ],

  [
    "madrasa",
    "Madrasa",
    "☪",
    ["ADMIN", "TEACHER"],
  ],

  [
    "timetable",
    "Timetable",
    "◷",
    ["ADMIN", "TEACHER"],
  ],

  [
    "reports",
    "Reports",
    "▥",
    ["ADMIN", "ACCOUNTANT", "TEACHER", "PARENT", "PUPIL"],
  ],

  [
    "activity",
    "Activity Log",
    "◉",
    ["ADMIN"],
  ],

  [
    "settings",
    "Settings",
    "⚙",
    ["ADMIN"],
  ],
];

/* =========================================================
   AUTHENTICATION
========================================================= */

function isLoggedIn() {
  const token = localStorage.getItem("nia_token");

  return Boolean(token);
}

/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem("nia_user");

    if (!storedUser) {
      return {
        id: 1,
        username: "admin",
        role: "ADMIN",
        name: "Administrator",
      };
    }

    const parsed = JSON.parse(storedUser);

    return {
      ...parsed,
      role: String(parsed.role || "ADMIN").toUpperCase(),
    };
  } catch {
    return {
      id: 1,
      username: "admin",
      role: "ADMIN",
      name: "Administrator",
    };
  }
}

/* =========================================================
   MANAGEMENT SHELL
========================================================= */

function Shell({ children }) {
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const user = getCurrentUser();

  const logout = () => {
    localStorage.removeItem("nia_token");
    localStorage.removeItem("nia_user");
    localStorage.removeItem("nia_logged_in");

    window.location.href = "/login";
  };

  const allowed = menu.filter((item) =>
    item[3].includes(user.role)
  );

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className={open ? "sidebar open" : "sidebar"}>

        <div className="brand">

          <img
            src="/NIA SCHOOLS.jpg"
            alt="NIA Schools"
          />

          <div>
            <b>NIA</b>
            <span>Schools</span>
          </div>

        </div>

        <nav>

          {allowed.map(([id, label, icon]) => {

            const route =
              id === "dashboard"
                ? "/dashboard"
                : `/${id}`;

            const active =
              location.pathname === route ||
              location.pathname.startsWith(`${route}/`);

            return (
              <Link
                key={id}
                to={route}
                className={active ? "active" : ""}
                onClick={() => setOpen(false)}
              >

                <span className="nav-icon">
                  {icon}
                </span>

                <span className="nav-label">
                  {label}
                </span>

              </Link>
            );
          })}

        </nav>

        <button
          type="button"
          className="logout"
          onClick={logout}
        >
          <span>↪</span>
          Sign out
        </button>

      </aside>

      {/* MAIN */}

      <div className="main">

        <header>

          <div className="header-left">

            <button
              type="button"
              className="hamb"
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              ☰
            </button>

          </div>

          <div className="header-user">

            <div className="user-info">

              <b>
                {user.name ||
                  user.username ||
                  "Administrator"}
              </b>

              <small>
                {String(user.role || "ADMIN").toLowerCase()}
              </small>

            </div>

            <div className="avatar">

              {(
                user.name ||
                user.username ||
                "U"
              )
                .charAt(0)
                .toUpperCase()}

            </div>

          </div>

        </header>

        <main>
          {children}
        </main>

      </div>

    </div>
  );
}

/* =========================================================
   PROTECTED MANAGEMENT ROUTES
========================================================= */

function Protected() {

  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <Shell>

      <Routes>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/students"
          element={<Students />}
        />

        <Route
          path="/teachers"
          element={<Teachers />}
        />

        <Route
          path="/academics"
          element={<Academics />}
        />

        <Route
          path="/finance"
          element={<Finance />}
        />

        <Route
          path="/madrasa"
          element={<Madrasa />}
        />

        <Route
          path="/timetable"
          element={<Timetable />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/activity"
          element={<Activity />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </Shell>
  );
}

/* =========================================================
   MAIN ROUTER
========================================================= */

export default function App() {

  return (
    <Routes>

      {/* =====================================================
          PUBLIC PAGES
      ===================================================== */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/about"
        element={<About />}
      />

      <Route
        path="/academics"
        element={<AcademicsPublic />}
      />

      <Route
        path="/school"
        element={<School />}
      />

      <Route
        path="/madrasa"
        element={<MadrasaPublic />}
      />

      <Route
        path="/contact"
        element={<Contact />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =====================================================
          PROTECTED MANAGEMENT
      ===================================================== */}

      <Route
        path="/dashboard/*"
        element={<Protected />}
      />

      <Route
        path="/students/*"
        element={<Protected />}
      />

      <Route
        path="/teachers/*"
        element={<Protected />}
      />

      <Route
        path="/academics/*"
        element={<Protected />}
      />

      <Route
        path="/finance/*"
        element={<Protected />}
      />

      <Route
        path="/madrasa/*"
        element={<Protected />}
      />

      <Route
        path="/timetable/*"
        element={<Protected />}
      />

      <Route
        path="/reports/*"
        element={<Protected />}
      />

      <Route
        path="/activity/*"
        element={<Protected />}
      />

      <Route
        path="/settings/*"
        element={<Protected />}
      />

      {/* =====================================================
          GLOBAL FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}