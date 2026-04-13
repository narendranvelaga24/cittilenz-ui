import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatedCharactersPanel } from "../../components/auth/AnimatedCharactersPanel.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { errorMessage } from "../../lib/apiResponse";
import { getHomeForRole } from "../../lib/roles";
import { popRouteToast, pushRouteToast } from "../../lib/toast";
import { useAuth } from "./useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setIsTyping(Boolean(form.identifier || form.password));
  }, [form.identifier, form.password]);

  useEffect(() => {
    const queuedToast = popRouteToast();
    if (queuedToast) setToastMessage(queuedToast);
  }, []);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // Validate identifier: not blank
    if (!form.identifier.trim()) {
      setError("Please enter email or username.");
      return;
    }

    // Validate password: minimum 8 characters per contract
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(form);
      pushRouteToast("Login successful");
      navigate(location.state?.from?.pathname || getHomeForRole(user.role), { replace: true });
    } catch (err) {
      const msg = errorMessage(err);
      // Distinguish error types per contract
      if (err.response?.status === 400) {
        setError(msg || "Invalid credentials. Please check email, username, and password.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError(msg || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      {toastMessage && <div className="toast-message" role="status" aria-live="polite">{toastMessage}</div>}
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

          <AnimatedCharactersPanel isTyping={isTyping} showPassword={showPassword} passwordLength={form.password.length} />
        </div>

        <div className="auth-form-area">
          <div className="auth-form-panel">
            <div className="auth-mobile-brand">
              <div className="auth-brand-mark auth-brand-mark-light">
                <Sparkles className="auth-brand-icon auth-brand-icon-dark" />
              </div>
              <span>Cittilenz</span>
            </div>

            <div className="auth-heading-block">
              <h1>Welcome back!</h1>
              <p>Please enter your details</p>
            </div>

            {error && (
              <div className="auth-error-block">
                <Alert tone="danger">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field-group">
                <label htmlFor="identifier">Email or Username</label>
                <input
                  id="identifier"
                  type="text"
                  placeholder="@gmail.com"
                  value={form.identifier}
                  autoComplete="off"
                  onChange={(event) => setForm({ ...form, identifier: event.target.value })}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  required
                />
              </div>

              <div className="auth-field-group">
                <label htmlFor="password">Password</label>
                <div className="auth-password-row">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    required
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="auth-password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="auth-toggle-icon" /> : <Eye className="auth-toggle-icon" />}
                  </button>
                </div>
              </div>

              <div className="auth-footer-row">
                <a href="#">Forgot password?</a>
              </div>

              <button
                type="submit"
                className="primary-button auth-submit"
                disabled={loading || !form.identifier.trim() || form.password.length < 8}
              >
                {loading ? "Signing in..." : "Log in"}
              </button>
            </form>

            <div className="auth-switch-row">
              <span>Don't have an account?</span>
              <Link to="/register">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export const Component = LoginPage;