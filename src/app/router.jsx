import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import {
  AnalyticsPageSkeleton,
  AuthPageSkeleton,
  CenteredSplashSkeleton,
  ContentPageSkeleton,
  DashboardPageSkeleton,
  IssueDetailSkeleton,
  LandingBootSkeleton,
  ReportPageSkeleton,
  TablePageSkeleton,
} from "../components/ui/LoadingSkeletons.jsx";
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

const withSuspense = (element, fallback = <ContentPageSkeleton />) => (
  <Suspense fallback={fallback}>
    {element}
  </Suspense>
);

export const router = createBrowserRouter([
  { path: "/", element: withSuspense(<PageTransition><LandingPage /></PageTransition>, <LandingBootSkeleton />) },
  { path: "/login", element: withSuspense(<PageTransition><LoginPage /></PageTransition>, <AuthPageSkeleton fieldCount={2} />) },
  { path: "/register", element: withSuspense(<PageTransition><RegisterPage /></PageTransition>, <AuthPageSkeleton fieldCount={6} grid wide />) },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/welcome", element: withSuspense(<PageTransition><PostLoginWelcomePage /></PageTransition>, <CenteredSplashSkeleton />) },
      {
        element: <AppLayout />,
        children: [
          { path: "/profile", element: withSuspense(<ProfilePage />, <ContentPageSkeleton panelCount={3} shellClassName="profile-shell" showAction={false} />) },
          {
            element: <ProtectedRoute roles={["CITIZEN"]} />,
            children: [
              { path: "/citizen/dashboard", element: withSuspense(<CitizenDashboard />, <DashboardPageSkeleton />) },
              { path: "/citizen/report-issue", element: withSuspense(<ReportIssuePage />, <ReportPageSkeleton />) },
              { path: "/citizen/issues", element: withSuspense(<MyIssuesPage />, <TablePageSkeleton columnCount={5} />) },
              { path: "/citizen/issues/:id", element: withSuspense(<IssueDetailPage />, <IssueDetailSkeleton />) },
            ],
          },
          {
            element: <ProtectedRoute roles={["OFFICIAL"]} />,
            children: [
              { path: "/official/dashboard", element: withSuspense(<OfficialDashboard />, <DashboardPageSkeleton />) },
              { path: "/official/issues", element: withSuspense(<OfficialIssuesPage />, <TablePageSkeleton columnCount={6} />) },
              { path: "/official/issues/:id", element: withSuspense(<IssueDetailPage />, <IssueDetailSkeleton />) },
            ],
          },
          {
            element: <ProtectedRoute roles={["WARD_SUPERIOR"]} />,
            children: [
              { path: "/superior/dashboard", element: withSuspense(<SuperiorDashboard />, <DashboardPageSkeleton statCount={1} />) },
              { path: "/superior/issues", element: withSuspense(<SuperiorIssuesPage />, <TablePageSkeleton columnCount={6} />) },
              { path: "/superior/issues/:id", element: withSuspense(<IssueDetailPage />, <IssueDetailSkeleton />) },
              { path: "/analytics", element: withSuspense(<AnalyticsPage />, <AnalyticsPageSkeleton />) },
            ],
          },
          {
            element: <ProtectedRoute roles={["ADMIN"]} />,
            children: [
              { path: "/admin/dashboard", element: withSuspense(<AdminDashboard />, <DashboardPageSkeleton />) },
              { path: "/admin/users", element: withSuspense(<AdminUsersPage />, <TablePageSkeleton columnCount={7} />) },
              { path: "/admin/issue-types", element: withSuspense(<AdminIssueTypesPage />, <TablePageSkeleton columnCount={6} />) },
              { path: "/admin/issues", element: withSuspense(<AdminIssuesPage />, <TablePageSkeleton columnCount={6} />) },
              { path: "/admin/analytics", element: withSuspense(<AnalyticsPage />, <AnalyticsPageSkeleton />) },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
