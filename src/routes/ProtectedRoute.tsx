import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: Array<"citizen" | "official" | "admin">;
  redirectPath?: string;
}

const ProtectedRoute = ({ allowedRoles = [], redirectPath = "/" }: ProtectedRouteProps) => {
  const { isAuthenticated: isLoggedIn, user } = useAuth();
  const userRole = user?.role;

  if (!isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(userRole!)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
