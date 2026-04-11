import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "../../api/admin.api";
import { HeroPanel } from "../../components/ui/HeroPanel.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";

export function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: getAdminDashboard });

  return (
    <section className="page-stack">
      <HeroPanel
        eyebrow="Admin dashboard"
        title="System-wide civic operations."
        description="Create staff accounts, manage issue types, and monitor operational health across wards."
      />
      <div className="stats-grid">
        <StatCard label="Citizens" value={isLoading ? "..." : data?.totalCitizens} />
        <StatCard label="Officials" value={isLoading ? "..." : data?.totalOfficials} tone="green" />
        <StatCard label="Ward superiors" value={isLoading ? "..." : data?.totalWardSuperiors} tone="orange" />
        <StatCard label="Issues" value={isLoading ? "..." : data?.totalIssues} tone="red" />
      </div>
    </section>
  );
}
