import React, { useEffect, useMemo, useRef, useState } from "react";
import { Page, Card, Table, useData } from "../components/Page";
import api from "../services/api";

const STUDENTS_PER_PAGE = 10;

const emptySubject = {
  code: "",
  name: "",
  description: "",
};

function getId(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function getName(item) {
  return [
    item?.firstName,
    item?.middleName,
    item?.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getClassName(item) {
  return (
    item?.name ||
    item?.className ||
    item?.class_name ||
    item?.code ||
    "—"
  );
}

export default function Madrasa() {
  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
    load: loadStudents,
  } = useData("students");

  const {
    data: subjects,
    loading: subjectsLoading,
    error: subjectsError,
    load: loadSubjects,
  } = useData("subjects");

  const {
    data: results,
    loading: resultsLoading,
    error: resultsError,
    load: loadResults,
  } = useData("results");

  const {
    data: classes,
    loading: classesLoading,
    error: classesError,
  } = useData("classes");

  const {
    data: exams,
    loading: examsLoading,
    error: examsError,
  } = useData("exams");

  const [studentPage, setStudentPage] = useState(1);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState(emptySubject);
  const [subjectSaving, setSubjectSaving] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef(null);

  const safeStudents = Array.isArray(students) ? students : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const safeResults = Array.isArray(results) ? results : [];
  const safeClasses = Array.isArray(classes) ? classes : [];
  const safeExams = Array.isArray(exams) ? exams : [];

  /*
   * Madrasa students:
   * A student can simultaneously belong to School and Madrasa.
   * We only use inMadrasa + madrasaClassId.
   */
  const madrasaStudents = useMemo(() => {
    return safeStudents.filter(
      (student) =>
        student?.inMadrasa === true ||
        student?.inMadrasa === 1 ||
        student?.in_madrasa === true ||
        student?.in_madrasa === 1
    );
  }, [safeStudents]);

  const madrasaSubjects = useMemo(() => {
    return safeSubjects.filter(
      (subject) =>
        String(subject?.category || "").toUpperCase() === "MADRASA"
    );
  }, [safeSubjects]);

  const madrasaClassIds = useMemo(() => {
    return new Set(
      safeClasses
        .filter((item) => {
          const text = [
            item?.name,
            item?.code,
            item?.level,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return (
            text.includes("madrasa") ||
            /^mad\s*[1-5]$/i.test(
              String(item?.name || item?.code || "")
            )
          );
        })
        .map((item) => getId(item.id))
        .filter(Boolean)
    );
  }, [safeClasses]);

  /*
   * Exams connected to Madrasa subjects.
   */
  const madrasaExams = useMemo(() => {
    const subjectIds = new Set(
      madrasaSubjects.map((subject) => getId(subject.id))
    );

    return safeExams.filter((exam) => {
      const examSubjectId = getId(exam?.subjectId ?? exam?.subject_id);

      return (
        subjectIds.has(examSubjectId) ||
        madrasaClassIds.has(
          getId(exam?.classId ?? exam?.class_id)
        )
      );
    });
  }, [safeExams, madrasaSubjects, madrasaClassIds]);

  /*
   * Only results belonging to Madrasa students and Madrasa subjects.
   */
  const madrasaStudentIds = useMemo(
    () => new Set(madrasaStudents.map((student) => getId(student.id))),
    [madrasaStudents]
  );

  const madrasaSubjectIds = useMemo(
    () => new Set(madrasaSubjects.map((subject) => getId(subject.id))),
    [madrasaSubjects]
  );

  const madrasaResults = useMemo(() => {
    return safeResults.filter((result) => {
      const studentId = getId(
        result?.studentId ?? result?.student_id
      );

      const subjectId = getId(
        result?.subjectId ?? result?.subject_id
      );

      return (
        madrasaStudentIds.has(studentId) &&
        madrasaSubjectIds.has(subjectId)
      );
    });
  }, [
    safeResults,
    madrasaStudentIds,
    madrasaSubjectIds,
  ]);

  const totalStudentPages = Math.max(
    1,
    Math.ceil(
      madrasaStudents.length / STUDENTS_PER_PAGE
    )
  );

  const visibleStudents = useMemo(() => {
    const start =
      (studentPage - 1) * STUDENTS_PER_PAGE;

    return madrasaStudents.slice(
      start,
      start + STUDENTS_PER_PAGE
    );
  }, [madrasaStudents, studentPage]);

  useEffect(() => {
    if (studentPage > totalStudentPages) {
      setStudentPage(totalStudentPages);
    }
  }, [studentPage, totalStudentPages]);

  const classMap = useMemo(() => {
    const map = {};

    safeClasses.forEach((item) => {
      map[getId(item.id)] = getClassName(item);
    });

    return map;
  }, [safeClasses]);

  const studentMap = useMemo(() => {
    const map = {};

    madrasaStudents.forEach((student) => {
      map[getId(student.id)] = student;
    });

    return map;
  }, [madrasaStudents]);

  const subjectMap = useMemo(() => {
    const map = {};

    madrasaSubjects.forEach((subject) => {
      map[getId(subject.id)] = subject;
    });

    return map;
  }, [madrasaSubjects]);

  const examMap = useMemo(() => {
    const map = {};

    safeExams.forEach((exam) => {
      map[getId(exam.id)] = exam;
    });

    return map;
  }, [safeExams]);

  const showSuccess = (text) => {
    setMessage(text);
    setErrorMessage("");

    window.setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  const showError = (text) => {
    setErrorMessage(text);
    setMessage("");

    window.setTimeout(() => {
      setErrorMessage("");
    }, 7000);
  };

  const handleSubjectChange = (event) => {
    const { name, value } = event.target;

    setSubjectForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddSubject = async (event) => {
    event.preventDefault();

    if (!subjectForm.code.trim()) {
      showError("Subject code is required.");
      return;
    }

    if (!subjectForm.name.trim()) {
      showError("Subject name is required.");
      return;
    }

    try {
      setSubjectSaving(true);

      await api.post("/subjects", {
        code: subjectForm.code.trim().toUpperCase(),
        name: subjectForm.name.trim(),
        category: "MADRASA",
        description:
          subjectForm.description.trim() || null,
        status: "ACTIVE",
      });

      await loadSubjects();

      setSubjectForm(emptySubject);
      setShowSubjectModal(false);

      showSuccess(
        "Madrasa subject added successfully."
      );
    } catch (error) {
      console.error(
        "ADD MADRASA SUBJECT ERROR:",
        error?.response?.data || error
      );

      showError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to add Madrasa subject."
      );
    } finally {
      setSubjectSaving(false);
    }
  };

  const openImportModal = () => {
    setSelectedExamId("");
    setSelectedSubjectId("");
    setExcelFile(null);
    setShowImportModal(true);
  };

  const closeImportModal = () => {
    if (importing) return;

    setShowImportModal(false);
    setSelectedExamId("");
    setSelectedSubjectId("");
    setExcelFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExcelFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setExcelFile(null);
      return;
    }

    const validExtension =
      /\.(xlsx|xlsm)$/i.test(file.name);

    if (!validExtension) {
      setExcelFile(null);
      showError(
        "Please select an .xlsx or .xlsm Excel file."
      );

      event.target.value = "";
      return;
    }

    setExcelFile(file);
  };

  const handleImportResults = async (event) => {
    event.preventDefault();

    if (!selectedExamId) {
      showError("Please select an exam.");
      return;
    }

    if (!selectedSubjectId) {
      showError("Please select a Madrasa subject.");
      return;
    }

    if (!excelFile) {
      showError("Please select an Excel file.");
      return;
    }

    try {
      setImporting(true);

      const formData = new FormData();

      formData.append(
        "exam_id",
        selectedExamId
      );

      formData.append(
        "subject_id",
        selectedSubjectId
      );

      formData.append(
        "file",
        excelFile
      );

      const response = await api.post(
        "/results/import-excel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const payload = response?.data || {};
      const data = payload?.data || {};

      await loadResults();

      setShowImportModal(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setExcelFile(null);

      showSuccess(
        `Import completed: ${
          data.imported_count ?? 0
        } imported, ${
          data.skipped_count ?? 0
        } skipped, ${
          data.error_count ?? 0
        } errors.`
      );
    } catch (error) {
      console.error(
        "EXCEL IMPORT ERROR:",
        error?.response?.data || error
      );

      showError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to import Excel results."
      );
    } finally {
      setImporting(false);
    }
  };

  const loading =
    studentsLoading ||
    subjectsLoading ||
    resultsLoading ||
    classesLoading ||
    examsLoading;

  const combinedError =
    studentsError ||
    subjectsError ||
    resultsError ||
    classesError ||
    examsError;

  return (
    <Page
      title="Madrasa"
      subtitle="Madrasa students, subjects and results"
      actions={
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setShowSubjectModal(true)
            }
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              background: "#1FA7B3",
              color: "#fff",
            }}
          >
            + Add Madrasa Subject
          </button>

          <button
            type="button"
            onClick={openImportModal}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              background: "#16A34A",
              color: "#fff",
            }}
          >
            Import Results Excel
          </button>
        </div>
      }
    >
      {message && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            background: "#dcfce7",
            color: "#166534",
          }}
        >
          {message}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {errorMessage}
        </div>
      )}

      {combinedError && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          Failed to load some Madrasa data.
        </div>
      )}

      {loading && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
          }}
        >
          Loading Madrasa data...
        </div>
      )}

      <div className="grid2">
        <Card>
          <h2>Madrasa Students</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div>
              <strong>
                {madrasaStudents.length}
              </strong>
              <div>Total Students</div>
            </div>

            <div>
              <strong>
                {madrasaSubjects.length}
              </strong>
              <div>Subjects</div>
            </div>

            <div>
              <strong>
                {madrasaResults.length}
              </strong>
              <div>Results</div>
            </div>
          </div>

          <Table
            rows={visibleStudents}
            columns={[
              {
                key: "admissionNo",
                label: "Admission No.",
              },
              {
                key: "name",
                label: "Name",
                render: (student) =>
                  getName(student) || "—",
              },
              {
                key: "madrasaClassId",
                label: "Madrasa Class",
                render: (student) =>
                  classMap[
                    getId(
                      student.madrasaClassId ??
                        student.madrasa_class_id
                    )
                  ] || "—",
              },
              {
                key: "schoolClassId",
                label: "School Class",
                render: (student) =>
                  classMap[
                    getId(
                      student.schoolClassId ??
                        student.school_class_id
                    )
                  ] || "—",
              },
              {
                key: "status",
                label: "Status",
                render: (student) =>
                  student.status || "—",
              },
            ]}
          />

          {madrasaStudents.length > 0 && (
            <div
              style={{
                marginTop: 18,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                disabled={studentPage === 1}
                onClick={() =>
                  setStudentPage(
                    (page) => page - 1
                  )
                }
              >
                Previous
              </button>

              <div
                style={{
                  display: "flex",
                  gap: 5,
                  flexWrap: "wrap",
                }}
              >
                {Array.from(
                  {
                    length: totalStudentPages,
                  },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setStudentPage(page)
                    }
                    style={{
                      minWidth: 36,
                      fontWeight:
                        page === studentPage
                          ? 700
                          : 400,
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={
                  studentPage ===
                  totalStudentPages
                }
                onClick={() =>
                  setStudentPage(
                    (page) => page + 1
                  )
                }
              >
                Next
              </button>
            </div>
          )}

          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              opacity: 0.7,
            }}
          >
            Showing{" "}
            {madrasaStudents.length === 0
              ? 0
              : (studentPage - 1) *
                  STUDENTS_PER_PAGE +
                1}{" "}
            -{" "}
            {Math.min(
              studentPage *
                STUDENTS_PER_PAGE,
              madrasaStudents.length
            )}{" "}
            of {madrasaStudents.length}
          </div>
        </Card>

        <Card>
          <h2>Madrasa Subjects</h2>

          <Table
            rows={madrasaSubjects}
            columns={[
              {
                key: "code",
                label: "Code",
              },
              {
                key: "name",
                label: "Subject",
              },
              {
                key: "description",
                label: "Description",
                render: (subject) =>
                  subject.description ||
                  "—",
              },
              {
                key: "status",
                label: "Status",
              },
            ]}
          />
        </Card>
      </div>

      <Card>
        <h2>Madrasa Results</h2>

        <Table
          rows={madrasaResults}
          columns={[
            {
              key: "studentId",
              label: "Student",
              render: (result) => {
                const student =
                  studentMap[
                    getId(
                      result.studentId ??
                        result.student_id
                    )
                  ];

                return student
                  ? `${student.admissionNo} - ${getName(
                      student
                    )}`
                  : "—";
              },
            },
            {
              key: "examId",
              label: "Exam",
              render: (result) => {
                const exam =
                  examMap[
                    getId(
                      result.examId ??
                        result.exam_id
                    )
                  ];

                return exam?.name || "—";
              },
            },
            {
              key: "subjectId",
              label: "Subject",
              render: (result) => {
                const subject =
                  subjectMap[
                    getId(
                      result.subjectId ??
                        result.subject_id
                    )
                  ];

                return subject?.name || "—";
              },
            },
            {
              key: "hw",
              label: "HW",
            },
            {
              key: "ct",
              label: "CT",
            },
            {
              key: "cw",
              label: "CW",
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

      {showSubjectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              width: "100%",
              maxWidth: 500,
            }}
          >
            <h2>Add Madrasa Subject</h2>

            <form onSubmit={handleAddSubject}>
              <div
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                <label>
                  Subject Code
                  <input
                    name="code"
                    value={subjectForm.code}
                    onChange={
                      handleSubjectChange
                    }
                    placeholder="e.g. FIQH"
                    required
                    style={{
                      width: "100%",
                      marginTop: 5,
                      padding: 10,
                    }}
                  />
                </label>

                <label>
                  Subject Name
                  <input
                    name="name"
                    value={subjectForm.name}
                    onChange={
                      handleSubjectChange
                    }
                    placeholder="e.g. Fiqh"
                    required
                    style={{
                      width: "100%",
                      marginTop: 5,
                      padding: 10,
                    }}
                  />
                </label>

                <label>
                  Description
                  <textarea
                    name="description"
                    value={
                      subjectForm.description
                    }
                    onChange={
                      handleSubjectChange
                    }
                    rows={3}
                    placeholder="Optional description"
                    style={{
                      width: "100%",
                      marginTop: 5,
                      padding: 10,
                    }}
                  />
                </label>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setShowSubjectModal(false)
                    }
                    disabled={subjectSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={subjectSaving}
                  >
                    {subjectSaving
                      ? "Saving..."
                      : "Save Subject"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              width: "100%",
              maxWidth: 600,
            }}
          >
            <h2>Import Madrasa Results</h2>

            <p
              style={{
                fontSize: 14,
                opacity: 0.75,
              }}
            >
              Excel columns required:
              <strong>
                {" "}
                admission_no, hw, ct, cw, fe
              </strong>
            </p>

            <form
              onSubmit={handleImportResults}
            >
              <div
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                <label>
                  Exam
                  <select
                    value={selectedExamId}
                    onChange={(event) =>
                      setSelectedExamId(
                        event.target.value
                      )
                    }
                    required
                    style={{
                      width: "100%",
                      marginTop: 5,
                      padding: 10,
                    }}
                  >
                    <option value="">
                      Select Exam
                    </option>

                    {madrasaExams.map(
                      (exam) => (
                        <option
                          key={exam.id}
                          value={exam.id}
                        >
                          {exam.name}
                          {exam.examType
                            ? ` - ${exam.examType}`
                            : ""}
                          {exam.examDate
                            ? ` - ${exam.examDate}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Madrasa Subject
                  <select
                    value={
                      selectedSubjectId
                    }
                    onChange={(event) =>
                      setSelectedSubjectId(
                        event.target.value
                      )
                    }
                    required
                    style={{
                      width: "100%",
                      marginTop: 5,
                      padding: 10,
                    }}
                  >
                    <option value="">
                      Select Subject
                    </option>

                    {madrasaSubjects.map(
                      (subject) => (
                        <option
                          key={subject.id}
                          value={subject.id}
                        >
                          {subject.code} -{" "}
                          {subject.name}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Excel File
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xlsm"
                    onChange={
                      handleExcelFile
                    }
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: 8,
                    }}
                    required
                  />
                </label>

                {excelFile && (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      background:
                        "#f3f4f6",
                      fontSize: 14,
                    }}
                  >
                    Selected file:{" "}
                    <strong>
                      {excelFile.name}
                    </strong>
                  </div>
                )}

                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: "#fefce8",
                    fontSize: 13,
                  }}
                >
                  <strong>
                    Excel format:
                  </strong>
                  <br />
                  admission_no | hw | ct | cw |
                  fe
                  <br />
                  <br />
                  Student IDs, Class IDs and
                  Subject IDs are not required.
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      closeImportModal
                    }
                    disabled={importing}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={importing}
                  >
                    {importing
                      ? "Importing..."
                      : "Import Results"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </Page>
  );
}
