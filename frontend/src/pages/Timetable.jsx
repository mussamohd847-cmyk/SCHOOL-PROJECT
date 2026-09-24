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

export default function Timetable() {
  const {
    data,
    load,
  } = useData("timetable");

  const {
    data: teachers,
  } = useData("teachers");

  const {
    data: subjects,
  } = useData("subjects");

  const {
    data: classes,
  } = useData("classes");

  const [modal, setModal] = useState(false);

  const [f, setF] = useState({
    teacherId: "",
    subjectId: "",
    classId: "",
    streamId: "",
    day: "Monday",
    startTime: "08:00",
    endTime: "09:00",
    room: "",
    section: "school",
  });

  const save = async (e) => {
    e.preventDefault();

    try {
      await api.post("/timetable", f);

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
      title="Timetable"
      subtitle="Teacher, subject, class and room scheduling"
      actions={
        <button
          className="primary"
          onClick={() => setModal(true)}
        >
          + Add Period
        </button>
      }
    >
      <Card>
        <Table
          rows={data}
          columns={[
            {
              key: "day",
              label: "Day",
            },
            {
              key: "startTime",
              label: "Start",
            },
            {
              key: "endTime",
              label: "End",
            },
            {
              key: "teacherId",
              label: "Teacher",
            },
            {
              key: "subjectId",
              label: "Subject",
            },
            {
              key: "classId",
              label: "Class",
            },
            {
              key: "room",
              label: "Room",
            },
            {
              key: "section",
              label: "Section",
            },
          ]}
          actions={(r) => (
            <button
              className="icon danger"
              onClick={async () => {
                if (
                  confirm(
                    "Delete period?"
                  )
                ) {
                  await api.delete(
                    `/timetable/${r.id}`
                  );

                  load();
                }
              }}
            >
              🗑
            </button>
          )}
        />
      </Card>

      {modal && (
        <Modal
          title="Add Timetable Period"
          onClose={() =>
            setModal(false)
          }
        >
          <form
            onSubmit={save}
            className="form-grid"
          >
            <Field label="Teacher">
              <select
                value={f.teacherId}
                onChange={(e) =>
                  setF({
                    ...f,
                    teacherId:
                      e.target.value,
                  })
                }
                required
              >
                <option value="">
                  Select
                </option>

                {teachers.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                  >
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Subject">
              <select
                value={f.subjectId}
                onChange={(e) =>
                  setF({
                    ...f,
                    subjectId:
                      e.target.value,
                  })
                }
                required
              >
                <option value="">
                  Select
                </option>

                {subjects.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                  >
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Class">
              <select
                value={f.classId}
                onChange={(e) =>
                  setF({
                    ...f,
                    classId:
                      e.target.value,
                  })
                }
                required
              >
                <option value="">
                  Select
                </option>

                {classes.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            {[
              ["day", "Day"],
              [
                "startTime",
                "Start Time",
              ],
              [
                "endTime",
                "End Time",
              ],
              ["room", "Room"],
            ].map(([key, label]) => (
              <Field
                key={key}
                label={label}
              >
                <input
                  type={
                    key.includes("Time")
                      ? "time"
                      : "text"
                  }
                  value={f[key]}
                  onChange={(e) =>
                    setF({
                      ...f,
                      [key]:
                        e.target.value,
                    })
                  }
                />
              </Field>
            ))}

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
                Save Period
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}