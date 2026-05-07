import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getSuperiorDashboard } from "../../api/dashboards.api";
import { getRoleIssues } from "../../api/issues.api";
import { DashboardIdentity } from "../../components/ui/DashboardIdentity.jsx";
import { HeroPanel } from "../../components/ui/HeroPanel.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";
import { useAuth } from "../auth/useAuth";

function normalizeStatus(status) {
  return String(status || "").trim().toUpperCase();
}

async function getSuperiorSummaryFromIssues() {
  const size = 50;
  const firstPage = await getRoleIssues("WARD_SUPERIOR", { page: 0, size, status: "ESCALATED" });
  const totalPages = Math.max(1, Number(firstPage?.totalPages || 1));
  const pages = [firstPage];

  if (totalPages > 1) {
    const remaining = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => getRoleIssues("WARD_SUPERIOR", { page: index + 1, size, status: "ESCALATED" }))
    );
    pages.push(...remaining);
  }

  const allIssues = pages.flatMap((pageData) => pageData?.content || []);

  return allIssues.reduce((summary, issue) => {
    if (normalizeStatus(issue?.status) === "ESCALATED") summary.totalEscalated += 1;
    return summary;
  }, {
    totalEscalated: 0,
  });
}

export function SuperiorDashboard() {
  const { user } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ["superior-dashboard", user?.id],
    queryFn: getSuperiorDashboard,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  const summaryQuery = useQuery({
    queryKey: ["superior-issues-summary", user?.id],
    queryFn: getSuperiorSummaryFromIssues,
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
        eyebrow="Ward superior dashboard"
        title="Monitor escalations in your ward."
        description="Review breached items, reassign work, or clear interventions with remarks."
        action={<Link className="primary-button" to="/superior/issues">Review escalations</Link>}
      />
      <div className="stats-grid">
        <StatCard isLoading={isLoading} label="Total escalated" value={data?.totalEscalated} tone="red" />
      </div>
      <OpenStreetMapAttribution />
    </section>
  );
}
