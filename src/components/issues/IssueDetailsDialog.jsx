import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.jsx";
import { formatDate } from "../../lib/format";

function formatText(value) {
  if (value === undefined || value === null) return "N/A";
  const text = String(value).trim();
  return text === "" ? "N/A" : text;
}

function asYesNo(value) {
  return value ? "Yes" : "No";
}

export function IssueDetailsDialog({ issue, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-view-dialog" aria-label="Issue details">
        {issue && (
          <>
            <DialogHeader>
              <DialogTitle className="issue-view-title">{formatText(issue.title)}</DialogTitle>
              <DialogDescription>
                Detailed issue snapshot for review.
              </DialogDescription>
            </DialogHeader>

            <div className="dialog-body">
              <dl className="details-list">
                <dt>Description</dt>
                <dd>{formatText(issue.description)}</dd>

                <dt>Issue Type</dt>
                <dd>{formatText(issue.issueTypeName || issue.displayName || issue.type)}</dd>

                <dt>Latitude</dt>
                <dd>{formatText(issue.latitude)}</dd>

                <dt>Longitude</dt>
                <dd>{formatText(issue.longitude)}</dd>

                <dt>Street</dt>
                <dd>{formatText(issue.street)}</dd>

                <dt>Area</dt>
                <dd>{formatText(issue.area)}</dd>

                <dt>Locality</dt>
                <dd>{formatText(issue.locality)}</dd>

                <dt>City</dt>
                <dd>{formatText(issue.city)}</dd>

                <dt>Pincode</dt>
                <dd>{formatText(issue.pincode)}</dd>

                <dt>Ward Id</dt>
                <dd>{formatText(issue.wardId)}</dd>

                <dt>Ward Name</dt>
                <dd>{formatText(issue.wardName)}</dd>

                <dt>Department Id</dt>
                <dd>{formatText(issue.departmentId)}</dd>

                <dt>Department Name</dt>
                <dd>{formatText(issue.departmentName)}</dd>

                <dt>Reported By</dt>
                <dd>{formatText(issue.reportedByName || issue.reporterName)}</dd>

                <dt>Assigned Official</dt>
                <dd>{formatText(issue.assignedOfficialName)}</dd>

                <dt>Assigned Official Id</dt>
                <dd>{formatText(issue.assignedOfficialId)}</dd>

                <dt>Assigned Official Mobile</dt>
                <dd>{formatText(issue.assignedOfficialMobile)}</dd>

                <dt>Assigned Official Email</dt>
                <dd>{formatText(issue.assignedOfficialEmail)}</dd>

                <dt>Ward Superior</dt>
                <dd>{formatText(issue.wardSuperiorName)}</dd>

                <dt>Ward Superior Mobile</dt>
                <dd>{formatText(issue.wardSuperiorMobile)}</dd>

                <dt>Ward Superior Email</dt>
                <dd>{formatText(issue.wardSuperiorEmail)}</dd>

                <dt>Status</dt>
                <dd>{formatText(issue.status)}</dd>

                <dt>Priority</dt>
                <dd>{formatText(issue.priority)}</dd>

                <dt>Report Count</dt>
                <dd>{formatText(issue.reportCount)}</dd>

                <dt>Created At</dt>
                <dd>{formatDate(issue.createdAt)}</dd>

                <dt>Assigned At</dt>
                <dd>{formatDate(issue.assignedAt)}</dd>

                <dt>Started At</dt>
                <dd>{formatDate(issue.startedAt)}</dd>

                <dt>Resolved At</dt>
                <dd>{formatDate(issue.resolvedAt)}</dd>

                <dt>Escalated At</dt>
                <dd>{formatDate(issue.escalatedAt)}</dd>

                <dt>Reassigned At</dt>
                <dd>{formatDate(issue.reassignedAt)}</dd>

                <dt>Soft SLA Deadline</dt>
                <dd>{formatDate(issue.softSlaDeadline)}</dd>

                <dt>Hard SLA Deadline</dt>
                <dd>{formatDate(issue.hardSlaDeadline)}</dd>

                <dt>Soft SLA Breached</dt>
                <dd>{asYesNo(Boolean(issue.softSlaBreached))}</dd>

                <dt>Hard SLA Breached</dt>
                <dd>{asYesNo(Boolean(issue.hardSlaBreached))}</dd>

                <dt>Escalation Count</dt>
                <dd>{formatText(issue.escalationCount)}</dd>

                <dt>Reassignment Count</dt>
                <dd>{formatText(issue.reassignmentCount)}</dd>

                <dt>Requires Supervisor Intervention</dt>
                <dd>{asYesNo(Boolean(issue.requiresSupervisorIntervention))}</dd>

                <dt>Version</dt>
                <dd>{formatText(issue.version)}</dd>

                <dt>Active</dt>
                <dd>{asYesNo(Boolean(issue.active))}</dd>
              </dl>

              {issue.imageUrl && (
                <section>
                  <h4 className="issue-view-section-title">Reported Image</h4>
                  <a className="issue-image-link" href={issue.imageUrl} target="_blank" rel="noreferrer">
                    <img className="issue-image-preview" src={issue.imageUrl} alt={issue.title || "Issue evidence"} />
                  </a>
                </section>
              )}

              {issue.resolvedImageUrl && (
                <section>
                  <h4 className="issue-view-section-title">Resolved Image</h4>
                  <a className="issue-image-link" href={issue.resolvedImageUrl} target="_blank" rel="noreferrer">
                    <img className="issue-image-preview" src={issue.resolvedImageUrl} alt="Resolved evidence" />
                  </a>
                </section>
              )}

              <section>
                <h4 className="issue-view-section-title">History</h4>
                {Array.isArray(issue.history) && issue.history.length > 0 ? (
                  <div className="timeline">
                    {issue.history.map((entry, index) => (
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
