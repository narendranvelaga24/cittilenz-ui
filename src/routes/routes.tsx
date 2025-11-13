import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";

// Citizen Dashboard Pages
import CitizenDashboard from "@/pages/CitizenDashboard";

// Official Dashboard Pages
import OfficialDashboard from "@/pages/OfficialDashboard";

// Admin Dashboard Pages
import AdminDashboard from "@/pages/AdminDashboard";

function AppRoutes() {
  const { isAuthenticated: isLoggedIn, user, initialized } = useAuth();
  const userRole = user?.role;

  // Avoid route flicker until auth state is initialized
  if (!initialized) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect logged-in users from home to their dashboard */}
        {isLoggedIn && (
          <Route
            path="/"
            element={
              userRole === "citizen" ? (
                <Navigate to="/citizen-dashboard" replace />
              ) : userRole === "official" ? (
                <Navigate to="/official-dashboard" replace />
              ) : userRole === "admin" ? (
                <Navigate to="/admin-dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        )}

        {/* Public Routes */}
        <Route
          path="/"
          element={isLoggedIn ? (
            userRole === "citizen" ? (
              <Navigate to="/citizen-dashboard" replace />
            ) : userRole === "official" ? (
              <Navigate to="/official-dashboard" replace />
            ) : (
              <Navigate to="/admin-dashboard" replace />
            )
          ) : (
            <Index />
          )}
        />
        <Route
          path="/login"
          element={isLoggedIn ? (
            userRole === "citizen" ? (
              <Navigate to="/citizen-dashboard" replace />
            ) : userRole === "official" ? (
              <Navigate to="/official-dashboard" replace />
            ) : (
              <Navigate to="/admin-dashboard" replace />
            )
          ) : (
            <Login />
          )}
        />
        <Route
          path="/register"
          element={isLoggedIn ? (
            userRole === "citizen" ? (
              <Navigate to="/citizen-dashboard" replace />
            ) : userRole === "official" ? (
              <Navigate to="/official-dashboard" replace />
            ) : (
              <Navigate to="/admin-dashboard" replace />
            )
          ) : (
            <Register />
          )}
        />

        {/* Unauthorized Route */}
        {isLoggedIn && (
          <Route
            path="/unauthorized"
            element={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
                  <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
              </div>
            }
          />
        )}

        {/* Citizen Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["citizen"]} />}>
          <Route path="/citizen-dashboard/*" element={<CitizenDashboard />} />
        </Route>

        {/* Official Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["official"]} />}>
          <Route path="/official-dashboard/*" element={<OfficialDashboard />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
