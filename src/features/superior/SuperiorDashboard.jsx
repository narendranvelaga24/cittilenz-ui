import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getSuperiorDashboard } from "../../api/dashboards.api";
import { HeroPanel } from "../../components/ui/HeroPanel.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";

export function SuperiorDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["superior-dashboard"], queryFn: getSuperiorDashboard });

  return (
    <section className="page-stack">
      <HeroPanel
        eyebrow="Ward superior dashboard"
        title="Monitor escalations in your ward."
        description="Review breached items, reassign work, or clear interventions with remarks."
        action={<Link className="primary-button" to="/superior/issues">Review escalations</Link>}
      />
      <div className="stats-grid">
        <StatCard label="Total escalated" value={isLoading ? "..." : data?.totalEscalated} tone="red" />
      </div>
    </section>
  );
}
