export function IssueStatusBadge({ status }) {
  const value = status || "UNKNOWN";
  const label = value.replaceAll("_", " ");
  return (
    <span className={`status-badge status-${String(value).toLowerCase()}`} aria-label={`Status: ${label}`}>
      <span aria-hidden="true" className="status-icon" />
      {label}
    </span>
  );
}
