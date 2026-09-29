import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
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
  /* =====================================================
     DATA
  ===================================================== */

  const {
    data: exams = [],
    load: loadExams,
  } = useData("exams");

  const {
    data: results = [],
    load: loadResults,
  } = useData("results");

  const {
    data: attendance = [],
    load: loadAttendance,
  } = useData("attendance");

  const {
    data: students = [],
  } = useData("students");

  const {
    data: subjects = [],
    load: loadSubjects,
  } = useData("subjects");

  const {
    data: classes = [],
  } = useData("classes");

  const [terms, setTerms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [
    loadingAcademicSettings,
    setLoadingAcademicSettings,
  ] = useState(true);

  /* =====================================================
     LOAD ACADEMIC YEARS + TERMS
  ===================================================== */

  const loadAcademicSettings = async () => {
    try {
      setLoadingAcademicSettings(true);

      const [
        yearsResponse,
        termsResponse,
      ] = await Promise.all([
        api.get("/academic-years"),
        api.get("/terms"),
      ]);

      const yearsResponseData =
        yearsResponse?.data;

      const termsResponseData =
        termsResponse?.data;

      const years =
        Array.isArray(
          yearsResponseData?.data
        )
          ? yearsResponseData.data
          : Array.isArray(
              yearsResponseData?.academic_years
            )
          ? yearsResponseData.academic_years
          : Array.isArray(
              yearsResponseData?.academicYears
            )
          ? yearsResponseData.academicYears
          : Array.isArray(
              yearsResponseData
            )
          ? yearsResponseData
          : [];

      const termList =
        Array.isArray(
          termsResponseData?.data
        )
          ? termsResponseData.data
          : Array.isArray(
              termsResponseData?.terms
            )
          ? termsResponseData.terms
          : Array.isArray(
              termsResponseData
            )
          ? termsResponseData
          : [];

      console.log(
        "ACADEMIC YEARS:",
        years
      );

      console.log(
        "TERMS:",
        termList
      );

      setAcademicYears(years);
      setTerms(termList);

      return {
        years,
        termList,
      };
    } catch (error) {
      console.error(
        "Failed to load academic settings:",
        error
      );

      console.error(
        "Academic year response:",
        error?.response?.data
      );

      console.error(
        "Term response:",
        error?.response?.data
      );

      setAcademicYears([]);
      setTerms([]);

      return {
        years: [],
        termList: [],
      };
    } finally {
      setLoadingAcademicSettings(false);
    }
  };

  useEffect(() => {
    loadAcademicSettings();
  }, []);

  /* =====================================================
     STATE
  ===================================================== */

  const [tab, setTab] =
    useState("exams");

  const [modal, setModal] =
    useState(false);

  const [importing, setImporting] =
    useState(false);

  /* =====================================================
     SUBJECT STATE
  ===================================================== */

  const [
    subjectModal,
    setSubjectModal,
  ] = useState(false);

  const [
    editingSubject,
    setEditingSubject,
  ] = useState(null);

  const [
    subjectForm,
    setSubjectForm,
  ] = useState({
    code: "",
    name: "",
    category: "SCHOOL",
    description: "",
    status: "ACTIVE",
  });

  /* =====================================================
     EXAM STATE

     Academic Year:
       - existing selection
       - OR typed value

     Term:
       - existing selection
       - OR typed value
  ===================================================== */

  const [exam, setExam] =
    useState({
      name: "",
      exam_type: "TEST",

      academic_year_id: "",
      academic_year: "",

      term_id: "",
      term: "",

      class_id: "",
      subject_id: "",
      exam_date: "",
      total_marks: 100,
    });

  /* =====================================================
     RESULT STATE
  ===================================================== */

  const [result, setResult] =
    useState({
      student_id: "",
      subject_id: "",
      exam_id: "",
      hw: 0,
      ct: 0,
      cw: 0,
      fe: 0,
    });

  /* =====================================================
     ATTENDANCE STATE
  ===================================================== */

  const [
    attendanceForm,
    setAttendanceForm,
  ] = useState({
    student_id: "",
    class_id: "",
    date: new Date()
      .toISOString()
      .split("T")[0],
    status: "PRESENT",
    remarks: "",
  });

  /* =====================================================
     SCHOOL SUBJECTS
  ===================================================== */

  const schoolSubjects =
    Array.isArray(subjects)
      ? subjects.filter(
          (subject) =>
            String(
              subject.category || ""
            ).toUpperCase() === "SCHOOL" &&
            String(
              subject.status || "ACTIVE"
            ).toUpperCase() === "ACTIVE"
        )
      : [];

  /* =====================================================
     ACTIVE ACADEMIC YEAR
  ===================================================== */

  const getDefaultAcademicYear =
    (yearsList = academicYears) => {
      const years =
        Array.isArray(yearsList)
          ? yearsList
          : [];

      if (!years.length) {
        return null;
      }

      const activeYear =
        years.find((item) => {
          const status =
            String(
              item.status || ""
            ).toUpperCase();

          return (
            status === "ACTIVE" ||
            status === "CURRENT" ||
            item.is_active === true ||
            item.is_current === true ||
            item.current === true
          );
        });

      return (
        activeYear ||
        years[0] ||
        null
      );
    };

  /* =====================================================
     ACADEMIC YEAR ID
  ===================================================== */

  const getDefaultAcademicYearId =
    (yearsList = academicYears) => {
      const selected =
        getDefaultAcademicYear(
          yearsList
        );

      return String(
        selected?.id || ""
      );
    };

  /* =====================================================
     ACADEMIC YEAR NAME
  ===================================================== */

  const getDefaultAcademicYearName =
    (yearsList = academicYears) => {
      const selected =
        getDefaultAcademicYear(
          yearsList
        );

      return String(
        selected?.name ||
          selected?.year ||
          selected?.academic_year ||
          ""
      ).trim();
    };

  /* =====================================================
     FIND ACADEMIC YEAR
  ===================================================== */

  const findAcademicYear = (
    yearName,
    yearsList = academicYears
  ) => {
    const cleanName =
      String(
        yearName || ""
      )
        .trim()
        .toLowerCase();

    if (!cleanName) {
      return null;
    }

    const list =
      Array.isArray(yearsList)
        ? yearsList
        : [];

    return (
      list.find((item) => {
        const itemName =
          String(
            item.name ||
              item.year ||
              item.academic_year ||
              ""
          )
            .trim()
            .toLowerCase();

        return (
          itemName ===
          cleanName
        );
      }) || null
    );
  };

  /* =====================================================
     ACADEMIC YEAR DATES

     Supports:
       2026
       2026/2027
       2026-2027
  ===================================================== */

  const getAcademicYearDates = (
    yearName
  ) => {
    const value =
      String(
        yearName || ""
      ).trim();

    const match =
      value.match(
        /^(\d{4})(?:\s*[\/-]\s*(\d{4}))?$/
      );

    if (!match) {
      return null;
    }

    const startYear =
      Number(match[1]);

    const endYear =
      Number(
        match[2] ||
          match[1]
      );

    if (
      startYear < 2000 ||
      endYear < startYear
    ) {
      return null;
    }

    return {
      start_date:
        `${startYear}-01-01`,
      end_date:
        `${endYear}-12-31`,
    };
  };

  /* =====================================================
     ENSURE ACADEMIC YEAR EXISTS
  ===================================================== */

  const ensureAcademicYear =
    async (
      yearName,
      yearsList = academicYears
    ) => {
      const cleanName =
        String(
          yearName || ""
        ).trim();

      if (!cleanName) {
        throw new Error(
          "Please select or enter Academic Year."
        );
      }

      const existing =
        findAcademicYear(
          cleanName,
          yearsList
        );

      if (existing?.id) {
        return existing;
      }

      const dates =
        getAcademicYearDates(
          cleanName
        );

      if (!dates) {
        throw new Error(
          "Academic Year must be like 2026 or 2026/2027."
        );
      }

      const response =
        await api.post(
          "/academic-years",
          {
            name: cleanName,
            start_date:
              dates.start_date,
            end_date:
              dates.end_date,
            status: "ACTIVE",
          }
        );

      const created =
        response?.data?.data ||
        response?.data?.academic_year ||
        response?.data;

      await loadAcademicSettings();

      if (created?.id) {
        return created;
      }

      const refreshed =
        await api.get(
          "/academic-years"
        );

      const refreshedData =
        refreshed?.data;

      const refreshedYears =
        Array.isArray(
          refreshedData?.data
        )
          ? refreshedData.data
          : Array.isArray(
              refreshedData?.academic_years
            )
          ? refreshedData.academic_years
          : Array.isArray(
              refreshedData
            )
          ? refreshedData
          : [];

      const found =
        findAcademicYear(
          cleanName,
          refreshedYears
        );

      if (found?.id) {
        return found;
      }

      throw new Error(
        "Academic Year was created but could not be found."
      );
    };

  /* =====================================================
     GET TERM NAME
  ===================================================== */

  const normalizeTermName = (
    termName
  ) => {
    const value =
      String(
        termName || ""
      )
        .trim()
        .toUpperCase();

    if (
      value === "1" ||
      value === "TERM1" ||
      value === "TERM 1"
    ) {
      return "TERM 1";
    }

    if (
      value === "2" ||
      value === "TERM2" ||
      value === "TERM 2"
    ) {
      return "TERM 2";
    }

    if (
      value === "3" ||
      value === "TERM3" ||
      value === "TERM 3"
    ) {
      return "TERM 3";
    }

    return value;
  };

  /* =====================================================
     FIND TERM
  ===================================================== */

  const findTerm = (
    termName,
    academicYearId,
    termList = terms
  ) => {
    const cleanName =
      normalizeTermName(
        termName
      );

    const yearId =
      Number(
        academicYearId || 0
      );

    if (!cleanName) {
      return null;
    }

    const list =
      Array.isArray(termList)
        ? termList
        : [];

    return (
      list.find((item) => {
        const itemName =
          normalizeTermName(
            item.name ||
              item.term_name ||
              item.termName
          );

        const itemYearId =
          Number(
            item.academic_year_id ||
              item.year_id ||
              0
          );

        return (
          itemName ===
            cleanName &&
          (!yearId ||
            itemYearId ===
              yearId)
        );
      }) || null
    );
  };

  /* =====================================================
     TERM DATES
  ===================================================== */

  const getTermDates = (
    academicYear,
    termName
  ) => {
    const yearName =
      String(
        academicYear?.name ||
          academicYear?.year ||
          academicYear?.academic_year ||
          ""
      ).trim();

    const dates =
      getAcademicYearDates(
        yearName
      );

    if (!dates) {
      return null;
    }

    const startYear =
      Number(
        yearName.substring(
          0,
          4
        )
      );

    const endYear =
      Number(
        dates.end_date.substring(
          0,
          4
        )
      );

    const normalized =
      normalizeTermName(
        termName
      );

    /*
     * TERM 1
     * January - April
     */
    if (
      normalized ===
      "TERM 1"
    ) {
      return {
        start_date:
          `${startYear}-01-01`,
        end_date:
          `${startYear}-04-30`,
      };
    }

    /*
     * TERM 2
     * May - August
     */
    if (
      normalized ===
      "TERM 2"
    ) {
      return {
        start_date:
          `${startYear}-05-01`,
        end_date:
          `${startYear}-08-31`,
      };
    }

    /*
     * TERM 3
     * September - December
     *
     * For a year such as
     * 2026/2027, TERM 3 is
     * placed in the ending year.
     */
    if (
      normalized ===
      "TERM 3"
    ) {
      return {
        start_date:
          `${endYear}-09-01`,
        end_date:
          `${endYear}-12-31`,
      };
    }

    return null;
  };

  /* =====================================================
     ENSURE TERM EXISTS

     User can:
       - select existing term
       - type new term
  ===================================================== */

  const ensureTerm =
    async (
      termName,
      academicYear,
      termList = terms
    ) => {
      const cleanName =
        normalizeTermName(
          termName
        );

      if (!cleanName) {
        throw new Error(
          "Please select or enter Term."
        );
      }

      const allowedTerms = [
        "TERM 1",
        "TERM 2",
        "TERM 3",
      ];

      if (
        !allowedTerms.includes(
          cleanName
        )
      ) {
        throw new Error(
          "Term must be TERM 1, TERM 2 or TERM 3."
        );
      }

      if (!academicYear?.id) {
        throw new Error(
          "Academic Year must be selected or created first."
        );
      }

      const existing =
        findTerm(
          cleanName,
          academicYear.id,
          termList
        );

      if (existing?.id) {
        return existing;
      }

      const dates =
        getTermDates(
          academicYear,
          cleanName
        );

      if (!dates) {
        throw new Error(
          "Could not determine Term dates."
        );
      }

      const response =
        await api.post(
          "/terms",
          {
            academic_year_id:
              Number(
                academicYear.id
              ),

            name:
              cleanName,

            start_date:
              dates.start_date,

            end_date:
              dates.end_date,

            status:
              "ACTIVE",
          }
        );

      const created =
        response?.data?.data ||
        response?.data?.term ||
        response?.data;

      await loadAcademicSettings();

      if (created?.id) {
        return created;
      }

      /*
       * Refresh again in case
       * backend returned only
       * success/message.
       */
      const refreshed =
        await api.get(
          "/terms"
        );

      const refreshedData =
        refreshed?.data;

      const refreshedTerms =
        Array.isArray(
          refreshedData?.data
        )
          ? refreshedData.data
          : Array.isArray(
              refreshedData?.terms
            )
          ? refreshedData.terms
          : Array.isArray(
              refreshedData
            )
          ? refreshedData
          : [];

      const found =
        findTerm(
          cleanName,
          academicYear.id,
          refreshedTerms
        );

      if (found?.id) {
        return found;
      }

      throw new Error(
        "Term was created but could not be found."
      );
    };

  /* =====================================================
     GET DEFAULT TERM
  ===================================================== */

  const getDefaultTerm =
    (
      termList = terms,
      yearId = null
    ) => {
      const list =
        Array.isArray(termList)
          ? termList
          : [];

      if (!list.length) {
        return null;
      }

      const numericYearId =
        Number(
          yearId || 0
        );

      let candidates =
        list.filter((item) => {
          if (!numericYearId) {
            return true;
          }

          return (
            Number(
              item.academic_year_id ||
                item.year_id ||
                0
            ) ===
            numericYearId
          );
        });

      if (!candidates.length) {
        candidates = list;
      }

      const active =
        candidates.find(
          (item) => {
            const status =
              String(
                item.status || ""
              ).toUpperCase();

            return (
              status === "ACTIVE" ||
              status === "CURRENT" ||
              item.is_active === true ||
              item.is_current === true ||
              item.current === true
            );
          }
        );

      return (
        active ||
        candidates[0] ||
        null
      );
    };

  /* =====================================================
     GET DEFAULT TERM ID
  ===================================================== */

  const getDefaultTermId =
    (
      termList = terms,
      yearId = null
    ) => {
      const selected =
        getDefaultTerm(
          termList,
          yearId
        );

      return String(
        selected?.id || ""
      );
    };

  /* =====================================================
     TERMS FOR SELECTED YEAR
  ===================================================== */

  const termsForSelectedYear =
    useMemo(() => {
      const yearId =
        Number(
          exam.academic_year_id ||
            0
        );

      if (!yearId) {
        return Array.isArray(
          terms
        )
          ? terms
          : [];
      }

      const filtered =
        terms.filter(
          (item) =>
            Number(
              item.academic_year_id ||
                item.year_id ||
                0
            ) === yearId
        );

      return filtered.length
        ? filtered
        : terms;
    }, [
      terms,
      exam.academic_year_id,
    ]);

  /* =====================================================
     WHEN USER SELECTS ACADEMIC YEAR
  ===================================================== */

  const handleAcademicYearSelect =
    (value) => {
      const selected =
        academicYears.find(
          (item) =>
            String(
              item.id
            ) ===
            String(value)
        );

      const defaultTerm =
        selected
          ? getDefaultTerm(
              terms,
              selected.id
            )
          : null;

      setExam(
        (previous) => ({
          ...previous,

          academic_year_id:
            String(
              value || ""
            ),

          academic_year:
            selected
              ? String(
                  selected.name ||
                    selected.year ||
                    selected.academic_year ||
                    ""
                )
              : previous.academic_year,

          term_id:
            defaultTerm?.id
              ? String(
                  defaultTerm.id
                )
              : "",

          term:
            defaultTerm?.name
              ? String(
                  defaultTerm.name
                )
              : "",
        })
      );
    };

  /* =====================================================
     WHEN USER TYPES ACADEMIC YEAR
  ===================================================== */

  const handleAcademicYearText =
    (value) => {
      const cleanValue =
        value;

      const existing =
        findAcademicYear(
          cleanValue,
          academicYears
        );

      if (existing?.id) {
        const defaultTerm =
          getDefaultTerm(
            terms,
            existing.id
          );

        setExam(
          (previous) => ({
            ...previous,

            academic_year:
              cleanValue,

            academic_year_id:
              String(
                existing.id
              ),

            term_id:
              defaultTerm?.id
                ? String(
                    defaultTerm.id
                  )
                : "",

            term:
              defaultTerm?.name ||
              "",
          })
        );

        return;
      }

      setExam(
        (previous) => ({
          ...previous,

          academic_year:
            cleanValue,

          academic_year_id:
            "",
        })
      );
    };

  /* =====================================================
     WHEN USER SELECTS TERM
  ===================================================== */

  const handleTermSelect =
    (value) => {
      const selected =
        termsForSelectedYear.find(
          (item) =>
            String(
              item.id
            ) ===
            String(value)
        );

      setExam(
        (previous) => ({
          ...previous,

          term_id:
            String(
              value || ""
            ),

          term:
            selected?.name ||
            "",
        })
      );
    };

  /* =====================================================
     WHEN USER TYPES TERM
  ===================================================== */

  const handleTermText =
    (value) => {
      const normalized =
        normalizeTermName(
          value
        );

      const existing =
        findTerm(
          normalized,
          exam.academic_year_id,
          terms
        );

      if (existing?.id) {
        setExam(
          (previous) => ({
            ...previous,

            term:
              value,

            term_id:
              String(
                existing.id
              ),
          })
        );

        return;
      }

      setExam(
        (previous) => ({
          ...previous,

          term:
            value,

          term_id:
            "",
        })
      );
    };

  /* =====================================================
     OPEN SUBJECT MODAL
  ===================================================== */

  const openSubjectModal =
    () => {
      setEditingSubject(null);

      setSubjectForm({
        code: "",
        name: "",
        category: "SCHOOL",
        description: "",
        status: "ACTIVE",
      });

      setSubjectModal(true);
    };

  /* =====================================================
     EDIT SUBJECT
  ===================================================== */

  const editSubject = (
    subject
  ) => {
    setEditingSubject(subject);

    setSubjectForm({
      code:
        subject.code || "",
      name:
        subject.name || "",
      category:
        subject.category ||
        "SCHOOL",
      description:
        subject.description || "",
      status:
        subject.status ||
        "ACTIVE",
    });

    setSubjectModal(true);
  };

  /* =====================================================
     SAVE SUBJECT
  ===================================================== */

  const saveSubject = async (
    e
  ) => {
    e.preventDefault();

    try {
      if (
        !subjectForm.code.trim()
      ) {
        alert(
          "Please enter Subject Code."
        );
        return;
      }

      if (
        !subjectForm.name.trim()
      ) {
        alert(
          "Please enter Subject Name."
        );
        return;
      }

      if (
        !subjectForm.category
      ) {
        alert(
          "Please select Category."
        );
        return;
      }

      const payload = {
        code:
          subjectForm.code
            .trim()
            .toUpperCase(),

        name:
          subjectForm.name.trim(),

        category:
          subjectForm.category,

        description:
          subjectForm.description.trim(),

        status:
          subjectForm.status,
      };

      if (editingSubject) {
        await api.put(
          `/subjects/${editingSubject.id}`,
          payload
        );
      } else {
        await api.post(
          "/subjects",
          payload
        );
      }

      const wasEditing =
        Boolean(
          editingSubject
        );

      setSubjectModal(false);
      setEditingSubject(null);

      setSubjectForm({
        code: "",
        name: "",
        category: "SCHOOL",
        description: "",
        status: "ACTIVE",
      });

      await loadSubjects();

      alert(
        wasEditing
          ? "Subject updated successfully."
          : "Subject created successfully."
      );
    } catch (error) {
      console.error(
        "Save subject error:",
        error
      );

      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to save subject."
      );
    }
  };

  /* =====================================================
     DELETE SUBJECT
  ===================================================== */

  const deleteSubject = async (
    id
  ) => {
    if (
      !window.confirm(
        "Delete subject?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/subjects/${id}`
      );

      await loadSubjects();

      alert(
        "Subject deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete subject error:",
        error
      );

      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to delete subject."
      );
    }
  };

  /* =====================================================
     OPEN EXAM MODAL
  ===================================================== */

  const openExamModal =
    async () => {
      if (
        schoolSubjects.length ===
        0
      ) {
        alert(
          "Please add a SCHOOL subject first."
        );

        setTab("subjects");

        return;
      }

      const {
        years,
        termList,
      } =
        await loadAcademicSettings();

      const defaultYear =
        getDefaultAcademicYearName(
          years
        );

      const defaultYearItem =
        getDefaultAcademicYear(
          years
        );

      const defaultTerm =
        getDefaultTerm(
          termList,
          defaultYearItem?.id
        );

      setExam({
        name: "",
        exam_type: "TEST",

        academic_year_id:
          String(
            defaultYearItem?.id ||
              ""
          ),

        academic_year:
          defaultYear,

        term_id:
          String(
            defaultTerm?.id ||
              ""
          ),

        term:
          String(
            defaultTerm?.name ||
              ""
          ),

        class_id: "",
        subject_id: "",
        exam_date: "",
        total_marks: 100,
      });

      setModal(true);
    };

  /* =====================================================
     OPEN RESULT MODAL
  ===================================================== */

  const openResultModal =
    () => {
      setResult({
        student_id: "",
        subject_id: "",
        exam_id: "",
        hw: 0,
        ct: 0,
        cw: 0,
        fe: 0,
      });

      setModal(true);
    };

  /* =====================================================
     OPEN ATTENDANCE MODAL
  ===================================================== */

  const openAttendanceModal =
    () => {
      setAttendanceForm({
        student_id: "",
        class_id: "",
        date: new Date()
          .toISOString()
          .split("T")[0],
        status: "PRESENT",
        remarks: "",
      });

      setModal(true);
    };

  /* =====================================================
     SAVE EXAM
  ===================================================== */

  const saveExam = async (
    e
  ) => {
    e.preventDefault();

    try {
      if (!exam.name.trim()) {
        alert(
          "Please enter Exam Name."
        );
        return;
      }

      if (
        !exam.academic_year.trim()
      ) {
        alert(
          "Please select or enter Academic Year."
        );
        return;
      }

      if (!exam.term.trim()) {
        alert(
          "Please select or enter Term."
        );
        return;
      }

      if (!exam.class_id) {
        alert(
          "Please select Class."
        );
        return;
      }

      if (!exam.subject_id) {
        alert(
          "Please select Subject."
        );
        return;
      }

      if (!exam.exam_date) {
        alert(
          "Please select Exam Date."
        );
        return;
      }

      const selectedSubject =
        schoolSubjects.find(
          (item) =>
            Number(item.id) ===
            Number(
              exam.subject_id
            )
        );

      if (!selectedSubject) {
        alert(
          "Please select a valid SCHOOL subject."
        );
        return;
      }

      /* ================================================
         REFRESH SETTINGS
      ================================================= */

      const freshSettings =
        await loadAcademicSettings();

      let freshYears =
        freshSettings?.years ||
        [];

      let freshTerms =
        freshSettings?.termList ||
        [];

      /* ================================================
         ACADEMIC YEAR
      ================================================= */

      const academicYear =
        await ensureAcademicYear(
          exam.academic_year,
          freshYears
        );

      if (!academicYear?.id) {
        throw new Error(
          "Academic Year could not be found or created."
        );
      }

      /* ================================================
         REFRESH AFTER POSSIBLE YEAR CREATION
      ================================================= */

      const afterYearSettings =
        await loadAcademicSettings();

      freshYears =
        afterYearSettings?.years ||
        freshYears;

      freshTerms =
        afterYearSettings?.termList ||
        freshTerms;

      const finalAcademicYear =
        findAcademicYear(
          exam.academic_year,
          freshYears
        ) ||
        academicYear;

      /* ================================================
         TERM

         Existing selected term:
           use it.

         New typed term:
           create it automatically.
      ================================================= */

      let finalTerm = null;

      if (
        exam.term_id
      ) {
        finalTerm =
          freshTerms.find(
            (item) =>
              Number(
                item.id
              ) ===
              Number(
                exam.term_id
              )
          ) || null;
      }

      /*
       * Check by name if ID
       * wasn't found.
       */
      if (!finalTerm) {
        finalTerm =
          findTerm(
            exam.term,
            finalAcademicYear.id,
            freshTerms
          );
      }

      /*
       * Create Term automatically
       * if it doesn't exist.
       */
      if (!finalTerm) {
        finalTerm =
          await ensureTerm(
            exam.term,
            finalAcademicYear,
            freshTerms
          );
      }

      if (!finalTerm?.id) {
        throw new Error(
          "Term could not be found or created."
        );
      }

      /* ================================================
         FINAL PAYLOAD
      ================================================= */

      const payload = {
        name:
          exam.name.trim(),

        exam_type:
          exam.exam_type,

        year_id:
          Number(
            finalAcademicYear.id
          ),

        term_id:
          Number(
            finalTerm.id
          ),

        class_id:
          Number(
            exam.class_id
          ),

        subject_id:
          Number(
            exam.subject_id
          ),

        exam_date:
          exam.exam_date,

        total_marks:
          Number(
            exam.total_marks ||
              100
          ),
      };

      console.log(
        "CREATING EXAM:",
        payload
      );

      await api.post(
        "/exams",
        payload
      );

      setModal(false);

      await loadExams();

      await loadAcademicSettings();

      alert(
        "Exam created successfully."
      );
    } catch (error) {
      console.error(
        "Create exam error:",
        error
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      alert(
        error?.response?.data
          ?.error ||
          error?.response?.data
            ?.message ||
          error.message ||
          "Failed to create exam."
      );
    }
  };

  /* =====================================================
     SAVE RESULT
  ===================================================== */

  const saveResult = async (
    e
  ) => {
    e.preventDefault();

    try {
      if (!result.student_id) {
        alert(
          "Please select Student."
        );
        return;
      }

      if (!result.subject_id) {
        alert(
          "Please select Subject."
        );
        return;
      }

      if (!result.exam_id) {
        alert(
          "Please select Exam."
        );
        return;
      }

      const payload = {
        student_id:
          Number(
            result.student_id
          ),

        subject_id:
          Number(
            result.subject_id
          ),

        exam_id:
          Number(
            result.exam_id
          ),

        hw: Number(
          result.hw || 0
        ),

        ct: Number(
          result.ct || 0
        ),

        cw: Number(
          result.cw || 0
        ),

        fe: Number(
          result.fe || 0
        ),
      };

      await api.post(
        "/results",
        payload
      );

      setModal(false);

      await loadResults();

      alert(
        "Result recorded successfully."
      );
    } catch (error) {
      console.error(
        "Create result error:",
        error
      );

      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to save result."
      );
    }
  };

  /* =====================================================
     SAVE ATTENDANCE
  ===================================================== */

  const saveAttendance =
    async (e) => {
      e.preventDefault();

      try {
        if (
          !attendanceForm.student_id
        ) {
          alert(
            "Please select Student."
          );
          return;
        }

        const payload = {
          student_id:
            Number(
              attendanceForm.student_id
            ),

          date:
            attendanceForm.date,

          status:
            attendanceForm.status,

          remarks:
            attendanceForm.remarks ||
            null,
        };

        if (
          attendanceForm.class_id
        ) {
          payload.class_id =
            Number(
              attendanceForm.class_id
            );
        }

        await api.post(
          "/attendance",
          payload
        );

        setModal(false);

        await loadAttendance();

        alert(
          "Attendance marked successfully."
        );
      } catch (error) {
        console.error(
          "Attendance error:",
          error
        );

        alert(
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Failed to mark attendance."
        );
      }
    };

  /* =====================================================
     DELETE EXAM
  ===================================================== */

  const deleteExam = async (
    id
  ) => {
    if (
      !window.confirm(
        "Delete exam?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/exams/${id}`
      );

      await loadExams();

      alert(
        "Exam deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete exam error:",
        error
      );

      alert(
        error.response?.data?.error ||
          "Failed to delete exam."
      );
    }
  };

  /* =====================================================
     DELETE RESULT
  ===================================================== */

  const deleteResult = async (
    id
  ) => {
    if (
      !window.confirm(
        "Delete result?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/results/${id}`
      );

      await loadResults();

      alert(
        "Result deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete result error:",
        error
      );

      alert(
        error.response?.data?.error ||
          "Failed to delete result."
      );
    }
  };

  /* =====================================================
     DELETE ATTENDANCE
  ===================================================== */

  const deleteAttendance =
    async (id) => {
      if (
        !window.confirm(
          "Delete attendance record?"
        )
      ) {
        return;
      }

      try {
        await api.delete(
          `/attendance/${id}`
        );

        await loadAttendance();

        alert(
          "Attendance deleted successfully."
        );
      } catch (error) {
        console.error(
          "Delete attendance error:",
          error
        );

        alert(
          error.response?.data?.error ||
            "Failed to delete attendance."
        );
      }
    };

  /* =====================================================
     HELPERS
  ===================================================== */

  const getStudentName = (
    studentId
  ) => {
    const student =
      students.find(
        (item) =>
          Number(item.id) ===
          Number(studentId)
      );

    if (!student) {
      return (
        studentId || "—"
      );
    }

    return [
      student.firstName,
      student.middleName,
      student.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getStudentAdmission = (
    studentId
  ) => {
    const student =
      students.find(
        (item) =>
          Number(item.id) ===
          Number(studentId)
      );

    return (
      student?.admissionNo ||
      student?.studentNumber ||
      "—"
    );
  };

  const getSubjectName = (
    subjectId
  ) => {
    const subject =
      subjects.find(
        (item) =>
          Number(item.id) ===
          Number(subjectId)
      );

    return (
      subject?.name ||
      subjectId ||
      "—"
    );
  };

  const getExamName = (
    examId
  ) => {
    const item =
      exams.find(
        (row) =>
          Number(row.id) ===
          Number(examId)
      );

    return (
      item?.name ||
      examId ||
      "—"
    );
  };

  const getClassName = (
    classId
  ) => {
    const item =
      classes.find(
        (row) =>
          Number(row.id) ===
          Number(classId)
      );

    return (
      item?.name ||
      item?.class_name ||
      item?.className ||
      classId ||
      "—"
    );
  };

  const getTermName = (
    termId
  ) => {
    const item =
      terms.find(
        (row) =>
          Number(row.id) ===
          Number(termId)
      );

    return (
      item?.name ||
      item?.term_name ||
      item?.termName ||
      termId ||
      "—"
    );
  };

  const getAcademicYearName = (
    yearId
  ) => {
    const item =
      academicYears.find(
        (row) =>
          Number(row.id) ===
          Number(yearId)
      );

    return (
      item?.name ||
      item?.year ||
      item?.academic_year ||
      yearId ||
      "—"
    );
  };

  /* =====================================================
     DOWNLOAD EXCEL TEMPLATE
  ===================================================== */

  const downloadResultTemplate =
    () => {
      const template = [
        {
          "Admission Number":
            "NIA001",

          "Student Name":
            "Student Name",

          Subject:
            "Mathematics",

          Exam:
            "Midterm Examination",

          Homework: 8,

          Topic: 16,

          "Class Work": 9,

          Final: 50,
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
        "Results"
      );

      XLSX.writeFile(
        workbook,
        "NIA_Results_Template.xlsx"
      );
    };

  /* =====================================================
     IMPORT RESULTS FROM XLSX
  ===================================================== */

  const handleResultExcel =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      try {
        setImporting(true);

        const buffer =
          await file.arrayBuffer();

        const workbook =
          XLSX.read(buffer, {
            type: "array",
          });

        const sheetName =
          workbook.SheetNames[0];

        const worksheet =
          workbook.Sheets[
            sheetName
          ];

        const rows =
          XLSX.utils.sheet_to_json(
            worksheet,
            {
              defval: "",
            }
          );

        if (!rows.length) {
          alert(
            "Excel file is empty."
          );
          return;
        }

        let imported = 0;
        let skipped = 0;

        const errors = [];

        for (
          let index = 0;
          index < rows.length;
          index++
        ) {
          const row =
            rows[index];

          const admission =
            String(
              row[
                "Admission Number"
              ] ||
                row[
                  "Admission No"
                ] ||
                row[
                  "Student Number"
                ] ||
                ""
            ).trim();

          const subjectName =
            String(
              row["Subject"] ||
                ""
            ).trim();

          const examName =
            String(
              row["Exam"] ||
                row["Exam Name"] ||
                ""
            ).trim();

          if (
            !admission ||
            !subjectName ||
            !examName
          ) {
            skipped++;

            errors.push(
              `Row ${
                index + 2
              }: Admission Number, Subject or Exam missing.`
            );

            continue;
          }

          const student =
            students.find(
              (item) => {
                const number =
                  String(
                    item.admissionNo ||
                      item.studentNumber ||
                      ""
                  )
                    .trim()
                    .toLowerCase();

                return (
                  number ===
                  admission.toLowerCase()
                );
              }
            );

          if (!student) {
            skipped++;

            errors.push(
              `Row ${
                index + 2
              }: Student ${admission} not found.`
            );

            continue;
          }

          const subject =
            subjects.find(
              (item) =>
                String(
                  item.name || ""
                )
                  .trim()
                  .toLowerCase() ===
                subjectName.toLowerCase()
            );

          if (!subject) {
            skipped++;

            errors.push(
              `Row ${
                index + 2
              }: Subject "${subjectName}" not found.`
            );

            continue;
          }

          const selectedExam =
            exams.find(
              (item) =>
                String(
                  item.name || ""
                )
                  .trim()
                  .toLowerCase() ===
                examName.toLowerCase()
            );

          if (!selectedExam) {
            skipped++;

            errors.push(
              `Row ${
                index + 2
              }: Exam "${examName}" not found.`
            );

            continue;
          }

          const hw =
            Number(
              row["Homework"] ||
                row["HW"] ||
                0
            );

          const ct =
            Number(
              row["Topic"] ||
                row["Topic Test"] ||
                row["CT"] ||
                0
            );

          const cw =
            Number(
              row["Class Work"] ||
                row["CW"] ||
                0
            );

          const fe =
            Number(
              row["Final"] ||
                row["Final Exam"] ||
                row["FE"] ||
                0
            );

          if (
            [hw, ct, cw, fe].some(
              (value) =>
                Number.isNaN(value)
            )
          ) {
            skipped++;

            errors.push(
              `Row ${
                index + 2
              }: Invalid marks.`
            );

            continue;
          }

          const payload = {
            student_id:
              Number(
                student.id
              ),

            subject_id:
              Number(
                subject.id
              ),

            exam_id:
              Number(
                selectedExam.id
              ),

            hw,
            ct,
            cw,
            fe,
          };

          try {
            await api.post(
              "/results",
              payload
            );

            imported++;
          } catch (error) {
            skipped++;

            errors.push(
              `Row ${
                index + 2
              }: ${
                error.response?.data
                  ?.error ||
                "Failed to save result."
              }`
            );
          }
        }

        await loadResults();

        let message =
          `Import completed.\n\n` +
          `Imported: ${imported}\n` +
          `Skipped: ${skipped}`;

        if (errors.length) {
          message +=
            "\n\nSome rows were skipped:\n" +
            errors
              .slice(0, 10)
              .join("\n");

          if (
            errors.length > 10
          ) {
            message +=
              `\n...and ${
                errors.length - 10
              } more.`;
          }
        }

        alert(message);
      } catch (error) {
        console.error(
          "Excel import error:",
          error
        );

        alert(
          "Failed to read Excel file."
        );
      } finally {
        setImporting(false);

        event.target.value = "";
      }
    };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <Page
      title="Academics"
      subtitle="Exams, results and attendance"
    >
      <div className="tabs">
        {[
          ["subjects", "Subjects"],
          ["exams", "Exams"],
          ["results", "Results"],
          [
            "attendance",
            "Attendance",
          ],
        ].map(
          ([key, label]) => (
            <button
              key={key}
              type="button"
              className={
                tab === key
                  ? "selected"
                  : ""
              }
              onClick={() => {
                setTab(key);
                setModal(false);
              }}
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* =================================================
          SUBJECTS
      ================================================= */}

      {tab === "subjects" && (
        <Card>
          <div className="section-head">
            <div>
              <h2>Subjects</h2>

              <p>
                Add and manage school
                subjects before creating
                examinations.
              </p>
            </div>

            <button
              type="button"
              className="primary"
              onClick={
                openSubjectModal
              }
            >
              + Add Subject
            </button>
          </div>

          <Table
            rows={subjects}
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
                key: "category",
                label: "Category",
              },
              {
                key: "description",
                label: "Description",
              },
              {
                key: "status",
                label: "Status",
              },
            ]}
            actions={(row) => (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    editSubject(row)
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="icon danger"
                  onClick={() =>
                    deleteSubject(
                      row.id
                    )
                  }
                >
                  🗑
                </button>
              </div>
            )}
          />
        </Card>
      )}

      {/* =================================================
          EXAMS
      ================================================= */}

      {tab === "exams" && (
        <Card>
          <div className="section-head">
            <div>
              <h2>Exams</h2>

              <p>
                Manage school
                examinations.
              </p>
            </div>

            <button
              type="button"
              className="primary"
              onClick={
                openExamModal
              }
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
                key: "exam_type",
                label: "Type",
              },
              {
                key: "term_id",
                label: "Term",
                render: (row) =>
                  getTermName(
                    row.term_id
                  ),
              },
              {
                key: "year_id",
                label:
                  "Academic Year",
                render: (row) =>
                  getAcademicYearName(
                    row.year_id ||
                      row.academic_year_id
                  ),
              },
              {
                key: "class_id",
                label: "Class",
                render: (row) =>
                  getClassName(
                    row.class_id
                  ),
              },
              {
                key: "subject_id",
                label: "Subject",
                render: (row) =>
                  getSubjectName(
                    row.subject_id
                  ),
              },
              {
                key: "exam_date",
                label:
                  "Exam Date",
              },
              {
                key: "total_marks",
                label:
                  "Total Marks",
              },
            ]}
            actions={(row) => (
              <button
                type="button"
                className="icon danger"
                onClick={() =>
                  deleteExam(
                    row.id
                  )
                }
              >
                🗑
              </button>
            )}
          />
        </Card>
      )}

      {/* =================================================
          RESULTS
      ================================================= */}

      {tab === "results" && (
        <Card>
          <div className="section-head">
            <div>
              <h2>Results</h2>

              <p>
                Enter and manage
                student examination
                results.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={
                  downloadResultTemplate
                }
              >
                📄 Excel Template
              </button>

              <label
                className="primary"
                style={{
                  cursor:
                    importing
                      ? "not-allowed"
                      : "pointer",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  padding:
                    "10px 14px",
                  borderRadius:
                    "6px",
                  opacity:
                    importing
                      ? 0.6
                      : 1,
                }}
              >
                {importing
                  ? "Importing..."
                  : "📥 Import Excel"}

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={
                    handleResultExcel
                  }
                  disabled={
                    importing
                  }
                  style={{
                    display:
                      "none",
                  }}
                />
              </label>

              <button
                type="button"
                className="primary"
                onClick={
                  openResultModal
                }
              >
                + Enter Result
              </button>
            </div>
          </div>

          <Table
            rows={results}
            columns={[
              {
                key: "student_id",
                label: "Student",
                render: (
                  row
                ) => (
                  <div>
                    <strong>
                      {getStudentName(
                        row.student_id
                      )}
                    </strong>

                    <small
                      style={{
                        display:
                          "block",
                        opacity:
                          0.7,
                      }}
                    >
                      {getStudentAdmission(
                        row.student_id
                      )}
                    </small>
                  </div>
                ),
              },
              {
                key: "subject_id",
                label: "Subject",
                render: (
                  row
                ) =>
                  getSubjectName(
                    row.subject_id
                  ),
              },
              {
                key: "exam_id",
                label: "Exam",
                render: (
                  row
                ) =>
                  getExamName(
                    row.exam_id
                  ),
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
                label:
                  "Class Work",
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
            actions={(row) => (
              <button
                type="button"
                className="icon danger"
                onClick={() =>
                  deleteResult(
                    row.id
                  )
                }
              >
                🗑
              </button>
            )}
          />
        </Card>
      )}

      {/* =================================================
          ATTENDANCE
      ================================================= */}

      {tab === "attendance" && (
        <Card>
          <div className="section-head">
            <div>
              <h2>
                Attendance Records
              </h2>

              <p>
                Manage daily
                student attendance.
              </p>
            </div>

            <button
              type="button"
              className="primary"
              onClick={
                openAttendanceModal
              }
            >
              + Mark Attendance
            </button>
          </div>

          <Table
            rows={attendance}
            columns={[
              {
                key: "student_id",
                label: "Student",
                render: (
                  row
                ) =>
                  getStudentName(
                    row.student_id
                  ),
              },
              {
                key: "class_id",
                label: "Class",
                render: (
                  row
                ) =>
                  getClassName(
                    row.class_id
                  ),
              },
              {
                key: "date",
                label: "Date",
              },
              {
                key: "status",
                label: "Status",
              },
              {
                key: "remarks",
                label: "Remarks",
              },
            ]}
            actions={(row) => (
              <button
                type="button"
                className="icon danger"
                onClick={() =>
                  deleteAttendance(
                    row.id
                  )
                }
              >
                🗑
              </button>
            )}
          />
        </Card>
      )}

      {/* =================================================
          SUBJECT MODAL
      ================================================= */}

      {subjectModal && (
        <Modal
          title={
            editingSubject
              ? "Edit Subject"
              : "Add Subject"
          }
          onClose={() =>
            setSubjectModal(false)
          }
        >
          <form
            onSubmit={saveSubject}
            className="form-grid"
          >
            <Field label="Subject Code">
              <input
                value={
                  subjectForm.code
                }
                onChange={(e) =>
                  setSubjectForm({
                    ...subjectForm,
                    code:
                      e.target.value,
                  })
                }
                placeholder="e.g. MAT"
                required
              />
            </Field>

            <Field label="Subject Name">
              <input
                value={
                  subjectForm.name
                }
                onChange={(e) =>
                  setSubjectForm({
                    ...subjectForm,
                    name:
                      e.target.value,
                  })
                }
                placeholder="e.g. Mathematics"
                required
              />
            </Field>

            <Field label="Category">
              <select
                value={
                  subjectForm.category
                }
                onChange={(e) =>
                  setSubjectForm({
                    ...subjectForm,
                    category:
                      e.target.value,
                  })
                }
                required
              >
                <option value="SCHOOL">
                  SCHOOL
                </option>

                <option value="MADRASA">
                  MADRASA
                </option>
              </select>
            </Field>

            <Field label="Description">
              <textarea
                value={
                  subjectForm.description
                }
                onChange={(e) =>
                  setSubjectForm({
                    ...subjectForm,
                    description:
                      e.target.value,
                  })
                }
                rows="3"
                placeholder="Optional description"
              />
            </Field>

            <Field label="Status">
              <select
                value={
                  subjectForm.status
                }
                onChange={(e) =>
                  setSubjectForm({
                    ...subjectForm,
                    status:
                      e.target.value,
                  })
                }
                required
              >
                <option value="ACTIVE">
                  ACTIVE
                </option>

                <option value="INACTIVE">
                  INACTIVE
                </option>
              </select>
            </Field>

            <div className="form-actions">
              <button
                type="button"
                onClick={() =>
                  setSubjectModal(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="primary"
                type="submit"
              >
                {editingSubject
                  ? "Update Subject"
                  : "Save Subject"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =================================================
          EXAM / RESULT / ATTENDANCE MODAL
      ================================================= */}

      {modal && (
        <Modal
          title={
            tab === "exams"
              ? "Add Exam"
              : tab === "results"
              ? "Enter Result"
              : "Mark Attendance"
          }
          onClose={() =>
            setModal(false)
          }
        >
          {/* =================================================
              EXAM FORM
          ================================================= */}

          {tab === "exams" && (
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
                      name: e.target
                        .value,
                    })
                  }
                  placeholder="e.g. Midterm Examination"
                  required
                />
              </Field>

              <Field label="Exam Type">
                <select
                  value={
                    exam.exam_type
                  }
                  onChange={(e) =>
                    setExam({
                      ...exam,
                      exam_type:
                        e.target
                          .value,
                    })
                  }
                  required
                >
                  <option value="TEST">
                    Test
                  </option>

                  <option value="MIDTERM">
                    Midterm
                  </option>

                  <option value="TERMINAL">
                    Terminal
                  </option>

                  <option value="FINAL">
                    Final
                  </option>
                </select>
              </Field>

              {/* =================================================
                  ACADEMIC YEAR
                  Existing = select
                  New = type
              ================================================= */}

              <Field label="Academic Year">
                <select
                  value={
                    exam.academic_year_id
                  }
                  onChange={(e) =>
                    handleAcademicYearSelect(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select existing Academic Year
                  </option>

                  {academicYears.map(
                    (item) => (
                      <option
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {item.name ||
                          item.year ||
                          item.academic_year ||
                          item.id}
                      </option>
                    )
                  )}
                </select>

                <input
                  type="text"
                  value={
                    exam.academic_year
                  }
                  onChange={(e) =>
                    handleAcademicYearText(
                      e.target.value
                    )
                  }
                  placeholder="Or type new e.g. 2026/2027"
                  style={{
                    marginTop:
                      "8px",
                  }}
                  required
                />

                <small
                  style={{
                    display:
                      "block",
                    marginTop:
                      "5px",
                    opacity:
                      0.7,
                  }}
                >
                  Choose an existing
                  Academic Year above
                  or type a new one.
                </small>
              </Field>

              {/* =================================================
                  TERM
                  Existing = select
                  New = type
              ================================================= */}

              <Field label="Term">
                <select
                  value={
                    exam.term_id
                  }
                  onChange={(e) =>
                    handleTermSelect(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select existing Term
                  </option>

                  {termsForSelectedYear.map(
                    (item) => (
                      <option
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {item.name ||
                          item.term_name ||
                          item.termName ||
                          item.id}
                      </option>
                    )
                  )}
                </select>

                <input
                  type="text"
                  value={
                    exam.term
                  }
                  onChange={(e) =>
                    handleTermText(
                      e.target.value
                    )
                  }
                  placeholder="Or type TERM 1, TERM 2 or TERM 3"
                  style={{
                    marginTop:
                      "8px",
                  }}
                  required
                />

                <small
                  style={{
                    display:
                      "block",
                    marginTop:
                      "5px",
                    opacity:
                      0.7,
                  }}
                >
                  Choose an existing
                  Term or type a new
                  TERM 1, TERM 2 or
                  TERM 3.
                </small>
              </Field>

              <Field label="Class">
                <select
                  value={
                    exam.class_id
                  }
                  onChange={(e) =>
                    setExam({
                      ...exam,
                      class_id:
                        e.target
                          .value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select Class
                  </option>

                  {classes.map(
                    (item) => (
                      <option
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {item.name ||
                          item.class_name ||
                          item.className ||
                          item.id}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="School Subject">
                <select
                  value={
                    exam.subject_id
                  }
                  onChange={(e) =>
                    setExam({
                      ...exam,
                      subject_id:
                        e.target
                          .value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select School Subject
                  </option>

                  {schoolSubjects.map(
                    (subject) => (
                      <option
                        key={
                          subject.id
                        }
                        value={
                          subject.id
                        }
                      >
                        {subject.code
                          ? `${subject.code} - `
                          : ""}
                        {
                          subject.name
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Exam Date">
                <input
                  type="date"
                  value={
                    exam.exam_date
                  }
                  onChange={(e) =>
                    setExam({
                      ...exam,
                      exam_date:
                        e.target
                          .value,
                    })
                  }
                  required
                />
              </Field>

              <Field label="Total Marks">
                <input
                  type="number"
                  min="1"
                  value={
                    exam.total_marks
                  }
                  onChange={(e) =>
                    setExam({
                      ...exam,
                      total_marks:
                        e.target
                          .value,
                    })
                  }
                  required
                />
              </Field>

              <div
                style={{
                  padding:
                    "10px 12px",
                  borderRadius:
                    "8px",
                  background:
                    "#f3f4f6",
                  fontSize:
                    "13px",
                  lineHeight:
                    "1.5",
                }}
              >
                Academic Year and
                Term can either be
                selected from existing
                records or entered
                manually. New values
                are created
                automatically when
                saving the exam.
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() =>
                    setModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="primary"
                  type="submit"
                  disabled={
                    loadingAcademicSettings
                  }
                >
                  {loadingAcademicSettings
                    ? "Loading..."
                    : "Save Exam"}
                </button>
              </div>
            </form>
          )}

          {/* =================================================
              RESULT FORM
          ================================================= */}

          {tab === "results" && (
            <form
              onSubmit={saveResult}
              className="form-grid"
            >
              <Field label="Student">
                <select
                  value={
                    result.student_id
                  }
                  onChange={(e) =>
                    setResult({
                      ...result,
                      student_id:
                        e.target
                          .value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select Student
                  </option>

                  {students.map(
                    (student) => (
                      <option
                        value={
                          student.id
                        }
                        key={
                          student.id
                        }
                      >
                        {student.admissionNo ||
                          student.studentNumber ||
                          student.id}{" "}
                        —{" "}
                        {
                          student.firstName
                        }{" "}
                        {
                          student.lastName
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Subject">
                <select
                  value={
                    result.subject_id
                  }
                  onChange={(e) =>
                    setResult({
                      ...result,
                      subject_id:
                        e.target
                          .value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select Subject
                  </option>

                  {subjects.map(
                    (subject) => (
                      <option
                        value={
                          subject.id
                        }
                        key={
                          subject.id
                        }
                      >
                        {
                          subject.name
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Exam">
                <select
                  value={
                    result.exam_id
                  }
                  onChange={(e) =>
                    setResult({
                      ...result,
                      exam_id:
                        e.target
                          .value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select Exam
                  </option>

                  {exams.map(
                    (item) => (
                      <option
                        value={
                          item.id
                        }
                        key={
                          item.id
                        }
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Homework (10%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    result.hw
                  }
                  onChange={(e) =>
                    setResult({
                      ...result,
                      hw: e.target
                        .value,
                    })
                  }
                />
              </Field>

              <Field label="Topic Test (20%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    result.ct
                  }
                  onChange={(e) =>
                    setResult({
                      ...result,
                      ct: e.target
                        .value,
                    })
                  }
                />
              </Field>

              <Field label="Class Work (10%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    result.cw
                  }
                  onChange={(e) =>
                    setResult({
                      ...result,
                      cw: e.target
                        .value,
                    })
                  }
                />
              </Field>

              <Field label="Final Exam (60%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    result.fe
                  }
                  onChange={(e) =>
                    setResult({
                      ...result,
                      fe: e.target
                        .value,
                    })
                  }
                  required
                />
              </Field>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() =>
                    setModal(false)
                  }
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

          {/* =================================================
              ATTENDANCE FORM
          ================================================= */}

          {tab ===
            "attendance" && (
            <form
              onSubmit={
                saveAttendance
              }
              className="form-grid"
            >
              <Field label="Student">
                <select
                  value={
                    attendanceForm.student_id
                  }
                  onChange={(e) =>
                    setAttendanceForm(
                      {
                        ...attendanceForm,
                        student_id:
                          e.target
                            .value,
                      }
                    )
                  }
                  required
                >
                  <option value="">
                    Select Student
                  </option>

                  {students.map(
                    (student) => (
                      <option
                        value={
                          student.id
                        }
                        key={
                          student.id
                        }
                      >
                        {student.admissionNo ||
                          student.studentNumber ||
                          student.id}{" "}
                        —{" "}
                        {
                          student.firstName
                        }{" "}
                        {
                          student.lastName
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Class">
                <select
                  value={
                    attendanceForm.class_id
                  }
                  onChange={(e) =>
                    setAttendanceForm(
                      {
                        ...attendanceForm,
                        class_id:
                          e.target
                            .value,
                      }
                    )
                  }
                >
                  <option value="">
                    Select Class
                  </option>

                  {classes.map(
                    (item) => (
                      <option
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {item.name ||
                          item.class_name ||
                          item.className ||
                          item.id}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Date">
                <input
                  type="date"
                  value={
                    attendanceForm.date
                  }
                  onChange={(e) =>
                    setAttendanceForm(
                      {
                        ...attendanceForm,
                        date:
                          e.target
                            .value,
                      }
                    )
                  }
                  required
                />
              </Field>

              <Field label="Status">
                <select
                  value={
                    attendanceForm.status
                  }
                  onChange={(e) =>
                    setAttendanceForm(
                      {
                        ...attendanceForm,
                        status:
                          e.target
                            .value,
                      }
                    )
                  }
                  required
                >
                  <option value="PRESENT">
                    Present
                  </option>

                  <option value="ABSENT">
                    Absent
                  </option>

                  <option value="LATE">
                    Late
                  </option>

                  <option value="EXCUSED">
                    Excused
                  </option>
                </select>
              </Field>

              <Field label="Remarks">
                <textarea
                  value={
                    attendanceForm.remarks
                  }
                  onChange={(e) =>
                    setAttendanceForm(
                      {
                        ...attendanceForm,
                        remarks:
                          e.target
                            .value,
                      }
                    )
                  }
                  rows="3"
                  placeholder="Optional remarks"
                />
              </Field>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() =>
                    setModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="primary"
                  type="submit"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </Page>
  );
}