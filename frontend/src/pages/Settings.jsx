import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Page, Card, Field } from "../components/Page";

const fields = [
  ["schoolName", "School Name"],
  ["shortName", "Short Name"],
  ["address", "Address"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["currency", "Currency"],
  ["receiptFooter", "Receipt Footer"],
];

const defaults = {
  schoolName: "Nimble Integrated Academy",
  shortName: "NIA",
  address: "",
  phone: "",
  email: "",
  currency: "TZS",
  receiptFooter: "Thank you.",
};

export default function Settings() {
  const [f, setF] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    api.get("/settings")
      .then(({ data }) => {
        if (!Array.isArray(data?.data)) {
          throw new Error("Unexpected settings response.");
        }
        const values = { ...defaults };
        data.data.forEach((item) => {
          const key = item.setting_key;
          if (Object.prototype.hasOwnProperty.call(values, key)) {
            values[key] = item.setting_value ?? "";
          }
        });
        if (active) setF(values);
      })
      .catch((e) => {
        if (active) {
          setFailed(true);
          setMsg(e.response?.data?.message || e.message || "Failed to load settings.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setFailed(false);

    try {
      const { data } = await api.get("/settings");
      if (!Array.isArray(data?.data)) {
        throw new Error("Unexpected settings response.");
      }

      const existing = new Map(data.data.map((item) => [item.setting_key, item]));

      for (const [key, label] of fields) {
        const payload = {
          setting_value: String(f[key] ?? ""),
          description: label,
        };

        if (existing.has(key)) {
          await api.put("/settings/" + encodeURIComponent(key), payload);
        } else {
          await api.post("/settings", {
            setting_key: key,
            ...payload,
          });
        }
      }

      setMsg("Settings saved successfully.");
    } catch (e) {
      setFailed(true);
      setMsg(e.response?.data?.message || e.response?.data?.error || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page title="Settings" subtitle="School information and system configuration">
      <Card>
        <form onSubmit={save} className="form-grid">
          {fields.map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                type={key === "email" ? "email" : "text"}
                value={f[key] ?? ""}
                disabled={loading || saving}
                onChange={(e) => setF((old) => ({ ...old, [key]: e.target.value }))}
              />
            </Field>
          ))}

          <div className="form-actions">
            <button className="primary" type="submit" disabled={loading || saving}>
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {msg && (
              <span role="status" style={{ color: failed ? "#b42318" : "#16803c" }}>
                {msg}
              </span>
            )}
          </div>
        </form>
      </Card>
    </Page>
  );
}
