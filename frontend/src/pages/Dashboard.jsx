import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Page, Card } from "../components/Page";

function StatCard({ icon, title, value, subtitle, tone = "blue" }) {
  return (
    <div className={`dashboard-stat stat-${tone}`}>
      <div className="stat-top">
        <div className="stat-icon">{icon}</div>
        <span className="stat-label">{title}</span>
      </div>

      <div className="stat-value">{value}</div>

      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="dashboard-section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {action}
    </div>
  );
}

function EmptyState({ message = "No records found." }) {
  return (
    <div className="dashboard-empty">
      <div className="empty-icon">📭</div>
      <p>{message}</p>
    </div>
  );
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-TZ").format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-TZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name = "Admin") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getStatusClass(status) {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("paid") ||
    value.includes("active") ||
    value.includes("approved") ||
    value.includes("present") ||
    value.includes("complete")
  ) {
    return "status-success";
  }

  if (
    value.includes("pending") ||
    value.includes("partial") ||
    value.includes("late")
  ) {
    return "status-warning";
  }

  if (
    value.includes("inactive") ||
    value.includes("absent") ||
    value.includes("overdue") ||
    value.includes("failed")
  ) {
    return "status-danger";
  }

  return "status-neutral";
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("nia_user") || "{}"
  );

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/admin");

      setData(response.data?.data || response.data || {});
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const goTo = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <Page
        title="Admin Dashboard"
        subtitle="Loading school management information..."
      >
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <h3>Loading Dashboard</h3>
          <p>Please wait while we retrieve the latest information.</p>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page
        title="Admin Dashboard"
        subtitle="School management overview"
      >
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>

          <h3>Unable to load dashboard</h3>

          <p>{error}</p>

          <button
            type="button"
            className="dashboard-primary-btn"
            onClick={loadDashboard}
          >
            🔄 Try Again
          </button>
        </div>
      </Page>
    );
  }

  const d = data || {};

  const totalStudents = d.totalStudents ?? 0;
  const activeStudents = d.activeStudents ?? 0;
  const teachers = d.teachers ?? 0;
  const classes = d.classes ?? 0;
  const subjects = d.subjects ?? 0;

  const attendance = d.attendance ?? {};
  const attendancePresent =
    attendance.present ??
    attendance.todayPresent ??
    0;

  const attendanceAbsent =
    attendance.absent ??
    attendance.todayAbsent ??
    0;

  const attendanceTotal =
    attendance.total ??
    attendance.totalStudents ??
    totalStudents;

  const attendancePercentage =
    attendance.percentage ??
    attendance.rate ??
    (attendanceTotal
      ? Math.round(
          (Number(attendancePresent) / Number(attendanceTotal)) * 100
        )
      : 0);

  const collected = d.collected ?? 0;
  const outstanding = d.outstanding ?? 0;

  const recentPayments = Array.isArray(d.recentPayments)
    ? d.recentPayments
    : [];

  const studentOverview = Array.isArray(d.studentOverview)
    ? d.studentOverview
    : [];

  const finance = d.finance || {};
  const academic = d.academic || {};
  const madrasa = d.madrasa || {};

  const activity = Array.isArray(d.activity)
    ? d.activity
    : Array.isArray(d.recentActivity)
    ? d.recentActivity
    : [];

  const totalFees =
    finance.totalFees ??
    finance.total ??
    Number(collected) + Number(outstanding);

  const feeCollectionPercentage =
    finance.percentage ??
    finance.collectionPercentage ??
    (Number(totalFees) > 0
      ? Math.round((Number(collected) / Number(totalFees)) * 100)
      : 0);

  const academicAverage =
    academic.average ??
    academic.averageScore ??
    academic.mean ??
    0;

  const madrasaStudents =
    madrasa.students ??
    madrasa.totalStudents ??
    0;

  const madrasaPresent =
    madrasa.present ??
    madrasa.todayPresent ??
    0;

  return (
    <Page
      title="Admin Dashboard"
      subtitle="Complete overview of NIA School & Madrasa"
      actions={
        <div className="dashboard-head-actions">
          <button
            type="button"
            className="dashboard-refresh-btn"
            onClick={loadDashboard}
          >
            🔄 Refresh
          </button>
        </div>
      }
    >
      {/* =========================================================
          WELCOME
      ========================================================== */}
      <div className="dashboard-welcome">
        <div>
          <span className="welcome-label">WELCOME BACK</span>

          <h2>
            {currentUser.name || "NIA Administrator"}
          </h2>

          <p>
            Manage students, teachers, academics, finance and
            madrasa activities from one place.
          </p>
        </div>

        <div className="welcome-date">
          <span>Today</span>
          <strong>
            {new Date().toLocaleDateString("en-TZ", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </strong>
        </div>
      </div>

      {/* =========================================================
          SUMMARY CARDS
      ========================================================== */}
      <div className="dashboard-stats">
        <StatCard
          icon="👨‍🎓"
          title="Total Students"
          value={formatNumber(totalStudents)}
          subtitle={`${formatNumber(activeStudents)} active students`}
          tone="blue"
        />

        <StatCard
          icon="👨‍🏫"
          title="Teachers"
          value={formatNumber(teachers)}
          subtitle="Teaching staff"
          tone="green"
        />

        <StatCard
          icon="🏫"
          title="Classes"
          value={formatNumber(classes)}
          subtitle={`${formatNumber(subjects)} subjects`}
          tone="violet"
        />

        <StatCard
          icon="📅"
          title="Today's Attendance"
          value={`${attendancePercentage}%`}
          subtitle={`${formatNumber(attendancePresent)} present`}
          tone="gold"
        />

        <StatCard
          icon="💰"
          title="Fees Collected"
          value={formatMoney(collected)}
          subtitle={`${feeCollectionPercentage}% collected`}
          tone="green"
        />

        <StatCard
          icon="⚠️"
          title="Outstanding Fees"
          value={formatMoney(outstanding)}
          subtitle="Pending collection"
          tone="red"
        />

        <StatCard
          icon="📚"
          title="Academic Average"
          value={
            academicAverage
              ? `${Number(academicAverage).toFixed(1)}%`
              : "—"
          }
          subtitle="Current performance"
          tone="blue"
        />

        <StatCard
          icon="☪️"
          title="Madrasa Students"
          value={formatNumber(madrasaStudents)}
          subtitle={`${formatNumber(madrasaPresent)} present today`}
          tone="violet"
        />
      </div>

      {/* =========================================================
          QUICK ACTIONS
      ========================================================== */}
      <Card>
        <SectionTitle
          title="Quick Actions"
          subtitle="Frequently used school management operations"
        />

        <div className="dashboard-quick-actions">
          <button
            type="button"
            onClick={() => goTo("/students")}
          >
            <span className="quick-action-icon">👨‍🎓</span>
            <span>
              <strong>Add Student</strong>
              <small>Register a new student</small>
            </span>
            <b>→</b>
          </button>

          <button
            type="button"
            onClick={() => goTo("/teachers")}
          >
            <span className="quick-action-icon">👨‍🏫</span>
            <span>
              <strong>Add Teacher</strong>
              <small>Register teaching staff</small>
            </span>
            <b>→</b>
          </button>

          <button
            type="button"
            onClick={() => goTo("/finance")}
          >
            <span className="quick-action-icon">💰</span>
            <span>
              <strong>Record Payment</strong>
              <small>Record student fees</small>
            </span>
            <b>→</b>
          </button>

          <button
            type="button"
            onClick={() => goTo("/academics")}
          >
            <span className="quick-action-icon">📋</span>
            <span>
              <strong>Attendance</strong>
              <small>Record daily attendance</small>
            </span>
            <b>→</b>
          </button>

          <button
            type="button"
            onClick={() => goTo("/academics")}
          >
            <span className="quick-action-icon">📝</span>
            <span>
              <strong>Add Exam</strong>
              <small>Create an examination</small>
            </span>
            <b>→</b>
          </button>

          <button
            type="button"
            onClick={() => goTo("/academics")}
          >
            <span className="quick-action-icon">📊</span>
            <span>
              <strong>Add Result</strong>
              <small>Enter student results</small>
            </span>
            <b>→</b>
          </button>
        </div>
      </Card>

      {/* =========================================================
          MAIN OVERVIEW
      ========================================================== */}
      <div className="dashboard-grid-two">
        {/* SCHOOL OVERVIEW */}
        <Card>
          <SectionTitle
            title="School Overview"
            subtitle="Current school statistics"
          />

          <div className="overview-list">
            <div className="overview-row">
              <div className="overview-label">
                <span className="overview-dot blue"></span>
                Total Students
              </div>

              <strong>{formatNumber(totalStudents)}</strong>
            </div>

            <div className="overview-row">
              <div className="overview-label">
                <span className="overview-dot green"></span>
                Active Students
              </div>

              <strong>{formatNumber(activeStudents)}</strong>
            </div>

            <div className="overview-row">
              <div className="overview-label">
                <span className="overview-dot violet"></span>
                Teachers
              </div>

              <strong>{formatNumber(teachers)}</strong>
            </div>

            <div className="overview-row">
              <div className="overview-label">
                <span className="overview-dot gold"></span>
                Classes
              </div>

              <strong>{formatNumber(classes)}</strong>
            </div>

            <div className="overview-row">
              <div className="overview-label">
                <span className="overview-dot red"></span>
                Subjects
              </div>

              <strong>{formatNumber(subjects)}</strong>
            </div>
          </div>
        </Card>

        {/* ATTENDANCE */}
        <Card>
          <SectionTitle
            title="Today's Attendance"
            subtitle="Student attendance overview"
          />

          <div className="attendance-dashboard">
            <div className="attendance-circle">
              <div>
                <strong>{attendancePercentage}%</strong>
                <span>Present</span>
              </div>
            </div>

            <div className="attendance-details">
              <div className="attendance-item">
                <span className="attendance-marker present"></span>

                <div>
                  <strong>Present</strong>
                  <small>
                    {formatNumber(attendancePresent)} students
                  </small>
                </div>
              </div>

              <div className="attendance-item">
                <span className="attendance-marker absent"></span>

                <div>
                  <strong>Absent</strong>
                  <small>
                    {formatNumber(attendanceAbsent)} students
                  </small>
                </div>
              </div>

              <div className="attendance-item">
                <span className="attendance-marker total"></span>

                <div>
                  <strong>Total</strong>
                  <small>
                    {formatNumber(attendanceTotal)} students
                  </small>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* =========================================================
          FINANCE + ACADEMIC
      ========================================================== */}
      <div className="dashboard-grid-two">
        {/* FINANCE */}
        <Card>
          <SectionTitle
            title="Finance Overview"
            subtitle="Current school fee collection"
            action={
              <button
                type="button"
                className="section-link"
                onClick={() => goTo("/finance")}
              >
                View Finance →
              </button>
            }
          />

          <div className="finance-summary">
            <div className="finance-main">
              <span>Total Fees</span>
              <strong>{formatMoney(totalFees)}</strong>
            </div>

            <div className="finance-progress">
              <div className="finance-progress-head">
                <span>Collection progress</span>
                <strong>{feeCollectionPercentage}%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      Math.max(Number(feeCollectionPercentage) || 0,
                      0),
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="finance-columns">
              <div>
                <span>Collected</span>
                <strong className="money-green">
                  {formatMoney(collected)}
                </strong>
              </div>

              <div>
                <span>Outstanding</span>
                <strong className="money-red">
                  {formatMoney(outstanding)}
                </strong>
              </div>
            </div>
          </div>
        </Card>

        {/* ACADEMIC */}
        <Card>
          <SectionTitle
            title="Academic Performance"
            subtitle="Current academic overview"
            action={
              <button
                type="button"
                className="section-link"
                onClick={() => goTo("/academics")}
              >
                View Academics →
              </button>
            }
          />

          <div className="academic-summary">
            <div className="academic-score">
              <span>Average Score</span>

              <strong>
                {academicAverage
                  ? `${Number(academicAverage).toFixed(1)}%`
                  : "—"}
              </strong>
            </div>

            <div className="academic-info-grid">
              <div>
                <span>Exams</span>
                <strong>
                  {formatNumber(
                    academic.exams ??
                      academic.totalExams ??
                      0
                  )}
                </strong>
              </div>

              <div>
                <span>Results</span>
                <strong>
                  {formatNumber(
                    academic.results ??
                      academic.totalResults ??
                      0
                  )}
                </strong>
              </div>

              <div>
                <span>Subjects</span>
                <strong>
                  {formatNumber(
                    academic.subjects ??
                      subjects ??
                      0
                  )}
                </strong>
              </div>

              <div>
                <span>Students</span>
                <strong>
                  {formatNumber(
                    academic.students ??
                      totalStudents
                  )}
                </strong>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* =========================================================
          MADRASA
      ========================================================== */}
      <Card>
        <SectionTitle
          title="Madrasa Overview"
          subtitle="Madrasa student and attendance information"
          action={
            <button
              type="button"
              className="section-link"
              onClick={() => goTo("/madrasa")}
            >
              View Madrasa →
            </button>
          }
        />

        <div className="madrasa-dashboard">
          <div className="madrasa-stat">
            <div className="madrasa-icon">☪️</div>

            <div>
              <span>Total Students</span>
              <strong>
                {formatNumber(madrasaStudents)}
              </strong>
            </div>
          </div>

          <div className="madrasa-stat">
            <div className="madrasa-icon">📅</div>

            <div>
              <span>Present Today</span>
              <strong>
                {formatNumber(madrasaPresent)}
              </strong>
            </div>
          </div>

          <div className="madrasa-stat">
            <div className="madrasa-icon">📚</div>

            <div>
              <span>Classes</span>
              <strong>
                {formatNumber(
                  madrasa.classes ??
                    madrasa.totalClasses ??
                    0
                )}
              </strong>
            </div>
          </div>

          <div className="madrasa-stat">
            <div className="madrasa-icon">👨‍🏫</div>

            <div>
              <span>Teachers</span>
              <strong>
                {formatNumber(
                  madrasa.teachers ??
                    madrasa.totalTeachers ??
                    0
                )}
              </strong>
            </div>
          </div>
        </div>
      </Card>

      {/* =========================================================
          STUDENT OVERVIEW
      ========================================================== */}
      <Card>
        <SectionTitle
          title="Student Overview"
          subtitle="Latest student statistics"
          action={
            <button
              type="button"
              className="section-link"
              onClick={() => goTo("/students")}
            >
              View Students →
            </button>
          }
        />

        {studentOverview.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Attendance</th>
                  <th>Performance</th>
                </tr>
              </thead>

              <tbody>
                {studentOverview
                  .slice(0, 8)
                  .map((student, index) => (
                    <tr key={student.id ?? index}>
                      <td>
                        <div className="student-table-name">
                          <div className="student-avatar">
                            {getInitials(
                              student.name ||
                                student.full_name ||
                                student.student_name ||
                                "Student"
                            )}
                          </div>

                          <div>
                            <strong>
                              {student.name ||
                                student.full_name ||
                                student.student_name ||
                                "Student"}
                            </strong>

                            <small>
                              {student.admission_no ||
                                student.admission_number ||
                                student.student_id ||
                                "—"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {student.class_name ||
                          student.class ||
                          student.grade ||
                          "—"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            student.status || "active"
                          )}`}
                        >
                          {student.status || "Active"}
                        </span>
                      </td>

                      <td>
                        {student.attendance_percentage != null
                          ? `${student.attendance_percentage}%`
                          : student.attendance != null
                          ? `${student.attendance}%`
                          : "—"}
                      </td>

                      <td>
                        {student.average != null
                          ? `${student.average}%`
                          : student.average_score != null
                          ? `${student.average_score}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No student overview records available." />
        )}
      </Card>

      {/* =========================================================
          RECENT PAYMENTS + ACTIVITY
      ========================================================== */}
      <div className="dashboard-grid-two">
        {/* PAYMENTS */}
        <Card>
          <SectionTitle
            title="Recent Payments"
            subtitle="Latest fee transactions"
            action={
              <button
                type="button"
                className="section-link"
                onClick={() => goTo("/finance")}
              >
                View All →
              </button>
            }
          />

          {recentPayments.length ? (
            <div className="recent-list">
              {recentPayments
                .slice(0, 6)
                .map((payment, index) => (
                  <div
                    className="recent-item"
                    key={payment.id ?? index}
                  >
                    <div className="recent-avatar payment-avatar">
                      💰
                    </div>

                    <div className="recent-content">
                      <strong>
                        {payment.student_name ||
                          payment.student ||
                          payment.name ||
                          "Student"}
                      </strong>

                      <span>
                        {payment.receipt_no ||
                          payment.receipt_number ||
                          payment.reference ||
                          "Payment"}
                      </span>
                    </div>

                    <div className="recent-right">
                      <strong className="payment-amount">
                        {formatMoney(
                          payment.amount ||
                            payment.paid_amount ||
                            0
                        )}
                      </strong>

                      <small>
                        {formatDate(
                          payment.date ||
                            payment.payment_date ||
                            payment.created_at
                        )}
                      </small>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState message="No recent payments found." />
          )}
        </Card>

        {/* ACTIVITY */}
        <Card>
          <SectionTitle
            title="Recent Activity"
            subtitle="Latest system activities"
          />

          {activity.length ? (
            <div className="activity-timeline">
              {activity
                .slice(0, 7)
                .map((item, index) => (
                  <div
                    className="activity-item"
                    key={item.id ?? index}
                  >
                    <div className="activity-line">
                      <span className="activity-dot"></span>
                    </div>

                    <div className="activity-content">
                      <strong>
                        {item.title ||
                          item.action ||
                          item.activity ||
                          item.message ||
                          "System activity"}
                      </strong>

                      <p>
                        {item.description ||
                          item.details ||
                          item.message ||
                          ""}
                      </p>

                      <small>
                        {formatDate(
                          item.created_at ||
                            item.date ||
                            item.timestamp
                        )}
                      </small>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState message="No recent activity found." />
          )}
        </Card>
      </div>

      {/* =========================================================
          DASHBOARD FOOTER ACTIONS
      ========================================================== */}
      <div className="dashboard-bottom-actions">
        <button
          type="button"
          onClick={() => goTo("/reports")}
        >
          <span>📊</span>
          <div>
            <strong>Generate Reports</strong>
            <small>View school reports and statistics</small>
          </div>
          <b>→</b>
        </button>

        <button
          type="button"
          onClick={() => goTo("/timetable")}
        >
          <span>🗓️</span>
          <div>
            <strong>Manage Timetable</strong>
            <small>View and manage class schedules</small>
          </div>
          <b>→</b>
        </button>

        <button
          type="button"
          onClick={() => goTo("/settings")}
        >
          <span>⚙️</span>
          <div>
            <strong>System Settings</strong>
            <small>Configure NIA system</small>
          </div>
          <b>→</b>
        </button>
      </div>
    </Page>
  );
}