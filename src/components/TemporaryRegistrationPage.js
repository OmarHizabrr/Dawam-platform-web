import { useMemo, useState } from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const COUNTRY_CODES = [
  { label: "🇾🇪 +967", value: "+967" },
  { label: "🇸🇦 +966", value: "+966" },
  { label: "🇦🇪 +971", value: "+971" },
  { label: "🇪🇬 +20", value: "+20" },
  { label: "🇰🇼 +965", value: "+965" },
];

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px",
    color: "#f8fafc",
    backgroundColor: "#0f172a",
    backgroundImage: "radial-gradient(circle at top right, #1e293b, #0f172a)",
    direction: "rtl",
    fontFamily: "Tajawal, Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "#1e293b",
    width: "100%",
    maxWidth: "500px",
    padding: "32px",
    borderRadius: "28px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  title: {
    textAlign: "center",
    fontSize: "1.75rem",
    marginBottom: "10px",
    color: "#60a5fa",
  },
  subtitle: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.95rem",
    marginBottom: "24px",
  },
  group: { marginBottom: "16px" },
  label: {
    display: "block",
    color: "#cbd5e1",
    marginBottom: "8px",
    fontSize: "0.9rem",
  },
  input: {
    width: "100%",
    background: "#334155",
    border: "1px solid transparent",
    padding: "12px 14px",
    borderRadius: "12px",
    color: "#f8fafc",
    fontSize: "0.95rem",
    outline: "none",
  },
  phoneRow: {
    display: "flex",
    gap: "10px",
    direction: "ltr",
  },
  code: { flex: "0 0 115px", textAlign: "center", cursor: "pointer" },
  phone: { flex: 1, direction: "rtl" },
  button: {
    width: "100%",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "8px",
  },
  notification: {
    marginTop: "14px",
    background: "#10b981",
    color: "#fff",
    padding: "12px 14px",
    borderRadius: "10px",
    textAlign: "center",
    fontSize: "0.95rem",
  },
  error: {
    marginTop: "14px",
    background: "#ef4444",
    color: "#fff",
    padding: "12px 14px",
    borderRadius: "10px",
    textAlign: "center",
    fontSize: "0.95rem",
  },
};

export default function TemporaryRegistrationPage() {
  const [form, setForm] = useState({
    name: "",
    jobId: "",
    code: "+967",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fullPhone = useMemo(
    () => `${form.code}${String(form.phone || "").trim()}`,
    [form.code, form.phone]
  );

  const onChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetForm = () => {
    setForm({ name: "", jobId: "", code: "+967", phone: "" });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await db.collection("users_temp").add({
        name: String(form.name || "").trim(),
        jobId: String(form.jobId || "").trim(),
        phone: fullPhone,
        countryCode: form.code,
        phoneWithoutCode: String(form.phone || "").trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      resetForm();
      setSuccessMessage("تم الإرسال بنجاح");
    } catch (error) {
      setErrorMessage("تعذر الإرسال حاليًا، حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>التسجيل الذكي</h1>
        <p style={styles.subtitle}>املأ بياناتك للانضمام إلى منصتنا الجديدة</p>

        <form onSubmit={onSubmit}>
          <div style={styles.group}>
            <label style={styles.label} htmlFor="temp-name">
              الاسم الرباعي الكامل
            </label>
            <input
              id="temp-name"
              type="text"
              required
              placeholder="مثال: محمد أحمد علي صالح"
              style={styles.input}
              value={form.name}
              onChange={onChange("name")}
            />
          </div>

          <div style={styles.group}>
            <label style={styles.label} htmlFor="temp-job-id">
              الرقم الوظيفي
            </label>
            <input
              id="temp-job-id"
              type="text"
              required
              placeholder="أدخل رقمك الوظيفي"
              style={styles.input}
              value={form.jobId}
              onChange={onChange("jobId")}
            />
          </div>

          <div style={styles.group}>
            <label style={styles.label} htmlFor="temp-phone">
              رقم الموبايل (المرتبط بالواتساب)
            </label>
            <div style={styles.phoneRow}>
              <select
                style={{ ...styles.input, ...styles.code }}
                value={form.code}
                onChange={onChange("code")}
              >
                {COUNTRY_CODES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
              <input
                id="temp-phone"
                type="tel"
                required
                placeholder="7XXXXXXXX"
                style={{ ...styles.input, ...styles.phone }}
                value={form.phone}
                onChange={onChange("phone")}
              />
            </div>
          </div>

          <button style={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جاري الإرسال..." : "إرسال البيانات"}
          </button>
        </form>

        {successMessage && <div style={styles.notification}>{successMessage}</div>}
        {errorMessage && <div style={styles.error}>{errorMessage}</div>}
      </div>
    </div>
  );
}
