import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCitizen } from "../../api/auth.api";
import { AnimatedCharactersPanel } from "../../components/auth/AnimatedCharactersPanel.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { ToastNotification } from "../../components/ui/ToastNotification.jsx";
import { errorMessage } from "../../lib/apiResponse";
import { pushRouteToast } from "../../lib/toast";
import { isStrongPassword, isValidEmail, isValidIndianMobile } from "../../lib/validation";

const LOGO_SRC = "/logo.png";

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", fullName: "", email: "", mobile: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", tone: "danger" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!toast.message) return undefined;
    const timer = window.setTimeout(() => setToast({ message: "", tone: "danger" }), 3000);
    return () => window.clearTimeout(timer);
  }, [toast.message]);

  function showError(message) {
    setError(message);
    setToast({ message, tone: "danger" });
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // Validate all required fields
    if (!form.username.trim()) {
      showError("Username is required.");
      return;
    }
    if (/\s/.test(form.username)) {
      showError("Username must not contain spaces.");
      return;
    }
    if (!form.fullName.trim()) {
      showError("Full name is required.");
      return;
    }
    if (!form.email.trim()) {
      showError("Email is required.");
      return;
    }
    if (!isValidEmail(form.email)) {
      showError("Enter a valid email address.");
      return;
    }
    const normalizedMobile = form.mobile.trim();
    if (!normalizedMobile) {
      showError("Mobile number is required.");
      return;
    }
    if (!isValidIndianMobile(normalizedMobile)) {
      showError("Enter a valid mobile number (10 digits starting with 6-9).");
      return;
    }
    if (!isStrongPassword(form.password)) {
      showError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerCitizen({
        ...form,
        mobile: normalizedMobile,
      });
      pushRouteToast("Sign up successful. Please log in.");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = errorMessage(err);
      // Distinguish error types per contract
      if (err.response?.status === 400) {
        showError(msg || "Registration failed. Please check your details and try again.");
      } else {
        showError(msg || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <ToastNotification message={toast.message} tone={toast.tone} role="alert" ariaLive="assertive" />
      <div className="auth-layout">
        <div className="auth-illustration">
          <div className="auth-illustration-header">
            <Link to="/" className="auth-brand-chip-link">
              <div className="auth-brand-chip">
                <span className="auth-brand-mark auth-brand-mark-dark">
                  <img alt="Cittilenz logo" className="auth-brand-logo" height="28" src={LOGO_SRC} width="28" />
                </span>
                <span>Cittilenz</span>
              </div>
            </Link>
          </div>

          <AnimatedCharactersPanel />
        </div>

        <div className="auth-form-area">
          <div className="auth-form-panel auth-form-panel-wide">
            <Link to="/" className="auth-mobile-brand-link">
              <div className="auth-mobile-brand">
                <div className="auth-brand-mark auth-brand-mark-light">
                  <img alt="Cittilenz logo" className="auth-brand-logo" height="28" src={LOGO_SRC} width="28" />
                </div>
                <span>Cittilenz</span>
              </div>
            </Link>

            <div className="auth-heading-block">
              <h1>Create your account</h1>
              <p>Please enter your details</p>
            </div>

            {error && (
              <div className="auth-error-block">
                <Alert tone="danger">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form auth-form-grid" noValidate>
              <div className="auth-field-group">
                <label htmlFor="username">Username</label>
                <input id="username" value={form.username} onChange={(event) => update("username", event.target.value)} />
              </div>

              <div className="auth-field-group">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" value={form.fullName} onChange={(event) => update("fullName", event.target.value)} />
              </div>

              <div className="auth-field-group">
                <label htmlFor="email">Email</label>
                <input id="email" inputMode="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
              </div>

              <div className="auth-field-group">
                <label htmlFor="mobile">Mobile</label>
                <input
                  id="mobile"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.mobile}
                  onChange={(event) => update("mobile", event.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div className="auth-field-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} />
              </div>

              <div className="auth-field-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} />
              </div>

              <button type="submit" className="primary-button auth-submit auth-submit-wide" disabled={loading}>
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
