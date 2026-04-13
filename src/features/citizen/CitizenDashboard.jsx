import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCitizenDashboard } from "../../api/issues.api";
import { HeroPanel } from "../../components/ui/HeroPanel.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";

export function CitizenDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["citizen-dashboard"], queryFn: getCitizenDashboard });

  return (
    <section className="page-stack">
      <HeroPanel
        eyebrow="Citizen dashboard"
        title="Report, track, and verify civic fixes."
        description="Geo-tagged reports move from citizen evidence to official accountability."
        action={<Link className="primary-button" to="/citizen/report-issue">Report an issue</Link>}
      />
      <div className="stats-grid">
        <StatCard label="Total reported" value={isLoading ? "..." : data?.totalReported} />
        <StatCard label="Resolved" value={isLoading ? "..." : data?.totalResolved} tone="green" />
        <StatCard label="Active" value={isLoading ? "..." : data?.totalAssignedOrInProgress} tone="orange" />
        <StatCard label="Escalated" value={isLoading ? "..." : data?.totalEscalated} tone="red" />
      </div>
      <OpenStreetMapAttribution />
    </section>
  );
}
