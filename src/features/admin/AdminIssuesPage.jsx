import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getRoleIssues } from "../../api/issues.api";
import { IssueDetailsDialog } from "../../components/issues/IssueDetailsDialog.jsx";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";

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
  const statusOptions = ["SUBMITTED", "ASSIGNED", "REASSIGNED", "IN_PROGRESS", "ESCALATED", "RESOLVED", "REJECTED"];

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

  const columns = [
    { key: "title", header: "Issue" },
    { key: "status", header: "Status", accessor: (issue) => issue.status, render: (issue) => <IssueStatusBadge status={issue.status} /> },
    {
      key: "issueType",
      header: "Type",
      accessor: (issue) => issue.issueTypeName || issue.displayName || issue.type || "Uncategorized",
      render: (issue) => issue.issueTypeName || issue.displayName || issue.type || "Uncategorized",
    },
    {
      key: "reporterDetails",
      header: "Reported By",
      searchValue: (issue) => [
        issue.reporterName,
        issue.reportedByName,
        issue.reportedByFullName,
        issue.citizenName,
        issue.reporterEmail,
        issue.reportedByEmail,
        issue.citizenEmail,
        issue.reporterMobile,
        issue.reportedByMobile,
        issue.reporterPhone,
        issue.citizenMobile,
      ].filter(Boolean).join(" "),
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
      searchValue: (issue) => [
        issue.assignedOfficialName,
        issue.currentOfficialName,
        issue.officialName,
        issue.assignedOfficialEmail,
        issue.currentOfficialEmail,
        issue.officialEmail,
        issue.assignedOfficialMobile,
        issue.currentOfficialMobile,
        issue.officialMobile,
      ].filter(Boolean).join(" "),
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
      enableSort: false,
      searchable: false,
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
      />

      <DataTable
        caption="Admin issues"
        columns={columns}
        rows={rows}
        getRowKey={(issue) => issue.id}
        emptyTitle="No issues found"
        isLoading={isFetching}
        searchPlaceholder="Search issues, status, type, reporter, official..."
        toolbar={<span>{isFetching ? "Refreshing..." : `Showing ${rows.length} of ${data?.totalElements ?? 0}`}</span>}
        filters={
          <div className="page-actions admin-issues-controls" aria-label="Admin issue filters">
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>
              <option value="">Status</option>
              {statusOptions.map((value) => (
                <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
              ))}
            </select>
            <input
              placeholder="Ward"
              value={wardId}
              onChange={(event) => {
                setWardId(event.target.value.replace(/[^0-9]/g, ""));
                setPage(0);
              }}
            />
            <input
              placeholder="Dept"
              value={departmentId}
              onChange={(event) => {
                setDepartmentId(event.target.value.replace(/[^0-9]/g, ""));
                setPage(0);
              }}
            />
            <input
              placeholder="Reporter"
              value={reportedBy}
              onChange={(event) => {
                setReportedBy(event.target.value.replace(/[^0-9]/g, ""));
                setPage(0);
              }}
            />
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setStatus("");
                setWardId("");
                setDepartmentId("");
                setReportedBy("");
                setDebouncedWardId("");
                setDebouncedDepartmentId("");
                setDebouncedReportedBy("");
                setPage(0);
              }}
            >
              Clear
            </button>
          </div>
        }
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <OpenStreetMapAttribution />

      <IssueDetailsDialog
        issue={selectedIssue}
        open={Boolean(selectedIssue)}
        onOpenChange={(open) => {
          if (!open) closeDetails();
        }}
      />
    </section>
  );
}
