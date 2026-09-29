import React, { useEffect, useState } from "react";
import api from "../services/api";

/* =====================================================
   PAGE
===================================================== */

export function Page({
  title,
  subtitle,
  children,
  actions,
}) {
  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{title}</h1>

          {subtitle && (
            <p>{subtitle}</p>
          )}
        </div>

        <div className="actions">
          {actions}
        </div>
      </div>

      {children}
    </div>
  );
}

/* =====================================================
   CARD
===================================================== */

export function Card({ children }) {
  return (
    <section className="card">
      {children}
    </section>
  );
}

/* =====================================================
   TABLE
===================================================== */

export function Table({
  columns,
  rows = [],
  actions,
}) {
  const safeRows = Array.isArray(rows)
    ? rows
    : [];

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                {column.label}
              </th>
            ))}

            {actions && (
              <th>Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {safeRows.length > 0 ? (
            safeRows.map((row, index) => (
              <tr
                key={
                  row.id ??
                  row.employee_number ??
                  index
                }
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(row)
                      : row[column.key] ??
                        "—"}
                  </td>
                ))}

                {actions && (
                  <td>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (actions ? 1 : 0)
                }
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

/* =====================================================
   MODAL
===================================================== */

export function Modal({
  title,
  onClose,
  children,
}) {
  return (
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-head">
          <h2>{title}</h2>

          <button
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/* =====================================================
   FIELD
===================================================== */

export function Field({
  label,
  children,
}) {
  return (
    <label className="field">
      {label}
      {children}
    </label>
  );
}

/* =====================================================
   USE DATA
===================================================== */

export function useData(collection) {
  const [data, setData] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      /*
       * Each collection uses its own API endpoint.
       *
       * Example:
       * useData("teachers")
       *      -> GET /api/teachers
       *
       * useData("students")
       *      -> GET /api/students
       *
       * This prevents Teachers from depending
       * on /api/bootstrap.
       */

      const response = await api.get(
        `/${collection}`
      );

      const result = response?.data;

      /*
       * Standard API response:
       *
       * {
       *   success: true,
       *   data: [...]
       * }
       */

      if (
        result &&
        Array.isArray(result.data)
      ) {
        setData(result.data);
      }

      /*
       * Also support APIs that directly
       * return an array.
       */

      else if (
        Array.isArray(result)
      ) {
        setData(result);
      }

      /*
       * Unknown response format.
       */

      else {
        setData([]);
      }
    } catch (e) {
      console.error(
        `Failed to load ${collection}:`,
        e
      );

      setData([]);

      setError(
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        `Could not load ${collection}.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [collection]);

  return {
    data,
    setData,
    loading,
    error,
    load,
  };
}

/* =====================================================
   FORMAT MONEY
===================================================== */

export function fmtMoney(n) {
  return new Intl.NumberFormat(
    "en-TZ",
    {
      style: "currency",
      currency: "TZS",
      maximumFractionDigits: 0,
    }
  ).format(Number(n) || 0);
}