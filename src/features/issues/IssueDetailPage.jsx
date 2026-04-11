import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getIssueById } from "../../api/issues.api";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { IssueTimeline } from "../../components/issues/IssueTimeline.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { formatDate } from "../../lib/format";

export function IssueDetailPage() {
  const { id } = useParams();
  const { data: issue, isLoading } = useQuery({ queryKey: ["issue", id], queryFn: () => getIssueById(id) });

  if (isLoading) return <div className="screen-message">Loading issue...</div>;

  return (
    <section className="page-stack">
      <PageHeader eyebrow={`Issue #${issue.id}`} title={issue.title} actions={<IssueStatusBadge status={issue.status} />} />
      <div className="detail-grid">
        <div className="panel">
          <h2>Details</h2>
          <p>{issue.description}</p>
          <dl className="details-list">
            <dt>Ward</dt><dd>{issue.wardName || "Pending"}</dd>
            <dt>Department</dt><dd>{issue.departmentName || "Pending"}</dd>
            <dt>Assigned official</dt><dd>{issue.assignedOfficialName || "Not assigned"}</dd>
            <dt>Soft SLA</dt><dd>{formatDate(issue.softSlaDeadline)}</dd>
            <dt>Hard SLA</dt><dd>{formatDate(issue.hardSlaDeadline)}</dd>
            <dt>Version</dt><dd>{issue.version}</dd>
          </dl>
        </div>
        <div className="panel">
          <h2>Status timeline</h2>
          <IssueTimeline history={issue.history} status={issue.status} />
        </div>
      </div>
    </section>
  );
}
