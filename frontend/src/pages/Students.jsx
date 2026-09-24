import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import {
  Page,
  Card,
  Table,
  Modal,
  Field,
} from "../components/Page";


const today = new Date()
  .toISOString()
  .slice(0, 10);


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


export default function Students() {

  const [students, setStudents] = useState([]);

  const [classes, setClasses] = useState([]);

  const [streams, setStreams] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [q, setQ] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [sectionFilter, setSectionFilter] =
    useState("");

  const [modal, setModal] =
    useState(false);

  const [edit, setEdit] =
    useState(null);

  const [form, setForm] =
    useState(blank);


  // ==========================================================
  // LOAD STUDENTS
  // ==========================================================

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

        setStudents(response.data);

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


  // ==========================================================
  // LOAD CLASSES + STREAMS
  // ==========================================================

  const loadMeta = async () => {

    try {

      const response =
        await api.get("/students/meta");

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


  useEffect(() => {

    loadStudents();

    loadMeta();

  }, []);


  // ==========================================================
  // FILTERED CLASSES
  // ==========================================================

  const schoolClasses = useMemo(
    () =>
      classes.filter(
        (item) =>
          item.section === "school"
      ),
    [classes]
  );


  const madrasaClasses = useMemo(
    () =>
      classes.filter(
        (item) =>
          item.section === "madrasa"
      ),
    [classes]
  );


  // ==========================================================
  // FILTERED STREAMS
  // ==========================================================

  const schoolStreams = useMemo(
    () => {

      if (!form.schoolClassId) {
        return [];
      }

      return streams.filter(
        (item) =>
          Number(item.class_id) ===
          Number(form.schoolClassId)
      );

    },
    [streams, form.schoolClassId]
  );


  const madrasaStreams = useMemo(
    () => {

      if (!form.madrasaClassId) {
        return [];
      }

      return streams.filter(
        (item) =>
          Number(item.class_id) ===
          Number(form.madrasaClassId)
      );

    },
    [streams, form.madrasaClassId]
  );


  // ==========================================================
  // SEARCH + FILTER
  // ==========================================================

  const rows = useMemo(() => {

    const search =
      q.trim().toLowerCase();

    return students.filter(
      (student) => {

        const fullName =
          `${student.firstName || ""} ${
            student.middleName || ""
          } ${
            student.lastName || ""
          }`.toLowerCase();

        const admissionNo =
          String(
            student.admissionNo || ""
          ).toLowerCase();

        const matchesSearch =
          !search ||
          fullName.includes(search) ||
          admissionNo.includes(search);

        const matchesStatus =
          !statusFilter ||
          student.status === statusFilter;

        const matchesSection =
          !sectionFilter ||
          (
            sectionFilter === "school" &&
            student.inSchool
          ) ||
          (
            sectionFilter === "madrasa" &&
            student.inMadrasa
          );

        return (
          matchesSearch &&
          matchesStatus &&
          matchesSection
        );
      }
    );

  }, [
    students,
    q,
    statusFilter,
    sectionFilter,
  ]);


  // ==========================================================
  // OPEN ADD
  // ==========================================================

  const openAdd = () => {

    setForm({
      ...blank,
      admissionDate: today,
    });

    setEdit(null);

    setModal(true);
  };


  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const openEdit = (student) => {

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
        student.placeOfBirth || "",

      phone:
        student.phone || "",

      email:
        student.email || "",

      address:
        student.address || "",

      parentName:
        student.parentName || "",

      parentPhone:
        student.parentPhone || "",

      parentEmail:
        student.parentEmail || "",

      emergencyContact:
        student.emergencyContact || "",

      admissionDate:
        student.admissionDate || today,

      status:
        student.status || "active",

      inSchool:
        Boolean(student.inSchool),

      schoolClassId:
        student.schoolClassId || "",

      schoolStreamId:
        student.schoolStreamId || "",

      inMadrasa:
        Boolean(student.inMadrasa),

      madrasaClassId:
        student.madrasaClassId || "",

      madrasaStreamId:
        student.madrasaStreamId || "",
    });

    setEdit(student);

    setModal(true);
  };


  // ==========================================================
  // SAVE
  // ==========================================================

  const save = async (event) => {

    event.preventDefault();

    if (!form.admissionNo.trim()) {

      alert(
        "Admission number is required."
      );

      return;
    }

    if (!form.firstName.trim()) {

      alert(
        "First name is required."
      );

      return;
    }

    if (!form.lastName.trim()) {

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
        form.middleName.trim() || null,

      lastName:
        form.lastName.trim(),

      gender:
        form.gender,

      dateOfBirth:
        form.dateOfBirth || null,

      placeOfBirth:
        form.placeOfBirth.trim() || null,

      phone:
        form.phone.trim() || null,

      email:
        form.email.trim() || null,

      address:
        form.address.trim() || null,

      parentName:
        form.parentName.trim() || null,

      parentPhone:
        form.parentPhone.trim() || null,

      parentEmail:
        form.parentEmail.trim() || null,

      emergencyContact:
        form.emergencyContact.trim() || null,

      admissionDate:
        form.admissionDate,

      status:
        form.status,

      inSchool:
        Boolean(form.inSchool),

      schoolClassId:
        form.schoolClassId
          ? Number(form.schoolClassId)
          : null,

      schoolStreamId:
        form.schoolStreamId
          ? Number(form.schoolStreamId)
          : null,

      inMadrasa:
        Boolean(form.inMadrasa),

      madrasaClassId:
        form.madrasaClassId
          ? Number(form.madrasaClassId)
          : null,

      madrasaStreamId:
        form.madrasaStreamId
          ? Number(form.madrasaStreamId)
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

      setForm(blank);

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


  // ==========================================================
  // DELETE
  // ==========================================================

  const deleteStudent = async (id) => {

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


  // ==========================================================
  // CLASS NAME
  // ==========================================================

  const className = (id) => {

    const item =
      classes.find(
        (item) =>
          Number(item.id) ===
          Number(id)
      );

    return item?.name || "—";
  };


  // ==========================================================
  // STREAM NAME
  // ==========================================================

  const streamName = (id) => {

    const item =
      streams.find(
        (item) =>
          Number(item.id) ===
          Number(id)
      );

    return item?.name || "—";
  };


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Page
      title="Students"
      subtitle="Central student records for School and Madrasa"
      actions={
        <button
          className="primary"
          onClick={openAdd}
        >
          + Add Student
        </button>
      }
    >

      <Card>

        {/* ==================================================
            TOOLBAR
        ================================================== */}

        <div
          className="toolbar"
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >

          <input
            style={{
              flex: "1",
              minWidth: "240px",
            }}
            placeholder="Search name or admission no..."
            value={q}
            onChange={(event) =>
              setQ(event.target.value)
            }
          />


          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="">
              All Status
            </option>

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


          <select
            value={sectionFilter}
            onChange={(event) =>
              setSectionFilter(
                event.target.value
              )
            }
          >
            <option value="">
              School + Madrasa
            </option>

            <option value="school">
              School
            </option>

            <option value="madrasa">
              Madrasa
            </option>
          </select>


          <span>
            {rows.length} students
          </span>

        </div>


        {/* ==================================================
            TABLE
        ================================================== */}

        {loading ? (

          <div className="loading">
            Loading students...
          </div>

        ) : (

          <Table
            rows={rows}
            columns={[
              {
                key: "admissionNo",
                label: "Admission No.",
              },

              {
                key: "name",
                label: "Student Name",
                render: (student) =>
                  `${student.firstName || ""} ${
                    student.middleName || ""
                  } ${
                    student.lastName || ""
                  }`.replace(
                    /\s+/g,
                    " "
                  ).trim(),
              },

              {
                key: "gender",
                label: "Gender",
              },

              {
                key: "dateOfBirth",
                label: "Date of Birth",
                render: (student) =>
                  student.dateOfBirth ||
                  "—",
              },

              {
                key: "schoolClass",
                label: "School",
                render: (student) =>
                  student.inSchool
                    ? className(
                        student.schoolClassId
                      )
                    : "No",
              },

              {
                key: "madrasaClass",
                label: "Madrasa",
                render: (student) =>
                  student.inMadrasa
                    ? className(
                        student.madrasaClassId
                      )
                    : "No",
              },

              {
                key: "status",
                label: "Status",
                render: (student) => (
                  <span className="badge">
                    {student.status}
                  </span>
                ),
              },
            ]}
            actions={(student) => (
              <>
                <button
                  className="icon"
                  title="Edit Student"
                  onClick={() =>
                    openEdit(student)
                  }
                >
                  ✎
                </button>

                <button
                  className="icon danger"
                  title="Delete Student"
                  onClick={() =>
                    deleteStudent(
                      student.id
                    )
                  }
                >
                  🗑
                </button>
              </>
            )}
          />

        )}

      </Card>


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

            {/* ==============================================
                BASIC INFORMATION
            ============================================== */}

            <Field label="Admission No.">

              <input
                type="text"
                value={
                  form.admissionNo
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    admissionNo:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    firstName:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    middleName:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    lastName:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    gender:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    dateOfBirth:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    placeOfBirth:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    phone:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    email:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    address:
                      event.target.value,
                  })
                }
              />

            </Field>


            {/* ==============================================
                PARENT
            ============================================== */}

            <Field label="Parent / Guardian Name">

              <input
                type="text"
                value={
                  form.parentName
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    parentName:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    parentPhone:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    parentEmail:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    emergencyContact:
                      event.target.value,
                  })
                }
              />

            </Field>


            {/* ==============================================
                ADMISSION
            ============================================== */}

            <Field label="Admission Date">

              <input
                type="date"
                value={
                  form.admissionDate
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    admissionDate:
                      event.target.value,
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    status:
                      event.target.value,
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


            {/* ==============================================
                SCHOOL
            ============================================== */}

            <div
              style={{
                gridColumn: "1 / -1",
                marginTop: "10px",
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    inSchool:
                      event.target.value ===
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    schoolClassId:
                      event.target.value,
                    schoolStreamId: "",
                  })
                }
              >

                <option value="">
                  Select Class
                </option>

                {schoolClasses.map(
                  (item) => (

                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    schoolStreamId:
                      event.target.value,
                  })
                }
              >

                <option value="">
                  Select Stream
                </option>

                {schoolStreams.map(
                  (item) => (

                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>

                  )
                )}

              </select>

            </Field>


            {/* ==============================================
                MADRASA
            ============================================== */}

            <div
              style={{
                gridColumn: "1 / -1",
                marginTop: "10px",
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    inMadrasa:
                      event.target.value ===
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    madrasaClassId:
                      event.target.value,
                    madrasaStreamId: "",
                  })
                }
              >

                <option value="">
                  Select Class
                </option>

                {madrasaClasses.map(
                  (item) => (

                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    madrasaStreamId:
                      event.target.value,
                  })
                }
              >

                <option value="">
                  Select Stream
                </option>

                {madrasaStreams.map(
                  (item) => (

                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>

                  )
                )}

              </select>

            </Field>


            {/* ==============================================
                ACTIONS
            ============================================== */}

            <div
              className="form-actions"
              style={{
                gridColumn: "1 / -1",
              }}
            >

              <button
                type="button"
                onClick={() =>
                  setModal(false)
                }
                disabled={saving}
              >
                Cancel
              </button>


              <button
                className="primary"
                type="submit"
                disabled={saving}
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