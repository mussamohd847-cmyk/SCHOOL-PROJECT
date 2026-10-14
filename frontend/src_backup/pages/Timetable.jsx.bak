import React, { useMemo, useState } from "react";
import api from "../services/api";
import {
  Page,
  Card,
  Table,
  Modal,
  Field,
  useData,
} from "../components/Page";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const LESSON_TYPES = [
  "SCHOOL",
  "MADRASA",
  "BREAK",
  "ACTIVITY",
];

const emptyForm = {
  day_of_week: "MONDAY",
  start_time: "08:00",
  end_time: "09:00",
  teacher_id: "",
  subject_id: "",
  class_id: "",
  stream_id: "",
  room: "",
  lesson_type: "SCHOOL",
};

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

  const {
    data: streams,
  } = useData("streams");

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState(emptyForm);

  const teacherMap = useMemo(
    () =>
      Object.fromEntries(
        teachers.map((t) => [
          t.id,
          t.name ||
            `${t.firstName || ""} ${t.middleName || ""} ${
              t.lastName || ""
            }`.trim() ||
            `Teacher #${t.id}`,
        ])
      ),
    [teachers]
  );

  const subjectMap = useMemo(
    () =>
      Object.fromEntries(
        subjects.map((s) => [
          s.id,
          s.name || `Subject #${s.id}`,
        ])
      ),
    [subjects]
  );

  const classMap = useMemo(
    () =>
      Object.fromEntries(
        classes.map((c) => [
          c.id,
          c.name || `Class #${c.id}`,
        ])
      ),
    [classes]
  );

  const streamMap = useMemo(
    () =>
      Object.fromEntries(
        streams.map((s) => [
          s.id,
          s.name || `Stream #${s.id}`,
        ])
      ),
    [streams]
  );

  const resetForm = () => {
    setF(emptyForm);
    setEditing(null);
  };

  const openAdd = () => {
    resetForm();
    setModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);

    setF({
      day_of_week: row.dayOfWeek || row.day_of_week || "MONDAY",
      start_time: row.startTime || row.start_time || "08:00",
      end_time: row.endTime || row.end_time || "09:00",
      teacher_id:
        row.teacherId ||
        row.teacher_id ||
        "",
      subject_id:
        row.subjectId ||
        row.subject_id ||
        "",
      class_id:
        row.classId ||
        row.class_id ||
        "",
      stream_id:
        row.streamId ||
        row.stream_id ||
        "",
      room: row.room || "",
      lesson_type:
        row.lessonType ||
        row.lesson_type ||
        "SCHOOL",
    });

    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();

    if (f.end_time <= f.start_time) {
      alert("End time must be after start time.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        day_of_week: f.day_of_week,
        start_time: f.start_time,
        end_time: f.end_time,
        teacher_id: f.teacher_id
          ? Number(f.teacher_id)
          : null,
        subject_id: f.subject_id
          ? Number(f.subject_id)
          : null,
        class_id: f.class_id
          ? Number(f.class_id)
          : null,
        stream_id: f.stream_id
          ? Number(f.stream_id)
          : null,
        room: f.room || null,
        lesson_type: f.lesson_type,
      };

      if (editing) {
        await api.put(
          `/timetable/${editing.id}`,
          payload
        );
      } else {
        await api.post(
          "/timetable",
          payload
        );
      }

      setModal(false);
      resetForm();
      load();
    } catch (e) {
      alert(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Failed to save timetable period."
      );
    } finally {
      setSaving(false);
    }
  };

  const deletePeriod = async (row) => {
    if (!confirm("Delete this timetable period?")) {
      return;
    }

    try {
      await api.delete(
        `/timetable/${row.id}`
      );

      load();
    } catch (e) {
      alert(
        e.response?.data?.error ||
          "Failed to delete timetable period."
      );
    }
  };

  const getDay = (row) =>
    row.dayOfWeek ||
    row.day_of_week ||
    row.day ||
    "";

  const getStart = (row) =>
    row.startTime ||
    row.start_time ||
    "";

  const getEnd = (row) =>
    row.endTime ||
    row.end_time ||
    "";

  const getTeacher = (row) => {
    const id =
      row.teacherId ||
      row.teacher_id;

    return id
      ? teacherMap[id] || `Teacher #${id}`
      : "-";
  };

  const getSubject = (row) => {
    const id =
      row.subjectId ||
      row.subject_id;

    return id
      ? subjectMap[id] || `Subject #${id}`
      : "-";
  };

  const getClass = (row) => {
    const id =
      row.classId ||
      row.class_id;

    return id
      ? classMap[id] || `Class #${id}`
      : "-";
  };

  const getStream = (row) => {
    const id =
      row.streamId ||
      row.stream_id;

    return id
      ? streamMap[id] || `Stream #${id}`
      : "-";
  };

  const getLessonType = (row) =>
    row.lessonType ||
    row.lesson_type ||
    "SCHOOL";

  return (
    <Page
      title="Timetable"
      subtitle="Teacher, subject, class and room scheduling"
      actions={
        <button
          className="primary"
          onClick={openAdd}
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
              render: (row) =>
                getDay(row),
            },
            {
              key: "start",
              label: "Start",
              render: (row) =>
                getStart(row),
            },
            {
              key: "end",
              label: "End",
              render: (row) =>
                getEnd(row),
            },
            {
              key: "teacher",
              label: "Teacher",
              render: (row) =>
                getTeacher(row),
            },
            {
              key: "subject",
              label: "Subject",
              render: (row) =>
                getSubject(row),
            },
            {
              key: "class",
              label: "Class",
              render: (row) =>
                getClass(row),
            },
            {
              key: "stream",
              label: "Stream",
              render: (row) =>
                getStream(row),
            },
            {
              key: "room",
              label: "Room",
              render: (row) =>
                row.room || "-",
            },
            {
              key: "lessonType",
              label: "Type",
              render: (row) =>
                getLessonType(row),
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
                className="icon"
                onClick={() =>
                  openEdit(row)
                }
                title="Edit"
              >
                ✏️
              </button>

              <button
                className="icon danger"
                onClick={() =>
                  deletePeriod(row)
                }
                title="Delete"
              >
                🗑
              </button>
            </div>
          )}
        />
      </Card>

      {modal && (
        <Modal
          title={
            editing
              ? "Edit Timetable Period"
              : "Add Timetable Period"
          }
          onClose={() => {
            setModal(false);
            resetForm();
          }}
        >
          <form
            onSubmit={save}
            className="form-grid"
          >
            <Field label="Day">
              <select
                value={f.day_of_week}
                onChange={(e) =>
                  setF({
                    ...f,
                    day_of_week:
                      e.target.value,
                  })
                }
                required
              >
                {DAYS.map((day) => (
                  <option
                    key={day}
                    value={day}
                  >
                    {day}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Start Time">
              <input
                type="time"
                value={f.start_time}
                onChange={(e) =>
                  setF({
                    ...f,
                    start_time:
                      e.target.value,
                  })
                }
                required
              />
            </Field>

            <Field label="End Time">
              <input
                type="time"
                value={f.end_time}
                onChange={(e) =>
                  setF({
                    ...f,
                    end_time:
                      e.target.value,
                  })
                }
                required
              />
            </Field>

            <Field label="Teacher">
              <select
                value={f.teacher_id}
                onChange={(e) =>
                  setF({
                    ...f,
                    teacher_id:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Select Teacher
                </option>

                {teachers.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                  >
                    {t.name ||
                      `${t.firstName || ""} ${
                        t.middleName || ""
                      } ${
                        t.lastName || ""
                      }`.trim() ||
                      `Teacher #${t.id}`}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Subject">
              <select
                value={f.subject_id}
                onChange={(e) =>
                  setF({
                    ...f,
                    subject_id:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Select Subject
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
                value={f.class_id}
                onChange={(e) =>
                  setF({
                    ...f,
                    class_id:
                      e.target.value,
                    stream_id: "",
                  })
                }
              >
                <option value="">
                  Select Class
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

            <Field label="Stream">
              <select
                value={f.stream_id}
                onChange={(e) =>
                  setF({
                    ...f,
                    stream_id:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Select Stream
                </option>

                {streams.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                  >
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Lesson Type">
              <select
                value={f.lesson_type}
                onChange={(e) =>
                  setF({
                    ...f,
                    lesson_type:
                      e.target.value,
                  })
                }
                required
              >
                {LESSON_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Room">
              <input
                type="text"
                value={f.room}
                placeholder="e.g. Room 01"
                onChange={(e) =>
                  setF({
                    ...f,
                    room: e.target.value,
                  })
                }
              />
            </Field>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setModal(false);
                  resetForm();
                }}
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
                  : editing
                  ? "Update Period"
                  : "Save Period"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}