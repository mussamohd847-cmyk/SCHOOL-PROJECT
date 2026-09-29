import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";

/* =========================================================
   PUBLIC PAGES
========================================================= */

import Home from "./pages/public/Home";
import About from "./pages/public/About";
import AcademicsPublic from "./pages/public/Academics";
import School from "./pages/public/School";
import MadrasaPublic from "./pages/public/Madrasa";
import Contact from "./pages/public/Contact";

/* =========================================================
   AUTH
========================================================= */

import Login from "./pages/Login";
import Register from "./pages/Register";

/* =========================================================
   MANAGEMENT PAGES
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
   MENU
========================================================= */

const menu = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "⌂",
    path: "/dashboard",
    roles: ["ADMIN", "ACCOUNTANT", "TEACHER", "PARENT", "PUPIL"],
  },
  {
    id: "students",
    label: "Students",
    icon: "♙",
    path: "/students",
    roles: ["ADMIN", "ACCOUNTANT", "TEACHER"],
  },
  {
    id: "teachers",
    label: "Teachers",
    icon: "♟",
    path: "/teachers",
    roles: ["ADMIN"],
  },
  {
    id: "academics",
    label: "Academics",
    icon: "▣",
    path: "/academics",
    roles: ["ADMIN", "TEACHER"],
  },
  {
    id: "finance",
    label: "Finance",
    icon: "▤",
    path: "/finance",
    roles: ["ADMIN", "ACCOUNTANT"],
  },
  {
    id: "madrasa",
    label: "Madrasa",
    icon: "☪",
    path: "/madrasa",
    roles: ["ADMIN", "TEACHER"],
  },
  {
    id: "timetable",
    label: "Timetable",
    icon: "◷",
    path: "/timetable",
    roles: ["ADMIN", "TEACHER"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: "▥",
    path: "/reports",
    roles: ["ADMIN", "ACCOUNTANT", "TEACHER", "PARENT", "PUPIL"],
  },
  {
    id: "activity",
    label: "Activity Log",
    icon: "◉",
    path: "/activity",
    roles: ["ADMIN"],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙",
    path: "/settings",
    roles: ["ADMIN"],
  },
];

/* =========================================================
   AUTH HELPERS
========================================================= */

function isLoggedIn() {
  return Boolean(
    localStorage.getItem("nia_token")
  );
}

function getCurrentUser() {
  try {
    const storedUser =
      localStorage.getItem("nia_user");

    if (!storedUser) {
      return {
        id: 1,
        username: "admin",
        name: "NIA Administrator",
        role: "ADMIN",
      };
    }

    const user = JSON.parse(storedUser);

    return {
      ...user,
      role: String(
        user.role || "ADMIN"
      ).toUpperCase(),
    };
  } catch {
    return {
      id: 1,
      username: "admin",
      name: "NIA Administrator",
      role: "ADMIN",
    };
  }
}

/* =========================================================
   MANAGEMENT LAYOUT
========================================================= */

function ManagementLayout({ children }) {
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const user = getCurrentUser();

  const allowedMenu = menu.filter((item) =>
    item.roles.includes(user.role)
  );

  const logout = () => {
    localStorage.removeItem("nia_token");
    localStorage.removeItem("nia_user");
    localStorage.removeItem("nia_logged_in");

    window.location.href = "/login";
  };

  return (
    <div className="app">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={
          open
            ? "sidebar open"
            : "sidebar"
        }
      >

        {/* BRAND */}

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

        {/* MENU */}

        <nav>

          {allowedMenu.map((item) => {

            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(
                `${item.path}/`
              );

            return (
              <Link
                key={item.id}
                to={item.path}
                className={
                  isActive
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setOpen(false);
                }}
              >

                <span className="nav-icon">
                  {item.icon}
                </span>

                <span className="nav-label">
                  {item.label}
                </span>

              </Link>
            );
          })}

        </nav>

        {/* LOGOUT */}

        <button
          type="button"
          className="logout"
          onClick={logout}
        >
          <span>↪</span>
          Sign out
        </button>

      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="main">

        {/* HEADER */}

        <header>

          <div className="header-left">

            <button
              type="button"
              className="hamb"
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => {
                setOpen(
                  (value) => !value
                );
              }}
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
                {String(
                  user.role ||
                    "ADMIN"
                ).toLowerCase()}
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

        {/* PAGE CONTENT */}

        <main>
          {children}
        </main>

      </div>

    </div>
  );
}

/* =========================================================
   PROTECTED PAGE WRAPPER
========================================================= */

function ProtectedPage({ children }) {
  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <ManagementLayout>
      {children}
    </ManagementLayout>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {

  return (
    <Routes>

      {/* ===================================================
          PUBLIC WEBSITE
      =================================================== */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/about"
        element={<About />}
      />

      <Route
        path="/academic-programs"
        element={<AcademicsPublic />}
      />

      <Route
        path="/school"
        element={<School />}
      />

      <Route
        path="/madrasa-info"
        element={<MadrasaPublic />}
      />

      <Route
        path="/contact"
        element={<Contact />}
      />

      {/* ===================================================
          AUTH
      =================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ===================================================
          MANAGEMENT
      =================================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedPage>
            <Dashboard />
          </ProtectedPage>
        }
      />

      <Route
        path="/students"
        element={
          <ProtectedPage>
            <Students />
          </ProtectedPage>
        }
      />

      <Route
        path="/teachers"
        element={
          <ProtectedPage>
            <Teachers />
          </ProtectedPage>
        }
      />

      <Route
        path="/academics"
        element={
          <ProtectedPage>
            <Academics />
          </ProtectedPage>
        }
      />

      <Route
        path="/finance"
        element={
          <ProtectedPage>
            <Finance />
          </ProtectedPage>
        }
      />

      <Route
        path="/madrasa"
        element={
          <ProtectedPage>
            <Madrasa />
          </ProtectedPage>
        }
      />

      <Route
        path="/timetable"
        element={
          <ProtectedPage>
            <Timetable />
          </ProtectedPage>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedPage>
            <Reports />
          </ProtectedPage>
        }
      />

      <Route
        path="/activity"
        element={
          <ProtectedPage>
            <Activity />
          </ProtectedPage>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedPage>
            <Settings />
          </ProtectedPage>
        }
      />

      {/* ===================================================
          FALLBACK
      =================================================== */}

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