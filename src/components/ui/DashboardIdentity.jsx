import { formatRoleLabel } from "../../lib/branding";

const LOGO_SRC = "/logo.png";

export function DashboardIdentity({ role }) {
  const roleLabel = formatRoleLabel(role);

  return (
    <div className="dashboard-identity">
      <span className="dashboard-identity-mark" aria-hidden="true">
        <img alt="" className="brand-logo" height="30" src={LOGO_SRC} width="30" />
      </span>
      <div>
        <strong>Cittilenz</strong>
        <span>{roleLabel}</span>
      </div>
    </div>
  );
}
