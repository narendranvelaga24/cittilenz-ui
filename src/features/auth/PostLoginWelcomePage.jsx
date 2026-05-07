import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SpecialText } from "@/components/ui/special-text";
import { getHomeForRole } from "../../lib/roles";
import { useAuth } from "./useAuth";

const GREETING_DURATION_MS = 1800;
const REDIRECT_DURATION_MS = 4200;

function getDisplayName(user) {
  const fullName = String(user?.fullName || "").trim();
  if (fullName) return fullName;

  const username = String(user?.username || "").trim();
  if (username) return username;

  const email = String(user?.email || "").trim();
  if (email) return email.split("@")[0];

  return "there";
}

export function PostLoginWelcomePage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState("greeting");
  const displayName = getDisplayName(user);

  const redirectTo = useMemo(() => {
    const nextPath = location.state?.redirectTo;
    if (typeof nextPath === "string" && nextPath.startsWith("/") && nextPath !== "/welcome") {
      return nextPath;
    }
    return getHomeForRole(user?.role);
  }, [location.state, user?.role]);

  const message = phase === "greeting" ? `Hi ${displayName}` : "Welcome to Cittilenz";

  useEffect(() => {
    const phaseTimer = window.setTimeout(() => setPhase("welcome"), GREETING_DURATION_MS);
    const redirectTimer = window.setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, REDIRECT_DURATION_MS);

    return () => {
      window.clearTimeout(phaseTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [navigate, redirectTo]);

  return (
    <main className="post-login-welcome" aria-live="polite">
      <SpecialText key={message} className="post-login-welcome__text" speed={18}>
        {message}
      </SpecialText>
    </main>
  );
}
