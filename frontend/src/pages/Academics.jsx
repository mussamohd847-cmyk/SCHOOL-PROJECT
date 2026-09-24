import React, { useState } from "react";
import api from "../services/api";
import {
  Page,
  Card,
  Table,
  Modal,
  Field,
  useData,
} from "../components/Page";

export default function Academics() {
  const {
    data: exams,
    load: loadExams,
  } = useData("exams");

  const {
    data: results,
    load: loadResults,
  } = useData("results");

  const {
    data: att,
  } = useData("attendance");

  const {
    data: students,
  } = useData("students");

  const {
    data: subjects,
  } = useData("subjects");

  const [tab, setTab] = useState("exams");

  const [modal, setModal] = useState(false);

  const [exam, setExam] = useState({
    name: "",
    termId: "1",
    yearId: "1",
    section: "school",
  });

  const [result, setResult] = useState({
    studentId: "",
    subjectId: "",
    examId: "",
    hw: 0,
    ct: 0,
    cw: 0,
    fe: 0,
    total: 0,
    grade: "F",
  });

  const saveExam = async (e) => {
    e.preventDefault();

    try {
      await api.post("/exams", exam);

      setModal(false);
      loadExams();
    } catch (e) {
      alert(e.response?.data?.error || "Save failed");
    }
  };

  const saveResult = async (e) => {
    e.preventDefault();

    const total =
      Number(result.hw) * 0.1 +
      Number(result.ct) * 0.2 +
      Number(result.cw) * 0.1 +
      Number(result.fe) * 0.6;

    const grade =
      total >= 80
        ? "A"
        : total >= 65
        ? "B"
        : total >= 50
        ? "C"
        : total >= 35
        ? "D"
        : "F";

    try {
      await api.post("/results", {
        ...result,
        total,
        grade,
      });

      setModal(false);
      loadResults();
    } catch (e) {
      alert(e.response?.data?.error || "Save failed");
    }
  };

  return (
    <Page
      title="Academics"
      subtitle="Exams, results and attendance"
    >
      <div className="tabs">
        {[
          ["exams", "Exams"],
          ["results", "Results"],
          ["attendance", "Attendance"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "selected" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "exams" && (
        <Card>
          <div className="section-head">
            <h2>Exams</h2>

            <button
              className="primary"
              onClick={() => setModal(true)}
            >
              + Add Exam
            </button>
          </div>

          <Table
            rows={exams}
            columns={[
              {
                key: "name",
                label: "Exam",
              },
              {
                key: "section",
                label: "Section",
              },
              {
                key: "termId",
                label: "Term",
              },
              {
                key: "yearId",
                label: "Year",
              },
            ]}
            actions={(r) => (
              <button
                className="icon danger"
                onClick={async () => {
                  if (confirm("Delete exam?")) {
                    await api.delete(`/exams/${r.id}`);
                    loadExams();
                  }
                }}
              >
                🗑
              </button>
            )}
          />
        </Card>
      )}

      {tab === "results" && (
        <Card>
          <div className="section-head">
            <h2>Results</h2>

            <button
              className="primary"
              onClick={() => setModal(true)}
            >
              + Enter Result
            </button>
          </div>

          <Table
            rows={results}
            columns={[
              {
                key: "studentId",
                label: "Student ID",
              },
              {
                key: "subjectId",
                label: "Subject ID",
              },
              {
                key: "examId",
                label: "Exam ID",
              },
              {
                key: "hw",
                label: "HW",
              },
              {
                key: "ct",
                label: "Topic",
              },
              {
                key: "cw",
                label: "Class Work",
              },
              {
                key: "fe",
                label: "Final",
              },
              {
                key: "total",
                label: "Total",
              },
              {
                key: "grade",
                label: "Grade",
              },
            ]}
          />
        </Card>
      )}

      {tab === "attendance" && (
        <Card>
          <h2>Attendance Records</h2>

          <Table
            rows={att}
            columns={[
              {
                key: "studentId",
                label: "Student ID",
              },
              {
                key: "classId",
                label: "Class ID",
              },
              {
                key: "date",
                label: "Date",
              },
              {
                key: "status",
                label: "Status",
              },
            ]}
          />
        </Card>
      )}

      {modal && (
        <Modal
          title={
            tab === "exams"
              ? "Add Exam"
              : "Enter Result"
          }
          onClose={() => setModal(false)}
        >
          {tab === "exams" ? (
            <form
              onSubmit={saveExam}
              className="form-grid"
            >
              <Field label="Exam Name">
                <input
                  value={exam.name}
                  onChange={(e) =>
                    setExam({
                      ...exam,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </Field>

              <Field label="Section">
                <select
                  value={exam.section}
                  onChange={(e) =>
                    setExam({
                      ...exam,
                      section: e.target.value,
                    })
                  }
                >
                  <option value="school">
                    School
                  </option>

                  <option value="madrasa">
                    Madrasa
                  </option>
                </select>
              </Field>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="primary"
                  type="submit"
                >
                  Save Exam
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={saveResult}
              className="form-grid"
            >
              <Field label="Student">
                <select
                  value={result.studentId}
                  onChange={(e) =>
                    setResult({
                      ...result,
                      studentId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select
                  </option>

                  {students.map((s) => (
                    <option
                      value={s.id}
                      key={s.id}
                    >
                      {s.admissionNo} —{" "}
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Subject">
                <select
                  value={result.subjectId}
                  onChange={(e) =>
                    setResult({
                      ...result,
                      subjectId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select
                  </option>

                  {subjects
                    .filter(
                      (s) => s.section === "school"
                    )
                    .map((s) => (
                      <option
                        value={s.id}
                        key={s.id}
                      >
                        {s.name}
                      </option>
                    ))}
                </select>
              </Field>

              <Field label="Exam">
                <select
                  value={result.examId}
                  onChange={(e) =>
                    setResult({
                      ...result,
                      examId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select
                  </option>

                  {exams.map((x) => (
                    <option
                      value={x.id}
                      key={x.id}
                    >
                      {x.name}
                    </option>
                  ))}
                </select>
              </Field>

              {[
                ["hw", "Homework"],
                ["ct", "Topic Test"],
                ["cw", "Class Work"],
                ["fe", "Final Exam"],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                >
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={result[key]}
                    onChange={(e) =>
                      setResult({
                        ...result,
                        [key]: e.target.value,
                      })
                    }
                  />
                </Field>
              ))}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="primary"
                  type="submit"
                >
                  Save Result
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </Page>
  );
}