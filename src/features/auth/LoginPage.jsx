import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../../components/ui/Alert.jsx";
import { errorMessage } from "../../lib/apiResponse";
import { getHomeForRole } from "../../lib/roles";
import { useAuth } from "./useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      navigate(location.state?.from?.pathname || getHomeForRole(user.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="eyebrow">Civic issue reporting</div>
        <h1>Welcome back to Cittilenz</h1>
        <p>Sign in as a citizen, official, ward superior, or admin.</p>
        {error && <Alert tone="danger">{error}</Alert>}
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Username or email
            <input value={form.identifier} onChange={(event) => setForm({ ...form, identifier: event.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          <button className="primary-button" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        </form>
        <p className="muted">Citizen account? <Link to="/register">Create one here</Link></p>
      </section>
    </main>
  );
}
