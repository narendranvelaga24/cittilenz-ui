import { Skeleton } from "./Skeleton.jsx";

export function StatCard({ label, value, tone = "blue", isLoading = false }) {
  return (
    <div className={`stat-card stat-${tone}`} aria-busy={isLoading}>
      <span>{label}</span>
      <strong>{isLoading ? <Skeleton className="skeleton-stat-value" /> : value ?? 0}</strong>
    </div>
  );
}
