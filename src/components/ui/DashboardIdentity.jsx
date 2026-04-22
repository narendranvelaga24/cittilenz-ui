import { ShieldCheck } from "lucide-react";

export function DashboardIdentity({ role }) {
  const roleLabel = role ? role.replace("_", " ") : "Dashboard";

  return (
    <div className="dashboard-identity">
      <span className="dashboard-identity-mark" aria-hidden="true">
        <ShieldCheck size={22} strokeWidth={1.7} />
      </span>
      <div>
        <strong>Cittilenz</strong>
        <span>{roleLabel}</span>
      </div>
    </div>
  );
}
