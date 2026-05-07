import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "../../api/admin.api";
import { getRoleIssues } from "../../api/issues.api";
import { DashboardIdentity } from "../../components/ui/DashboardIdentity.jsx";
import { HeroPanel } from "../../components/ui/HeroPanel.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";
import { useAuth } from "../auth/useAuth";

async function getAdminIssueSummary() {
  const size = 50;
  const firstPage = await getRoleIssues("ADMIN", { page: 0, size });
  const totalPages = Math.max(1, Number(firstPage?.totalPages || 1));
  const pages = [firstPage];

  if (totalPages > 1) {
    const remaining = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => getRoleIssues("ADMIN", { page: index + 1, size }))
    );
    pages.push(...remaining);
  }

  const allIssues = pages.flatMap((pageData) => pageData?.content || []);

  return allIssues.reduce((summary) => {
    summary.totalIssues += 1;
    return summary;
  }, {
    totalIssues: 0,
  });
}

export function AdminDashboard() {
  const { user } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard", user?.id],
    queryFn: getAdminDashboard,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  const summaryQuery = useQuery({
    queryKey: ["admin-issues-summary", user?.id],
    queryFn: getAdminIssueSummary,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  const data = { ...(dashboardQuery.data || {}), ...(summaryQuery.data || {}) };
  const isLoading = dashboardQuery.isLoading && summaryQuery.isLoading;

  return (
    <section className="page-stack dashboard-shell">
      <DashboardIdentity role={user?.role} />
      <HeroPanel
        eyebrow="Admin dashboard"
        title="System-wide civic operations."
        description="Create staff accounts, manage issue types, and monitor operational health across wards."
      />
      <div className="stats-grid">
        <StatCard isLoading={isLoading} label="Citizens" value={data?.totalCitizens} />
        <StatCard isLoading={isLoading} label="Officials" value={data?.totalOfficials} tone="green" />
        <StatCard isLoading={isLoading} label="Ward superiors" value={data?.totalWardSuperiors} tone="orange" />
        <StatCard isLoading={isLoading} label="Issues" value={data?.totalIssues} tone="red" />
      </div>
      <OpenStreetMapAttribution />
    </section>
  );
}
