import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getIssueById, getMyIssues } from "../../api/issues.api";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { formatDate } from "../../lib/format";
import { useAuth } from "../auth/useAuth";

function normalizeStatus(status) {
  return String(status || "").trim().toUpperCase();
}

function statusRank(status) {
  const order = {
    SUBMITTED: 1,
    ASSIGNED: 2,
    REASSIGNED: 3,
    IN_PROGRESS: 4,
    ESCALATED: 5,
    RESOLVED: 6,
    REJECTED: 7,
  };
  return order[normalizeStatus(status)] || 0;
}

function lifecycleVersion(issue) {
  const version = Number(issue?.version);
  return Number.isFinite(version) ? version : -1;
}

function isNewerLifecycleState(current, incoming) {
  if (!current) return true;
  if (!incoming) return false;

  const currentVersion = lifecycleVersion(current);
  const incomingVersion = lifecycleVersion(incoming);
  if (incomingVersion > currentVersion) return true;
  if (incomingVersion < currentVersion) return false;

  return statusRank(incoming?.status) >= statusRank(current?.status);
}

function mergeCanonicalIssue(row, canonicalIssue) {
  if (!canonicalIssue) return row;
  if (isNewerLifecycleState(canonicalIssue, row)) {
    return {
      ...canonicalIssue,
      ...row,
      status: normalizeStatus(row.status) || canonicalIssue.status,
    };
  }

  return {
    ...row,
    ...canonicalIssue,
    status: normalizeStatus(canonicalIssue.status) || row.status,
  };
}

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
  const [page, setPage] = useState(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [canonicalIssues, setCanonicalIssues] = useState({});
  const { data, isLoading } = useQuery({
    queryKey: ["my-issues", user?.id, page],
    queryFn: () => getMyIssues({ page, size: 10, sortBy: "createdAt", direction: "DESC" }),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const rememberCanonicalIssue = useCallback((issue) => {
    if (!issue?.id) return;

    setCanonicalIssues((previous) => {
      const current = previous[issue.id];
      const incoming = {
        ...current,
        ...issue,
        status: normalizeStatus(issue.status) || current?.status,
      };

      if (!current || isNewerLifecycleState(current, incoming)) {
        return {
          ...previous,
          [issue.id]: incoming,
        };
      }

      return previous;
    });
  }, []);

  useEffect(() => {
    const rows = data?.content || [];
    if (!rows.length) return;

    let cancelled = false;

    async function reconcileWithIssueDetails() {
      const comparisons = await Promise.all(rows.map(async (row) => {
        try {
          const detail = await getIssueById(row.id);
          if (!detail) return null;

          rememberCanonicalIssue(detail);

          if (!isNewerLifecycleState(row, detail)) return null;

          return {
            id: row.id,
            issue: {
              ...row,
              ...detail,
              status: normalizeStatus(detail.status) || row.status,
            },
          };
        } catch {
          return null;
        }
      }));

      if (cancelled) return;

      const updates = comparisons.filter(Boolean);
      if (!updates.length) return;

      updates.forEach(({ id, issue }) => {
        queryClient.setQueriesData({ queryKey: ["my-issues", user?.id] }, (current) => {
          if (!current?.content) return current;
          const nextContent = current.content.map((row) => (String(row.id) === String(id) ? { ...row, ...issue } : row));
          return { ...current, content: nextContent };
        });
      });
    }

    reconcileWithIssueDetails();

    return () => {
      cancelled = true;
    };
  }, [data, queryClient, rememberCanonicalIssue, user?.id]);

  const issues = (data?.content || []).map((issue) => mergeCanonicalIssue(issue, canonicalIssues[issue.id]));
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
