import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import { PageTransition } from "../components/routing/PageTransition.jsx";
import { ProtectedRoute } from "../components/routing/ProtectedRoute.jsx";
import { AdminDashboard } from "../features/admin/AdminDashboard.jsx";
import { AdminIssuesPage } from "../features/admin/AdminIssuesPage.jsx";
import { AdminIssueTypesPage } from "../features/admin/AdminIssueTypesPage.jsx";
import { AdminUsersPage } from "../features/admin/AdminUsersPage.jsx";
import { LoginPage } from "../features/auth/LoginPage.jsx";
import { RegisterPage } from "../features/auth/RegisterPage.jsx";
import { AnalyticsPage } from "../features/analytics/AnalyticsPage.jsx";
import { CitizenDashboard } from "../features/citizen/CitizenDashboard.jsx";
import { IssueDetailPage } from "../features/issues/IssueDetailPage.jsx";
import { MyIssuesPage } from "../features/issues/MyIssuesPage.jsx";
import { LandingPage } from "../features/landing/LandingPage.jsx";
import { OfficialDashboard } from "../features/official/OfficialDashboard.jsx";
import { OfficialIssuesPage } from "../features/official/OfficialIssuesPage.jsx";
import { ProfilePage } from "../features/profile/ProfilePage.jsx";
import { ReportIssuePage } from "../features/report/ReportIssuePage.jsx";
import { SuperiorDashboard } from "../features/superior/SuperiorDashboard.jsx";
import { SuperiorIssuesPage } from "../features/superior/SuperiorIssuesPage.jsx";

export const router = createBrowserRouter([
  { path: "/", element: <PageTransition><LandingPage /></PageTransition> },
  { path: "/login", element: <PageTransition><LoginPage /></PageTransition> },
  { path: "/register", element: <PageTransition><RegisterPage /></PageTransition> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/profile", element: <ProfilePage /> },
          {
            element: <ProtectedRoute roles={["CITIZEN"]} />,
            children: [
              { path: "/citizen/dashboard", element: <CitizenDashboard /> },
              { path: "/citizen/report-issue", element: <ReportIssuePage /> },
              { path: "/citizen/issues", element: <MyIssuesPage /> },
              { path: "/citizen/issues/:id", element: <IssueDetailPage /> },
            ],
          },
          {
            element: <ProtectedRoute roles={["OFFICIAL"]} />,
            children: [
              { path: "/official/dashboard", element: <OfficialDashboard /> },
              { path: "/official/issues", element: <OfficialIssuesPage /> },
              { path: "/official/issues/:id", element: <IssueDetailPage /> },
            ],
          },
          {
            element: <ProtectedRoute roles={["WARD_SUPERIOR"]} />,
            children: [
              { path: "/superior/dashboard", element: <SuperiorDashboard /> },
              { path: "/superior/issues", element: <SuperiorIssuesPage /> },
              { path: "/superior/issues/:id", element: <IssueDetailPage /> },
              { path: "/analytics", element: <AnalyticsPage /> },
            ],
          },
          {
            element: <ProtectedRoute roles={["ADMIN"]} />,
            children: [
              { path: "/admin/dashboard", element: <AdminDashboard /> },
              { path: "/admin/users", element: <AdminUsersPage /> },
              { path: "/admin/issue-types", element: <AdminIssueTypesPage /> },
              { path: "/admin/issues", element: <AdminIssuesPage /> },
              { path: "/admin/analytics", element: <AnalyticsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
