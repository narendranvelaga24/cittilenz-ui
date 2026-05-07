import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/auth.api";
import { AnimatedCharactersPanel } from "../../components/auth/AnimatedCharactersPanel.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { Button } from "../../components/ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog.jsx";
import { ToastNotification } from "../../components/ui/ToastNotification.jsx";
import { errorMessage } from "../../lib/apiResponse";
import { getHomeForRole } from "../../lib/roles";
import { popRouteToast, pushRouteToast } from "../../lib/toast";
import { useAuth } from "./useAuth";

const LOGO_SRC = "/logo.png";

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
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotForm, setForgotForm] = useState({ identifier: "", newPassword: "", confirmPassword: "" });
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

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
      navigate("/welcome", {
        replace: true,
        state: {
          redirectTo: location.state?.from?.pathname || getHomeForRole(user.role),
        },
      });
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

  function updateForgot(field, value) {
    setForgotForm((current) => ({ ...current, [field]: value }));
  }

  function closeForgotDialog(open) {
    setForgotOpen(open);
    if (!open) {
      setForgotForm({ identifier: "", newPassword: "", confirmPassword: "" });
      setForgotError("");
      setForgotSuccess("");
      setForgotLoading(false);
    }
  }

  async function handleForgotSubmit(event) {
    event.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotForm.identifier.trim()) {
      setForgotError("Enter your username or email.");
      return;
    }
    if (forgotForm.newPassword.length < 8) {
      setForgotError("New password must be at least 8 characters.");
      return;
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    try {
      await forgotPassword({
        identifier: forgotForm.identifier.trim(),
        newPassword: forgotForm.newPassword,
        confirmPassword: forgotForm.confirmPassword,
      });
      setForgotSuccess("Password reset successful. You can log in with the new password now.");
      setToastMessage("Password reset successful");
      setForm((current) => ({ ...current, identifier: forgotForm.identifier.trim(), password: "" }));
    } catch (err) {
      setForgotError(errorMessage(err) || "Unable to reset password. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <ToastNotification message={toastMessage} role="status" ariaLive="polite" />
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

          <AnimatedCharactersPanel isTyping={isTyping} showPassword={showPassword} passwordLength={form.password.length} />
        </div>

        <div className="auth-form-area">
          <div className="auth-form-panel">
            <Link to="/" className="auth-mobile-brand-link">
              <div className="auth-mobile-brand">
                <div className="auth-brand-mark auth-brand-mark-light">
                  <img alt="Cittilenz logo" className="auth-brand-logo" height="28" src={LOGO_SRC} width="28" />
                </div>
                <span>Cittilenz</span>
              </div>
            </Link>

            <div className="auth-heading-block">
              <h1>Welcome back!</h1>
              <p>Please enter your details</p>
            </div>

            {error && (
              <div className="auth-error-block">
                <Alert tone="danger">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
                <button className="auth-link-button" onClick={() => setForgotOpen(true)} type="button">Forgot password?</button>
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
      <Dialog open={forgotOpen} onOpenChange={closeForgotDialog}>
        <DialogContent className="auth-reset-dialog">
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              Enter your username or email and set a new password.
            </DialogDescription>
          </DialogHeader>
          {forgotError && <Alert tone="danger">{forgotError}</Alert>}
          {forgotSuccess && <Alert tone="success">{forgotSuccess}</Alert>}
          <form className="form-grid" onSubmit={handleForgotSubmit} noValidate>
            <label>
              Username or email
              <input
                autoComplete="username"
                value={forgotForm.identifier}
                onChange={(event) => updateForgot("identifier", event.target.value)}
              />
            </label>
            <label>
              New password
              <input
                autoComplete="new-password"
                type="password"
                value={forgotForm.newPassword}
                onChange={(event) => updateForgot("newPassword", event.target.value)}
              />
            </label>
            <label>
              Confirm new password
              <input
                autoComplete="new-password"
                type="password"
                value={forgotForm.confirmPassword}
                onChange={(event) => updateForgot("confirmPassword", event.target.value)}
              />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => closeForgotDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={forgotLoading}>{forgotLoading ? "Resetting..." : "Reset password"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export const Component = LoginPage;
