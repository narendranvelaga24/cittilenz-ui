import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getIssueById, linkDuplicate } from "../../api/issues.api";
import { useAuth } from "../auth/useAuth";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { IssueTimeline } from "../../components/issues/IssueTimeline.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { errorMessage } from "../../lib/apiResponse";
import { formatDate } from "../../lib/format";

export function IssueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: issue, isLoading } = useQuery({ queryKey: ["issue", id], queryFn: () => getIssueById(id) });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(""), 4000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const linkDuplicateMutation = useMutation({
    mutationFn: () => linkDuplicate(id),
    onSuccess: () => {
      setMessage("You've been linked to this issue. Future updates will notify you.");
      setToastMessage("You've been linked to this issue.");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
    },
    onError: (err) => {
      setError(errorMessage(err));
      setMessage("");
    },
  });

  if (isLoading) return <div className="screen-message">Loading issue...</div>;

  // Check if current user is citizen and has already reported this issue
  const isCitizen = user?.role === "CITIZEN";
  const canLinkDuplicate = isCitizen && issue && issue.reporterIds && !issue.reporterIds.includes(user?.id);

  return (
    <section className="page-stack">
      {toastMessage && <div className="toast-message">{toastMessage}</div>}
      <PageHeader eyebrow={`Issue #${issue.id}`} title={issue.title} actions={<IssueStatusBadge status={issue.status} />} />
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
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
            <dt>Reports linked</dt><dd>{issue.reportCount || 1}</dd>
            <dt>Version</dt><dd>{issue.version}</dd>
          </dl>
          {canLinkDuplicate && (
            <button
              className="primary-button"
              disabled={linkDuplicateMutation.isPending}
              onClick={() => linkDuplicateMutation.mutate()}
            >
              {linkDuplicateMutation.isPending ? "Linking..." : "Link this issue to your reports"}
            </button>
          )}
        </div>
        <div className="panel">
          <h2>Status timeline</h2>
          <IssueTimeline history={issue.history} status={issue.status} />
        </div>
      </div>
      <OpenStreetMapAttribution />
    </section>
  );
}
