import React, {
  useEffect,
  useState,
} from "react";

import api from "../services/api";

import {
  Page,
  Card,
  Field,
} from "../components/Page";

export default function Settings() {
  const [f, setF] = useState({
    schoolName: "",
    shortName: "",
    address: "",
    phone: "",
    email: "",
    currency: "TZS",
    receiptFooter: "",
  });

  const [msg, setMsg] = useState("");

  useEffect(() => {
    api
      .get("/settings")
      .then((r) => setF(r.data));
  }, []);

  const save = async (e) => {
    e.preventDefault();

    try {
      await api.put("/settings", f);

      setMsg("Settings saved.");
    } catch (e) {
      setMsg(
        e.response?.data?.error ||
          "Save failed."
      );
    }
  };

  return (
    <Page
      title="Settings"
      subtitle="School information and system configuration"
    >
      <Card>
        <form
          onSubmit={save}
          className="form-grid"
        >
          {[
            ["schoolName", "School Name"],
            ["shortName", "Short Name"],
            ["address", "Address"],
            ["phone", "Phone"],
            ["email", "Email"],
            ["currency", "Currency"],
            [
              "receiptFooter",
              "Receipt Footer",
            ],
          ].map(([key, label]) => (
            <Field
              key={key}
              label={label}
            >
              <input
                value={f[key] || ""}
                onChange={(e) =>
                  setF({
                    ...f,
                    [key]: e.target.value,
                  })
                }
              />
            </Field>
          ))}

          <div className="form-actions">
            <button
              className="primary"
              type="submit"
            >
              Save Settings
            </button>

            {msg && (
              <span className="success">
                {msg}
              </span>
            )}
          </div>
        </form>
      </Card>
    </Page>
  );
}
