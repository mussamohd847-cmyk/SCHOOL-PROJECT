import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Page, Card } from "../components/Page";

export default function TeacherClassAssignment() {
  const [tab, setTab] = useState("class");
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classAssignments, setClassAssignments] = useState([]);
  const [subjectAssignments, setSubjectAssignments] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [classId, setClassId] = useState("");
  const [streamId, setStreamId] = useState("");
  const [yearId, setYearId] = useState("");
  const [subjectTeacherId, setSubjectTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const rows = (r) => {
    const d = r?.data?.data;
    return Array.isArray(d) ? d : Array.isArray(r?.data) ? r.data : [];
  };

  const load = async () => {
    setLoading(true);
    try {
      const [t, c, s, y, ca, su, sa] = await Promise.all([
        api.get("/teachers"),
        api.get("/classes"),
        api.get("/streams"),
        api.get("/academic-years"),
        api.get("/teacher-classes"),
        api.get("/subjects"),
        api.get("/teacher-subjects"),
      ]);
      setTeachers(rows(t));
      setClasses(rows(c));
      setStreams(rows(s));
      setYears(rows(y));
      setClassAssignments(rows(ca));
      setSubjects(rows(su));
      setSubjectAssignments(rows(sa));
    } catch (e) {
      setMessage(e.response?.data?.message || "Failed to load assignment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const teacherName = (id) => {
    const t = teachers.find((x) => Number(x.id) === Number(id));
    return t?.name || t?.full_name || t?.teacher_name || `Teacher ${id ?? "-"}`;
  };

  const className = (id) => {
    const c = classes.find((x) => Number(x.id) === Number(id));
    return c?.name || `Class ${id ?? "-"}`;
  };

  const subjectName = (id) => {
    const s = subjects.find((x) => Number(x.id) === Number(id));
    return s?.name || `Subject ${id ?? "-"}`;
  };

  const submitClass = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.post("/teacher-classes", {
        teacher_id: Number(teacherId),
        class_id: Number(classId),
        stream_id: streamId ? Number(streamId) : null,
        academic_year_id: Number(yearId),
      });
      setMessage("Class assigned successfully.");
      setTeacherId("");
      setClassId("");
      setStreamId("");
      setYearId("");
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Failed to assign class.");
    } finally {
      setSaving(false);
    }
  };

  const submitSubject = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.post("/teacher-subjects", {
        teacher_id: Number(subjectTeacherId),
        subject_id: Number(subjectId),
      });
      setMessage("Subject assigned successfully.");
      setSubjectTeacherId("");
      setSubjectId("");
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Failed to assign subject.");
    } finally {
      setSaving(false);
    }
  };

  const removeClass = async (item) => {
    if (!window.confirm("Delete this class assignment?")) return;
    try {
      await api.delete(`/teacher-classes/${item.id}`);
      setMessage("Class assignment deleted.");
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Failed to delete class assignment.");
    }
  };

  const removeSubject = async (item) => {
    if (!window.confirm("Delete this subject assignment?")) return;
    try {
      await api.delete(
        `/teacher-subjects/${item.teacher_id}/${item.subject_id}`
      );
      setMessage("Subject assignment deleted.");
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Failed to delete subject assignment.");
    }
  };

  const visibleStreams = streams.filter(
    (s) => !classId || Number(s.class_id) === Number(classId)
  );

  const selectStyle = { padding: 10, width: "100%", boxSizing: "border-box" };
  const formStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: 14,
    alignItems: "end",
  };
  const tableStyle = { width: "100%", borderCollapse: "collapse" };
  const cellStyle = {
    textAlign: "left",
    padding: 10,
    borderBottom: "1px solid #ddd",
  };

  return (
    <Page title="Teacher Assignment" subtitle="Assign teachers to classes and subjects">
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <button type="button" onClick={() => setTab("class")} disabled={tab === "class"}>
          Class Assign
        </button>
        <button type="button" onClick={() => setTab("subject")} disabled={tab === "subject"}>
          Subject Assign
        </button>
      </div>

      {message && <p role="status">{message}</p>}

      {tab === "class" && (
        <>
          <Card>
            <h3>Class Assign</h3>
            <form onSubmit={submitClass} style={formStyle}>
              <label>Teacher
                <select style={selectStyle} value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
                  <option value="">Select teacher</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{teacherName(t.id)}</option>)}
                </select>
              </label>
              <label>Class
                <select style={selectStyle} value={classId} onChange={(e) => { setClassId(e.target.value); setStreamId(""); }} required>
                  <option value="">Select class</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label>Stream (Optional)
                <select style={selectStyle} value={streamId} onChange={(e) => setStreamId(e.target.value)}>
                  <option value="">Entire class / No stream</option>
                  {visibleStreams.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label>Academic Year
                <select style={selectStyle} value={yearId} onChange={(e) => setYearId(e.target.value)} required>
                  <option value="">Select academic year</option>
                  {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </label>
              <button type="submit" disabled={saving}>{saving ? "Saving..." : "Assign Class"}</button>
            </form>
          </Card>

          <Card>
            <h3>Assigned Classes</h3>
            {loading ? <p>Loading...</p> : (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead><tr>{["Teacher", "Class", "Stream", "Year", "Action"].map((x) => <th key={x} style={cellStyle}>{x}</th>)}</tr></thead>
                  <tbody>
                    {classAssignments.map((a) => (
                      <tr key={a.id}>
                        <td style={cellStyle}>{teacherName(a.teacher_id)}</td>
                        <td style={cellStyle}>{className(a.class_id)}</td>
                        <td style={cellStyle}>{a.stream_id ? streams.find((s) => Number(s.id) === Number(a.stream_id))?.name || "-" : "Entire class"}</td>
                        <td style={cellStyle}>{years.find((y) => Number(y.id) === Number(a.academic_year_id))?.name || "-"}</td>
                        <td style={cellStyle}><button type="button" onClick={() => removeClass(a)}>Delete</button></td>
                      </tr>
                    ))}
                    {!classAssignments.length && <tr><td colSpan="5" style={cellStyle}>No class assignments found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {tab === "subject" && (
        <>
          <Card>
            <h3>Subject Assign</h3>
            <form onSubmit={submitSubject} style={formStyle}>
              <label>Teacher
                <select style={selectStyle} value={subjectTeacherId} onChange={(e) => setSubjectTeacherId(e.target.value)} required>
                  <option value="">Select teacher</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{teacherName(t.id)}</option>)}
                </select>
              </label>
              <label>Subject
                <select style={selectStyle} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
                  <option value="">Select subject</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ""}</option>)}
                </select>
              </label>
              <button type="submit" disabled={saving}>{saving ? "Saving..." : "Assign Subject"}</button>
            </form>
          </Card>

          <Card>
            <h3>Assigned Subjects</h3>
            {loading ? <p>Loading...</p> : (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead><tr>{["Teacher", "Subject", "Action"].map((x) => <th key={x} style={cellStyle}>{x}</th>)}</tr></thead>
                  <tbody>
                    {subjectAssignments.map((a) => (
                      <tr key={`${a.teacher_id}-${a.subject_id}`}>
                        <td style={cellStyle}>{teacherName(a.teacher_id)}</td>
                        <td style={cellStyle}>{subjectName(a.subject_id)}</td>
                        <td style={cellStyle}><button type="button" onClick={() => removeSubject(a)}>Delete</button></td>
                      </tr>
                    ))}
                    {!subjectAssignments.length && <tr><td colSpan="3" style={cellStyle}>No subject assignments found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </Page>
  );
}
