import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/auth.api";
import { AnimatedCharactersPanel } from "../../components/auth/AnimatedCharactersPanel.jsx";
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
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState({ message: "", tone: "info" });
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotForm, setForgotForm] = useState({ identifier: "", newPassword: "", confirmPassword: "" });
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    setIsTyping(Boolean(form.identifier || form.password));
  }, [form.identifier, form.password]);

  useEffect(() => {
    const queuedToast = popRouteToast();
    if (queuedToast) setToast({ message: queuedToast, tone: "success" });
  }, []);

  useEffect(() => {
    if (!toast.message) return undefined;
    const timer = window.setTimeout(() => setToast({ message: "", tone: "info" }), 2500);
    return () => window.clearTimeout(timer);
  }, [toast.message]);

  function showToast(message, tone = "info") {
    setToast({ message, tone });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Validate identifier: not blank
    if (!form.identifier.trim()) {
      showToast("Please enter email or username.", "danger");
      return;
    }

    // Validate password: minimum 8 characters per contract
    if (form.password.length < 8) {
      showToast("Password must be at least 8 characters.", "danger");
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
        showToast(msg || "Invalid credentials. Please check email, username, and password.", "danger");
      } else if (err.response?.status === 401) {
        showToast("Session expired. Please log in again.", "danger");
      } else {
        showToast(msg || "Login failed. Please try again.", "danger");
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
      setForgotLoading(false);
    }
  }

  async function handleForgotSubmit(event) {
    event.preventDefault();

    if (!forgotForm.identifier.trim()) {
      showToast("Enter your username or email.", "danger");
      return;
    }
    if (forgotForm.newPassword.length < 8) {
      showToast("New password must be at least 8 characters.", "danger");
      return;
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      showToast("Passwords do not match.", "danger");
      return;
    }

    setForgotLoading(true);
    try {
      const nextIdentifier = forgotForm.identifier.trim();
      await forgotPassword({
        identifier: nextIdentifier,
        newPassword: forgotForm.newPassword,
        confirmPassword: forgotForm.confirmPassword,
      });
      setForm((current) => ({ ...current, identifier: nextIdentifier, password: "" }));
      showToast("Password reset successful. You can log in with the new password now.", "success");
      closeForgotDialog(false);
    } catch (err) {
      showToast(errorMessage(err) || "Unable to reset password. Please try again.", "danger");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <ToastNotification message={toast.message} tone={toast.tone} />
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
