import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getMyIssues } from "../../api/issues.api";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { formatDate } from "../../lib/format";

export function MyIssuesPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useQuery({
    queryKey: ["my-issues", page],
    queryFn: () => getMyIssues({ page, size: 10, sortBy: "createdAt", direction: "DESC" }),
  });

  const issues = data?.content || [];
  const columns = [
    { key: "title", header: "Issue" },
    { key: "status", header: "Status", render: (issue) => <IssueStatusBadge status={issue.status} /> },
    { key: "departmentName", header: "Department", render: (issue) => issue.departmentName || "Pending" },
    { key: "assignedOfficialName", header: "Official", render: (issue) => issue.assignedOfficialName || "Not assigned" },
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
    </section>
  );
}
