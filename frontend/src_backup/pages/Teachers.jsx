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

export default function Teachers() {
  const { data, load } = useData("teachers");

  const blank = {
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
    specialization: "",
    employment_date: "",
    assignment: "school",
    status: "active",
  };

  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // ADD TEACHER
  // =====================================================

  const openAdd = () => {
    setEdit({ ...blank });
    setModal(true);
  };

  // =====================================================
  // EDIT TEACHER
  // =====================================================

  const openEdit = (teacher) => {
    setEdit({
      id: teacher.id,

      first_name:
        teacher.first_name || "",

      middle_name:
        teacher.middle_name || "",

      last_name:
        teacher.last_name || "",

      gender:
        teacher.gender || "Male",

      phone:
        teacher.phone || "",

      email:
        teacher.email || "",

      address:
        teacher.address || "",

      specialization:
        teacher.specialization || "",

      employment_date:
        teacher.employment_date ||
        teacher.employmentDate ||
        "",

      assignment:
        teacher.assignment || "school",

      status:
        teacher.status || "active",
    });

    setModal(true);
  };

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (key, value) => {
    setEdit((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // =====================================================
  // SAVE TEACHER
  // =====================================================

  const save = async (e) => {
    e.preventDefault();

    if (!edit) return;

    if (!edit.first_name?.trim()) {
      alert("First name is required.");
      return;
    }

    if (!edit.last_name?.trim()) {
      alert("Last name is required.");
      return;
    }

    if (!edit.gender) {
      alert("Gender is required.");
      return;
    }

    if (!edit.phone?.trim()) {
      alert("Phone is required.");
      return;
    }

    setSaving(true);

    try {
      // =================================================
      // DO NOT SEND:
      // employee_number
      // teacher_no
      // name
      //
      // BACKEND GENERATES THEM AUTOMATICALLY
      // =================================================

      const payload = {
        first_name:
          edit.first_name.trim(),

        middle_name:
          edit.middle_name?.trim() || null,

        last_name:
          edit.last_name.trim(),

        gender:
          edit.gender,

        phone:
          edit.phone.trim(),

        email:
          edit.email?.trim() || null,

        address:
          edit.address?.trim() || null,

        specialization:
          edit.specialization?.trim() || null,

        employment_date:
          edit.employment_date || null,

        assignment:
          edit.assignment || "school",

        status:
          edit.status || "active",
      };

      // =================================================
      // CREATE
      // =================================================

      if (!edit.id) {
        await api.post(
          "/teachers",
          payload
        );
      }

      // =================================================
      // UPDATE
      // =================================================

      else {
        await api.put(
          `/teachers/${edit.id}`,
          payload
        );
      }

      setModal(false);
      setEdit(null);

      await load();

    } catch (error) {
      console.error(
        "Teacher save error:",
        error
      );

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Save failed";

      alert(message);

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE TEACHER
  // =====================================================

  const deleteTeacher = async (teacher) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this teacher?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/teachers/${teacher.id}`
      );

      await load();

    } catch (error) {
      console.error(
        "Teacher delete error:",
        error
      );

      alert(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Delete failed"
      );
    }
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setModal(false);
    setEdit(null);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <Page
      title="Teachers & Staff"
      subtitle="Manage teaching staff and assignments"
      actions={
        <button
          className="primary"
          onClick={openAdd}
        >
          + Add Teacher
        </button>
      }
    >
      <Card>
        <Table
          rows={data}
          columns={[
            {
              key: "employee_number",
              label: "Employee No.",
            },
            {
              key: "teacher_no",
              label: "Teacher No.",
            },
            {
              key: "name",
              label: "Name",
            },
            {
              key: "gender",
              label: "Gender",
            },
            {
              key: "phone",
              label: "Phone",
            },
            {
              key: "email",
              label: "Email",
            },
            {
              key: "assignment",
              label: "Assignment",
            },
            {
              key: "status",
              label: "Status",
            },
          ]}
          actions={(row) => (
            <>
              <button
                className="icon"
                onClick={() =>
                  openEdit(row)
                }
                title="Edit teacher"
              >
                ✎
              </button>

              <button
                className="icon danger"
                onClick={() =>
                  deleteTeacher(row)
                }
                title="Delete teacher"
              >
                🗑
              </button>
            </>
          )}
        />
      </Card>

      {/* =================================================
          TEACHER MODAL
      ================================================= */}

      {modal && edit && (
        <Modal
          title={
            edit.id
              ? "Edit Teacher"
              : "Add Teacher"
          }
          onClose={closeModal}
        >
          <form
            onSubmit={save}
            className="form-grid"
          >

            {/* FIRST NAME */}

            <Field label="First Name">
              <input
                type="text"
                value={
                  edit.first_name || ""
                }
                onChange={(e) =>
                  handleChange(
                    "first_name",
                    e.target.value
                  )
                }
                required
              />
            </Field>

            {/* MIDDLE NAME */}

            <Field label="Middle Name">
              <input
                type="text"
                value={
                  edit.middle_name || ""
                }
                onChange={(e) =>
                  handleChange(
                    "middle_name",
                    e.target.value
                  )
                }
              />
            </Field>

            {/* LAST NAME */}

            <Field label="Last Name">
              <input
                type="text"
                value={
                  edit.last_name || ""
                }
                onChange={(e) =>
                  handleChange(
                    "last_name",
                    e.target.value
                  )
                }
                required
              />
            </Field>

            {/* GENDER */}

            <Field label="Gender">
              <select
                value={
                  edit.gender || "Male"
                }
                onChange={(e) =>
                  handleChange(
                    "gender",
                    e.target.value
                  )
                }
                required
              >
                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>
            </Field>

            {/* PHONE */}

            <Field label="Phone">
              <input
                type="text"
                value={
                  edit.phone || ""
                }
                onChange={(e) =>
                  handleChange(
                    "phone",
                    e.target.value
                  )
                }
                required
              />
            </Field>

            {/* EMAIL */}

            <Field label="Email">
              <input
                type="email"
                value={
                  edit.email || ""
                }
                onChange={(e) =>
                  handleChange(
                    "email",
                    e.target.value
                  )
                }
              />
            </Field>

            {/* ADDRESS */}

            <Field label="Address">
              <input
                type="text"
                value={
                  edit.address || ""
                }
                onChange={(e) =>
                  handleChange(
                    "address",
                    e.target.value
                  )
                }
              />
            </Field>

            {/* SPECIALIZATION */}

            <Field label="Specialization">
              <input
                type="text"
                value={
                  edit.specialization || ""
                }
                onChange={(e) =>
                  handleChange(
                    "specialization",
                    e.target.value
                  )
                }
              />
            </Field>

            {/* EMPLOYMENT DATE */}

            <Field label="Employment Date">
              <input
                type="date"
                value={
                  edit.employment_date || ""
                }
                onChange={(e) =>
                  handleChange(
                    "employment_date",
                    e.target.value
                  )
                }
              />
            </Field>

            {/* ASSIGNMENT */}

            <Field label="Assignment">
              <select
                value={
                  edit.assignment ||
                  "school"
                }
                onChange={(e) =>
                  handleChange(
                    "assignment",
                    e.target.value
                  )
                }
              >
                <option value="school">
                  School
                </option>

                <option value="madrasa">
                  Madrasa
                </option>

                <option value="both">
                  Both
                </option>
              </select>
            </Field>

            {/* STATUS */}

            <Field label="Status">
              <select
                value={
                  edit.status || "active"
                }
                onChange={(e) =>
                  handleChange(
                    "status",
                    e.target.value
                  )
                }
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </Field>

            {/* ACTIONS */}

            <div className="form-actions">
              <button
                type="button"
                onClick={closeModal}
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
                  : "Save Teacher"}
              </button>
            </div>

          </form>
        </Modal>
      )}
    </Page>
  );
}