import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";

// Citizen Dashboard Pages
import CitizenDashboard from "@/pages/CitizenDashboard";
import DashboardHomeCitizen from "@/pages/citizen/DashboardHome";
import MyIssues from "@/pages/citizen/MyIssues";
import MapView from "@/pages/citizen/MapView";
import NotificationsCitizen from "@/pages/citizen/Notifications";
import ProfileCitizen from "@/pages/citizen/Profile";
import HelpCitizen from "@/pages/citizen/Help";

// Official Dashboard Pages
import OfficialDashboard from "@/pages/OfficialDashboard";
import DashboardHomeOfficial from "@/pages/official/DashboardHome";
import IssuesOfficial from "@/pages/official/Issues";
import IssueDetailOfficial from "@/pages/official/IssueDetail";
import MapAnalytics from "@/pages/official/MapAnalytics";
import Performance from "@/pages/official/Performance";
import NotificationsOfficial from "@/pages/official/Notifications";
import ProfileOfficial from "@/pages/official/Profile";

// Admin Dashboard Pages
import AdminDashboard from "@/pages/AdminDashboard";
import DashboardHomeAdmin from "@/pages/admin/DashboardHome";
import UsersAdmin from "@/pages/admin/Users";
import IssuesAdmin from "@/pages/admin/Issues";
import Departments from "@/pages/admin/Departments";
import Analytics from "@/pages/admin/Analytics";
import Settings from "@/pages/admin/Settings";
import AuditLogs from "@/pages/admin/AuditLogs";
import AI from "@/pages/admin/AI";

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
          <Route path="/citizen-dashboard" element={<CitizenDashboard />}> 
            <Route index element={<DashboardHomeCitizen />} />
            <Route path="my-issues" element={<MyIssues />} />
            <Route path="map" element={<MapView />} />
            <Route path="notifications" element={<NotificationsCitizen />} />
            <Route path="profile" element={<ProfileCitizen />} />
            <Route path="help" element={<HelpCitizen />} />
            <Route path="*" element={<Navigate to="/citizen-dashboard" replace />} />
          </Route>
        </Route>

        {/* Official Protected Routes with nested children */}
        <Route element={<ProtectedRoute allowedRoles={["official"]} />}>
          <Route path="/official-dashboard" element={<OfficialDashboard />}> 
            <Route index element={<DashboardHomeOfficial />} />
            <Route path="issues" element={<IssuesOfficial />} />
            <Route path="issues/:id" element={<IssueDetailOfficial />} />
            <Route path="map" element={<MapAnalytics />} />
            <Route path="performance" element={<Performance />} />
            <Route path="notifications" element={<NotificationsOfficial />} />
            <Route path="profile" element={<ProfileOfficial />} />
            <Route path="*" element={<Navigate to="/official-dashboard" replace />} />
          </Route>
        </Route>

        {/* Admin Protected Routes with nested children */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />}> 
            <Route index element={<DashboardHomeAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="issues" element={<IssuesAdmin />} />
            <Route path="departments" element={<Departments />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="ai" element={<AI />} />
            <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
          </Route>
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
