import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Page, Card, fmtMoney } from "../components/Page";

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("nia_token");

    // Do not call the protected API without a token.
    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadDashboard = async () => {
      try {
        const r = await api.get("/dashboard/admin");

        if (!mounted) return;

        // Backend response:
        // {
        //   success: true,
        //   message: "...",
        //   data: {...}
        // }
        const dashboardData = r.data?.data || {};

        setD(dashboardData);
        setError("");
      } catch (err) {
        console.error(
          "DASHBOARD ERROR:",
          err.response?.status,
          err.response?.data || err.message
        );

        if (!mounted) return;

        if (err.response?.status === 401) {
          setError("Your login session is missing or expired.");
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load dashboard data."
          );
        }

        setD(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const token = localStorage.getItem("nia_token");

  /*
   * No token:
   * Do not render Dashboard.
   * Login/routing should handle the user.
   */
  if (!token) {
    return null;
  }

  if (loading) {
    return (
      <Page
        title="Dashboard"
        subtitle="Loading system data…"
      >
        <div className="loading">Loading…</div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page
        title="Dashboard"
        subtitle="Unable to load dashboard"
      >
        <Card>
          <div className="error">
            {error}
          </div>
        </Card>
      </Page>
    );
  }

  if (!d) {
    return (
      <Page
        title="Dashboard"
        subtitle="No dashboard data available"
      >
        <Card>
          <div className="loading">
            No dashboard data found.
          </div>
        </Card>
      </Page>
    );
  }

  const totalStudents =
    d.totalStudents ??
    d.total_students ??
    0;

  const activeStudents =
    d.activeStudents ??
    d.active_students ??
    totalStudents;

  const teachers =
    d.teachers ??
    d.total_teachers ??
    0;

  const classes =
    d.classes ??
    d.total_classes ??
    0;

  const subjects =
    d.subjects ??
    d.total_subjects ??
    0;

  const collected =
    d.collected ??
    d.fees_collected ??
    0;

  const outstanding =
    d.outstanding ??
    d.outstanding_fees ??
    0;

  const attendance =
    d.attendance || {};

  const attendanceSummary =
    d.attendance_summary || {};

  const presentToday =
    d.presentToday ??
    attendance.present ??
    attendanceSummary.PRESENT ??
    0;

  const absentToday =
    attendance.absent ??
    attendanceSummary.ABSENT ??
    0;

  const lateToday =
    attendance.late ??
    attendanceSummary.LATE ??
    0;

  const excusedToday =
    attendance.excused ??
    attendanceSummary.EXCUSED ??
    0;

  const recentPayments =
    d.recentPayments ??
    d.recent_payments?.length ??
    0;

  const studentOverview =
    d.studentOverview || {};

  const finance =
    d.finance || {};

  const academic =
    d.academic || {};

  const madrasa =
    d.madrasa || {};

  const activity =
    d.activity || [];

  const cards = [
    [
      "Total Students",
      totalStudents,
      "🎓",
      "teal",
    ],
    [
      "Active Students",
      activeStudents,
      "✅",
      "green",
    ],
    [
      "Teachers",
      teachers,
      "🧑‍🏫",
      "blue",
    ],
    [
      "Classes",
      classes,
      "🏫",
      "violet",
    ],
    [
      "Today's Attendance",
      `${presentToday} / ${activeStudents}`,
      "📋",
      "gold",
    ],
    [
      "Fees Collected",
      fmtMoney(collected),
      "💰",
      "green",
    ],
    [
      "Outstanding Fees",
      fmtMoney(outstanding),
      "⚠️",
      "red",
    ],
    [
      "Recent Payments",
      recentPayments,
      "🧾",
      "blue",
    ],
  ];

  return (
    <Page
      title="Dashboard"
      subtitle={`Welcome back, ${
        d.user?.name || "Administrator"
      }.`}
    >
      {/* SUMMARY CARDS */}
      <div className="stats">
        {cards.map((c) => (
          <div
            className={`stat ${c[3]}`}
            key={c[0]}
          >
            <span>{c[2]}</span>

            <div>
              <strong>{c[1]}</strong>
              <small>{c[0]}</small>
            </div>
          </div>
        ))}
      </div>

      {/* SCHOOL OVERVIEW + RECENT ACTIVITY */}
      <div className="grid2">
        <Card>
          <h2>School Overview</h2>

          <div className="kv">
            <span>Academic Year</span>
            <b>{d.currentYear || "—"}</b>

            <span>Current Term</span>
            <b>{d.currentTerm || "—"}</b>

            <span>Active Students</span>
            <b>{activeStudents}</b>

            <span>School Students</span>
            <b>{studentOverview.school || 0}</b>

            <span>Madrasa Students</span>
            <b>{studentOverview.madrasa || 0}</b>
          </div>
        </Card>

        <Card>
          <h2>Recent Activity</h2>

          <ul className="activity">
            {activity.length ? (
              activity.map((x, index) => (
                <li
                  key={x.id ?? index}
                >
                  <b>{x.action || "Activity"}</b>

                  <span>
                    {x.description ||
                      x.module ||
                      "Activity"}
                  </span>

                  <small>
                    {x.created_at || "—"}
                  </small>
                </li>
              ))
            ) : (
              <li>
                <span>
                  No recent activity.
                </span>
              </li>
            )}
          </ul>
        </Card>
      </div>

      {/* STUDENT OVERVIEW */}
      <div className="grid2">
        <Card>
          <h2>Student Overview</h2>

          <div className="kv">
            <span>Total Students</span>
            <b>{totalStudents}</b>

            <span>Active Students</span>
            <b>{activeStudents}</b>

            <span>Male Students</span>
            <b>
              {studentOverview.male || 0}
            </b>

            <span>Female Students</span>
            <b>
              {studentOverview.female || 0}
            </b>

            <span>School Students</span>
            <b>
              {studentOverview.school || 0}
            </b>

            <span>Madrasa Students</span>
            <b>
              {studentOverview.madrasa || 0}
            </b>
          </div>
        </Card>

        <Card>
          <h2>Attendance Overview</h2>

          <div className="kv">
            <span>Present Today</span>
            <b>{presentToday}</b>

            <span>Absent Today</span>
            <b>{absentToday}</b>

            <span>Late Today</span>
            <b>{lateToday}</b>

            <span>Excused</span>
            <b>{excusedToday}</b>

            <span>
              Total Active Students
            </span>
            <b>{activeStudents}</b>
          </div>
        </Card>
      </div>

      {/* FINANCE + ACADEMIC PERFORMANCE */}
      <div className="grid2">
        <Card>
          <h2>Finance Overview</h2>

          <div className="kv">
            <span>Collected Today</span>
            <b>
              {fmtMoney(
                finance.todayCollected ?? 0
              )}
            </b>

            <span>
              Collected This Month
            </span>
            <b>
              {fmtMoney(
                finance.monthCollected ??
                  collected ??
                  0
              )}
            </b>

            <span>Total Collected</span>
            <b>
              {fmtMoney(collected)}
            </b>

            <span>Outstanding Fees</span>
            <b>
              {fmtMoney(outstanding)}
            </b>

            <span>
              Students With Unpaid Fees
            </span>
            <b>
              {finance.unpaidStudents || 0}
            </b>
          </div>
        </Card>

        <Card>
          <h2>Academic Performance</h2>

          <div className="kv">
            <span>
              Average Performance
            </span>
            <b>
              {academic.average !== undefined
                ? `${academic.average}%`
                : "—"}
            </b>

            <span>Passed Students</span>
            <b>
              {academic.passed || 0}
            </b>

            <span>
              Students Needing Attention
            </span>
            <b>
              {academic.needingAttention || 0}
            </b>

            <span>
              Exams Completed
            </span>
            <b>
              {academic.exams || 0}
            </b>

            <span>
              Results Entered
            </span>
            <b>
              {academic.results || 0}
            </b>
          </div>
        </Card>
      </div>

      {/* MADRASA OVERVIEW */}
      <div className="grid2">
        <Card>
          <h2>Madrasa Overview</h2>

          <div className="kv">
            <span>
              Madrasa Students
            </span>
            <b>
              {madrasa.students ||
                studentOverview.madrasa ||
                0}
            </b>

            <span>Madrasa Teachers</span>
            <b>
              {madrasa.teachers || 0}
            </b>

            <span>Madrasa Classes</span>
            <b>
              {madrasa.classes || 0}
            </b>

            <span>Madrasa Subjects</span>
            <b>
              {madrasa.subjects || 0}
            </b>

            <span>
              Today's Attendance
            </span>
            <b>
              {madrasa.presentToday || 0}
            </b>
          </div>
        </Card>

        <Card>
          <h2>Quick Actions</h2>

          <div className="quick-actions">
            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/students")
              }
            >
              🎓 Add Student
            </button>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/teachers")
              }
            >
              🧑‍🏫 Add Teacher
            </button>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/finance")
              }
            >
              💰 Record Payment
            </button>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/academics")
              }
            >
              📋 Record Attendance
            </button>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/academics")
              }
            >
              📝 Add Exam
            </button>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/academics")
              }
            >
              📊 Add Result
            </button>
          </div>
        </Card>
      </div>
    </Page>
  );
}
