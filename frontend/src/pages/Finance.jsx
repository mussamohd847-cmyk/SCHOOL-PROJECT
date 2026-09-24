import React, { useState } from "react";
import api from "../services/api";
import {
  Page,
  Card,
  Table,
  Modal,
  Field,
  useData,
  fmtMoney,
} from "../components/Page";

export default function Finance() {
  const {
    data: payments,
    load,
  } = useData("payments");

  const {
    data: students,
  } = useData("students");

  const [modal, setModal] = useState(false);

  const [f, setF] = useState({
    studentId: "",
    amount: "",
    paymentDate: new Date()
      .toISOString()
      .slice(0, 10),
    method: "Cash",
    referenceNo: "",
    receiptNo: "",
    termId: "1",
    yearId: "1",
  });

  const save = async (e) => {
    e.preventDefault();

    try {
      await api.post("/payments", f);

      setModal(false);
      load();
    } catch (e) {
      alert(
        e.response?.data?.error ||
          "Save failed"
      );
    }
  };

  const total = payments.reduce(
    (a, x) => a + Number(x.amount || 0),
    0
  );

  return (
    <Page
      title="Finance"
      subtitle="Fees, payments and receipts"
      actions={
        <button
          className="primary"
          onClick={() => setModal(true)}
        >
          + Record Payment
        </button>
      }
    >
      <div className="stats">
        <div className="stat green">
          <span>💰</span>

          <div>
            <strong>
              {fmtMoney(total)}
            </strong>

            <small>
              Total Collected
            </small>
          </div>
        </div>

        <div className="stat blue">
          <span>🧾</span>

          <div>
            <strong>
              {payments.length}
            </strong>

            <small>
              Payments
            </small>
          </div>
        </div>
      </div>

      <Card>
        <Table
          rows={payments}
          columns={[
            {
              key: "receiptNo",
              label: "Receipt No.",
            },
            {
              key: "studentId",
              label: "Student ID",
            },
            {
              key: "amount",
              label: "Amount",
              render: (r) =>
                fmtMoney(r.amount),
            },
            {
              key: "date",
              label: "Date",
            },
            {
              key: "method",
              label: "Method",
            },
            {
              key: "reference",
              label: "Reference",
            },
          ]}
          actions={(r) => (
            <button
              className="icon danger"
              onClick={async () => {
                if (confirm("Delete payment?")) {
                  await api.delete(
                    `/payments/${r.id}`
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
          title="Record Payment"
          onClose={() => setModal(false)}
        >
          <form
            onSubmit={save}
            className="form-grid"
          >
            <Field label="Student">
              <select
                value={f.studentId}
                onChange={(e) =>
                  setF({
                    ...f,
                    studentId:
                      e.target.value,
                  })
                }
                required
              >
                <option value="">
                  Select student
                </option>

                {students.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                  >
                    {s.admissionNo} —{" "}
                    {s.firstName}{" "}
                    {s.lastName}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Amount">
              <input
                type="number"
                min="1"
                value={f.amount}
                onChange={(e) =>
                  setF({
                    ...f,
                    amount:
                      e.target.value,
                  })
                }
                required
              />
            </Field>

            <Field label="Payment Date">
              <input
                type="date"
                value={f.paymentDate}
                onChange={(e) =>
                  setF({
                    ...f,
                    paymentDate:
                      e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Method">
              <select
                value={f.method}
                onChange={(e) =>
                  setF({
                    ...f,
                    method:
                      e.target.value,
                  })
                }
              >
                <option>Cash</option>
                <option>Bank</option>
                <option>
                  Mobile Money
                </option>
              </select>
            </Field>

            <Field label="Receipt No.">
              <input
                value={f.receiptNo}
                onChange={(e) =>
                  setF({
                    ...f,
                    receiptNo:
                      e.target.value,
                  })
                }
                required
              />
            </Field>

            <Field label="Reference No.">
              <input
                value={f.referenceNo}
                onChange={(e) =>
                  setF({
                    ...f,
                    referenceNo:
                      e.target.value,
                  })
                }
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
                Save Payment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}
