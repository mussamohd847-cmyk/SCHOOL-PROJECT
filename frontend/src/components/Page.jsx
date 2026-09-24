import React, { useEffect, useState } from "react";
import api from "../services/api";

export function Page({ title, subtitle, children, actions }) {
  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className="actions">{actions}</div>
      </div>

      {children}
    </div>
  );
}

export function Card({ children }) {
  return <section className="card">{children}</section>;
}

export function Table({ columns, rows, actions }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}

            {actions && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {rows.length ? (
            rows.map((r, i) => (
              <tr key={r.id ?? i}>
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(r) : r[c.key] ?? "—"}
                  </td>
                ))}

                {actions && <td>{actions(r)}</td>}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="empty"
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-head">
          <h2>{title}</h2>

          <button onClick={onClose}>×</button>
        </div>

        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return <label className="field">{label}{children}</label>;
}

export function useData(collection) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);

    api
      .get("/bootstrap")
      .then((r) => setData(r.data[collection] || []))
      .catch((e) =>
        setError(e.response?.data?.error || "Could not load data.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return {
    data,
    setData,
    loading,
    error,
    load,
  };
}

export function fmtMoney(n) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
}