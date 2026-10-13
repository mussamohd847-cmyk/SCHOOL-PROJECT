import React, { useMemo } from "react";
import {
  Page,
  Card,
  Table,
  useData,
  fmtMoney,
} from "../components/Page";

export default function Reports() {
  const {
    data: students,
  } = useData("students");

  const {
    data: payments,
  } = useData("payments");

  const {
    data: results,
  } = useData("results");

  const {
    data: attendance,
  } = useData("attendance");

  const collected = payments.reduce(
    (a, x) => a + Number(x.amount || 0),
    0
  );

  const present = attendance.filter(
    (x) => x.status === "Present"
  ).length;

  const print = () => window.print();

  return (
    <Page
      title="Reports"
      subtitle="Printable school and madrasa reports"
      actions={
        <button
          className="primary"
          onClick={print}
        >
          🖨 Print
        </button>
      }
    >
      <div className="stats">
        <div className="stat teal">
          <span>🎓</span>

          <div>
            <strong>
              {students.length}
            </strong>

            <small>
              Students
            </small>
          </div>
        </div>

        <div className="stat green">
          <span>💰</span>

          <div>
            <strong>
              {fmtMoney(collected)}
            </strong>

            <small>
              Fees Collected
            </small>
          </div>
        </div>

        <div className="stat blue">
          <span>📋</span>

          <div>
            <strong>
              {present}
            </strong>

            <small>
              Present Records
            </small>
          </div>
        </div>

        <div className="stat violet">
          <span>📚</span>

          <div>
            <strong>
              {results.length}
            </strong>

            <small>
              Result Records
            </small>
          </div>
        </div>
      </div>

      <Card>
        <h2>Student Report</h2>

        <Table
          rows={students}
          columns={[
            {
              key: "admissionNo",
              label: "Admission No.",
            },
            {
              key: "firstName",
              label: "Student",
              render: (r) =>
                `${r.firstName} ${r.lastName}`,
            },
            {
              key: "gender",
              label: "Gender",
            },
            {
              key: "dob",
              label: "DOB",
            },
            {
              key: "status",
              label: "Status",
            },
          ]}
        />
      </Card>
    </Page>
  );
}
