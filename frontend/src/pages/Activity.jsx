import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Page, Card, Field } from "../components/Page";

function getList(response) {
  const body = response?.data;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data?.items)) return body.data.items;
  return [];
}

export default function Activity() {
  const [accounts, setAccounts] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [personId, setPersonId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [u, s, t] = await Promise.all([
        api.get("/users"),
        api.get("/students"),
        api.get("/teachers"),
      ]);
      setAccounts(getList(u));
      setStudents(getList(s));
      setTeachers(getList(t));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load data. Please sign in as an administrator.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const people = role === "teacher" ? teachers : students;

  function personName(p) {
    const directName = p.name || p.full_name || p.fullName || p.student_name || p.teacher_name;
    if (directName && !/^ID\s*\d+$/i.test(String(directName).trim())) {
      return String(directName).trim();
    }

    const parts = [
      p.first_name || p.firstName || p.firstname,
      p.middle_name || p.middleName || p.middlename,
      p.last_name || p.lastName || p.lastname,
    ].filter(Boolean);

    const fullName = parts.join(" ").trim();
    return fullName || `Name halipo (ID ${p.id})`;
  }

  function personNumber(p) {
    return role === "teacher"
      ? (p.teacher_no || p.employee_number || "")
      : (p.admission_no || "");
  }

  async function createAccount(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!personId && ["teacher", "student"].includes(role)) {
      setError("Select mwanafunzi au mwalimu kwanza.");
      return;
    }

    setLoading(true);
    try {
      const selected = people.find(p => String(p.id) === String(personId));
      await api.post("/users", {
        username,
        password,
        role,
        name: selected ? personName(selected) : username,
        ...(role === "student" ? { student_id: Number(personId) } : {}),
        ...(role === "teacher" ? { teacher_id: Number(personId) } : {}),
      });

      setMessage("Account imetengenezwa kikamilifu.");
      setUsername("");
      setPassword("");
      setPersonId("");
      await loadData();
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || "Imeshindikana kutengeneza akaunti.");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(user) {
    const next = String(user.status).toLowerCase() === "active" ? "inactive" : "active";
    if (!window.confirm(`Unataka ${next === "active" ? "kuwezesha" : "kusimamisha"} akaunti ya ${user.username}?`)) return;

    setError("");
    setMessage("");
    try {
      await api.put(`/users/${user.id}`, { status: next });
      setMessage("Hali ya akaunti imebadilishwa.");
      await loadData();
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || "Imeshindikana kubadilisha akaunti.");
    }
  }

  async function resetPassword(user) {
    const nextPassword = window.prompt(`Ingiza password mpya kwa ${user.username} (angalau herufi 8):`);
    if (nextPassword === null) return;
    if (nextPassword.length < 8) {
      setError("Password lazima iwe na angalau herufi 8.");
      return;
    }

    setError("");
    setMessage("");
    try {
      await api.put(`/users/${user.id}`, { password: nextPassword });
      setMessage("Password imebadilishwa. Mtumiaji atatakiwa kuibadilisha anapoingia.");
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || "Imeshindikana kubadilisha password.");
    }
  }

  const filtered = accounts.filter(a =>
    `${a.name || ""} ${a.username || ""} ${a.role || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Page
      title="Account Management"
      subtitle="Tengeneza na simamia akaunti za wanafunzi na walimu"
    >
      {message && <div className="alert success" role="status">{message}</div>}
      {error && <div className="alert error" role="alert">{error}</div>}

      <Card>
        <h2>Create New Account</h2>
        <form onSubmit={createAccount} className="form-grid">
          <Field label="Account Type">
            <select value={role} onChange={e => {
              setRole(e.target.value);
              setPersonId("");
            }}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </Field>

          <Field label={role === "teacher" ? "Select Teacher" : "Select Student"}>
            <select value={personId} onChange={e => setPersonId(e.target.value)} required>
              <option value="">-- Select person --</option>
              {people.map(p => {
                const linked = role === "teacher"
                  ? (p.user_id || accounts.some(a => a.role === "teacher" && Number(a.teacher_id) === Number(p.id)))
                  : accounts.some(a => a.role === "student" && Number(a.student_id) === Number(p.id));

                return (
                  <option key={p.id} value={p.id} disabled={Boolean(linked)}>
                    {personName(p)} {personNumber(p) ? `(${personNumber(p)})` : ""}{linked ? " — Account exists" : ""}
                  </option>
                );
              })}
            </select>
          </Field>

          <Field label="Username">
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="off"
              required
              minLength={3}
              placeholder="Enter username"
            />
          </Field>

          <Field label="Temporary Password">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
          </Field>

          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
        <p>Passwords are stored as secure hashes, not plain text.</p>
      </Card>

      <Card>
        <div className="page-head">
          <h2>Existing Accounts ({filtered.length})</h2>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, username or role"
            aria-label="Search accounts"
          />
          <button type="button" onClick={loadData}>Refresh</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td>{user.name || "—"}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>{user.status}</td>
                  <td>
                    <div className="actions">
                      <button type="button" onClick={() => resetPassword(user)}>
                        Reset Password
                      </button>
                      {user.role !== "admin" && (
                        <button type="button" onClick={() => changeStatus(user)}>
                          {String(user.status).toLowerCase() === "active" ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan="5">No accounts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  );
}
