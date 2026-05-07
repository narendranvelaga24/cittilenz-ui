import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCitizenDashboard, getMyIssues } from "../../api/issues.api";
import { DashboardIdentity } from "../../components/ui/DashboardIdentity.jsx";
import { HeroPanel } from "../../components/ui/HeroPanel.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";
import { useAuth } from "../auth/useAuth";

function normalizeStatus(status) {
  return String(status || "").trim().toUpperCase();
}

async function getCitizenSummaryFromMyIssues() {
  const size = 50;
  const firstPage = await getMyIssues({ page: 0, size, sortBy: "createdAt", direction: "DESC" });
  const totalPages = Math.max(1, Number(firstPage?.totalPages || 1));
  const pages = [firstPage];

  if (totalPages > 1) {
    const remaining = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => getMyIssues({ page: index + 1, size, sortBy: "createdAt", direction: "DESC" }))
    );
    pages.push(...remaining);
  }

  const allIssues = pages.flatMap((pageData) => pageData?.content || []);
  const totalReported = Number(firstPage?.totalElements ?? allIssues.length ?? 0);

  const summary = allIssues.reduce((accumulator, issue) => {
    const status = normalizeStatus(issue?.status);
    if (status === "RESOLVED") accumulator.totalResolved += 1;
    if (status === "ESCALATED") accumulator.totalEscalated += 1;
    if (["ASSIGNED", "IN_PROGRESS", "REASSIGNED"].includes(status)) {
      accumulator.totalAssignedOrInProgress += 1;
    }
    return accumulator;
  }, {
    totalReported,
    totalResolved: 0,
    totalAssignedOrInProgress: 0,
    totalEscalated: 0,
  });

  return summary;
}

export function CitizenDashboard() {
  const { user } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ["citizen-dashboard", user?.id],
    queryFn: getCitizenDashboard,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  const summaryQuery = useQuery({
    queryKey: ["my-issues-summary", user?.id],
    queryFn: getCitizenSummaryFromMyIssues,
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
        eyebrow="Citizen dashboard"
        title="Report, track, and verify civic fixes."
        description="Geo-tagged reports move from citizen evidence to official accountability."
        action={<Link className="primary-button" to="/citizen/report-issue">Report an issue</Link>}
      />
      <div className="stats-grid">
        <StatCard isLoading={isLoading} label="Total reported" value={data?.totalReported} />
        <StatCard isLoading={isLoading} label="Resolved" value={data?.totalResolved} tone="green" />
        <StatCard isLoading={isLoading} label="Active" value={data?.totalAssignedOrInProgress} tone="orange" />
        <StatCard isLoading={isLoading} label="Escalated" value={data?.totalEscalated} tone="red" />
      </div>
      <OpenStreetMapAttribution />
    </section>
  );
}
