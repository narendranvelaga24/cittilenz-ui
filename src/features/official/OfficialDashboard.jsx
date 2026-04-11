import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getOfficialDashboard } from "../../api/dashboards.api";
import { HeroPanel } from "../../components/ui/HeroPanel.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";

export function OfficialDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["official-dashboard"], queryFn: getOfficialDashboard });

  return (
    <section className="page-stack">
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
    </section>
  );
}
