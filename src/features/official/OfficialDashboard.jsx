import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getOfficialDashboard } from "../../api/dashboards.api";
import { getRoleIssues } from "../../api/issues.api";
import { DashboardIdentity } from "../../components/ui/DashboardIdentity.jsx";
import { HeroPanel } from "../../components/ui/HeroPanel.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";
import { useAuth } from "../auth/useAuth";

function normalizeStatus(status) {
  return String(status || "").trim().toUpperCase();
}

async function getOfficialSummaryFromIssues() {
  const size = 50;
  const firstPage = await getRoleIssues("OFFICIAL", { page: 0, size });
  const totalPages = Math.max(1, Number(firstPage?.totalPages || 1));
  const pages = [firstPage];

  if (totalPages > 1) {
    const remaining = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => getRoleIssues("OFFICIAL", { page: index + 1, size }))
    );
    pages.push(...remaining);
  }

  const allIssues = pages.flatMap((pageData) => pageData?.content || []);

  return allIssues.reduce((summary, issue) => {
    const status = normalizeStatus(issue?.status);
    if (status === "ASSIGNED") summary.totalAssigned += 1;
    if (status === "IN_PROGRESS") summary.totalInProgress += 1;
    if (status === "RESOLVED") summary.totalResolved += 1;
    if (status === "ESCALATED") summary.totalEscalated += 1;
    return summary;
  }, {
    totalAssigned: 0,
    totalInProgress: 0,
    totalResolved: 0,
    totalEscalated: 0,
  });
}

export function OfficialDashboard() {
  const { user } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ["official-dashboard", user?.id],
    queryFn: getOfficialDashboard,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  const summaryQuery = useQuery({
    queryKey: ["official-issues-summary", user?.id],
    queryFn: getOfficialSummaryFromIssues,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  const data = summaryQuery.data || dashboardQuery.data;
  const isLoading = dashboardQuery.isLoading && summaryQuery.isLoading;

  return (
    <section className="page-stack dashboard-shell">
      <DashboardIdentity role={user?.role} />
      <HeroPanel
        eyebrow="Official dashboard"
        title="Manage assigned issues and SLA work."
        description="Start assigned work, resolve with proof, and keep every complaint traceable."
        action={<Link className="primary-button" to="/official/issues">View assigned issues</Link>}
      />
      <div className="stats-grid">
        <StatCard label="Assigned" value={isLoading ? "..." : data?.totalAssigned} />
        <StatCard label="In progress" value={isLoading ? "..." : data?.totalInProgress} tone="orange" />
        <StatCard label="Resolved" value={isLoading ? "..." : data?.totalResolved} tone="green" />
        <StatCard label="Escalated" value={isLoading ? "..." : data?.totalEscalated} tone="red" />
      </div>
      <OpenStreetMapAttribution />
    </section>
  );
}
