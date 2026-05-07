import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { getIssueById, getRoleIssues, reassignIssue, supervisorClear, supervisorReassign } from "../../api/issues.api";
import { getDepartments } from "../../api/departments.api";
import { IssueDetailsDialog } from "../../components/issues/IssueDetailsDialog.jsx";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { Button } from "../../components/ui/button.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { ToastNotification } from "../../components/ui/ToastNotification.jsx";
import { errorMessage } from "../../lib/apiResponse";

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

export function SuperiorIssuesPage() {
  const [status, setStatus] = useState("ESCALATED");
  const [departmentId, setDepartmentId] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [sortKey, setSortKey] = useState("hardSlaDeadline");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [debouncedDepartmentId, setDebouncedDepartmentId] = useState("");
  const [debouncedReportedBy, setDebouncedReportedBy] = useState("");
  const [clearingIssue, setClearingIssue] = useState(null);
  const [clearRemarks, setClearRemarks] = useState("");

  // Debounce filter inputs to prevent excessive API calls per contract
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDepartmentId(departmentId);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [departmentId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedReportedBy(reportedBy);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [reportedBy]);
  const [toast, setToast] = useState({ message: "", tone: "info" });
  const [canonicalIssues, setCanonicalIssues] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!toast.message) return;
    const timeout = setTimeout(() => setToast({ message: "", tone: "info" }), 4000);
    return () => clearTimeout(timeout);
  }, [toast.message]);

  function showToast(message, tone = "info") {
    setToast({ message, tone });
  }

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

  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: getDepartments, staleTime: 30 * 60_000 });
  const { data, isLoading } = useQuery({
    queryKey: ["superior-issues", status, debouncedDepartmentId, debouncedReportedBy, page],
    queryFn: () => getRoleIssues("WARD_SUPERIOR", {
      status: status || undefined,
      departmentId: debouncedDepartmentId ? Number(debouncedDepartmentId) : undefined,
      reportedBy: debouncedReportedBy ? Number(debouncedReportedBy) : undefined,
      page,
      size: 10,
    }),
  });

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
        queryClient.setQueriesData({ queryKey: ["superior-issues"] }, (current) => {
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
  }, [data, queryClient, rememberCanonicalIssue]);

  const reassignMutation = useMutation({
    mutationFn: ({ id, version }) => reassignIssue(id, { version }),
    onSuccess: async (updatedIssue, variables) => {
      const detailIssue = await getIssueById(variables.id).catch(() => null);
      const canonicalIssue = {
        ...updatedIssue,
        ...(detailIssue || {}),
        status: normalizeStatus(detailIssue?.status || updatedIssue?.status || "REASSIGNED"),
      };

      rememberCanonicalIssue(canonicalIssue);
      queryClient.setQueriesData({ queryKey: ["superior-issues"] }, (current) => {
        if (!current?.content) return current;
        return {
          ...current,
          content: current.content.map((row) => (
            String(row.id) === String(variables.id)
              ? {
                  ...row,
                  ...canonicalIssue,
                }
              : row
          )),
        };
      });
      showToast("Escalated issue reassigned.", "success");
      await queryClient.refetchQueries({ queryKey: ["superior-issues"], type: "active" });
    },
    onError: (err) => showToast(errorMessage(err), "danger"),
  });
  const supervisorReassignMutation = useMutation({
    mutationFn: ({ id, version }) => supervisorReassign(id, { version }),
    onSuccess: async (updatedIssue, variables) => {
      const detailIssue = await getIssueById(variables.id).catch(() => null);
      const canonicalIssue = {
        ...updatedIssue,
        ...(detailIssue || {}),
        status: normalizeStatus(detailIssue?.status || updatedIssue?.status || "ASSIGNED"),
      };

      rememberCanonicalIssue(canonicalIssue);
      queryClient.setQueriesData({ queryKey: ["superior-issues"] }, (current) => {
        if (!current?.content) return current;
        return {
          ...current,
          content: current.content.map((row) => (
            String(row.id) === String(variables.id)
              ? {
                  ...row,
                  ...canonicalIssue,
                }
              : row
          )),
        };
      });
      showToast("Supervisor reassignment completed.", "success");
      await queryClient.refetchQueries({ queryKey: ["superior-issues"], type: "active" });
    },
    onError: (err) => showToast(errorMessage(err), "danger"),
  });

  async function submitClearIntervention(event) {
    event.preventDefault();
    const remarks = clearRemarks.trim();
    if (!clearingIssue) return;
    if (!remarks) {
      showToast("Supervisor remarks are required.", "danger");
      return;
    }
    try {
      const updatedIssue = await supervisorClear(clearingIssue.id, { version: clearingIssue.version, remarks });
      const detailIssue = await getIssueById(clearingIssue.id).catch(() => null);
      const canonicalIssue = {
        ...updatedIssue,
        ...(detailIssue || {}),
        status: normalizeStatus(detailIssue?.status || updatedIssue?.status || clearingIssue.status),
      };

      rememberCanonicalIssue(canonicalIssue);
      queryClient.setQueriesData({ queryKey: ["superior-issues"] }, (current) => {
        if (!current?.content) return current;
        return {
          ...current,
          content: current.content.map((row) => (
            String(row.id) === String(clearingIssue.id)
              ? {
                  ...row,
                  ...canonicalIssue,
                }
              : row
          )),
        };
      });
      showToast("Intervention cleared.", "success");
      setClearingIssue(null);
      setClearRemarks("");
      await queryClient.refetchQueries({ queryKey: ["superior-issues"], type: "active" });
    } catch (err) {
      showToast(errorMessage(err), "danger");
    }
  }

  const issues = (data?.content || []).map((issue) => mergeCanonicalIssue(issue, canonicalIssues[issue.id]));
  const columns = [
    { key: "title", header: "Issue" },
    { key: "status", header: "Status", accessor: (issue) => normalizeStatus(issue.status), render: (issue) => <IssueStatusBadge status={issue.status} /> },
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
        const name = pickFirst(issue.reporterName, issue.reportedByName, issue.reportedByFullName, issue.citizenName);
        const email = pickFirst(issue.reporterEmail, issue.reportedByEmail, issue.citizenEmail);
        const phone = pickFirst(issue.reporterMobile, issue.reportedByMobile, issue.reporterPhone, issue.citizenMobile);
        return renderContact(name, email, phone);
      },
    },
    {
      key: "officialDetails",
      header: "Working Official",
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
        const name = pickFirst(issue.assignedOfficialName, issue.currentOfficialName, issue.officialName);
        const email = pickFirst(issue.assignedOfficialEmail, issue.currentOfficialEmail, issue.officialEmail);
        const phone = pickFirst(issue.assignedOfficialMobile, issue.currentOfficialMobile, issue.officialMobile);
        return renderContact(name, email, phone);
      },
    },
    { key: "departmentName", header: "Department", accessor: (issue) => issue.departmentName || "N/A", render: (issue) => issue.departmentName || "N/A" },
    {
      key: "hardSlaDeadline",
      header: "SLA Status",
      accessor: (issue) => issue.hardSlaBreached ? "Breached" : issue.softSlaBreached ? "At risk" : "On track",
      render: (issue) => {
        if (issue.hardSlaBreached) return <span className="sla-breached">Breached</span>;
        if (issue.softSlaBreached) return <span className="sla-warning">At risk</span>;
        return <span className="sla-on-track">On track</span>;
      },
    },
    { key: "requiresSupervisorIntervention", header: "Intervention", accessor: (issue) => issue.requiresSupervisorIntervention ? "Required" : "No", render: (issue) => issue.requiresSupervisorIntervention ? "Required" : "No" },
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
          {issue.status === "ESCALATED" && <button disabled={reassignMutation.isPending} onClick={() => reassignMutation.mutate({ id: issue.id, version: issue.version })}>{reassignMutation.isPending ? "Reassigning..." : "Reassign"}</button>}
          {issue.status === "ASSIGNED" && issue.requiresSupervisorIntervention && <button disabled={supervisorReassignMutation.isPending} onClick={() => supervisorReassignMutation.mutate({ id: issue.id, version: issue.version })}>{supervisorReassignMutation.isPending ? "Reassigning..." : "Supervisor reassign"}</button>}
          {issue.status === "ASSIGNED" && issue.requiresSupervisorIntervention && <button onClick={() => setClearingIssue(issue)}>Clear</button>}
          {issue.requiresSupervisorIntervention && issue.status !== "ASSIGNED" && <span className="action-note">Intervention flag present, but only ASSIGNED issues can be supervisor-reassigned.</span>}
          {issue.status !== "ESCALATED" && !issue.requiresSupervisorIntervention && <span className="action-note">No action needed</span>}
        </div>
      ),
    },
  ];

  return (
    <section className="page-stack">
      <ToastNotification
        message={toast.message}
        tone={toast.tone}
        role={toast.tone === "danger" ? "alert" : "status"}
        ariaLive="polite"
      />
      <PageHeader
        eyebrow="Escalation queue"
        title="Ward issues needing attention"
      />
      <DataTable
        caption="Ward superior escalation issues"
        columns={columns}
        rows={issues}
        getRowKey={(issue) => issue.id}
        isLoading={isLoading}
        loadingText="Loading escalations..."
        emptyTitle="No issues need intervention"
        searchPlaceholder="Search issues, department, reporter, official..."
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={({ key, direction }) => {
          setSortKey(key);
          setSortDirection(direction);
        }}
        filters={
        <div className="page-actions admin-issues-controls issues-sort-controls">
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>
            <option value="ESCALATED">Escalated</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="">All</option>
          </select>
          <select value={departmentId} onChange={(event) => {
            setDepartmentId(event.target.value);
          }}>
            <option value="">All departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <input
            placeholder="Reported by user id"
            value={reportedBy}
            onChange={(event) => {
              setReportedBy(event.target.value.replace(/[^0-9]/g, ""));
            }}
          />
        </div>
        }
      />
      <Pagination page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
      <OpenStreetMapAttribution />
      <IssueDetailsDialog
        issue={selectedIssue}
        open={Boolean(selectedIssue)}
        onOpenChange={(open) => {
          if (!open) setSelectedIssue(null);
        }}
      />
      <Dialog
        open={Boolean(clearingIssue)}
        onOpenChange={(open) => {
          if (!open) {
            setClearingIssue(null);
            setClearRemarks("");
          }
        }}
      >
        <DialogContent className="admin-edit-dialog">
          <DialogHeader>
            <DialogTitle>Clear intervention?</DialogTitle>
            <DialogDescription>
              Add supervisor remarks before clearing this intervention flag.
            </DialogDescription>
          </DialogHeader>
          <form className="form-grid" onSubmit={submitClearIntervention} noValidate>
            <label>
              Supervisor remarks
              <textarea rows={4} value={clearRemarks} onChange={(event) => setClearRemarks(event.target.value)} />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setClearingIssue(null);
                setClearRemarks("");
              }}>Cancel</Button>
              <Button type="submit">Clear intervention</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
