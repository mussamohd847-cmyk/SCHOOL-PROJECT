import React from "react";
import {
  Page,
  Card,
  Table,
  useData,
} from "../components/Page";

export default function Madrasa() {
  const {
    data: students,
  } = useData("students");

  const {
    data: subjects,
  } = useData("subjects");

  const {
    data: results,
  } = useData("results");

  const ms = students.filter(
    (s) => s.inMadrasa
  );

  return (
    <Page
      title="Madrasa"
      subtitle="Madrasa enrolment and results"
    >
      <div className="grid2">
        <Card>
          <h2>Madrasa Students</h2>

          <Table
            rows={ms}
            columns={[
              {
                key: "admissionNo",
                label: "Admission No.",
              },
              {
                key: "firstName",
                label: "Name",
                render: (r) =>
                  `${r.firstName} ${r.lastName}`,
              },
              {
                key: "madrasaClassId",
                label: "Class",
              },
              {
                key: "status",
                label: "Status",
              },
            ]}
          />
        </Card>

        <Card>
          <h2>Madrasa Subjects</h2>

          <Table
            rows={subjects.filter(
              (s) => s.section === "madrasa"
            )}
            columns={[
              {
                key: "code",
                label: "Code",
              },
              {
                key: "name",
                label: "Subject",
              },
            ]}
          />
        </Card>
      </div>

      <Card>
        <h2>Madrasa Results</h2>

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
              key: "total",
              label: "Mark",
            },
            {
              key: "grade",
              label: "Grade",
            },
          ]}
        />
      </Card>
    </Page>
  );
}
