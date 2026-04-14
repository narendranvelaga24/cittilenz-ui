import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getMyIssues } from "../../api/issues.api";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { formatDate } from "../../lib/format";
import { useAuth } from "../auth/useAuth";

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
  if (!hasAny) {
    return <span className="muted">{fallbackLabel}</span>;
  }
  return (
    <div className="contact-stack">
      <strong>{name || "N/A"}</strong>
      <span>{email || "Email not available"}</span>
      <span>{phone || "Phone not available"}</span>
    </div>
  );
}

export function MyIssuesPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const { data, isLoading } = useQuery({
    queryKey: ["my-issues", page],
    queryFn: () => getMyIssues({ page, size: 10, sortBy: "createdAt", direction: "DESC" }),
  });

  const issues = data?.content || [];
  const columns = [
    { key: "title", header: "Issue" },
    { key: "status", header: "Status", render: (issue) => <IssueStatusBadge status={issue.status} /> },
    {
      key: "officialDetails",
      header: "Assigned/Resolved Official",
      render: (issue) => {
        const assignedName = pickFirst(issue.assignedOfficialName, issue.currentOfficialName, issue.officialName);
        const assignedEmail = pickFirst(issue.assignedOfficialEmail, issue.currentOfficialEmail, issue.officialEmail);
        const assignedPhone = pickFirst(issue.assignedOfficialMobile, issue.currentOfficialMobile, issue.officialMobile);
        const resolvedName = pickFirst(issue.resolvedByOfficialName, issue.resolverName);
        const resolvedEmail = pickFirst(issue.resolvedByOfficialEmail, issue.resolverEmail);
        const resolvedPhone = pickFirst(issue.resolvedByOfficialMobile, issue.resolverMobile);
        const isResolved = String(issue.status || "").toUpperCase() === "RESOLVED";
        return renderContact(
          isResolved ? pickFirst(resolvedName, assignedName) : assignedName,
          isResolved ? pickFirst(resolvedEmail, assignedEmail) : assignedEmail,
          isResolved ? pickFirst(resolvedPhone, assignedPhone) : assignedPhone,
          "Official details not available"
        );
      },
    },
    { key: "departmentName", header: "Department", render: (issue) => issue.departmentName || "Pending" },
    { key: "createdAt", header: "Created", render: (issue) => formatDate(issue.createdAt) },
    { key: "action", header: "", render: (issue) => <Link to={`/citizen/issues/${issue.id}`}>View</Link> },
  ];

  return (
    <section className="page-stack">
      <PageHeader eyebrow="Tracking" title="My reported issues" actions={<Link className="primary-button" to="/citizen/report-issue">New report</Link>} />
      <DataTable
        caption="My reported civic issues"
        columns={columns}
        rows={issues}
        getRowKey={(issue) => issue.id}
        isLoading={isLoading}
        loadingText="Loading issues..."
        emptyTitle="No issues reported yet"
        emptyDescription="Create your first report to start tracking civic work."
      />
      <Pagination page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
      <OpenStreetMapAttribution />
    </section>
  );
}
