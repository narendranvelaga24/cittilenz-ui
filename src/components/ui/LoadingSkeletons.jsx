import { Skeleton } from "./Skeleton.jsx";

const STAT_TONES = ["blue", "green", "orange", "red", "yellow"];

function StatCardSkeleton({ tone = "blue" }) {
  return (
    <div className={`stat-card stat-${tone}`} aria-hidden="true">
      <Skeleton className="skeleton-kicker" />
      <Skeleton className="skeleton-stat-value" />
    </div>
  );
}

function SkeletonField() {
  return (
    <label className="skeleton-field" aria-hidden="true">
      <Skeleton className="skeleton-kicker skeleton-field-label" />
      <Skeleton className="skeleton-input" />
    </label>
  );
}

export function PageHeaderSkeleton({ hasAction = true }) {
  return (
    <div className="page-heading skeleton-page-header" aria-hidden="true">
      <div className="skeleton-page-copy">
        <Skeleton className="skeleton-kicker" />
        <Skeleton className="skeleton-title skeleton-title-lg" />
        <Skeleton className="skeleton-line skeleton-line-long" />
      </div>
      {hasAction ? (
        <div className="page-actions skeleton-page-actions">
          <Skeleton className="skeleton-pill skeleton-button" />
        </div>
      ) : null}
    </div>
  );
}

export function TableRowsSkeleton({ columnCount = 5, rowCount = 6 }) {
  const columns = Array.from({ length: columnCount }, (_, index) => index);
  const rows = Array.from({ length: rowCount }, (_, index) => index);
  const minWidth = `${Math.max(760, columnCount * 160)}px`;

  return (
    <div className="table-scroll-shell table-loading-skeleton" style={{ "--table-min-width": minWidth }}>
      <table aria-hidden="true">
        <thead>
          <tr>
            {columns.map((columnIndex) => (
              <th key={`heading-${columnIndex}`}>
                <Skeleton className="skeleton-kicker skeleton-table-heading" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {columns.map((columnIndex) => (
                <td key={`cell-${rowIndex}-${columnIndex}`}>
                  <Skeleton
                    className={
                      columnIndex === columnCount - 1
                        ? "skeleton-pill skeleton-table-action"
                        : columnIndex === 0
                          ? "skeleton-line skeleton-line-long skeleton-table-cell"
                          : columnIndex % 3 === 0
                            ? "skeleton-line skeleton-line-short skeleton-table-cell"
                            : "skeleton-line skeleton-line-medium skeleton-table-cell"
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ContentPageSkeleton({ shellClassName = "", showAction = true, panelCount = 2 }) {
  return (
    <section className={`page-stack ${shellClassName}`.trim()} aria-busy="true">
      <PageHeaderSkeleton hasAction={showAction} />
      <div className="detail-grid skeleton-content-grid" aria-hidden="true">
        {Array.from({ length: panelCount }, (_, index) => (
          <div className="panel skeleton-panel-stack" key={`panel-${index}`}>
            <Skeleton className="skeleton-title" />
            <Skeleton className="skeleton-line skeleton-line-long" />
            <Skeleton className="skeleton-line skeleton-line-medium" />
            <Skeleton className="skeleton-input" />
            <Skeleton className="skeleton-input" />
            <Skeleton className="skeleton-pill skeleton-button" />
          </div>
        ))}
      </div>
      <div className="osm-attribution skeleton-footer-chip" aria-hidden="true">
        <Skeleton className="skeleton-line skeleton-line-medium" />
      </div>
      <span className="sr-only">Loading page</span>
    </section>
  );
}

export function DashboardPageSkeleton({ statCount = 4, showIdentity = true }) {
  return (
    <section className="page-stack dashboard-shell" aria-busy="true">
      {showIdentity ? (
        <div className="dashboard-identity dashboard-identity-skeleton" aria-hidden="true">
          <Skeleton className="skeleton-circle skeleton-dashboard-mark" />
          <div className="skeleton-dashboard-copy">
            <Skeleton className="skeleton-line skeleton-line-short" />
            <Skeleton className="skeleton-kicker skeleton-line-medium" />
          </div>
        </div>
      ) : null}
      <div className="hero-card skeleton-hero-card" aria-hidden="true">
        <div className="skeleton-hero-copy">
          <Skeleton className="skeleton-kicker" />
          <Skeleton className="skeleton-title skeleton-title-xl" />
          <Skeleton className="skeleton-line skeleton-line-long" />
          <Skeleton className="skeleton-line skeleton-line-medium" />
        </div>
        <Skeleton className="skeleton-pill skeleton-button hero-skeleton-action" />
      </div>
      <div className="stats-grid" aria-hidden="true">
        {Array.from({ length: statCount }, (_, index) => (
          <StatCardSkeleton key={`stat-${index}`} tone={STAT_TONES[index % STAT_TONES.length]} />
        ))}
      </div>
      <div className="osm-attribution skeleton-footer-chip" aria-hidden="true">
        <Skeleton className="skeleton-line skeleton-line-medium" />
      </div>
      <span className="sr-only">Loading dashboard</span>
    </section>
  );
}

export function ReportPageSkeleton() {
  return (
    <section className="page-stack report-shell" aria-busy="true">
      <PageHeaderSkeleton />
      <div className="report-grid report-grid-split" aria-hidden="true">
        <div className="panel form-grid report-form-card skeleton-panel-stack">
          {Array.from({ length: 7 }, (_, index) => <SkeletonField key={`field-${index}`} />)}
          <Skeleton className="skeleton-pill skeleton-button" />
          <SkeletonField />
          <Skeleton className="skeleton-pill skeleton-button" />
        </div>
        <aside className="panel status-panel report-status-card skeleton-panel-stack">
          <Skeleton className="skeleton-title" />
          {Array.from({ length: 6 }, (_, index) => (
            <div className="check-row skeleton-check-row" key={`check-${index}`}>
              <Skeleton className="skeleton-circle skeleton-check-mark" />
              <div className="skeleton-check-copy">
                <Skeleton className="skeleton-line skeleton-line-medium" />
                <Skeleton className="skeleton-kicker skeleton-line-short" />
              </div>
            </div>
          ))}
        </aside>
      </div>
      <div className="osm-attribution skeleton-footer-chip" aria-hidden="true">
        <Skeleton className="skeleton-line skeleton-line-medium" />
      </div>
      <span className="sr-only">Loading report issue page</span>
    </section>
  );
}

export function TablePageSkeleton({ columnCount = 5, rowCount = 6, showFilters = true, showPagination = true }) {
  return (
    <section className="page-stack" aria-busy="true">
      <PageHeaderSkeleton />
      <div className="table-card">
        <div className="table-toolbar table-toolbar-rich skeleton-table-toolbar" aria-hidden="true">
          <div className="table-toolbar-summary">
            <Skeleton className="skeleton-line skeleton-line-short skeleton-toolbar-title" />
            <Skeleton className="skeleton-kicker skeleton-toolbar-meta" />
          </div>
          <div className="table-toolbar-controls">
            <Skeleton className="skeleton-pill skeleton-toolbar-search" />
            {showFilters ? <Skeleton className="skeleton-pill skeleton-toolbar-filter" /> : null}
            <Skeleton className="skeleton-pill skeleton-toolbar-button" />
          </div>
        </div>
        <TableRowsSkeleton columnCount={columnCount} rowCount={rowCount} />
      </div>
      {showPagination ? (
        <div className="pagination skeleton-pagination" aria-hidden="true">
          <Skeleton className="skeleton-kicker skeleton-pagination-copy" />
          <Skeleton className="skeleton-pill skeleton-pagination-button" />
          <Skeleton className="skeleton-pill skeleton-pagination-button" />
        </div>
      ) : null}
      <div className="osm-attribution skeleton-footer-chip" aria-hidden="true">
        <Skeleton className="skeleton-line skeleton-line-medium" />
      </div>
      <span className="sr-only">Loading table</span>
    </section>
  );
}

export function IssueDetailSkeleton() {
  return (
    <section className="page-stack" aria-busy="true">
      <PageHeaderSkeleton />
      <div className="detail-grid skeleton-detail-grid" aria-hidden="true">
        <div className="panel skeleton-panel-stack">
          <Skeleton className="skeleton-title" />
          <Skeleton className="skeleton-line skeleton-line-long" />
          <Skeleton className="skeleton-line skeleton-line-medium" />
          <div className="details-list skeleton-details-list">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="skeleton-detail-pair" key={`detail-${index}`}>
                <Skeleton className="skeleton-kicker skeleton-detail-label" />
                <Skeleton className="skeleton-line skeleton-line-medium skeleton-detail-value" />
              </div>
            ))}
          </div>
          <Skeleton className="skeleton-pill skeleton-button" />
        </div>
        <div className="panel skeleton-panel-stack">
          <Skeleton className="skeleton-title" />
          <div className="timeline skeleton-timeline">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="timeline-item skeleton-timeline-item" key={`timeline-${index}`}>
                <Skeleton className="skeleton-line skeleton-line-short" />
                <Skeleton className="skeleton-line skeleton-line-long" />
                <Skeleton className="skeleton-kicker skeleton-line-medium" />
              </div>
            ))}
          </div>
        </div>
        <div className="panel skeleton-panel-stack">
          <Skeleton className="skeleton-title" />
          <Skeleton className="skeleton-media" />
        </div>
        <div className="panel skeleton-panel-stack">
          <Skeleton className="skeleton-title" />
          <Skeleton className="skeleton-media" />
        </div>
      </div>
      <div className="osm-attribution skeleton-footer-chip" aria-hidden="true">
        <Skeleton className="skeleton-line skeleton-line-medium" />
      </div>
      <span className="sr-only">Loading issue details</span>
    </section>
  );
}

export function AnalyticsChartSkeleton() {
  return (
    <div className="analytics-chart-skeleton" aria-hidden="true">
      <div className="analytics-chart-bars">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="analytics-chart-column" key={`bar-${index}`}>
            <Skeleton className={`analytics-chart-bar analytics-chart-bar-${index + 1}`} />
            <Skeleton className="skeleton-kicker analytics-chart-label" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <section className="page-stack analytics-shell" aria-busy="true">
      <PageHeaderSkeleton hasAction={false} />
      <div className="panel form-grid two skeleton-filter-grid" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => <SkeletonField key={`filter-${index}`} />)}
      </div>
      <div className="stats-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={`analytics-stat-${index}`} tone={STAT_TONES[index % STAT_TONES.length]} />
        ))}
      </div>
      <div className="stats-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={`analytics-extra-stat-${index}`} tone={STAT_TONES[(index + 1) % STAT_TONES.length]} />
        ))}
      </div>
      <div className="panel chart-panel">
        <AnalyticsChartSkeleton />
      </div>
      <span className="sr-only">Loading analytics</span>
    </section>
  );
}

export function AuthPageSkeleton({ wide = false, fieldCount = 2, grid = false }) {
  return (
    <main className="auth-page" aria-busy="true">
      <div className="auth-layout">
        <div className="auth-illustration auth-skeleton-illustration" aria-hidden="true">
          <div className="auth-illustration-header">
            <div className="auth-brand-chip">
              <Skeleton className="skeleton-circle skeleton-auth-mark" />
              <Skeleton className="skeleton-line skeleton-line-short" />
            </div>
          </div>
          <div className="auth-skeleton-stage">
            <Skeleton className="skeleton auth-skeleton-orb auth-skeleton-orb-one" />
            <Skeleton className="skeleton auth-skeleton-orb auth-skeleton-orb-two" />
            <div className="auth-skeleton-figures">
              <Skeleton className="auth-skeleton-figure auth-skeleton-figure-tall" />
              <Skeleton className="auth-skeleton-figure auth-skeleton-figure-mid" />
              <Skeleton className="auth-skeleton-figure auth-skeleton-figure-short" />
            </div>
          </div>
        </div>

        <div className="auth-form-area">
          <div className={`auth-form-panel ${wide ? "auth-form-panel-wide" : ""}`.trim()}>
            <div className="auth-heading-block" aria-hidden="true">
              <Skeleton className="skeleton-title skeleton-title-lg" />
              <Skeleton className="skeleton-line skeleton-line-medium" />
            </div>
            <div className={`auth-form ${grid ? "auth-form-grid" : ""}`.trim()} aria-hidden="true">
              {Array.from({ length: fieldCount }, (_, index) => (
                <div className="auth-field-group" key={`auth-field-${index}`}>
                  <Skeleton className="skeleton-kicker" />
                  <Skeleton className="skeleton-input" />
                </div>
              ))}
              <Skeleton className="skeleton-pill skeleton-button auth-skeleton-submit" />
            </div>
            <div className="auth-switch-row" aria-hidden="true">
              <Skeleton className="skeleton-kicker skeleton-line-short" />
              <Skeleton className="skeleton-kicker skeleton-line-short" />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading authentication page</span>
    </main>
  );
}

export function CenteredSplashSkeleton() {
  return (
    <main className="post-login-welcome" aria-busy="true">
      <div className="skeleton-welcome-stack" aria-hidden="true">
        <Skeleton className="skeleton-title skeleton-title-lg" />
        <Skeleton className="skeleton-line skeleton-line-medium" />
      </div>
      <span className="sr-only">Loading welcome screen</span>
    </main>
  );
}

export function LandingBootSkeleton() {
  return (
    <main className="landing-boot-shell" aria-busy="true">
      <div className="landing-boot-nav panel" aria-hidden="true">
        <div className="landing-boot-brand">
          <Skeleton className="skeleton-circle landing-boot-brand-mark" />
          <Skeleton className="skeleton-line skeleton-line-short" />
        </div>
        <div className="landing-boot-links">
          <Skeleton className="skeleton-pill landing-boot-link" />
          <Skeleton className="skeleton-pill landing-boot-link" />
          <Skeleton className="skeleton-pill landing-boot-link" />
        </div>
      </div>
      <section className="landing-boot-hero panel" aria-hidden="true">
        <div className="landing-boot-copy">
          <Skeleton className="skeleton-kicker" />
          <Skeleton className="skeleton-title skeleton-title-xl" />
          <Skeleton className="skeleton-line skeleton-line-long" />
          <Skeleton className="skeleton-line skeleton-line-medium" />
          <div className="landing-boot-actions">
            <Skeleton className="skeleton-pill skeleton-button" />
            <Skeleton className="skeleton-pill skeleton-button" />
          </div>
        </div>
        <div className="landing-boot-visual">
          <Skeleton className="landing-boot-map" />
          <Skeleton className="landing-boot-card landing-boot-card-one" />
          <Skeleton className="landing-boot-card landing-boot-card-two" />
        </div>
      </section>
      <div className="landing-boot-metrics" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="panel landing-boot-metric" key={`metric-${index}`}>
            <Skeleton className="skeleton-line skeleton-line-short" />
            <Skeleton className="skeleton-kicker skeleton-line-medium" />
          </div>
        ))}
      </div>
      <span className="sr-only">Opening Cittilenz</span>
    </main>
  );
}
