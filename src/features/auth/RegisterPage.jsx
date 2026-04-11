import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCitizen } from "../../api/auth.api";
import { Alert } from "../../components/ui/Alert.jsx";
import { errorMessage } from "../../lib/apiResponse";

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", fullName: "", email: "", mobile: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await registerCitizen(form);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <div className="eyebrow">Citizen registration</div>
        <h1>Create your account</h1>
        <p>Officials and ward superiors are created by the admin. This form always creates a citizen account.</p>
        {error && <Alert tone="danger">{error}</Alert>}
        <form onSubmit={handleSubmit} className="form-grid two">
          <label>Username<input value={form.username} onChange={(event) => update("username", event.target.value)} required /></label>
          <label>Full name<input value={form.fullName} onChange={(event) => update("fullName", event.target.value)} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required /></label>
          <label>Mobile<input value={form.mobile} onChange={(event) => update("mobile", event.target.value)} required /></label>
          <label>Password<input type="password" minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} required /></label>
          <label>Confirm password<input type="password" minLength={8} value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} required /></label>
          <button className="primary-button full" disabled={loading}>{loading ? "Creating..." : "Register"}</button>
        </form>
        <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
      </section>
    </main>
  );
}
