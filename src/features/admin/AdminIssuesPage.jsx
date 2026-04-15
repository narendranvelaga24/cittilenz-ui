import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getRoleIssues } from "../../api/issues.api";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { formatDate } from "../../lib/format";

function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
}

function renderContact(name, email, phone, fallbackLabel = "Not available") {
  const hasAny = Boolean(name || email || phone);
  if (!hasAny) return <span className="muted">{fallbackLabel}</span>;

  return (
    <div className="contact-stack">
      <strong>{name || "N/A"}</strong>
      <span>{email || "Email not available"}</span>
      <span>{phone || "Phone not available"}</span>
    </div>
  );
}

export function AdminIssuesPage() {
  const [status, setStatus] = useState("");
  const [wardId, setWardId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [page, setPage] = useState(0);

  const [debouncedWardId, setDebouncedWardId] = useState("");
  const [debouncedDepartmentId, setDebouncedDepartmentId] = useState("");
  const [debouncedReportedBy, setDebouncedReportedBy] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);

  const closeDetails = () => setSelectedIssue(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedWardId(wardId), 500);
    return () => clearTimeout(timer);
  }, [wardId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDepartmentId(departmentId), 500);
    return () => clearTimeout(timer);
  }, [departmentId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedReportedBy(reportedBy), 500);
    return () => clearTimeout(timer);
  }, [reportedBy]);

  useEffect(() => {
    if (!selectedIssue) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDetails();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIssue]);

  const { data, isFetching } = useQuery({
    queryKey: ["admin-issues", status, debouncedWardId, debouncedDepartmentId, debouncedReportedBy, page],
    queryFn: () =>
      getRoleIssues("ADMIN", {
        status: status || undefined,
        wardId: debouncedWardId ? Number(debouncedWardId) : undefined,
        departmentId: debouncedDepartmentId ? Number(debouncedDepartmentId) : undefined,
        reportedBy: debouncedReportedBy ? Number(debouncedReportedBy) : undefined,
        page,
      }),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const rows = data?.content || [];
  const totalPages = Math.max(1, Number(data?.totalPages || 1));

  const formatText = (value) => {
    if (value === undefined || value === null) return "N/A";
    const text = String(value).trim();
    return text === "" ? "N/A" : text;
  };

  const asYesNo = (value) => (value ? "Yes" : "No");

  const columns = [
    { key: "title", header: "Issue" },
    { key: "status", header: "Status", render: (issue) => <IssueStatusBadge status={issue.status} /> },
    {
      key: "issueType",
      header: "Type",
      render: (issue) => issue.issueTypeName || issue.displayName || issue.type || "Uncategorized",
    },
    {
      key: "reporterDetails",
      header: "Reported By",
      render: (issue) => {
        const reporterName = pickFirst(issue.reporterName, issue.reportedByName, issue.reportedByFullName, issue.citizenName);
        const reporterEmail = pickFirst(issue.reporterEmail, issue.reportedByEmail, issue.citizenEmail);
        const reporterPhone = pickFirst(issue.reporterMobile, issue.reportedByMobile, issue.reporterPhone, issue.citizenMobile);
        return renderContact(reporterName, reporterEmail, reporterPhone);
      },
    },
    {
      key: "officialDetails",
      header: "Official",
      render: (issue) => {
        const assignedName = pickFirst(issue.assignedOfficialName, issue.currentOfficialName, issue.officialName);
        const assignedEmail = pickFirst(issue.assignedOfficialEmail, issue.currentOfficialEmail, issue.officialEmail);
        const assignedPhone = pickFirst(issue.assignedOfficialMobile, issue.currentOfficialMobile, issue.officialMobile);
        return renderContact(assignedName, assignedEmail, assignedPhone);
      },
    },
    { key: "wardName", header: "Ward", render: (issue) => issue.wardName || "N/A" },
    {
      key: "actions",
      header: "Actions",
      render: (issue) => (
        <div className="action-cell">
          <button type="button" className="secondary-button" onClick={() => setSelectedIssue(issue)}>
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Admin issue view"
        title="All issues"
        actions={
          <div className="page-actions">
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>
              <option value="">All statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ESCALATED">Escalated</option>
            </select>
            <input
              placeholder="Ward id"
              value={wardId}
              onChange={(event) => {
                setWardId(event.target.value.replace(/[^0-9]/g, ""));
                setPage(0);
              }}
            />
            <input
              placeholder="Department id"
              value={departmentId}
              onChange={(event) => {
                setDepartmentId(event.target.value.replace(/[^0-9]/g, ""));
                setPage(0);
              }}
            />
            <input
              placeholder="Reported by user id"
              value={reportedBy}
              onChange={(event) => {
                setReportedBy(event.target.value.replace(/[^0-9]/g, ""));
                setPage(0);
              }}
            />
          </div>
        }
      />

      <DataTable
        caption="Admin issues"
        columns={columns}
        rows={rows}
        getRowKey={(issue) => issue.id}
        emptyTitle="No issues found"
        isLoading={isFetching}
        toolbar={<span>{isFetching ? "Refreshing..." : `Showing ${rows.length} of ${data?.totalElements ?? 0}`}</span>}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <OpenStreetMapAttribution />

      {selectedIssue && (
        <div className="dialog-backdrop" role="presentation" onClick={closeDetails}>
          <article className="dialog-card" role="dialog" aria-modal="true" aria-label="Issue details" onClick={(event) => event.stopPropagation()}>
            <header className="dialog-header">
              <h3>{formatText(selectedIssue.title)}</h3>
              <button type="button" className="ghost-button" onClick={closeDetails}>
                Close
              </button>
            </header>

            <div className="dialog-body">
              <dl className="details-list">
                <dt>Description</dt>
                <dd>{formatText(selectedIssue.description)}</dd>

                <dt>Issue Type</dt>
                <dd>{formatText(selectedIssue.issueTypeName || selectedIssue.displayName || selectedIssue.type)}</dd>

                <dt>Latitude</dt>
                <dd>{formatText(selectedIssue.latitude)}</dd>

                <dt>Longitude</dt>
                <dd>{formatText(selectedIssue.longitude)}</dd>

                <dt>Street</dt>
                <dd>{formatText(selectedIssue.street)}</dd>

                <dt>Area</dt>
                <dd>{formatText(selectedIssue.area)}</dd>

                <dt>Locality</dt>
                <dd>{formatText(selectedIssue.locality)}</dd>

                <dt>City</dt>
                <dd>{formatText(selectedIssue.city)}</dd>

                <dt>Pincode</dt>
                <dd>{formatText(selectedIssue.pincode)}</dd>

                <dt>Ward Id</dt>
                <dd>{formatText(selectedIssue.wardId)}</dd>

                <dt>Ward Name</dt>
                <dd>{formatText(selectedIssue.wardName)}</dd>

                <dt>Department Id</dt>
                <dd>{formatText(selectedIssue.departmentId)}</dd>

                <dt>Department Name</dt>
                <dd>{formatText(selectedIssue.departmentName)}</dd>

                <dt>Reported By</dt>
                <dd>{formatText(selectedIssue.reportedByName || selectedIssue.reporterName)}</dd>

                <dt>Assigned Official</dt>
                <dd>{formatText(selectedIssue.assignedOfficialName)}</dd>

                <dt>Assigned Official Id</dt>
                <dd>{formatText(selectedIssue.assignedOfficialId)}</dd>

                <dt>Assigned Official Mobile</dt>
                <dd>{formatText(selectedIssue.assignedOfficialMobile)}</dd>

                <dt>Assigned Official Email</dt>
                <dd>{formatText(selectedIssue.assignedOfficialEmail)}</dd>

                <dt>Ward Superior</dt>
                <dd>{formatText(selectedIssue.wardSuperiorName)}</dd>

                <dt>Ward Superior Mobile</dt>
                <dd>{formatText(selectedIssue.wardSuperiorMobile)}</dd>

                <dt>Ward Superior Email</dt>
                <dd>{formatText(selectedIssue.wardSuperiorEmail)}</dd>

                <dt>Status</dt>
                <dd>{formatText(selectedIssue.status)}</dd>

                <dt>Priority</dt>
                <dd>{formatText(selectedIssue.priority)}</dd>

                <dt>Report Count</dt>
                <dd>{formatText(selectedIssue.reportCount)}</dd>

                <dt>Created At</dt>
                <dd>{formatDate(selectedIssue.createdAt)}</dd>

                <dt>Assigned At</dt>
                <dd>{formatDate(selectedIssue.assignedAt)}</dd>

                <dt>Started At</dt>
                <dd>{formatDate(selectedIssue.startedAt)}</dd>

                <dt>Resolved At</dt>
                <dd>{formatDate(selectedIssue.resolvedAt)}</dd>

                <dt>Escalated At</dt>
                <dd>{formatDate(selectedIssue.escalatedAt)}</dd>

                <dt>Reassigned At</dt>
                <dd>{formatDate(selectedIssue.reassignedAt)}</dd>

                <dt>Soft SLA Deadline</dt>
                <dd>{formatDate(selectedIssue.softSlaDeadline)}</dd>

                <dt>Hard SLA Deadline</dt>
                <dd>{formatDate(selectedIssue.hardSlaDeadline)}</dd>

                <dt>Soft SLA Breached</dt>
                <dd>{asYesNo(Boolean(selectedIssue.softSlaBreached))}</dd>

                <dt>Hard SLA Breached</dt>
                <dd>{asYesNo(Boolean(selectedIssue.hardSlaBreached))}</dd>

                <dt>Escalation Count</dt>
                <dd>{formatText(selectedIssue.escalationCount)}</dd>

                <dt>Reassignment Count</dt>
                <dd>{formatText(selectedIssue.reassignmentCount)}</dd>

                <dt>Requires Supervisor Intervention</dt>
                <dd>{asYesNo(Boolean(selectedIssue.requiresSupervisorIntervention))}</dd>

                <dt>Version</dt>
                <dd>{formatText(selectedIssue.version)}</dd>

                <dt>Active</dt>
                <dd>{asYesNo(Boolean(selectedIssue.active))}</dd>
              </dl>

              {selectedIssue.imageUrl && (
                <section>
                  <h4>Reported Image</h4>
                  <a className="issue-image-link" href={selectedIssue.imageUrl} target="_blank" rel="noreferrer">
                    <img className="issue-image-preview" src={selectedIssue.imageUrl} alt={selectedIssue.title || "Issue evidence"} />
                  </a>
                </section>
              )}

              {selectedIssue.resolvedImageUrl && (
                <section>
                  <h4>Resolved Image</h4>
                  <a className="issue-image-link" href={selectedIssue.resolvedImageUrl} target="_blank" rel="noreferrer">
                    <img className="issue-image-preview" src={selectedIssue.resolvedImageUrl} alt="Resolved evidence" />
                  </a>
                </section>
              )}

              <section>
                <h4>History</h4>
                {Array.isArray(selectedIssue.history) && selectedIssue.history.length > 0 ? (
                  <div className="timeline">
                    {selectedIssue.history.map((entry, index) => (
                      <article key={`${entry.changedAt || index}-${entry.newStatus || "status"}`} className="timeline-item">
                        <strong>{formatText(entry.newStatus)}</strong>
                        <span>
                          {formatText(entry.oldStatus)} to {formatText(entry.newStatus)}
                        </span>
                        <small>By: {formatText(entry.changedByName)}</small>
                        <small>{formatDate(entry.changedAt)}</small>
                        <small>{formatText(entry.remarks)}</small>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No history available</p>
                )}
              </section>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
