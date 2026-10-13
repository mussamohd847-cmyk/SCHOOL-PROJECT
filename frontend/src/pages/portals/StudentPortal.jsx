import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./StudentPortal.css";

const sections = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "results", label: "My Results", icon: "▤" },
  { id: "attendance", label: "Attendance", icon: "◷" },
  { id: "payments", label: "Fees & Payments", icon: "◇" },
  { id: "timetable", label: "Class Timetable", icon: "▦" },
];

const arr = (value) => Array.isArray(value) ? value : [];
const pick = (...values) => values.find((v) => v !== null && v !== undefined && v !== "") ?? "—";
const dateText = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
  });
};
const money = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? `TZS ${n.toLocaleString()}` : "—";
};
const titleCase = (value) => String(value || "—").replaceAll("_", " ").toLowerCase()
  .replace(/\b\w/g, (c) => c.toUpperCase());

function Table({ headers, rows, empty, renderRow }) {
  return (
    <div className="sp-table-wrap">
      <table className="sp-table">
        <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map(renderRow) : (
            <tr><td colSpan={headers.length} className="sp-empty">{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function StudentPortal() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [section, setSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let firstLoad = true;

    const load = async () => {
      try {
        const res = await api.get("/portal/student/dashboard");
        if (active) {
          setData(res.data?.data || null);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Unable to load your information. Please sign in again if your session has expired.");
      } finally {
        if (active && firstLoad) {
          setLoading(false);
          firstLoad = false;
        }
      }
    };

    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const logout = () => {
    ["nia_token", "nia_user", "nia_logged_in"].forEach((k) => localStorage.removeItem(k));
    navigate("/login", { replace: true });
  };

  const student = data?.student;
  const attendance = arr(data?.attendance);
  const results = arr(data?.results);
  const payments = arr(data?.payments);
  const fees = arr(data?.fees);
  const timetable = arr(data?.timetable);

  const stats = useMemo(() => {
    const present = attendance.filter((a) => String(a.status).toUpperCase() === "PRESENT").length;
    const marked = attendance.filter((a) => ["PRESENT", "ABSENT", "LATE", "EXCUSED"].includes(String(a.status).toUpperCase())).length;
    const paid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const attendanceRate = marked ? Math.round((present / marked) * 100) : null;
    return { present, attendanceRate, paid };
  }, [attendance, payments]);

  const sectionTitle = sections.find((s) => s.id === section)?.label || "Overview";

  const renderResults = () => (
    <Table
      headers={["Exam", "Subject", "Marks", "Grade"]}
      rows={results}
      empty="Your results have not been published yet."
      renderRow={(r, i) => (
        <tr key={r.id || i}>
          <td><strong>{pick(r.examName, r.exam_name, r.exam, r.examId, r.exam_id)}</strong></td>
          <td>{pick(r.subjectName, r.subject_name, r.subject, r.subjectId, r.subject_id)}</td>
          <td>{pick(r.total, r.marks, r.score)}</td>
          <td><span className="sp-grade">{pick(r.grade, "Pending")}</span></td>
        </tr>
      )}
    />
  );

  const renderAttendance = () => (
    <Table
      headers={["Date", "Status", "Remarks"]}
      rows={attendance}
      empty="No attendance records are available yet."
      renderRow={(a, i) => (
        <tr key={a.id || i}>
          <td>{dateText(a.date)}</td>
          <td><span className={`sp-status sp-status-${String(a.status || "").toLowerCase()}`}>{titleCase(a.status)}</span></td>
          <td>{pick(a.remarks, "—")}</td>
        </tr>
      )}
    />
  );

  const renderPayments = () => (
    <>
      <div className="sp-mini-stats">
        <div className="sp-mini-stat"><span>Total payments recorded</span><strong>{payments.length}</strong></div>
        <div className="sp-mini-stat"><span>Total amount paid</span><strong>{money(stats.paid)}</strong></div>
        <div className="sp-mini-stat"><span>Fee structures</span><strong>{fees.length}</strong></div>
      </div>
      <h3 className="sp-subheading">Payment history</h3>
      <Table
        headers={["Payment date", "Receipt", "Method", "Amount"]}
        rows={payments}
        empty="No payments have been recorded yet."
        renderRow={(p, i) => (
          <tr key={p.id || i}>
            <td>{dateText(p.payment_date || p.paymentDate)}</td>
            <td>{pick(p.receipt_no, p.receiptNo, p.reference_number, p.reference)}</td>
            <td>{titleCase(p.payment_method || p.paymentMethod)}</td>
            <td><strong>{money(p.amount)}</strong></td>
          </tr>
        )}
      />
      <h3 className="sp-subheading">Fee structures</h3>
      <Table
        headers={["Fee type", "Amount", "Due date"]}
        rows={fees}
        empty="No fee structures are available for your class."
        renderRow={(f, i) => (
          <tr key={f.id || i}>
            <td>{titleCase(f.fee_type || f.feeType)}</td>
            <td>{money(f.amount)}</td>
            <td>{dateText(f.due_date || f.dueDate)}</td>
          </tr>
        )}
      />
      <p className="sp-note">For official balances or payment corrections, please contact the school accountant.</p>
    </>
  );

  const renderTimetable = () => {
    const ordered = [...timetable].sort((a, b) =>
      String(a.day_of_week || a.dayOfWeek).localeCompare(String(b.day_of_week || b.dayOfWeek)) ||
      String(a.start_time || a.startTime).localeCompare(String(b.start_time || b.startTime))
    );
    return (
      <Table
        headers={["Day", "Time", "Subject", "Room", "Type"]}
        rows={ordered}
        empty="Your class timetable has not been published yet."
        renderRow={(t, i) => (
          <tr key={t.id || i}>
            <td><strong>{titleCase(t.day_of_week || t.dayOfWeek)}</strong></td>
            <td>{pick(t.start_time, t.startTime)} – {pick(t.end_time, t.endTime)}</td>
            <td>{pick(t.subject_name, t.subjectName, t.subject, t.subject_id, t.subjectId)}</td>
            <td>{pick(t.room, "—")}</td>
            <td>{titleCase(t.lesson_type || t.lessonType)}</td>
          </tr>
        )}
      />
    );
  };

  const renderContent = () => {
    if (section === "results") return renderResults();
    if (section === "attendance") return renderAttendance();
    if (section === "payments") return renderPayments();
    if (section === "timetable") return renderTimetable();

    return (
      <>
        <div className="sp-welcome">
          <div>
            <span className="sp-eyebrow">STUDENT SPACE</span>
            <h2>Welcome back, {student?.name || "Student"}!</h2>
            <p>Here is an overview of your learning journey at NIA.</p>
          </div>
          <div className="sp-admission">
            <span>ADMISSION NUMBER</span>
            <strong>{pick(student?.admissionNo, student?.admission_no)}</strong>
          </div>
        </div>

        <div className="sp-stat-grid">
          <button className="sp-stat-card" onClick={() => setSection("results")}>
            <span className="sp-stat-icon sp-blue">▤</span>
            <span className="sp-stat-label">Published results</span>
            <strong>{results.length}</strong>
            <span className="sp-stat-foot">View academic performance ↗</span>
          </button>
          <button className="sp-stat-card" onClick={() => setSection("attendance")}>
            <span className="sp-stat-icon sp-teal">◷</span>
            <span className="sp-stat-label">Attendance rate</span>
            <strong>{stats.attendanceRate === null ? "—" : `${stats.attendanceRate}%`}</strong>
            <span className="sp-stat-foot">{stats.present} days marked present</span>
          </button>
          <button className="sp-stat-card" onClick={() => setSection("payments")}>
            <span className="sp-stat-icon sp-gold">◇</span>
            <span className="sp-stat-label">Payments recorded</span>
            <strong>{payments.length}</strong>
            <span className="sp-stat-foot">Total {money(stats.paid)}</span>
          </button>
          <button className="sp-stat-card" onClick={() => setSection("timetable")}>
            <span className="sp-stat-icon sp-purple">▦</span>
            <span className="sp-stat-label">Timetable entries</span>
            <strong>{timetable.length}</strong>
            <span className="sp-stat-foot">View your class schedule ↗</span>
          </button>
        </div>

        <section className="sp-panel">
          <div className="sp-panel-heading">
            <div><span className="sp-eyebrow">ACADEMICS</span><h3>Recent results</h3></div>
            <button className="sp-text-button" onClick={() => setSection("results")}>View all →</button>
          </div>
          <Table
            headers={["Exam", "Subject", "Marks", "Grade"]}
            rows={results.slice(0, 5)}
            empty="Your results will appear here when they are published."
            renderRow={(r, i) => (
              <tr key={r.id || i}>
                <td><strong>{pick(r.examName, r.exam_name, r.exam, r.examId, r.exam_id)}</strong></td>
                <td>{pick(r.subjectName, r.subject_name, r.subject, r.subjectId, r.subject_id)}</td>
                <td>{pick(r.total, r.marks, r.score)}</td>
                <td><span className="sp-grade">{pick(r.grade, "Pending")}</span></td>
              </tr>
            )}
          />
        </section>

        <section className="sp-panel">
          <div className="sp-panel-heading">
            <div><span className="sp-eyebrow">DAILY RECORD</span><h3>Recent attendance</h3></div>
            <button className="sp-text-button" onClick={() => setSection("attendance")}>View all →</button>
          </div>
          <Table
            headers={["Date", "Status", "Remarks"]}
            rows={attendance.slice(0, 5)}
            empty="Attendance records will appear here when available."
            renderRow={(a, i) => (
              <tr key={a.id || i}>
                <td>{dateText(a.date)}</td>
                <td><span className={`sp-status sp-status-${String(a.status || "").toLowerCase()}`}>{titleCase(a.status)}</span></td>
                <td>{pick(a.remarks, "—")}</td>
              </tr>
            )}
          />
        </section>
      </>
    );
  };

  return (
    <div className="sp-layout">
      <aside className="sp-sidebar">
        <div className="sp-brand">
          <div className="sp-brand-mark">NIA</div>
          <div><strong>NIA Schools</strong><span>STUDENT PORTAL</span></div>
        </div>

        <div className="sp-profile">
          <div className="sp-avatar">{(student?.name || "Student").trim().charAt(0).toUpperCase()}</div>
          <div className="sp-profile-text">
            <strong>{student?.name || "Student Account"}</strong>
            <span>{pick(student?.admissionNo, student?.admission_no, "Student")}</span>
          </div>
        </div>

        <span className="sp-nav-caption">MY LEARNING</span>
        <nav className="sp-nav" aria-label="Student portal navigation">
          {sections.map((item) => (
            <button key={item.id} className={section === item.id ? "active" : ""}
              onClick={() => setSection(item.id)}>
              <span className="sp-nav-icon">{item.icon}</span>{item.label}
              {section === item.id && <span className="sp-nav-active" />}
            </button>
          ))}
        </nav>

        <div className="sp-sidebar-bottom">
          <div className="sp-help"><strong>Need assistance?</strong><p>Contact your school office for support.</p></div>
          <button className="sp-logout" onClick={logout}><span>↪</span> Sign out</button>
        </div>
      </aside>

      <main className="sp-main">
        <header className="sp-topbar">
          <div><span className="sp-top-kicker">NIMBLE INTEGRATED ACADEMY</span><h1>{sectionTitle}</h1></div>
          <div className="sp-top-actions">
            <span className="sp-online"><span /> Student account</span>
            <button className="sp-refresh" onClick={() => window.location.reload()} title="Refresh portal" aria-label="Refresh portal">↻</button>
          </div>
        </header>

        {loading && <div className="sp-message"><span className="sp-loader" /> Loading your student portal...</div>}
        {!loading && error && (
          <div className="sp-error" role="alert">
            <strong>We could not load your portal</strong><p>{error}</p>
            <button onClick={() => window.location.reload()}>Try again</button>
          </div>
        )}
        {!loading && !error && !student && (
          <div className="sp-error"><strong>Student profile not linked</strong><p>Please contact the school administrator to link your account to your student record.</p></div>
        )}
        {!loading && !error && student && <div className="sp-content">{renderContent()}</div>}

        <footer className="sp-footer"><span>© {new Date().getFullYear()} NIA School &amp; Madrasa</span><span>Student Portal · Your learning, at a glance</span></footer>
      </main>
    </div>
  );
}
