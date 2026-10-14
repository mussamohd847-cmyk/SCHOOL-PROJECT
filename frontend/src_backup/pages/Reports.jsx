import React from "react";
import {
  Page,
  Card,
  Table,
  useData,
  fmtMoney,
} from "../components/Page";
import api from "../services/api";

const esc = (v) => String(v ?? "—").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;",
  '"': "&quot;", "'": "&#39;",
}[c]));

async function printStudentReport(row) {
  const win = window.open("", "_blank");
  if (!win) {
    window.alert("Ruhusu pop-ups ili kuchapisha ripoti.");
    return;
  }

  win.document.write("<p style='font-family:Arial;padding:20px'>Inapakia ripoti...</p>");

  try {
    const response = await api.get(`/results/student/${row.id}/report`);
    const payload = response?.data?.data ?? response?.data?.result ?? response?.data;
    const student = payload?.student ?? row;
    const results = Array.isArray(payload?.results) ? payload.results : [];

    const value = (...keys) => {
      for (const key of keys) {
        if (student[key] !== undefined && student[key] !== null) return student[key];
      }
      return "";
    };

    const name = [
      value("firstName", "first_name"),
      value("middleName", "middle_name"),
      value("lastName", "last_name"),
    ].filter(Boolean).join(" ") || "—";

    const school = results.filter(
      r => String(r.subject_category || "").toUpperCase() !== "MADRASA"
    );
    const madrasa = results.filter(
      r => String(r.subject_category || "").toUpperCase() === "MADRASA"
    );
    const sum = key => school.reduce((n, r) => n + Number(r[key] || 0), 0);
    const average = school.length
      ? (school.reduce((n, r) => n + Number(r.total || 0), 0) / school.length).toFixed(2)
      : "—";

    const schoolRows = school.map(r => `
      <tr><td>${esc(r.subject_name || r.subject_id)}</td>
      <td>${esc(r.cw)}</td><td>${esc(r.hw)}</td><td>${esc(r.ct)}</td>
      <td>${esc(r.fe)}</td><td>${esc(r.total)}</td><td>${esc(r.grade)}</td><td></td></tr>
    `).join("");

    const madrasaRows = madrasa.map(r => `
      <tr><td>${esc(r.subject_name || r.subject_id)}</td>
      <td>${esc(r.total)}</td><td>${esc(r.grade)}</td><td></td></tr>
    `).join("");

    const exams = [...new Set(results.map(r =>
      [r.exam_name, r.exam_type].filter(Boolean).join(" — ")
    ).filter(Boolean))].join(", ") || "—";

    win.document.open();
    win.document.write(`<!doctype html>
<html><head><meta charset="utf-8"><title>Student Report</title>
<style>
@page{size:A4 landscape;margin:9mm}
body{font:11px Arial,sans-serif;color:#172b4d;margin:0}
header{text-align:center;border-top:7px solid #1684c5;border-bottom:2px solid #1684c5;padding:8px}
.logo{height:65px;max-width:150px;object-fit:contain}
h1{font-size:20px;margin:4px}h2{font-size:14px;margin:10px 0 5px}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:12px 0}
.info div{border:1px solid #ccd6e0;padding:7px}
table{width:100%;border-collapse:collapse;margin:6px 0 12px}
th,td{border:1px solid #aebdca;padding:6px;text-align:center}
th{background:#eaf3f9}td:first-child,th:first-child{text-align:left}
.summary{font-weight:bold;background:#f0f5f8}
.signatures{display:grid;grid-template-columns:1fr 1fr;gap:35px;margin-top:20px}
.signature{margin-top:28px;border-top:1px solid #444;padding-top:5px}
.bottom{border-bottom:5px solid #1684c5;margin-top:20px}
@media print{button{display:none}}
</style></head><body>
<header>
<img class="logo" src="/NIA%20SCHOOLS.png" alt="NIA Schools Logo">
<h1>NIMBLE INTEGRATED ACADEMY</h1>
<div>STUDENT ACADEMIC REPORT</div>
</header>
<div class="info">
<div><b>Student:</b> ${esc(name)}</div>
<div><b>Admission No.:</b> ${esc(value("admissionNo", "admission_no"))}</div>
<div><b>Gender:</b> ${esc(value("gender"))}</div>
<div><b>School Class ID:</b> ${esc(value("school_class_id", "schoolClassId"))}</div>
<div><b>Madrasa Class ID:</b> ${esc(value("madrasa_class_id", "madrasaClassId"))}</div>
<div><b>Exam:</b> ${esc(exams)}</div>
</div>
<h2>School Results</h2>
<table><thead><tr><th>Subject</th><th>Class Work</th><th>Homework</th><th>Test</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remarks</th></tr></thead>
<tbody>${schoolRows || '<tr><td colspan="8">No school results recorded</td></tr>'}
<tr class="summary"><td>TOTAL</td><td>${sum("cw").toFixed(2)}</td><td>${sum("hw").toFixed(2)}</td><td>${sum("ct").toFixed(2)}</td><td>${sum("fe").toFixed(2)}</td><td>${sum("total").toFixed(2)}</td><td>—</td><td></td></tr>
<tr class="summary"><td colspan="5">AVERAGE</td><td>${average}</td><td>—</td><td></td></tr>
</tbody></table>
<h2>Madrasa Results</h2>
<table><thead><tr><th>Subject</th><th>Marks</th><th>Grade</th><th>Remarks</th></tr></thead>
<tbody>${madrasaRows || '<tr><td colspan="4">No Madrasa results recorded</td></tr>'}</tbody></table>
<div class="signatures">
<div>Class Teacher's Comments: __________________________<div class="signature">Class Teacher's Signature</div></div>
<div>Head Teacher's Comments: ___________________________<div class="signature">Head Teacher's Signature / School Stamp</div></div>
</div><div class="bottom"></div>
</body></html>`);
    win.document.close();
    win.focus();
    win.setTimeout(() => win.print(), 700);
  } catch (error) {
    win.close();
    window.alert(error?.response?.data?.message || "Imeshindikana kupata ripoti.");
  }
}

export default function Reports() {
  const { data: students } = useData("students");
  const { data: payments } = useData("payments");
  const { data: results } = useData("results");
  const { data: attendance } = useData("attendance");

  const collected = payments.reduce((a, x) => a + Number(x.amount || 0), 0);
  const present = attendance.filter(x => x.status === "Present").length;

  return (
    <Page
      title="Reports"
      subtitle="Printable school and madrasa reports"
      actions={<button className="primary" onClick={() => window.print()}>Print Summary</button>}
    >
      <div className="stats">
        <div className="stat teal"><span>🎓</span><div><strong>{students.length}</strong><small>Students</small></div></div>
        <div className="stat green"><span>💰</span><div><strong>{fmtMoney(collected)}</strong><small>Fees Collected</small></div></div>
        <div className="stat blue"><span>📋</span><div><strong>{present}</strong><small>Present Records</small></div></div>
        <div className="stat violet"><span>📚</span><div><strong>{results.length}</strong><small>Result Records</small></div></div>
      </div>
      <Card>
        <h2>Student Reports</h2>
        <Table
          rows={students}
          columns={[
            { key: "admissionNo", label: "Admission No." },
            { key: "firstName", label: "Student", render: r => `${r.firstName || r.first_name || ""} ${r.lastName || r.last_name || ""}`.trim() },
            { key: "gender", label: "Gender" },
            { key: "status", label: "Status" },
            {
              key: "report",
              label: "Report",
              render: r => (
                <button className="primary" type="button" onClick={() => printStudentReport(r)}>
                  Print Report
                </button>
              ),
            },
          ]}
        />
      </Card>
    </Page>
  );
}
