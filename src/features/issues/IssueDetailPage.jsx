import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getIssueById, linkDuplicate } from "../../api/issues.api";
import { useAuth } from "../auth/useAuth";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { IssueTimeline } from "../../components/issues/IssueTimeline.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { IssueDetailSkeleton } from "../../components/ui/LoadingSkeletons.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { ToastNotification } from "../../components/ui/ToastNotification.jsx";
import { errorMessage } from "../../lib/apiResponse";
import { env } from "../../lib/env";
import { formatDate } from "../../lib/format";

function toAbsoluteAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalizedBase = env.baseUrl.endsWith("/") ? env.baseUrl.slice(0, -1) : env.baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function isSafeAssetUrl(url) {
  if (!url) return false;
  if (url.startsWith("http://") || url.startsWith("https://")) return true;
  return url.startsWith("/uploads/");
}

export function IssueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: issue, isLoading } = useQuery({ queryKey: ["issue", id], queryFn: () => getIssueById(id) });
  const [toast, setToast] = useState({ message: "", tone: "info" });

  useEffect(() => {
    if (!toast.message) return;
    const timeout = setTimeout(() => setToast({ message: "", tone: "info" }), 4000);
    return () => clearTimeout(timeout);
  }, [toast.message]);

  function showToast(message, tone = "info") {
    setToast({ message, tone });
  }

  const linkDuplicateMutation = useMutation({
    mutationFn: () => linkDuplicate(id),
    onSuccess: (updatedIssue) => {
      const previousCount = Number(issue?.reportCount || 0);
      const nextCount = Number(updatedIssue?.reportCount || previousCount);
      const alreadyLinked = nextCount <= previousCount;
      const nextMessage = alreadyLinked
        ? "You are already linked to this issue."
        : "You've been linked to this issue. Future updates will notify you.";

      showToast(nextMessage, alreadyLinked ? "info" : "success");
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
      queryClient.invalidateQueries({ queryKey: ["my-issues"] });
      queryClient.invalidateQueries({ queryKey: ["citizen-dashboard"] });
    },
    onError: (err) => showToast(errorMessage(err), "danger"),
  });

  if (isLoading) return <IssueDetailSkeleton />;

  // Check if current user is citizen and has already reported this issue
  const isCitizen = user?.role === "CITIZEN";
  const reportedByCurrentUser = Array.isArray(issue?.reporterIds)
    ? issue.reporterIds.includes(user?.id)
    : Boolean(
        issue?.reportedById != null && user?.id != null
          ? Number(issue.reportedById) === Number(user.id)
          : issue?.reportedByName && user?.fullName && issue.reportedByName === user.fullName,
      );
  const canLinkDuplicate = isCitizen && issue && !reportedByCurrentUser;
  const reportedImageUrl = toAbsoluteAssetUrl(issue.imageUrl || issue.reportedImageUrl || issue.uploadedImageUrl);
  const resolvedImageUrl = toAbsoluteAssetUrl(issue.resolvedImageUrl || issue.resolutionImageUrl || issue.fixedImageUrl);
  const safeReportedImageUrl = isSafeAssetUrl(reportedImageUrl) ? reportedImageUrl : "";
  const safeResolvedImageUrl = isSafeAssetUrl(resolvedImageUrl) ? resolvedImageUrl : "";

  return (
    <section className="page-stack">
      <ToastNotification message={toast.message} tone={toast.tone} />
      <PageHeader eyebrow={`Issue #${issue.id}`} title={issue.title} actions={<IssueStatusBadge status={issue.status} />} />
      <div className="detail-grid">
        <div className="panel">
          <h2>Details</h2>
          <p>{issue.description}</p>
          <dl className="details-list">
            <dt>Ward</dt><dd>{issue.wardName || "Pending"}</dd>
            <dt>Department</dt><dd>{issue.departmentName || "Pending"}</dd>
            <dt>Type</dt><dd>{issue.issueTypeName || issue.displayName || issue.type || "Not specified"}</dd>
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
        <div className="panel">
          <h2>Reported image</h2>
          {safeReportedImageUrl ? (
            <a className="issue-image-link" href={safeReportedImageUrl} target="_blank" rel="noreferrer">
              <img className="issue-image-preview" src={safeReportedImageUrl} alt={`Reported evidence for issue ${issue.id}`} loading="lazy" />
            </a>
          ) : (
            <p>No report image available yet.</p>
          )}
        </div>
        <div className="panel">
          <h2>Resolution image</h2>
          {safeResolvedImageUrl ? (
            <a className="issue-image-link" href={safeResolvedImageUrl} target="_blank" rel="noreferrer">
              <img className="issue-image-preview" src={safeResolvedImageUrl} alt={`Resolution proof for issue ${issue.id}`} loading="lazy" />
            </a>
          ) : (
            <p>Resolution image will appear once the issue is marked as resolved.</p>
          )}
        </div>
      </div>
      <OpenStreetMapAttribution />
    </section>
  );
}
