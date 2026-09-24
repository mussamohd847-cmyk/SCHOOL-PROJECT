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

const blank = {
  admissionNo: "",
  firstName: "",
  lastName: "",
  gender: "Male",
  dob: "",
  pob: "Zanzibar",
  guardianName: "",
  guardianPhone: "",
  address: "",
  emergencyContact: "",
  admissionDate: new Date()
    .toISOString()
    .slice(0, 10),
  status: "active",
  inSchool: true,
  inMadrasa: false,
  schoolClassId: "",
  schoolStreamId: "",
  madrasaClassId: "",
};

export default function Students() {
  const {
    data,
    loading,
    load,
  } = useData("students");

  const [q, setQ] = useState("");
  const [form, setForm] = useState(blank);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);

  const save = async (e) => {
    e.preventDefault();

    try {
      if (edit) {
        await api.put(
          `/students/${edit.id}`,
          form
        );
      } else {
        await api.post(
          "/students",
          form
        );
      }

      setModal(false);
      setEdit(null);
      setForm(blank);
      load();
    } catch (e) {
      alert(
        e.response?.data?.error ||
          "Save failed"
      );
    }
  };

  const del = async (id) => {
    if (confirm("Delete this student?")) {
      try {
        await api.delete(
          `/students/${id}`
        );

        load();
      } catch (e) {
        alert(
          e.response?.data?.error ||
            "Delete failed"
        );
      }
    }
  };

  const rows = data.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.admissionNo}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <Page
      title="Students"
      subtitle="Central student records for School and Madrasa"
      actions={
        <button
          className="primary"
          onClick={() => {
            setForm(blank);
            setEdit(null);
            setModal(true);
          }}
        >
          + Add Student
        </button>
      }
    >
      <Card>
        <div className="toolbar">
          <input
            placeholder="Search name or admission no…"
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
          />

          <span>
            {rows.length} students
          </span>
        </div>

        {loading ? (
          <div className="loading">
            Loading…
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
                key: "firstName",
                label: "First Name",
              },
              {
                key: "lastName",
                label: "Last Name",
              },
              {
                key: "gender",
                label: "Gender",
              },
              {
                key: "dob",
                label: "Date of Birth",
              },
              {
                key: "status",
                label: "Status",
                render: (r) => (
                  <span className="badge">
                    {r.status}
                  </span>
                ),
              },
              {
                key: "inSchool",
                label: "School",
                render: (r) =>
                  r.inSchool
                    ? "Yes"
                    : "No",
              },
              {
                key: "inMadrasa",
                label: "Madrasa",
                render: (r) =>
                  r.inMadrasa
                    ? "Yes"
                    : "No",
              },
            ]}
            actions={(r) => (
              <>
                <button
                  className="icon"
                  onClick={() => {
                    setForm({
                      ...r,
                    });
                    setEdit(r);
                    setModal(true);
                  }}
                >
                  ✎
                </button>

                <button
                  className="icon danger"
                  onClick={() =>
                    del(r.id)
                  }
                >
                  🗑
                </button>
              </>
            )}
          />
        )}
      </Card>

      {modal && (
        <Modal
          title={
            edit
              ? "Edit Student"
              : "Add Student"
          }
          onClose={() =>
            setModal(false)
          }
        >
          <form
            onSubmit={save}
            className="form-grid"
          >
            {Object.entries({
              admissionNo:
                "Admission No.",
              firstName:
                "First Name",
              lastName:
                "Last Name",
              gender:
                "Gender",
              dob:
                "Date of Birth",
              pob:
                "Place of Birth",
              guardianName:
                "Guardian Name",
              guardianPhone:
                "Guardian Phone",
              address:
                "Address",
              emergencyContact:
                "Emergency Contact",
              admissionDate:
                "Admission Date",
            }).map(([key, label]) => (
              <Field
                key={key}
                label={label}
              >
                <input
                  type={
                    key.includes("Date") ||
                    key === "dob"
                      ? "date"
                      : "text"
                  }
                  value={
                    form[key] ?? ""
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]:
                        e.target.value,
                    })
                  }
                  required={[
                    "firstName",
                    "lastName",
                    "gender",
                    "dob",
                  ].includes(key)}
                />
              </Field>
            ))}

            <Field label="School">
              <select
                value={
                  form.inSchool
                    ? "1"
                    : "0"
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    inSchool:
                      e.target.value ===
                      "1",
                  })
                }
              >
                <option value="1">
                  Enrolled
                </option>

                <option value="0">
                  Not enrolled
                </option>
              </select>
            </Field>

            <Field label="Madrasa">
              <select
                value={
                  form.inMadrasa
                    ? "1"
                    : "0"
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    inMadrasa:
                      e.target.value ===
                      "1",
                  })
                }
              >
                <option value="0">
                  Not enrolled
                </option>

                <option value="1">
                  Enrolled
                </option>
              </select>
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
                Save Student
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}