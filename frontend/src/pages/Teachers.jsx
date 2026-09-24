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
  const {
    data,
    load,
  } = useData("teachers");

  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);

  const blank = {
    teacherNo: "",
    name: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
    employmentDate: "",
    assignment: "school",
    status: "active",
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      if (edit) {
        await api.put(
          `/teachers/${edit.id}`,
          edit
        );
      } else {
        await api.post(
          "/teachers",
          edit || blank
        );
      }

      setModal(false);
      load();
    } catch (e) {
      alert(
        e.response?.data?.error ||
          "Save failed"
      );
    }
  };

  return (
    <Page
      title="Teachers & Staff"
      subtitle="Manage teaching staff and assignments"
      actions={
        <button
          className="primary"
          onClick={() => {
            setEdit(blank);
            setModal(true);
          }}
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
              key: "teacherNo",
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
          actions={(r) => (
            <>
              <button
                className="icon"
                onClick={() => {
                  setEdit({
                    ...r,
                  });
                  setModal(true);
                }}
              >
                ✎
              </button>

              <button
                className="icon danger"
                onClick={async () => {
                  if (
                    confirm(
                      "Delete teacher?"
                    )
                  ) {
                    await api.delete(
                      `/teachers/${r.id}`
                    );

                    load();
                  }
                }}
              >
                🗑
              </button>
            </>
          )}
        />
      </Card>

      {modal && (
        <Modal
          title={
            edit?.id
              ? "Edit Teacher"
              : "Add Teacher"
          }
          onClose={() =>
            setModal(false)
          }
        >
          <form
            onSubmit={save}
            className="form-grid"
          >
            {[
              [
                "teacherNo",
                "Teacher No.",
              ],
              ["name", "Name"],
              ["phone", "Phone"],
              ["email", "Email"],
              ["address", "Address"],
              [
                "employmentDate",
                "Employment Date",
              ],
            ].map(([key, label]) => (
              <Field
                key={key}
                label={label}
              >
                <input
                  type={
                    key ===
                    "employmentDate"
                      ? "date"
                      : "text"
                  }
                  value={
                    edit[key] || ""
                  }
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      [key]:
                        e.target.value,
                    })
                  }
                  required={
                    key === "name"
                  }
                />
              </Field>
            ))}

            <Field label="Gender">
              <select
                value={
                  edit.gender ||
                  "Male"
                }
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    gender:
                      e.target.value,
                  })
                }
              >
                <option>
                  Male
                </option>

                <option>
                  Female
                </option>
              </select>
            </Field>

            <Field label="Assignment">
              <select
                value={
                  edit.assignment ||
                  "school"
                }
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    assignment:
                      e.target.value,
                  })
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
                Save Teacher
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}