import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./TeacherPortal.css";

const today = () => new Date().toISOString().slice(0, 10);

const nameOf = (x) =>
  x?.name || x?.className || x?.class_name ||
  x?.subjectName || x?.subject_name || `#${x?.id ?? ""}`;

const idOf = (x) => String(x?.id ?? "");

export default function TeacherPortal() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [section, setSection] = useState("overview");
  const [profileOpen, setProfileOpen] = useState(false);

  const [attendance, setAttendance] = useState({
    class_id: "", student_id: "", date: today(),
    status: "PRESENT", remarks: "",
  });
  const [selectedAttendanceStudents, setSelectedAttendanceStudents] = useState([]);
  const [attendanceStatuses, setAttendanceStatuses] = useState({});

  const [result, setResult] = useState({
    exam_id: "", student_id: "", total: "",
  });

  const [lessonPlans, setLessonPlans] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [lesson, setLesson] = useState({
    class_id: "", subject_id: "", lesson_date: today(),
    topic: "", objectives: "", activities: "", resources: "", notes: "",
  });
  const [profileForm, setProfileForm] = useState({
    phone: "", email: "", address: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "", new_password: "", confirm_password: "",
  });

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get("/portal/teacher/dashboard");
      setData(res.data?.data || null);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load portal data. Please sign in with a teacher account."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load(false);
    }, 30000);
    return () => clearInterval(timer);
  }, [load]);


  useEffect(() => {
    let active = true;
    const fetchSectionData = async () => {
      try {
        if (section === "lesson-planning") {
          const res = await api.get("/portal/teacher/lessons");
          if (active) setLessonPlans(res.data?.data || []);
        } else if (section === "announcements" || section === "overview") {
          const res = await api.get("/portal/teacher/announcements");
          if (active) setAnnouncements(res.data?.data || []);
        }
      } catch (err) {
        if (active) setError(
          err.response?.data?.message || "Unable to load information."
        );
      }
    };
    fetchSectionData();
    return () => { active = false; };
  }, [section]);

  useEffect(() => {
    const t = data?.teacher || {};
    setProfileForm({
      phone: t.phone || "",
      email: t.email || "",
      address: t.address || "",
    });
  }, [data?.teacher]);

  const saveAttendance = async (e) => {
    e.preventDefault();
    if (!attendance.class_id || !attendance.date || !selectedAttendanceStudents.length) {
      setError("Select a class and at least one student.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    let saved = 0;

    try {
      for (const studentId of selectedAttendanceStudents) {
        await api.post("/portal/teacher/attendance", {
          class_id: Number(attendance.class_id),
          student_id: Number(studentId),
          date: attendance.date,
          status: attendanceStatuses[studentId] || "PRESENT",
          remarks: attendance.remarks,
        });
        saved++;
      }
      setMessage(`Attendance saved for ${saved} student(s).`);
      await load(false);
    } catch (err) {
      setError(
        (err.response?.data?.message || "Unable to save attendance.") +
        ` Successfully saved before error: ${saved}.`
      );
    } finally {
      setSaving(false);
    }
  };

  const saveLesson = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.post("/portal/teacher/lessons", lesson);
      setMessage("Lesson plan saved successfully.");
      setLesson({
        class_id: "", subject_id: "", lesson_date: today(),
        topic: "", objectives: "", activities: "", resources: "", notes: "",
      });
      const res = await api.get("/portal/teacher/lessons");
      setLessonPlans(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Imeshindikana kuhifadhi lesson plan.");
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (id) => {
    if (!window.confirm("Delete this lesson plan?")) return;
    setError("");
    setMessage("");
    try {
      await api.delete(`/portal/teacher/lessons/${id}`);
      setLessonPlans((items) => items.filter((item) => item.id !== id));
      setMessage("Lesson plan deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Imeshindikana kufuta lesson plan.");
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.patch("/portal/teacher/profile", profileForm);
      setMessage("Profile updated successfully.");
      await load(false);
    } catch (err) {
      setError(err.response?.data?.message || "Imeshindikana kusasisha profile.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.post("/portal/teacher/change-password", passwordForm);
      setMessage("Password changed successfully. Use your new password next time you log in.");
      setPasswordForm({
        current_password: "", new_password: "", confirm_password: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Imeshindikana kubadilisha password.");
    } finally {
      setSaving(false);
    }
  };

  const classes = data?.classes || [];
  const subjects = data?.subjects || [];
  const students = data?.students || [];
  const exams = data?.exams || [];
  const timetable = data?.timetable || [];

  const attendanceStudents = useMemo(() => {
    if (!attendance.class_id) return [];
    return students.filter((s) =>
      [s.schoolClassId, s.school_class_id, s.madrasaClassId, s.madrasa_class_id]
        .some((id) => String(id ?? "") === attendance.class_id)
    );
  }, [students, attendance.class_id]);

  const selectedExam = exams.find((x) => idOf(x) === result.exam_id);

  const resultStudents = useMemo(() => {
    if (!selectedExam) return [];
    return students.filter((s) =>
      [s.schoolClassId, s.school_class_id, s.madrasaClassId, s.madrasa_class_id]
        .some((id) => String(id ?? "") === String(selectedExam.class_id ?? selectedExam.classId ?? ""))
    );
  }, [students, selectedExam]);

  const logout = () => {
    ["nia_token", "nia_user", "nia_logged_in"].forEach((k) =>
      localStorage.removeItem(k)
    );
    navigate("/login", { replace: true });
  };

  const submit = async (e, endpoint, payload, successText, reset) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await api.post(endpoint, payload);
      setMessage(successText);
      if (reset) reset();
      await load(false);
    } catch (err) {
      setError(err.response?.data?.message || "Imeshindikana kuhifadhi taarifa.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return <div className="sp-layout"><aside className="sp-sidebar"><div className="sp-brand"><div className="sp-brand-mark">NIA</div><div><strong>NIA Schools</strong><span>TEACHER PORTAL</span></div></div></aside><main className="sp-main"><header className="sp-topbar"><div><span className="sp-top-kicker">NIMBLE INTEGRATED ACADEMY</span><h1>Teacher Dashboard</h1></div></header><div className="sp-message"><span className="sp-loader" /> Loading Teacher Portal...</div></main></div>;
  }

  const navItems = [
    ["overview", "Dashboard", "⌂"],
    ["classes", "My Classes & Students", "▤"],
    ["attendance", "Attendance", "◷"],
    ["results", "Results & Exams", "▧"],
    ["timetable", "Timetable", "▦"],
    ["lesson-planning", "Lesson Planning", "✎"],
  ];

  const profileItems = [
    ["profile", "My Profile"],
    ["announcements", "Announcements"],
    ["change-password", "Change Password"],
  ];

  const sectionTitle = [...navItems, ...profileItems]
    .find((item) => item[0] === section)?.[1] || "Dashboard";

  return (
    <div className="sp-layout tp-layout">
      <aside className="sp-sidebar">
        <div className="sp-brand"><div className="sp-brand-mark">NIA</div><div><strong>NIA Schools</strong><span>TEACHER PORTAL</span></div></div>
        <div className="sp-profile">
          <div className="sp-avatar">{(data?.teacher?.name || "T").trim().charAt(0).toUpperCase()}</div>
          <div className="sp-profile-text"><strong>{data?.teacher?.name || "Teacher Account"}</strong><span>{data?.teacher?.employeeNumber || "Teacher"}</span></div>
        </div>
        <span className="sp-nav-caption">TEACHING</span>
        <nav className="sp-nav" aria-label="Teacher portal navigation">
          {navItems.map(([key, label, icon]) => (
            <button key={key} className={section === key ? "active" : ""} onClick={() => { setSection(key); setError(""); setMessage(""); }}>
              <span className="sp-nav-icon">{icon}</span>{label}
              {section === key && <span className="sp-nav-active" />}
            </button>
          ))}
        </nav>
        <div className="sp-sidebar-bottom">
          <div className="sp-help"><strong>Need help?</strong><p>Contact the school administration for assistance.</p></div>
          <button className="sp-logout" onClick={logout}><span>↪</span> Sign out</button>
        </div>
      </aside>
      <main className="sp-main">
        <header className="sp-topbar">
          <div><span className="sp-top-kicker">NIMBLE INTEGRATED ACADEMY</span><h1>{sectionTitle}</h1></div>
          <div className="sp-top-actions">
            <span className="sp-online"><span /> Teacher Account</span>
            <button className="sp-refresh" onClick={() => load()} title="Refresh portal" aria-label="Refresh portal">↻</button>
            <div className="tp-profile-menu">
              <button
                type="button"
                className="tp-profile-trigger"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                onClick={() => setProfileOpen((open) => !open)}
              >
                <span className="tp-profile-initial">
                  {(data?.teacher?.name || "T").trim().charAt(0).toUpperCase()}
                </span>
                <span>Profile</span>
                <span aria-hidden="true">{profileOpen ? "▴" : "▾"}</span>
              </button>
              {profileOpen && (
                <div className="tp-profile-dropdown" role="menu">
                  {profileItems.map(([key, label]) => (
                    <button
                      type="button"
                      role="menuitem"
                      key={key}
                      className={section === key ? "active" : ""}
                      onClick={() => {
                        setSection(key);
                        setProfileOpen(false);
                        setError("");
                        setMessage("");
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="sp-content tp-content">

      {error && <div className="tp-alert tp-alert-error" role="alert">{error}</div>}
      {message && <div className="tp-alert tp-alert-success" role="status">{message}</div>}

      {!data ? (
        <div className="tp-panel">
          No portal information is available.
          <button className="tp-btn tp-btn-primary" onClick={() => load()}>Try again</button>
        </div>
      ) : (
        <>
          <section className="tp-welcome">
            <div>
              <span className="tp-muted">WELCOME</span>
              <h2>{data.teacher?.name || "Teacher"}</h2>
              <p>Employee number: {data.teacher?.employeeNumber || "Haijawekwa"}</p>
            </div>
            <div className="tp-date">{today()}</div>
          </section>

          {section === "overview" && <>
            <section className="tp-overview-heading">
              <div>
                <span className="tp-overview-eyebrow">TEACHING AT A GLANCE</span>
                <h2>Your teaching overview</h2>
                <p>Review today's schedule, attendance, assessments and school updates.</p>
              </div>
              <span className="tp-overview-date">{today()}</span>
            </section>

            <section className="tp-stats">
              {[
                ["Assigned Classes", classes.length],
                ["Assigned Subjects", subjects.length],
                ["Students", students.length],
                ["Upcoming Exams", (data?.exams || []).length],
              ].map(([label, value]) => (
                <article className="tp-stat" key={label}>
                  <span>{label}</span><strong>{value}</strong>
                </article>
              ))}
            </section>

            <div className="tp-dashboard-grid">
              <section className="tp-panel tp-dashboard-panel">
                <div className="tp-panel-heading">
                  <h3>Today's Schedule</h3>
                  <span>{timetable.filter((item) =>
                    String(item.dayOfWeek || item.day_of_week || "").toUpperCase() ===
                    new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()
                  ).length}</span>
                </div>
                {(() => {
                  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
                  const items = timetable.filter((item) =>
                    String(item.dayOfWeek || item.day_of_week || "").toUpperCase() === weekday
                  );
                  return items.length ? items.map((item, index) => (
                    <div className="tp-dashboard-row" key={item.id || index}>
                      <span className="tp-schedule-time">
                        {item.startTime || item.start_time || "—"}
                        <small>{item.endTime || item.end_time || "—"}</small>
                      </span>
                      <div className="tp-dashboard-row-main">
                        <strong>{item.subjectName || item.subject_name ||
                          nameOf(subjects.find((s) => idOf(s) === String(item.subject_id ?? item.subjectId)) || {})}</strong>
                        <span>{item.className || item.class_name ||
                          nameOf(classes.find((cl) => idOf(cl) === String(item.class_id ?? item.classId)) || {})}</span>
                        {(item.room) && <small>Room: {item.room}</small>}
                      </div>
                    </div>
                  )) : <p className="tp-empty">No schedule entries are available for today.</p>;
                })()}
                <button className="tp-text-button" onClick={() => setSection("timetable")}>View full timetable →</button>
              </section>

              <section className="tp-panel tp-dashboard-panel">
                <div className="tp-panel-heading"><h3>Attendance Overview</h3><span>Today</span></div>
                <div className="tp-attendance-total">
                  <strong>{data?.attendanceOverview?.recorded ?? 0}</strong>
                  <span>Students with recorded attendance</span>
                </div>
                <div className="tp-attendance-grid">
                  {[
                    ["Present", data?.attendanceOverview?.present ?? 0, "present"],
                    ["Absent", data?.attendanceOverview?.absent ?? 0, "absent"],
                    ["Late", data?.attendanceOverview?.late ?? 0, "late"],
                    ["Excused", data?.attendanceOverview?.excused ?? 0, "excused"],
                  ].map(([label, value, kind]) => (
                    <div className="tp-attendance-item" key={label}>
                      <span className={`tp-attendance-dot ${kind}`} />
                      <span>{label}</span><strong>{value}</strong>
                    </div>
                  ))}
                </div>
                <p className="tp-dashboard-note">
                  {data?.attendanceOverview?.notRecorded ?? 0} assigned students have no attendance record for today.
                </p>
                <button className="tp-text-button" onClick={() => setSection("attendance")}>Record attendance →</button>
              </section>

              <section className="tp-panel tp-dashboard-panel">
                <div className="tp-panel-heading"><h3>Upcoming Exams</h3><span>{exams.length}</span></div>
                {exams.length ? exams.slice(0, 5).map((exam) => (
                  <div className="tp-dashboard-row" key={exam.id}>
                    <span className="tp-exam-date">
                      {exam.exam_date || exam.examDate || "Date not set"}
                    </span>
                    <div className="tp-dashboard-row-main">
                      <strong>{exam.name || exam.examName || exam.exam_name || `Exam ${exam.id}`}</strong>
                      <span>
                        {nameOf(classes.find((cl) => idOf(cl) === String(exam.class_id ?? exam.classId)) || {})}
                        {" · "}
                        {nameOf(subjects.find((sub) => idOf(sub) === String(exam.subject_id ?? exam.subjectId)) || {})}
                      </span>
                    </div>
                  </div>
                )) : <p className="tp-empty">No upcoming exams are recorded.</p>}
                <button className="tp-text-button" onClick={() => setSection("results")}>Manage results →</button>
              </section>

              <section className="tp-panel tp-dashboard-panel">
                <div className="tp-panel-heading"><h3>Academic Progress</h3><span>Recorded results</span></div>
                <div className="tp-progress-number">
                  {data?.academicProgress?.averagePercentage == null
                    ? "—" : `${data.academicProgress.averagePercentage}%`}
                </div>
                <p className="tp-dashboard-note">Average percentage from results with a valid exam total.</p>
                <div className="tp-progress-footer">
                  <strong>{data?.academicProgress?.recordCount ?? 0}</strong>
                  <span>Result records available</span>
                </div>
                {(data?.academicProgress?.recordCount ?? 0) === 0 &&
                  <p className="tp-empty">No recorded results are available for progress analysis.</p>}
                <button className="tp-text-button" onClick={() => setSection("results")}>Enter or review results →</button>
              </section>

              <section className="tp-panel tp-dashboard-panel">
                <div className="tp-panel-heading"><h3>Announcements</h3><span>{announcements.length}</span></div>
                {announcements.length ? announcements.slice(0, 4).map((item) => (
                  <article className="tp-announcement" key={item.id}>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                    <small>{item.created_at ? new Date(item.created_at).toLocaleString() : ""}</small>
                  </article>
                )) : <p className="tp-empty">No published announcements are available.</p>}
                <button className="tp-text-button" onClick={() => setSection("announcements")}>View all announcements →</button>
              </section>

              <section className="tp-panel tp-dashboard-panel">
                <div className="tp-panel-heading"><h3>Pending Tasks</h3><span>
                  {(data?.pendingTasks?.attendanceNotRecorded ?? 0) +
                   (data?.pendingTasks?.pastExamsWithoutResults ?? 0)}
                </span></div>
                <div className="tp-task-row">
                  <div><strong>Attendance not recorded</strong><p>Assigned students without today's attendance entry.</p></div>
                  <span className="tp-task-count">{data?.pendingTasks?.attendanceNotRecorded ?? 0}</span>
                </div>
                <div className="tp-task-row">
                  <div><strong>Past exams without results</strong><p>Past active exams with no recorded result entries.</p></div>
                  <span className="tp-task-count">{data?.pendingTasks?.pastExamsWithoutResults ?? 0}</span>
                </div>
                <p className="tp-dashboard-note">Tasks are calculated from existing records; no sample tasks are added.</p>
              </section>
            </div>
          </>}

          {section === "classes" && (
            <>
              <section className="tp-panel">
                <div className="tp-panel-heading">
                  <h3>My Classes</h3><span>{classes.length}</span>
                </div>
                <div className="tp-table-wrap">
                  <table className="tp-table">
                    <thead><tr><th>Class</th><th>Class ID</th></tr></thead>
                    <tbody>
                      {classes.map((c) => (
                        <tr key={c.id}><td>{nameOf(c)}</td><td>{c.id}</td></tr>
                      ))}
                      {!classes.length && <tr><td colSpan="2" className="tp-empty">No classes assigned yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="tp-panel">
                <div className="tp-panel-heading">
                  <h3>My Students</h3><span>{students.length}</span>
                </div>
                <div className="tp-table-wrap">
                  <table className="tp-table">
                    <thead><tr><th>Student</th><th>Admission Number</th><th>Class</th></tr></thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td>{student.name || "—"}</td>
                          <td>{student.admissionNo || student.admission_no || student.id}</td>
                          <td>{nameOf(classes.find((c) =>
                            [student.schoolClassId, student.school_class_id,
                             student.madrasaClassId, student.madrasa_class_id]
                              .some((id) => String(id ?? "") === String(c.id))
                          ) || {})}</td>
                        </tr>
                      ))}
                      {!students.length && <tr><td colSpan="3" className="tp-empty">No students found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {section === "lesson-planning" && (
            <>
              <section className="tp-panel tp-form-panel">
                <h3>Create Lesson Plan</h3>
                <form onSubmit={saveLesson}>
                  <div className="tp-form-grid">
                    <label>Class
                      <select required value={lesson.class_id} onChange={(e) => setLesson({ ...lesson, class_id: e.target.value })}>
                        <option value="">Select class</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{nameOf(c)}</option>)}
                      </select>
                    </label>
                    <label>Subject
                      <select required value={lesson.subject_id} onChange={(e) => setLesson({ ...lesson, subject_id: e.target.value })}>
                        <option value="">Select subject</option>
                        {subjects.map((sub) => <option key={sub.id} value={sub.id}>{nameOf(sub)}</option>)}
                      </select>
                    </label>
                    <label>Lesson date
                      <input type="date" required value={lesson.lesson_date} onChange={(e) => setLesson({ ...lesson, lesson_date: e.target.value })} />
                    </label>
                    <label>Topic
                      <input required maxLength="200" value={lesson.topic} onChange={(e) => setLesson({ ...lesson, topic: e.target.value })} />
                    </label>
                    <label className="tp-full-width">Learning objectives
                      <textarea required rows="3" value={lesson.objectives} onChange={(e) => setLesson({ ...lesson, objectives: e.target.value })} />
                    </label>
                    <label className="tp-full-width">Class activities
                      <textarea rows="3" value={lesson.activities} onChange={(e) => setLesson({ ...lesson, activities: e.target.value })} />
                    </label>
                    <label>Teaching resources
                      <input value={lesson.resources} onChange={(e) => setLesson({ ...lesson, resources: e.target.value })} />
                    </label>
                    <label>Notes
                      <input value={lesson.notes} onChange={(e) => setLesson({ ...lesson, notes: e.target.value })} />
                    </label>
                  </div>
                  <button className="tp-btn tp-btn-primary" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Lesson Plan"}
                  </button>
                </form>
              </section>
              <section className="tp-panel">
                <div className="tp-panel-heading"><h3>Saved Lesson Plans</h3><span>{lessonPlans.length}</span></div>
                <div className="tp-table-wrap"><table className="tp-table">
                  <thead><tr><th>Date</th><th>Topic</th><th>Class</th><th>Subject</th><th>Objectives</th><th>Action</th></tr></thead>
                  <tbody>
                    {lessonPlans.map((item) => (
                      <tr key={item.id}>
                        <td>{item.lesson_date || "—"}</td>
                        <td>{item.topic}</td>
                        <td>{nameOf(classes.find((c) => String(c.id) === String(item.class_id)) || { id: item.class_id })}</td>
                        <td>{nameOf(subjects.find((sub) => String(sub.id) === String(item.subject_id)) || { id: item.subject_id })}</td>
                        <td>{item.objectives}</td>
                        <td><button type="button" className="tp-btn" onClick={() => deleteLesson(item.id)} disabled={saving}>Delete</button></td>
                      </tr>
                    ))}
                    {!lessonPlans.length && <tr><td colSpan="6" className="tp-empty">No lesson plans saved yet.</td></tr>}
                  </tbody>
                </table></div>
              </section>
            </>
          )}

          {section === "profile" && (
            <section className="tp-panel tp-form-panel">
              <h3>My Profile</h3>
              <div className="tp-profile-details">
                <p><strong>Full Name:</strong> {data?.teacher?.name || "—"}</p>
                <p><strong>Employee Number:</strong> {data?.teacher?.employeeNumber || data?.teacher?.employee_number || "—"}</p>
                <p><strong>Teacher Number:</strong> {data?.teacher?.teacherNumber || "—"}</p>
                <p><strong>Gender:</strong> {data?.teacher?.gender || "—"}</p>
                <p><strong>Assignment:</strong> {data?.teacher?.assignment || "—"}</p>
                <p><strong>Specialization:</strong> {data?.teacher?.specialization || "—"}</p>
                <p><strong>Classes Assigned:</strong> {classes.length}</p>
                <p><strong>Subjects Assigned:</strong> {subjects.length}</p>
              </div>
              <form onSubmit={saveProfile}>
                <div className="tp-form-grid">
                  <label>Phone
                    <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  </label>
                  <label>Email
                    <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                  </label>
                  <label className="tp-full-width">Address
                    <input value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
                  </label>
                </div>
                <button className="tp-btn tp-btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button>
              </form>
            </section>
          )}

          {section === "announcements" && (
            <section className="tp-panel">
              <div className="tp-panel-heading"><h3>School Announcements</h3><span>{announcements.length}</span></div>
              {announcements.length ? announcements.map((item) => (
                <article className="tp-list-row" key={item.id} style={{ display: "block", padding: "14px 0" }}>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <small className="tp-muted">{item.created_at ? new Date(item.created_at).toLocaleString() : ""}</small>
                </article>
              )) : <p className="tp-empty">No published announcements are available.</p>}
            </section>
          )}

          {section === "change-password" && (
            <section className="tp-panel tp-form-panel">
              <h3>Change Password</h3>
              <form onSubmit={changePassword}>
                <div className="tp-form-grid">
                  <label className="tp-full-width">Current password
                    <input type="password" autoComplete="current-password" required value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
                  </label>
                  <label>New password
                    <input type="password" autoComplete="new-password" minLength="8" required value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} />
                  </label>
                  <label>Confirm new password
                    <input type="password" autoComplete="new-password" minLength="8" required value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} />
                  </label>
                </div>
                <p className="tp-muted">Use at least 8 characters. Your current password is required to authorize this change.</p>
                <button className="tp-btn tp-btn-primary" type="submit" disabled={saving}>{saving ? "Updating..." : "Change Password"}</button>
              </form>
            </section>
          )}

          {section === "attendance" && (
            <section className="tp-panel tp-form-panel">
              <h3>Record Attendance</h3>
              <p className="tp-muted">Select all students or choose individual students. Set each student's attendance status and submit.</p>

              <form onSubmit={saveAttendance}>
                <div className="tp-form-grid">
                  <label>Class
                    <select required value={attendance.class_id} onChange={(e) => {
                      const classId = e.target.value;
                      const classStudents = students.filter((student) =>
                        [student.schoolClassId, student.school_class_id, student.madrasaClassId, student.madrasa_class_id]
                          .some((id) => String(id ?? "") === classId)
                      );
                      setAttendance((a) => ({ ...a, class_id: classId }));
                      setSelectedAttendanceStudents(classStudents.map((student) => String(student.id)));
                      setAttendanceStatuses({});
                    }}>
                      <option value="">Select class</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{nameOf(c)}</option>)}
                    </select>
                  </label>

                  <label>Date
                    <input type="date" required value={attendance.date}
                      onChange={(e) => setAttendance((a) => ({ ...a, date: e.target.value }))} />
                  </label>

                  <label className="tp-full">Remarks (optional)
                    <input maxLength="255" value={attendance.remarks}
                      onChange={(e) => setAttendance((a) => ({ ...a, remarks: e.target.value }))}
                      placeholder="Additional remarks" />
                  </label>
                </div>

                {attendance.class_id && attendanceStudents.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <strong>Students ({attendanceStudents.length})</strong>
                      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="checkbox"
                          checked={attendanceStudents.every((student) => selectedAttendanceStudents.includes(String(student.id)))}
                          onChange={(e) => setSelectedAttendanceStudents(
                            e.target.checked ? attendanceStudents.map((student) => String(student.id)) : []
                          )} />
                        Select All Students
                      </label>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: "left", padding: 10 }}>Select</th>
                            <th style={{ textAlign: "left", padding: 10 }}>Student</th>
                            <th style={{ textAlign: "left", padding: 10 }}>Attendance Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceStudents.map((student) => {
                            const studentId = String(student.id);
                            return (
                              <tr key={student.id}>
                                <td style={{ padding: 10 }}>
                                  <input type="checkbox"
                                    aria-label={`Select ${student.name}`}
                                    checked={selectedAttendanceStudents.includes(studentId)}
                                    onChange={(e) => setSelectedAttendanceStudents((current) =>
                                      e.target.checked
                                        ? [...current, studentId]
                                        : current.filter((id) => id !== studentId)
                                    )} />
                                </td>
                                <td style={{ padding: 10 }}>
                                  {student.name} — {student.admissionNo || student.admission_no || student.id}
                                </td>
                                <td style={{ padding: 10 }}>
                                  <select aria-label={`Attendance status for ${student.name}`}
                                    value={attendanceStatuses[studentId] || "PRESENT"}
                                    onChange={(e) => setAttendanceStatuses((current) => ({
                                      ...current, [studentId]: e.target.value
                                    }))}>
                                    <option value="PRESENT">Present</option>
                                    <option value="ABSENT">Absent</option>
                                    <option value="LATE">Late</option>
                                    <option value="EXCUSED">Excused</option>
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <p className="tp-muted">Selected: {selectedAttendanceStudents.length} student(s)</p>
                  </div>
                )}

                <button className="tp-btn tp-btn-primary" type="submit"
                  disabled={saving || !selectedAttendanceStudents.length}>
                  {saving ? "Saving Attendance..." : `Submit Attendance (${selectedAttendanceStudents.length})`}
                </button>

                {attendance.class_id && !attendanceStudents.length &&
                  <p className="tp-muted">No students were found in this class.</p>}
              </form>
            </section>
          )}

          {section === "results" && (
            <section className="tp-panel tp-form-panel">
              <h3>Enter Results</h3>
              <p className="tp-muted">Select exam hai. Class na somo hufuata mtihani uliochaguliwa.</p>
              <form onSubmit={(e) => submit(
                e, "/portal/teacher/results", result,
                "Results saved successfully.",
                () => setResult((r) => ({ ...r, total: "" }))
              )}>
                <div className="tp-form-grid">
                  <label className="tp-full">Exam
                    <select required value={result.exam_id} onChange={(e) => setResult({ exam_id: e.target.value, student_id: "", total: "" })}>
                      <option value="">Select exam</option>
                      {exams.map((ex) => <option key={ex.id} value={ex.id}>
                        {ex.name || ex.examName || ex.exam_name || `Exam ${ex.id}`} — {nameOf(classes.find((c) => idOf(c) === String(ex.class_id ?? ex.classId)) || { id: ex.class_id ?? ex.classId })}
                      </option>)}
                    </select>
                  </label>
                  <label>Student
                    <select required value={result.student_id} onChange={(e) => setResult({ ...result, student_id: e.target.value })}>
                      <option value="">Select student</option>
                      {resultStudents.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.admissionNo || s.id}</option>)}
                    </select>
                  </label>
                  <label>Score
                    <input required type="number" min="0" max={selectedExam?.total_marks ?? selectedExam?.totalMarks ?? 100} step="0.01" value={result.total} onChange={(e) => setResult({ ...result, total: e.target.value })} />
                    <small>Total Marks: {selectedExam?.total_marks ?? selectedExam?.totalMarks ?? 100}</small>
                  </label>
                </div>
                <button className="tp-btn tp-btn-primary" disabled={saving || !selectedExam || !resultStudents.length}>
                  {saving ? "Saving..." : "Save Results"}
                </button>
                {result.exam_id && !resultStudents.length && <p className="tp-muted">No wanafunzi waliopatikana kwa darasa la mtihani huu.</p>}
              </form>
            </section>
          )}

          {section === "timetable" && (
            <section className="tp-panel">
              <h3>My Timetable</h3>
              <div className="tp-table-wrap"><table className="tp-table">
                <thead><tr><th>Day</th><th>Start</th><th>End</th><th>Class</th><th>Subject</th></tr></thead>
                <tbody>{timetable.map((t, i) => (
                  <tr key={t.id || i}>
                    <td>{t.dayOfWeek || t.day_of_week || "—"}</td>
                    <td>{t.startTime || t.start_time || "—"}</td>
                    <td>{t.endTime || t.end_time || "—"}</td>
                    <td>{t.className || t.class_name || t.classId || t.class_id || "—"}</td>
                    <td>{t.subjectName || t.subject_name || t.subjectId || t.subject_id || "—"}</td>
                  </tr>
                ))}{!timetable.length && <tr><td colSpan="5" className="tp-empty">No timetable has been set up yet.</td></tr>}</tbody>
              </table></div>
            </section>
          )}
        </>
      )}
        </div>
        <footer className="sp-footer"><span>© {new Date().getFullYear()} NIA School &amp; Madrasa</span><span>Teacher Portal · Teaching Overview</span></footer>
      </main>
    </div>
  );
}
