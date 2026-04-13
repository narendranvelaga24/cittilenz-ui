import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCitizen } from "../../api/auth.api";
import { AnimatedCharactersPanel } from "../../components/auth/AnimatedCharactersPanel.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { errorMessage } from "../../lib/apiResponse";
import { pushRouteToast } from "../../lib/toast";

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

    // Validate all required fields
    if (!form.username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!form.mobile.trim()) {
      setError("Mobile number is required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerCitizen(form);
      pushRouteToast("Sign up successful. Please log in.");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = errorMessage(err);
      // Distinguish error types per contract
      if (err.response?.status === 400) {
        setError(msg || "Registration failed. Please check your details and try again.");
      } else {
        setError(msg || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <div className="auth-illustration">
          <div className="auth-illustration-header">
            <div className="auth-brand-chip">
              <span className="auth-brand-mark auth-brand-mark-dark">
                <Sparkles className="auth-brand-icon auth-brand-icon-light" />
              </span>
              <span>Cittilenz</span>
            </div>
          </div>

          <AnimatedCharactersPanel />
        </div>

        <div className="auth-form-area">
          <div className="auth-form-panel auth-form-panel-wide">
            <div className="auth-mobile-brand">
              <div className="auth-brand-mark auth-brand-mark-light">
                <Sparkles className="auth-brand-icon auth-brand-icon-dark" />
              </div>
              <span>Cittilenz</span>
            </div>

            <div className="auth-heading-block">
              <h1>Create your account</h1>
              <p>Please enter your details</p>
            </div>

            {error && (
              <div className="auth-error-block">
                <Alert tone="danger">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form auth-form-grid">
              <div className="auth-field-group">
                <label htmlFor="username">Username</label>
                <input id="username" value={form.username} onChange={(event) => update("username", event.target.value)} required />
              </div>

              <div className="auth-field-group">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" value={form.fullName} onChange={(event) => update("fullName", event.target.value)} required />
              </div>

              <div className="auth-field-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
              </div>

              <div className="auth-field-group">
                <label htmlFor="mobile">Mobile</label>
                <input id="mobile" value={form.mobile} onChange={(event) => update("mobile", event.target.value)} required />
              </div>

              <div className="auth-field-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} required />
              </div>

              <div className="auth-field-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" type="password" minLength={8} value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} required />
              </div>

              <button type="submit" className="primary-button auth-submit auth-submit-wide" disabled={loading || !form.username.trim() || !form.fullName.trim() || !form.email.trim() || !form.mobile.trim() || form.password.length < 8 || form.password !== form.confirmPassword}>
                {loading ? "Creating..." : "Register"}
              </button>
            </form>

            <div className="auth-switch-row">
              <span>Already have an account?</span>
              <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}