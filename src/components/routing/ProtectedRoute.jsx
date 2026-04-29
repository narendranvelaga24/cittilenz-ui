import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

export function ProtectedRoute({ roles }) {
  const { booting, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (booting) return <div className="screen-message">Restoring your session...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <div className="screen-message">Access denied for this account.</div>;
  }

  return <Outlet />;
}
