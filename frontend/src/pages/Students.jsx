import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as XLSX from "xlsx";

import api from "../services/api";

import {
  Page,
  Card,
  Modal,
  Field,
} from "../components/Page";

// ==========================================================
// TODAY
// ==========================================================

const today = new Date()
  .toISOString()
  .slice(0, 10);

// ==========================================================
// PAGINATION
// ==========================================================

const STUDENTS_PER_PAGE = 10;

// ==========================================================
// EMPTY STUDENT FORM
// ==========================================================

const blank = {
  admissionNo: "",

  firstName: "",
  middleName: "",
  lastName: "",

  gender: "Male",

  dateOfBirth: "",
  placeOfBirth: "Zanzibar",

  phone: "",
  email: "",

  address: "",

  parentName: "",
  parentPhone: "",
  parentEmail: "",

  emergencyContact: "",

  admissionDate: today,

  status: "active",

  inSchool: true,
  schoolClassId: "",
  schoolStreamId: "",

  inMadrasa: false,
  madrasaClassId: "",
  madrasaStreamId: "",
};

// ==========================================================
// NORMALIZE EXCEL HEADER
// ==========================================================

const normalizeHeader = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
};

// ==========================================================
// EXCEL DATE
// ==========================================================

const excelDateToISO = (value) => {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    const year = value.getFullYear();

    const month = String(
      value.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      value.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  if (typeof value === "number") {
    const parsed =
      XLSX.SSF.parse_date_code(value);

    if (parsed) {
      const month = String(
        parsed.m
      ).padStart(2, "0");

      const day = String(
        parsed.d
      ).padStart(2, "0");

      return `${parsed.y}-${month}-${day}`;
    }
  }

  const text =
    String(value).trim();

  if (!text) {
    return "";
  }

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(text)
  ) {
    return text;
  }

  const date = new Date(text);

  if (!Number.isNaN(date.getTime())) {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return "";
};

// ==========================================================
// NORMALIZE GENDER
// ==========================================================

const normalizeGender = (value) => {
  const gender =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    gender === "female" ||
    gender === "f"
  ) {
    return "Female";
  }

  return "Male";
};

// ==========================================================
// NORMALIZE STATUS
// ==========================================================

const normalizeStatus = (value) => {
  const status =
    String(value || "")
      .trim()
      .toLowerCase();

  const allowed = [
    "active",
    "inactive",
    "graduated",
    "transferred",
    "suspended",
  ];

  if (allowed.includes(status)) {
    return status;
  }

  return "active";
};

// ==========================================================
// FIND CLASS
// ==========================================================

const findClassId = (
  classes,
  value,
  section
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const search =
    String(value)
      .trim()
      .toLowerCase();

  const item =
    classes.find((row) => {
      if (
        String(row.section || "")
          .toLowerCase() !==
        section
      ) {
        return false;
      }

      return (
        String(row.name || "")
          .trim()
          .toLowerCase() ===
        search
      );
    });

  return item
    ? Number(item.id)
    : null;
};

// ==========================================================
// FIND STREAM
// ==========================================================

const findStreamId = (
  streams,
  value,
  classId
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (!classId) {
    return null;
  }

  const search =
    String(value)
      .trim()
      .toLowerCase();

  const item =
    streams.find((row) => {
      if (
        Number(row.class_id) !==
        Number(classId)
      ) {
        return false;
      }

      return (
        String(row.name || "")
          .trim()
          .toLowerCase() ===
        search
      );
    });

  return item
    ? Number(item.id)
    : null;
};

// ==========================================================
// COMPONENT
// ==========================================================

export default function Students() {
  // ========================================================
  // STATES
  // ========================================================

  const [students, setStudents] =
    useState([]);

  const [classes, setClasses] =
    useState([]);

  const [streams, setStreams] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // ========================================================
  // COLUMN FILTERS
  // ========================================================

  const [columnFilters, setColumnFilters] =
    useState({
      admissionNo: "",
      name: "",
      gender: "",
      dateOfBirth: "",
      school: "",
      madrasa: "",
      status: "",
    });

  // ========================================================
  // SORTING
  // ========================================================

  const [sortConfig, setSortConfig] =
    useState({
      key: "admissionNo",
      direction: "asc",
    });

  // ========================================================
  // PAGINATION
  // ========================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  // ========================================================
  // MODAL STATES
  // ========================================================

  const [modal, setModal] =
    useState(false);

  const [edit, setEdit] =
    useState(null);

  const [form, setForm] =
    useState(blank);

  // ========================================================
  // EXCEL STATES
  // ========================================================

  const [excelModal, setExcelModal] =
    useState(false);

  const [excelFile, setExcelFile] =
    useState(null);

  const [excelRows, setExcelRows] =
    useState([]);

  const [excelLoading, setExcelLoading] =
    useState(false);

  const [importing, setImporting] =
    useState(false);

  const [importResult, setImportResult] =
    useState(null);

  const fileInputRef =
    useRef(null);

  // ========================================================
  // LOAD STUDENTS
  // ========================================================

  const loadStudents = async () => {
    setLoading(true);

    try {
      const response =
        await api.get("/students");

      const payload =
        response.data?.data;

      if (Array.isArray(payload)) {
        setStudents(payload);
      } else if (
        Array.isArray(response.data)
      ) {
        setStudents(
          response.data
        );
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error(
        "STUDENTS LOAD ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Could not load students."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // LOAD CLASSES + STREAMS
  // ========================================================

  const loadMeta = async () => {
    try {
      const response =
        await api.get(
          "/students/meta"
        );

      const data =
        response.data?.data || {};

      setClasses(
        Array.isArray(data.classes)
          ? data.classes
          : []
      );

      setStreams(
        Array.isArray(data.streams)
          ? data.streams
          : []
      );
    } catch (error) {
      console.error(
        "STUDENT META ERROR:",
        error
      );
    }
  };

  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {
    loadStudents();
    loadMeta();
  }, []);

  // ========================================================
  // SCHOOL CLASSES
  // ========================================================

  const schoolClasses =
    useMemo(
      () =>
        classes.filter(
          (item) =>
            String(
              item.section || ""
            ).toLowerCase() ===
            "school"
        ),
      [classes]
    );

  // ========================================================
  // MADRASA CLASSES
  // ========================================================

  const madrasaClasses =
    useMemo(
      () =>
        classes.filter(
          (item) =>
            String(
              item.section || ""
            ).toLowerCase() ===
            "madrasa"
        ),
      [classes]
    );

  // ========================================================
  // SCHOOL STREAMS
  // ========================================================

  const schoolStreams =
    useMemo(() => {
      if (!form.schoolClassId) {
        return [];
      }

      return streams.filter(
        (item) =>
          Number(item.class_id) ===
          Number(form.schoolClassId)
      );
    }, [
      streams,
      form.schoolClassId,
    ]);

  // ========================================================
  // MADRASA STREAMS
  // ========================================================

  const madrasaStreams =
    useMemo(() => {
      if (!form.madrasaClassId) {
        return [];
      }

      return streams.filter(
        (item) =>
          Number(item.class_id) ===
          Number(form.madrasaClassId)
      );
    }, [
      streams,
      form.madrasaClassId,
    ]);

  // ========================================================
  // CLASS NAME
  // ========================================================

  const className = (id) => {
    const item =
      classes.find(
        (row) =>
          Number(row.id) ===
          Number(id)
      );

    return item?.name || "—";
  };

  // ========================================================
  // STREAM NAME
  // ========================================================

  const streamName = (id) => {
    const item =
      streams.find(
        (row) =>
          Number(row.id) ===
          Number(id)
      );

    return item?.name || "—";
  };

  // ========================================================
  // STUDENT FULL NAME
  // ========================================================

  const getStudentName = (
    student
  ) => {
    return `${student.firstName || ""} ${
      student.middleName || ""
    } ${
      student.lastName || ""
    }`
      .replace(/\s+/g, " ")
      .trim();
  };

  // ========================================================
  // SCHOOL DISPLAY
  // ========================================================

  const getSchoolDisplay = (
    student
  ) => {
    if (!student.inSchool) {
      return "No";
    }

    const classText =
      className(
        student.schoolClassId
      );

    const streamText =
      student.schoolStreamId
        ? ` - ${streamName(
            student.schoolStreamId
          )}`
        : "";

    return `${classText}${streamText}`;
  };

  // ========================================================
  // MADRASA DISPLAY
  // ========================================================

  const getMadrasaDisplay = (
    student
  ) => {
    if (!student.inMadrasa) {
      return "No";
    }

    const classText =
      className(
        student.madrasaClassId
      );

    const streamText =
      student.madrasaStreamId
        ? ` - ${streamName(
            student.madrasaStreamId
          )}`
        : "";

    return `${classText}${streamText}`;
  };

  // ========================================================
  // UPDATE COLUMN FILTER
  // ========================================================

  const updateColumnFilter = (
    key,
    value
  ) => {
    setColumnFilters(
      (previous) => ({
        ...previous,
        [key]: value,
      })
    );

    setCurrentPage(1);
  };

  // ========================================================
  // CLEAR ALL FILTERS
  // ========================================================

  const clearFilters = () => {
    setColumnFilters({
      admissionNo: "",
      name: "",
      gender: "",
      dateOfBirth: "",
      school: "",
      madrasa: "",
      status: "",
    });

    setCurrentPage(1);
  };

  // ========================================================
  // CHECK FILTER ACTIVE
  // ========================================================

  const hasFilters =
    Object.values(
      columnFilters
    ).some(
      (value) =>
        String(value).trim() !== ""
    );

  // ========================================================
  // FILTER STUDENTS
  // ========================================================

  const filteredRows =
    useMemo(() => {
      return students.filter(
        (student) => {
          const admissionNo =
            String(
              student.admissionNo ||
              ""
            ).toLowerCase();

          const name =
            getStudentName(
              student
            ).toLowerCase();

          const gender =
            String(
              student.gender || ""
            ).toLowerCase();

          const dateOfBirth =
            String(
              student.dateOfBirth ||
              ""
            ).toLowerCase();

          const school =
            getSchoolDisplay(
              student
            ).toLowerCase();

          const madrasa =
            getMadrasaDisplay(
              student
            ).toLowerCase();

          const status =
            String(
              student.status || ""
            ).toLowerCase();

          return (
            admissionNo.includes(
              columnFilters.admissionNo
                .trim()
                .toLowerCase()
            ) &&
            name.includes(
              columnFilters.name
                .trim()
                .toLowerCase()
            ) &&
            gender.includes(
              columnFilters.gender
                .trim()
                .toLowerCase()
            ) &&
            dateOfBirth.includes(
              columnFilters.dateOfBirth
                .trim()
                .toLowerCase()
            ) &&
            school.includes(
              columnFilters.school
                .trim()
                .toLowerCase()
            ) &&
            madrasa.includes(
              columnFilters.madrasa
                .trim()
                .toLowerCase()
            ) &&
            status.includes(
              columnFilters.status
                .trim()
                .toLowerCase()
            )
          );
        }
      );
    }, [
      students,
      columnFilters,
      classes,
      streams,
    ]);

  // ========================================================
  // SORT STUDENTS
  // ========================================================

  const sortedRows =
    useMemo(() => {
      const rows = [
        ...filteredRows,
      ];

      rows.sort(
        (a, b) => {
          let first = "";
          let second = "";

          switch (
            sortConfig.key
          ) {
            case "admissionNo":
              first =
                a.admissionNo || "";
              second =
                b.admissionNo || "";
              break;

            case "name":
              first =
                getStudentName(
                  a
                );
              second =
                getStudentName(
                  b
                );
              break;

            case "gender":
              first =
                a.gender || "";
              second =
                b.gender || "";
              break;

            case "dateOfBirth":
              first =
                a.dateOfBirth || "";
              second =
                b.dateOfBirth || "";
              break;

            case "school":
              first =
                getSchoolDisplay(
                  a
                );
              second =
                getSchoolDisplay(
                  b
                );
              break;

            case "madrasa":
              first =
                getMadrasaDisplay(
                  a
                );
              second =
                getMadrasaDisplay(
                  b
                );
              break;

            case "status":
              first =
                a.status || "";
              second =
                b.status || "";
              break;

            default:
              first = "";
              second = "";
          }

          const firstValue =
            String(first)
              .toLowerCase()
              .trim();

          const secondValue =
            String(second)
              .toLowerCase()
              .trim();

          if (
            firstValue <
            secondValue
          ) {
            return sortConfig.direction ===
              "asc"
              ? -1
              : 1;
          }

          if (
            firstValue >
            secondValue
          ) {
            return sortConfig.direction ===
              "asc"
              ? 1
              : -1;
          }

          return 0;
        }
      );

      return rows;
    }, [
      filteredRows,
      sortConfig,
      classes,
      streams,
    ]);

  // ========================================================
  // SORT HANDLER
  // ========================================================

  const handleSort = (
    key
  ) => {
    setSortConfig(
      (previous) => {
        if (
          previous.key === key
        ) {
          return {
            key,
            direction:
              previous.direction ===
              "asc"
                ? "desc"
                : "asc",
          };
        }

        return {
          key,
          direction: "asc",
        };
      }
    );

    setCurrentPage(1);
  };

  // ========================================================
  // SORT ICON
  // ========================================================

  const sortIcon = (key) => {
    if (
      sortConfig.key !== key
    ) {
      return (
        <span
          style={{
            opacity: 0.35,
            marginLeft: "5px",
          }}
        >
          ↕
        </span>
      );
    }

    return (
      <span
        style={{
          marginLeft: "5px",
          fontWeight: 800,
        }}
      >
        {sortConfig.direction ===
        "asc"
          ? "▲"
          : "▼"}
      </span>
    );
  };

  // ========================================================
  // TOTAL PAGES
  // ========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        sortedRows.length /
          STUDENTS_PER_PAGE
      )
    );

  // ========================================================
  // KEEP PAGE VALID
  // ========================================================

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // ========================================================
  // PAGINATED ROWS
  // ========================================================

  const paginatedRows =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        STUDENTS_PER_PAGE;

      const end =
        start +
        STUDENTS_PER_PAGE;

      return sortedRows.slice(
        start,
        end
      );
    }, [
      sortedRows,
      currentPage,
    ]);

  // ========================================================
  // DISPLAY RANGE
  // ========================================================

  const displayStart =
    sortedRows.length === 0
      ? 0
      : (currentPage - 1) *
          STUDENTS_PER_PAGE +
        1;

  const displayEnd =
    Math.min(
      currentPage *
        STUDENTS_PER_PAGE,
      sortedRows.length
    );

  // ========================================================
  // PAGE NUMBERS
  // ========================================================

  const pageNumbers =
    useMemo(() => {
      const pages = [];

      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        pages.push(page);
      }

      return pages;
    }, [totalPages]);

  // ========================================================
  // OPEN ADD
  // ========================================================

  const openAdd = () => {
    setForm({
      ...blank,
      admissionDate: today,
    });

    setEdit(null);
    setModal(true);
  };

  // ========================================================
  // OPEN EDIT
  // ========================================================

  const openEdit = (
    student
  ) => {
    setForm({
      admissionNo:
        student.admissionNo || "",

      firstName:
        student.firstName || "",

      middleName:
        student.middleName || "",

      lastName:
        student.lastName || "",

      gender:
        student.gender || "Male",

      dateOfBirth:
        student.dateOfBirth || "",

      placeOfBirth:
        student.placeOfBirth ||
        "",

      phone:
        student.phone || "",

      email:
        student.email || "",

      address:
        student.address || "",

      parentName:
        student.parentName || "",

      parentPhone:
        student.parentPhone ||
        "",

      parentEmail:
        student.parentEmail ||
        "",

      emergencyContact:
        student.emergencyContact ||
        "",

      admissionDate:
        student.admissionDate ||
        today,

      status:
        student.status ||
        "active",

      inSchool:
        Boolean(
          student.inSchool
        ),

      schoolClassId:
        student.schoolClassId ||
        "",

      schoolStreamId:
        student.schoolStreamId ||
        "",

      inMadrasa:
        Boolean(
          student.inMadrasa
        ),

      madrasaClassId:
        student.madrasaClassId ||
        "",

      madrasaStreamId:
        student.madrasaStreamId ||
        "",
    });

    setEdit(student);
    setModal(true);
  };

  // ========================================================
  // SAVE STUDENT
  // ========================================================

  const save = async (
    event
  ) => {
    event.preventDefault();

    if (
      !form.admissionNo.trim()
    ) {
      alert(
        "Admission number is required."
      );
      return;
    }

    if (
      !form.firstName.trim()
    ) {
      alert(
        "First name is required."
      );
      return;
    }

    if (
      !form.lastName.trim()
    ) {
      alert(
        "Last name is required."
      );
      return;
    }

    if (!form.admissionDate) {
      alert(
        "Admission date is required."
      );
      return;
    }

    const payload = {
      admissionNo:
        form.admissionNo.trim(),

      firstName:
        form.firstName.trim(),

      middleName:
        form.middleName.trim() ||
        null,

      lastName:
        form.lastName.trim(),

      gender:
        form.gender,

      dateOfBirth:
        form.dateOfBirth ||
        null,

      placeOfBirth:
        form.placeOfBirth.trim() ||
        null,

      phone:
        form.phone.trim() ||
        null,

      email:
        form.email.trim() ||
        null,

      address:
        form.address.trim() ||
        null,

      parentName:
        form.parentName.trim() ||
        null,

      parentPhone:
        form.parentPhone.trim() ||
        null,

      parentEmail:
        form.parentEmail.trim() ||
        null,

      emergencyContact:
        form.emergencyContact.trim() ||
        null,

      admissionDate:
        form.admissionDate,

      status:
        form.status,

      inSchool:
        Boolean(
          form.inSchool
        ),

      schoolClassId:
        form.schoolClassId
          ? Number(
              form.schoolClassId
            )
          : null,

      schoolStreamId:
        form.schoolStreamId
          ? Number(
              form.schoolStreamId
            )
          : null,

      inMadrasa:
        Boolean(
          form.inMadrasa
        ),

      madrasaClassId:
        form.madrasaClassId
          ? Number(
              form.madrasaClassId
            )
          : null,

      madrasaStreamId:
        form.madrasaStreamId
          ? Number(
              form.madrasaStreamId
            )
          : null,
    };

    setSaving(true);

    try {
      if (edit) {
        await api.put(
          `/students/${edit.id}`,
          payload
        );
      } else {
        await api.post(
          "/students",
          payload
        );
      }

      setModal(false);
      setEdit(null);

      setForm({
        ...blank,
        admissionDate: today,
      });

      await loadStudents();
    } catch (error) {
      console.error(
        "STUDENT SAVE ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Could not save student."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================================
  // DELETE STUDENT
  // ========================================================

  const deleteStudent =
    async (id) => {
      const confirmed =
        window.confirm(
          "Delete this student? This action cannot be undone."
        );

      if (!confirmed) {
        return;
      }

      try {
        await api.delete(
          `/students/${id}`
        );

        await loadStudents();
      } catch (error) {
        console.error(
          "STUDENT DELETE ERROR:",
          error
        );

        alert(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Could not delete student."
        );
      }
    };

  // ========================================================
  // OPEN EXCEL MODAL
  // ========================================================

  const openExcelImport = () => {
    setExcelFile(null);
    setExcelRows([]);
    setImportResult(null);
    setExcelModal(true);
  };

  // ========================================================
  // CLOSE EXCEL MODAL
  // ========================================================

  const closeExcelImport = () => {
    if (importing) {
      return;
    }

    setExcelModal(false);
    setExcelFile(null);
    setExcelRows([]);
    setImportResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  // ========================================================
  // READ EXCEL
  // ========================================================

  const handleExcelFile =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase();

      if (
        !["xlsx", "xls"].includes(
          extension
        )
      ) {
        alert(
          "Please select an Excel file (.xlsx or .xls)."
        );

        event.target.value = "";
        return;
      }

      setExcelFile(file);
      setExcelLoading(true);
      setExcelRows([]);
      setImportResult(null);

      try {
        const buffer =
          await file.arrayBuffer();

        const workbook =
          XLSX.read(buffer, {
            type: "array",
            cellDates: true,
          });

        const firstSheet =
          workbook.Sheets[
            workbook.SheetNames[0]
          ];

        if (!firstSheet) {
          throw new Error(
            "The Excel file does not contain a worksheet."
          );
        }

        const rawRows =
          XLSX.utils.sheet_to_json(
            firstSheet,
            {
              defval: "",
              raw: true,
            }
          );

        if (!rawRows.length) {
          throw new Error(
            "The Excel file is empty."
          );
        }

        const converted =
          rawRows.map(
            (row, index) => {
              const normalized = {};

              Object.keys(row).forEach(
                (key) => {
                  normalized[
                    normalizeHeader(key)
                  ] = row[key];
                }
              );

              return {
                rowNumber:
                  index + 2,

                admissionNo:
                  String(
                    normalized.admissionno ||
                      ""
                  ).trim(),

                firstName:
                  String(
                    normalized.firstname ||
                      ""
                  ).trim(),

                middleName:
                  String(
                    normalized.middlename ||
                      ""
                  ).trim(),

                lastName:
                  String(
                    normalized.lastname ||
                      ""
                  ).trim(),

                gender:
                  normalizeGender(
                    normalized.gender
                  ),

                dateOfBirth:
                  excelDateToISO(
                    normalized.dateofbirth
                  ),

                placeOfBirth:
                  String(
                    normalized.placeofbirth ||
                      ""
                  ).trim(),

                phone:
                  String(
                    normalized.phone ||
                      ""
                  ).trim(),

                email:
                  String(
                    normalized.email ||
                      ""
                  ).trim(),

                address:
                  String(
                    normalized.address ||
                      ""
                  ).trim(),

                parentName:
                  String(
                    normalized.parentname ||
                      ""
                  ).trim(),

                parentPhone:
                  String(
                    normalized.parentphone ||
                      ""
                  ).trim(),

                parentEmail:
                  String(
                    normalized.parentemail ||
                      ""
                  ).trim(),

                emergencyContact:
                  String(
                    normalized.emergencycontact ||
                      ""
                  ).trim(),

                admissionDate:
                  excelDateToISO(
                    normalized.admissiondate
                  ) || today,

                status:
                  normalizeStatus(
                    normalized.status
                  ),

                schoolClass:
                  String(
                    normalized.schoolclass ||
                      ""
                  ).trim(),

                schoolStream:
                  String(
                    normalized.schoolstream ||
                      ""
                  ).trim(),

                madrasaClass:
                  String(
                    normalized.madrasaclass ||
                      ""
                  ).trim(),

                madrasaStream:
                  String(
                    normalized.madrasastream ||
                      ""
                  ).trim(),
              };
            }
          );

        setExcelRows(
          converted
        );
      } catch (error) {
        console.error(
          "EXCEL READ ERROR:",
          error
        );

        alert(
          error.message ||
          "Could not read Excel file."
        );

        setExcelFile(null);
      } finally {
        setExcelLoading(false);
      }
    };

  // ========================================================
  // IMPORT EXCEL
  // ========================================================

  const importExcel =
    async () => {
      if (!excelRows.length) {
        alert(
          "Please select an Excel file first."
        );
        return;
      }

      setImporting(true);

      let imported = 0;
      let skipped = 0;
      let failed = 0;

      const errors = [];

      const existingAdmissions =
        new Set(
          students
            .map(
              (student) =>
                String(
                  student.admissionNo ||
                    ""
                )
                  .trim()
                  .toLowerCase()
            )
            .filter(Boolean)
        );

      const excelAdmissions =
        new Set();

      for (
        const row of excelRows
      ) {
        try {
          const admissionNo =
            row.admissionNo.trim();

          if (!admissionNo) {
            skipped++;

            errors.push(
              `Row ${row.rowNumber}: Admission No. is missing.`
            );

            continue;
          }

          if (!row.firstName) {
            skipped++;

            errors.push(
              `Row ${row.rowNumber}: First Name is missing.`
            );

            continue;
          }

          if (!row.lastName) {
            skipped++;

            errors.push(
              `Row ${row.rowNumber}: Last Name is missing.`
            );

            continue;
          }

          const admissionKey =
            admissionNo.toLowerCase();

          if (
            existingAdmissions.has(
              admissionKey
            )
          ) {
            skipped++;

            errors.push(
              `Row ${row.rowNumber}: ${admissionNo} already exists.`
            );

            continue;
          }

          if (
            excelAdmissions.has(
              admissionKey
            )
          ) {
            skipped++;

            errors.push(
              `Row ${row.rowNumber}: Duplicate Admission No. ${admissionNo} in Excel file.`
            );

            continue;
          }

          excelAdmissions.add(
            admissionKey
          );

          let schoolClassId =
            null;

          let schoolStreamId =
            null;

          let inSchool = false;

          if (row.schoolClass) {
            schoolClassId =
              findClassId(
                classes,
                row.schoolClass,
                "school"
              );

            if (!schoolClassId) {
              skipped++;

              errors.push(
                `Row ${row.rowNumber}: School class "${row.schoolClass}" was not found.`
              );

              continue;
            }

            inSchool = true;

            if (row.schoolStream) {
              schoolStreamId =
                findStreamId(
                  streams,
                  row.schoolStream,
                  schoolClassId
                );

              if (!schoolStreamId) {
                skipped++;

                errors.push(
                  `Row ${row.rowNumber}: School stream "${row.schoolStream}" was not found for class "${row.schoolClass}".`
                );

                continue;
              }
            }
          }

          let madrasaClassId =
            null;

          let madrasaStreamId =
            null;

          let inMadrasa = false;

          if (row.madrasaClass) {
            madrasaClassId =
              findClassId(
                classes,
                row.madrasaClass,
                "madrasa"
              );

            if (!madrasaClassId) {
              skipped++;

              errors.push(
                `Row ${row.rowNumber}: Madrasa class "${row.madrasaClass}" was not found.`
              );

              continue;
            }

            inMadrasa = true;

            if (row.madrasaStream) {
              madrasaStreamId =
                findStreamId(
                  streams,
                  row.madrasaStream,
                  madrasaClassId
                );

              if (!madrasaStreamId) {
                skipped++;

                errors.push(
                  `Row ${row.rowNumber}: Madrasa stream "${row.madrasaStream}" was not found for class "${row.madrasaClass}".`
                );

                continue;
              }
            }
          }

          const payload = {
            admissionNo,

            firstName:
              row.firstName,

            middleName:
              row.middleName ||
              null,

            lastName:
              row.lastName,

            gender:
              row.gender,

            dateOfBirth:
              row.dateOfBirth ||
              null,

            placeOfBirth:
              row.placeOfBirth ||
              null,

            phone:
              row.phone ||
              null,

            email:
              row.email ||
              null,

            address:
              row.address ||
              null,

            parentName:
              row.parentName ||
              null,

            parentPhone:
              row.parentPhone ||
              null,

            parentEmail:
              row.parentEmail ||
              null,

            emergencyContact:
              row.emergencyContact ||
              null,

            admissionDate:
              row.admissionDate ||
              today,

            status:
              row.status ||
              "active",

            inSchool,

            schoolClassId,

            schoolStreamId,

            inMadrasa,

            madrasaClassId,

            madrasaStreamId,
          };

          await api.post(
            "/students",
            payload
          );

          imported++;

          existingAdmissions.add(
            admissionKey
          );
        } catch (error) {
          failed++;

          const message =
            error.response?.data
              ?.message ||
            error.response?.data?.error ||
            error.message ||
            "Unknown error";

          errors.push(
            `Row ${row.rowNumber}: ${message}`
          );
        }
      }

      setImportResult({
        imported,
        skipped,
        failed,
        errors,
      });

      await loadStudents();

      setImporting(false);
    };

  // ========================================================
  // DOWNLOAD EXCEL TEMPLATE
  // ========================================================

  const downloadTemplate =
    () => {
      const template = [
        {
          "Admission No.":
            "ADM001",

          "First Name":
            "Ali",

          "Middle Name":
            "Hassan",

          "Last Name":
            "Omar",

          Gender:
            "Male",

          "Date of Birth":
            "2015-02-10",

          "Place of Birth":
            "Zanzibar",

          Phone:
            "0777000000",

          Email:
            "ali@example.com",

          Address:
            "Zanzibar",

          "Parent Name":
            "Hassan Omar",

          "Parent Phone":
            "0777111111",

          "Parent Email":
            "parent@example.com",

          "Emergency Contact":
            "0777222222",

          "Admission Date":
            today,

          Status:
            "active",

          "School Class":
            "GRADE 1",

          "School Stream":
            "A",

          "Madrasa Class":
            "",

          "Madrasa Stream":
            "",
        },

        {
          "Admission No.":
            "ADM002",

          "First Name":
            "Asha",

          "Middle Name":
            "Mohamed",

          "Last Name":
            "Said",

          Gender:
            "Female",

          "Date of Birth":
            "2014-08-21",

          "Place of Birth":
            "Zanzibar",

          Phone:
            "0777333333",

          Email:
            "",

          Address:
            "Zanzibar",

          "Parent Name":
            "Mohamed Said",

          "Parent Phone":
            "0777444444",

          "Parent Email":
            "",

          "Emergency Contact":
            "0777555555",

          "Admission Date":
            today,

          Status:
            "active",

          "School Class":
            "GRADE 2",

          "School Stream":
            "A",

          "Madrasa Class":
            "",

          "Madrasa Stream":
            "",
        },
      ];

      const worksheet =
        XLSX.utils.json_to_sheet(
          template
        );

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Students"
      );

      XLSX.writeFile(
        workbook,
        "NIA_Students_Import_Template.xlsx"
      );
    };

  // ========================================================
  // TABLE HEADER STYLE
  // ========================================================

  const headerStyle = {
    padding: "12px",
    textAlign: "left",
    whiteSpace: "nowrap",
    fontWeight: "700",
    background:
      "rgba(37, 99, 235, 0.06)",
    borderBottom:
      "1px solid rgba(0,0,0,0.10)",
  };

  // ========================================================
  // FILTER INPUT STYLE
  // ========================================================

  const filterInputStyle = {
    width: "100%",
    minWidth: "120px",
    marginTop: "8px",
    padding: "8px 10px",
    border:
      "1px solid rgba(0,0,0,0.15)",
    borderRadius: "7px",
    outline: "none",
    fontSize: "12px",
    boxSizing: "border-box",
    background: "#fff",
  };

  // ========================================================
  // STATUS BADGE STYLE
  // ========================================================

  const getStatusStyle = (
    status
  ) => {
    const value =
      String(
        status || ""
      ).toLowerCase();

    if (value === "active") {
      return {
        background:
          "rgba(22,163,74,0.12)",
        color: "#15803D",
        border:
          "1px solid rgba(22,163,74,0.25)",
      };
    }

    if (value === "inactive") {
      return {
        background:
          "rgba(107,114,128,0.12)",
        color: "#4B5563",
        border:
          "1px solid rgba(107,114,128,0.25)",
      };
    }

    if (value === "graduated") {
      return {
        background:
          "rgba(37,99,235,0.12)",
        color: "#1D4ED8",
        border:
          "1px solid rgba(37,99,235,0.25)",
      };
    }

    if (value === "transferred") {
      return {
        background:
          "rgba(245,158,11,0.14)",
        color: "#B45309",
        border:
          "1px solid rgba(245,158,11,0.25)",
      };
    }

    if (value === "suspended") {
      return {
        background:
          "rgba(231,76,60,0.12)",
        color: "#DC2626",
        border:
          "1px solid rgba(231,76,60,0.25)",
      };
    }

    return {
      background:
        "rgba(0,0,0,0.06)",
      color: "#444",
      border:
        "1px solid rgba(0,0,0,0.10)",
    };
  };

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <Page
      title="Students"
      subtitle="Central student records for School and Madrasa"
      actions={
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={
              openExcelImport
            }
          >
            📥 Import Excel
          </button>

          <button
            className="primary"
            type="button"
            onClick={openAdd}
          >
            + Add Student
          </button>
        </div>
      }
    >
      <Card>
        {/* ==================================================
            FILTER SUMMARY
        ================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: "12px",
            flexWrap:
              "wrap",
            marginBottom:
              "16px",
          }}
        >
          <div>
            <strong
              style={{
                fontSize:
                  "17px",
              }}
            >
              Student Records
            </strong>

            <div
              style={{
                fontSize:
                  "13px",
                opacity:
                  0.65,
                marginTop:
                  "3px",
              }}
            >
              Search and filter directly
              from each column.
            </div>
          </div>

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "10px",
              flexWrap:
                "wrap",
            }}
          >
            <span
              style={{
                fontSize:
                  "13px",
                fontWeight:
                  "600",
              }}
            >
              Showing{" "}
              {sortedRows.length}{" "}
              of{" "}
              {students.length}{" "}
              students
            </span>

            {hasFilters && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ==================================================
            TABLE
        ================================================== */}

        {loading ? (
          <div
            className="loading"
            style={{
              padding:
                "40px",
              textAlign:
                "center",
            }}
          >
            Loading students...
          </div>
        ) : (
          <div
            style={{
              width:
                "100%",
              overflowX:
                "auto",
            }}
          >
            <table
              style={{
                width:
                  "100%",
                minWidth:
                  "1150px",
                borderCollapse:
                  "collapse",
              }}
            >
              {/* ==================================================
                  TABLE HEAD
              ================================================== */}

              <thead>
                <tr>
                  {/* ADMISSION */}

                  <th
                    style={
                      headerStyle
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSort(
                          "admissionNo"
                        )
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        padding:
                          "0",
                        cursor:
                          "pointer",
                        fontWeight:
                          "700",
                        fontSize:
                          "13px",
                      }}
                    >
                      Admission No.
                      {sortIcon(
                        "admissionNo"
                      )}
                    </button>

                    <div>
                      <input
                        type="text"
                        placeholder="🔍 Search..."
                        value={
                          columnFilters.admissionNo
                        }
                        onChange={(
                          event
                        ) =>
                          updateColumnFilter(
                            "admissionNo",
                            event
                              .target
                              .value
                          )
                        }
                        style={
                          filterInputStyle
                        }
                      />
                    </div>
                  </th>

                  {/* NAME */}

                  <th
                    style={
                      headerStyle
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSort(
                          "name"
                        )
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        padding:
                          "0",
                        cursor:
                          "pointer",
                        fontWeight:
                          "700",
                        fontSize:
                          "13px",
                      }}
                    >
                      Student Name
                      {sortIcon(
                        "name"
                      )}
                    </button>

                    <div>
                      <input
                        type="text"
                        placeholder="🔍 Search..."
                        value={
                          columnFilters.name
                        }
                        onChange={(
                          event
                        ) =>
                          updateColumnFilter(
                            "name",
                            event
                              .target
                              .value
                          )
                        }
                        style={
                          filterInputStyle
                        }
                      />
                    </div>
                  </th>

                  {/* GENDER */}

                  <th
                    style={
                      headerStyle
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSort(
                          "gender"
                        )
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        padding:
                          "0",
                        cursor:
                          "pointer",
                        fontWeight:
                          "700",
                        fontSize:
                          "13px",
                      }}
                    >
                      Gender
                      {sortIcon(
                        "gender"
                      )}
                    </button>

                    <div>
                      <input
                        type="text"
                        placeholder="🔍 Search..."
                        value={
                          columnFilters.gender
                        }
                        onChange={(
                          event
                        ) =>
                          updateColumnFilter(
                            "gender",
                            event
                              .target
                              .value
                          )
                        }
                        style={
                          filterInputStyle
                        }
                      />
                    </div>
                  </th>

                  {/* DATE OF BIRTH */}

                  <th
                    style={
                      headerStyle
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSort(
                          "dateOfBirth"
                        )
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        padding:
                          "0",
                        cursor:
                          "pointer",
                        fontWeight:
                          "700",
                        fontSize:
                          "13px",
                      }}
                    >
                      Date of Birth
                      {sortIcon(
                        "dateOfBirth"
                      )}
                    </button>

                    <div>
                      <input
                        type="text"
                        placeholder="🔍 YYYY-MM-DD"
                        value={
                          columnFilters.dateOfBirth
                        }
                        onChange={(
                          event
                        ) =>
                          updateColumnFilter(
                            "dateOfBirth",
                            event
                              .target
                              .value
                          )
                        }
                        style={
                          filterInputStyle
                        }
                      />
                    </div>
                  </th>

                  {/* SCHOOL */}

                  <th
                    style={
                      headerStyle
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSort(
                          "school"
                        )
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        padding:
                          "0",
                        cursor:
                          "pointer",
                        fontWeight:
                          "700",
                        fontSize:
                          "13px",
                      }}
                    >
                      School
                      {sortIcon(
                        "school"
                      )}
                    </button>

                    <div>
                      <input
                        type="text"
                        placeholder="🔍 Class / Stream"
                        value={
                          columnFilters.school
                        }
                        onChange={(
                          event
                        ) =>
                          updateColumnFilter(
                            "school",
                            event
                              .target
                              .value
                          )
                        }
                        style={
                          filterInputStyle
                        }
                      />
                    </div>
                  </th>

                  {/* MADRASA */}

                  <th
                    style={
                      headerStyle
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSort(
                          "madrasa"
                        )
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        padding:
                          "0",
                        cursor:
                          "pointer",
                        fontWeight:
                          "700",
                        fontSize:
                          "13px",
                      }}
                    >
                      Madrasa
                      {sortIcon(
                        "madrasa"
                      )}
                    </button>

                    <div>
                      <input
                        type="text"
                        placeholder="🔍 Class / Stream"
                        value={
                          columnFilters.madrasa
                        }
                        onChange={(
                          event
                        ) =>
                          updateColumnFilter(
                            "madrasa",
                            event
                              .target
                              .value
                          )
                        }
                        style={
                          filterInputStyle
                        }
                      />
                    </div>
                  </th>

                  {/* STATUS */}

                  <th
                    style={
                      headerStyle
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSort(
                          "status"
                        )
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        padding:
                          "0",
                        cursor:
                          "pointer",
                        fontWeight:
                          "700",
                        fontSize:
                          "13px",
                      }}
                    >
                      Status
                      {sortIcon(
                        "status"
                      )}
                    </button>

                    <div>
                      <input
                        type="text"
                        placeholder="🔍 Search..."
                        value={
                          columnFilters.status
                        }
                        onChange={(
                          event
                        ) =>
                          updateColumnFilter(
                            "status",
                            event
                              .target
                              .value
                          )
                        }
                        style={
                          filterInputStyle
                        }
                      />
                    </div>
                  </th>

                  {/* ACTIONS */}

                  <th
                    style={{
                      ...headerStyle,
                      textAlign:
                        "center",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              {/* ==================================================
                  TABLE BODY
              ================================================== */}

              <tbody>
                {paginatedRows.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        padding:
                          "50px 20px",
                        textAlign:
                          "center",
                        opacity:
                          0.65,
                      }}
                    >
                      {hasFilters
                        ? "No students match the selected filters."
                        : "No students found."}
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map(
                    (student) => (
                      <tr
                        key={
                          student.id
                        }
                        style={{
                          borderBottom:
                            "1px solid rgba(0,0,0,0.07)",
                        }}
                      >
                        <td
                          style={{
                            padding:
                              "12px",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <strong>
                            {
                              student.admissionNo
                            }
                          </strong>
                        </td>

                        <td
                          style={{
                            padding:
                              "12px",
                          }}
                        >
                          <strong>
                            {getStudentName(
                              student
                            )}
                          </strong>
                        </td>

                        <td
                          style={{
                            padding:
                              "12px",
                          }}
                        >
                          {
                            student.gender ||
                            "—"
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "12px",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {
                            student.dateOfBirth ||
                            "—"
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "12px",
                          }}
                        >
                          {student.inSchool ? (
                            <span>
                              {
                                getSchoolDisplay(
                                  student
                                )
                              }
                            </span>
                          ) : (
                            <span
                              style={{
                                opacity:
                                  0.5,
                              }}
                            >
                              No
                            </span>
                          )}
                        </td>

                        <td
                          style={{
                            padding:
                              "12px",
                          }}
                        >
                          {student.inMadrasa ? (
                            <span>
                              {
                                getMadrasaDisplay(
                                  student
                                )
                              }
                            </span>
                          ) : (
                            <span
                              style={{
                                opacity:
                                  0.5,
                              }}
                            >
                              No
                            </span>
                          )}
                        </td>

                        <td
                          style={{
                            padding:
                              "12px",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              padding:
                                "5px 10px",
                              borderRadius:
                                "999px",
                              fontSize:
                                "12px",
                              fontWeight:
                                "700",
                              textTransform:
                                "capitalize",
                              ...getStatusStyle(
                                student.status
                              ),
                            }}
                          >
                            {
                              student.status ||
                              "—"
                            }
                          </span>
                        </td>

                        <td
                          style={{
                            padding:
                              "12px",
                            textAlign:
                              "center",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "center",
                              gap:
                                "6px",
                            }}
                          >
                            <button
                              className="icon"
                              title="Edit Student"
                              type="button"
                              onClick={() =>
                                openEdit(
                                  student
                                )
                              }
                            >
                              ✎
                            </button>

                            <button
                              className="icon danger"
                              title="Delete Student"
                              type="button"
                              onClick={() =>
                                deleteStudent(
                                  student.id
                                )
                              }
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================================================
            PAGINATION
        ================================================== */}

        {!loading && (
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap:
                "15px",
              flexWrap:
                "wrap",
              marginTop:
                "18px",
              paddingTop:
                "15px",
              borderTop:
                "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                fontSize:
                  "14px",
                opacity:
                  0.75,
              }}
            >
              Showing{" "}
              <strong>
                {displayStart}
              </strong>
              {" – "}
              <strong>
                {displayEnd}
              </strong>
              {" of "}
              <strong>
                {sortedRows.length}
              </strong>
              {" students"}
            </div>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "6px",
                flexWrap:
                  "wrap",
              }}
            >
              <button
                type="button"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
              >
                ‹ Previous
              </button>

              {pageNumbers.map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                    style={{
                      minWidth:
                        "38px",
                      fontWeight:
                        currentPage ===
                        page
                          ? "700"
                          : "400",
                      border:
                        currentPage ===
                        page
                          ? "2px solid #2563EB"
                          : undefined,
                    }}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ====================================================
          EXCEL IMPORT MODAL
      ==================================================== */}

      {excelModal && (
        <Modal
          title="Import Students from Excel"
          onClose={
            closeExcelImport
          }
        >
          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "18px",
            }}
          >
            <div
              style={{
                padding:
                  "14px",
                borderRadius:
                  "8px",
                background:
                  "rgba(37, 99, 235, 0.08)",
              }}
            >
              <strong>
                Excel Import
              </strong>

              <p
                style={{
                  marginBottom:
                    0,
                }}
              >
                Upload an Excel file containing
                existing student records.
                Admission No. must be unique.
              </p>
            </div>

            <button
              type="button"
              onClick={
                downloadTemplate
              }
            >
              📄 Download Excel Template
            </button>

            <Field label="Excel File">
              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept=".xlsx,.xls"
                onChange={
                  handleExcelFile
                }
                disabled={
                  importing
                }
              />
            </Field>

            {excelFile && (
              <div>
                <strong>
                  Selected file:
                </strong>{" "}
                {excelFile.name}
              </div>
            )}

            {excelLoading && (
              <div className="loading">
                Reading Excel file...
              </div>
            )}

            {excelRows.length >
              0 &&
              !importResult && (
                <div>
                  <h3>
                    Preview
                  </h3>

                  <div
                    style={{
                      overflowX:
                        "auto",
                      maxHeight:
                        "300px",
                      border:
                        "1px solid #ddd",
                      borderRadius:
                        "8px",
                    }}
                  >
                    <table
                      style={{
                        width:
                          "100%",
                        borderCollapse:
                          "collapse",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              padding:
                                "8px",
                            }}
                          >
                            Row
                          </th>

                          <th
                            style={{
                              padding:
                                "8px",
                            }}
                          >
                            Admission
                          </th>

                          <th
                            style={{
                              padding:
                                "8px",
                            }}
                          >
                            Name
                          </th>

                          <th
                            style={{
                              padding:
                                "8px",
                            }}
                          >
                            Gender
                          </th>

                          <th
                            style={{
                              padding:
                                "8px",
                            }}
                          >
                            School
                          </th>

                          <th
                            style={{
                              padding:
                                "8px",
                            }}
                          >
                            Madrasa
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {excelRows
                          .slice(
                            0,
                            20
                          )
                          .map(
                            (
                              row
                            ) => (
                              <tr
                                key={
                                  row.rowNumber
                                }
                              >
                                <td
                                  style={{
                                    padding:
                                      "8px",
                                  }}
                                >
                                  {
                                    row.rowNumber
                                  }
                                </td>

                                <td
                                  style={{
                                    padding:
                                      "8px",
                                  }}
                                >
                                  {
                                    row.admissionNo ||
                                    "—"
                                  }
                                </td>

                                <td
                                  style={{
                                    padding:
                                      "8px",
                                  }}
                                >
                                  {`${row.firstName} ${
                                    row.middleName
                                  } ${
                                    row.lastName
                                  }`
                                    .replace(
                                      /\s+/g,
                                      " "
                                    )
                                    .trim()}
                                </td>

                                <td
                                  style={{
                                    padding:
                                      "8px",
                                  }}
                                >
                                  {
                                    row.gender
                                  }
                                </td>

                                <td
                                  style={{
                                    padding:
                                      "8px",
                                  }}
                                >
                                  {
                                    row.schoolClass ||
                                    "—"
                                  }
                                </td>

                                <td
                                  style={{
                                    padding:
                                      "8px",
                                  }}
                                >
                                  {
                                    row.madrasaClass ||
                                    "—"
                                  }
                                </td>
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                  </div>

                  {excelRows.length >
                    20 && (
                    <small>
                      Showing first 20
                      rows of{" "}
                      {
                        excelRows.length
                      }.
                    </small>
                  )}
                </div>
              )}

            {importResult && (
              <div
                style={{
                  padding:
                    "16px",
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                }}
              >
                <h3>
                  Import Completed
                </h3>

                <p>
                  <strong>
                    Imported:
                  </strong>{" "}
                  {
                    importResult.imported
                  }
                </p>

                <p>
                  <strong>
                    Skipped:
                  </strong>{" "}
                  {
                    importResult.skipped
                  }
                </p>

                <p>
                  <strong>
                    Failed:
                  </strong>{" "}
                  {
                    importResult.failed
                  }
                </p>

                {importResult.errors
                  ?.length > 0 && (
                  <div>
                    <h4>
                      Details
                    </h4>

                    <div
                      style={{
                        maxHeight:
                          "200px",
                        overflowY:
                          "auto",
                        fontSize:
                          "13px",
                      }}
                    >
                      {importResult.errors.map(
                        (
                          error,
                          index
                        ) => (
                          <div
                            key={
                              index
                            }
                            style={{
                              marginBottom:
                                "6px",
                            }}
                          >
                            {
                              error
                            }
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div
              className="form-actions"
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap:
                  "10px",
              }}
            >
              <button
                type="button"
                onClick={
                  closeExcelImport
                }
                disabled={
                  importing
                }
              >
                Close
              </button>

              {!importResult && (
                <button
                  className="primary"
                  type="button"
                  onClick={
                    importExcel
                  }
                  disabled={
                    importing ||
                    excelLoading ||
                    excelRows.length ===
                      0
                  }
                >
                  {importing
                    ? "Importing..."
                    : `Import ${
                        excelRows.length ||
                        0
                      } Students`}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ====================================================
          STUDENT MODAL
      ==================================================== */}

      {modal && (
        <Modal
          title={
            edit
              ? "Edit Student"
              : "Add Student"
          }
          onClose={() => {
            if (!saving) {
              setModal(false);
            }
          }}
        >
          <form
            onSubmit={save}
            className="form-grid"
          >
            <Field label="Admission No.">
              <input
                type="text"
                value={
                  form.admissionNo
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    admissionNo:
                      event.target
                        .value,
                  })
                }
                required
              />
            </Field>

            <Field label="First Name">
              <input
                type="text"
                value={
                  form.firstName
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    firstName:
                      event.target
                        .value,
                  })
                }
                required
              />
            </Field>

            <Field label="Middle Name">
              <input
                type="text"
                value={
                  form.middleName
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    middleName:
                      event.target
                        .value,
                  })
                }
              />
            </Field>

            <Field label="Last Name">
              <input
                type="text"
                value={
                  form.lastName
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    lastName:
                      event.target
                        .value,
                  })
                }
                required
              />
            </Field>

            <Field label="Gender">
              <select
                value={
                  form.gender
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    gender:
                      event.target
                        .value,
                  })
                }
              >
                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>
            </Field>

            <Field label="Date of Birth">
              <input
                type="date"
                value={
                  form.dateOfBirth
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    dateOfBirth:
                      event.target
                        .value,
                  })
                }
              />
            </Field>

            <Field label="Place of Birth">
              <input
                type="text"
                value={
                  form.placeOfBirth
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    placeOfBirth:
                      event.target
                        .value,
                  })
                }
              />
            </Field>

            <Field label="Phone">
              <input
                type="text"
                value={
                  form.phone
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    phone:
                      event.target
                        .value,
                  })
                }
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={
                  form.email
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    email:
                      event.target
                        .value,
                  })
                }
              />
            </Field>

            <Field label="Address">
              <input
                type="text"
                value={
                  form.address
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    address:
                      event.target
                        .value,
                  })
                }
              />
            </Field>

            <Field label="Parent / Guardian Name">
              <input
                type="text"
                value={
                  form.parentName
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    parentName:
                      event.target
                        .value,
                  })
                }
              />
            </Field>

            <Field label="Parent / Guardian Phone">
              <input
                type="text"
                value={
                  form.parentPhone
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    parentPhone:
                      event.target
                        .value,
                  })
                }
              />
            </Field>

            <Field label="Parent Email">
              <input
                type="email"
                value={
                  form.parentEmail
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    parentEmail:
                      event.target
                        .value,
                  })
                }
              />
            </Field>

            <Field label="Emergency Contact">
              <input
                type="text"
                value={
                  form.emergencyContact
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    emergencyContact:
                      event.target
                        .value,
                  })
                }
              />
            </Field>

            <Field label="Admission Date">
              <input
                type="date"
                value={
                  form.admissionDate
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    admissionDate:
                      event.target
                        .value,
                  })
                }
                required
              />
            </Field>

            <Field label="Status">
              <select
                value={
                  form.status
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    status:
                      event.target
                        .value,
                  })
                }
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

                <option value="graduated">
                  Graduated
                </option>

                <option value="transferred">
                  Transferred
                </option>

                <option value="suspended">
                  Suspended
                </option>
              </select>
            </Field>

            {/* SCHOOL */}

            <div
              style={{
                gridColumn:
                  "1 / -1",
                marginTop:
                  "10px",
              }}
            >
              <h3>
                School Enrollment
              </h3>
            </div>

            <Field label="School Enrollment">
              <select
                value={
                  form.inSchool
                    ? "yes"
                    : "no"
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    inSchool:
                      event.target
                        .value ===
                      "yes",
                  })
                }
              >
                <option value="yes">
                  Enrolled
                </option>

                <option value="no">
                  Not Enrolled
                </option>
              </select>
            </Field>

            <Field label="School Class">
              <select
                value={
                  form.schoolClassId
                }
                disabled={
                  !form.inSchool
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    schoolClassId:
                      event.target
                        .value,
                    schoolStreamId:
                      "",
                  })
                }
              >
                <option value="">
                  Select Class
                </option>

                {schoolClasses.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.name
                      }
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="School Stream">
              <select
                value={
                  form.schoolStreamId
                }
                disabled={
                  !form.inSchool ||
                  !form.schoolClassId
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    schoolStreamId:
                      event.target
                        .value,
                  })
                }
              >
                <option value="">
                  Select Stream
                </option>

                {schoolStreams.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.name
                      }
                    </option>
                  )
                )}
              </select>
            </Field>

            {/* MADRASA */}

            <div
              style={{
                gridColumn:
                  "1 / -1",
                marginTop:
                  "10px",
              }}
            >
              <h3>
                Madrasa Enrollment
              </h3>
            </div>

            <Field label="Madrasa Enrollment">
              <select
                value={
                  form.inMadrasa
                    ? "yes"
                    : "no"
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    inMadrasa:
                      event.target
                        .value ===
                      "yes",
                  })
                }
              >
                <option value="no">
                  Not Enrolled
                </option>

                <option value="yes">
                  Enrolled
                </option>
              </select>
            </Field>

            <Field label="Madrasa Class">
              <select
                value={
                  form.madrasaClassId
                }
                disabled={
                  !form.inMadrasa
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    madrasaClassId:
                      event.target
                        .value,
                    madrasaStreamId:
                      "",
                  })
                }
              >
                <option value="">
                  Select Class
                </option>

                {madrasaClasses.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.name
                      }
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Madrasa Stream">
              <select
                value={
                  form.madrasaStreamId
                }
                disabled={
                  !form.inMadrasa ||
                  !form.madrasaClassId
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    madrasaStreamId:
                      event.target
                        .value,
                  })
                }
              >
                <option value="">
                  Select Stream
                </option>

                {madrasaStreams.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.name
                      }
                    </option>
                  )
                )}
              </select>
            </Field>

            {/* ACTIONS */}

            <div
              className="form-actions"
              style={{
                gridColumn:
                  "1 / -1",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setModal(false)
                }
                disabled={
                  saving
                }
              >
                Cancel
              </button>

              <button
                className="primary"
                type="submit"
                disabled={
                  saving
                }
              >
                {saving
                  ? "Saving..."
                  : edit
                    ? "Update Student"
                    : "Save Student"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}