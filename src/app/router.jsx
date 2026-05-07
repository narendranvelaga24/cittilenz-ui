import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import { PageTransition } from "../components/routing/PageTransition.jsx";
import { ProtectedRoute } from "../components/routing/ProtectedRoute.jsx";

const lazyNamed = (factory, exportName) =>
  lazy(() => factory().then((module) => ({ default: module[exportName] })));

const AdminDashboard = lazyNamed(() => import("../features/admin/AdminDashboard.jsx"), "AdminDashboard");
const AdminIssuesPage = lazyNamed(() => import("../features/admin/AdminIssuesPage.jsx"), "AdminIssuesPage");
const AdminIssueTypesPage = lazyNamed(() => import("../features/admin/AdminIssueTypesPage.jsx"), "AdminIssueTypesPage");
const AdminUsersPage = lazyNamed(() => import("../features/admin/AdminUsersPage.jsx"), "AdminUsersPage");
const LoginPage = lazyNamed(() => import("../features/auth/LoginPage.jsx"), "LoginPage");
const PostLoginWelcomePage = lazyNamed(() => import("../features/auth/PostLoginWelcomePage.jsx"), "PostLoginWelcomePage");
const RegisterPage = lazyNamed(() => import("../features/auth/RegisterPage.jsx"), "RegisterPage");
const AnalyticsPage = lazyNamed(() => import("../features/analytics/AnalyticsPage.jsx"), "AnalyticsPage");
const CitizenDashboard = lazyNamed(() => import("../features/citizen/CitizenDashboard.jsx"), "CitizenDashboard");
const IssueDetailPage = lazyNamed(() => import("../features/issues/IssueDetailPage.jsx"), "IssueDetailPage");
const MyIssuesPage = lazyNamed(() => import("../features/issues/MyIssuesPage.jsx"), "MyIssuesPage");
const LandingPage = lazyNamed(() => import("../features/landing/LandingPage.jsx"), "LandingPage");
const OfficialDashboard = lazyNamed(() => import("../features/official/OfficialDashboard.jsx"), "OfficialDashboard");
const OfficialIssuesPage = lazyNamed(() => import("../features/official/OfficialIssuesPage.jsx"), "OfficialIssuesPage");
const ProfilePage = lazyNamed(() => import("../features/profile/ProfilePage.jsx"), "ProfilePage");
const ReportIssuePage = lazyNamed(() => import("../features/report/ReportIssuePage.jsx"), "ReportIssuePage");
const SuperiorDashboard = lazyNamed(() => import("../features/superior/SuperiorDashboard.jsx"), "SuperiorDashboard");
const SuperiorIssuesPage = lazyNamed(() => import("../features/superior/SuperiorIssuesPage.jsx"), "SuperiorIssuesPage");

const withSuspense = (element) => (
  <Suspense fallback={<div className="screen-message">Loading page...</div>}>
    {element}
  </Suspense>
);

export const router = createBrowserRouter([
  { path: "/", element: withSuspense(<PageTransition><LandingPage /></PageTransition>) },
  { path: "/login", element: withSuspense(<PageTransition><LoginPage /></PageTransition>) },
  { path: "/register", element: withSuspense(<PageTransition><RegisterPage /></PageTransition>) },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/welcome", element: withSuspense(<PageTransition><PostLoginWelcomePage /></PageTransition>) },
      {
        element: <AppLayout />,
        children: [
          { path: "/profile", element: withSuspense(<ProfilePage />) },
          {
            element: <ProtectedRoute roles={["CITIZEN"]} />,
            children: [
              { path: "/citizen/dashboard", element: withSuspense(<CitizenDashboard />) },
              { path: "/citizen/report-issue", element: withSuspense(<ReportIssuePage />) },
              { path: "/citizen/issues", element: withSuspense(<MyIssuesPage />) },
              { path: "/citizen/issues/:id", element: withSuspense(<IssueDetailPage />) },
            ],
          },
          {
            element: <ProtectedRoute roles={["OFFICIAL"]} />,
            children: [
              { path: "/official/dashboard", element: withSuspense(<OfficialDashboard />) },
              { path: "/official/issues", element: withSuspense(<OfficialIssuesPage />) },
              { path: "/official/issues/:id", element: withSuspense(<IssueDetailPage />) },
            ],
          },
          {
            element: <ProtectedRoute roles={["WARD_SUPERIOR"]} />,
            children: [
              { path: "/superior/dashboard", element: withSuspense(<SuperiorDashboard />) },
              { path: "/superior/issues", element: withSuspense(<SuperiorIssuesPage />) },
              { path: "/superior/issues/:id", element: withSuspense(<IssueDetailPage />) },
              { path: "/analytics", element: withSuspense(<AnalyticsPage />) },
            ],
          },
          {
            element: <ProtectedRoute roles={["ADMIN"]} />,
            children: [
              { path: "/admin/dashboard", element: withSuspense(<AdminDashboard />) },
              { path: "/admin/users", element: withSuspense(<AdminUsersPage />) },
              { path: "/admin/issue-types", element: withSuspense(<AdminIssueTypesPage />) },
              { path: "/admin/issues", element: withSuspense(<AdminIssuesPage />) },
              { path: "/admin/analytics", element: withSuspense(<AnalyticsPage />) },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
