import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRoleIssues, reassignIssue, supervisorClear, supervisorReassign } from "../../api/issues.api";
import { getDepartments } from "../../api/departments.api";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
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

export function SuperiorIssuesPage() {
  const [status, setStatus] = useState("ESCALATED");
  const [departmentId, setDepartmentId] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [page, setPage] = useState(0);
  const [debouncedDepartmentId, setDebouncedDepartmentId] = useState("");
  const [debouncedReportedBy, setDebouncedReportedBy] = useState("");

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
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!toast.message) return;
    const timeout = setTimeout(() => setToast({ message: "", tone: "info" }), 4000);
    return () => clearTimeout(timeout);
  }, [toast.message]);

  function showToast(message, tone = "info") {
    setToast({ message, tone });
  }
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

  const reassignMutation = useMutation({
    mutationFn: reassignIssue,
    onSuccess: async (updatedIssue, id) => {
      queryClient.setQueriesData({ queryKey: ["superior-issues"] }, (current) => {
        if (!current?.content) return current;
        return {
          ...current,
          content: current.content.map((row) => (
            row.id === id
              ? {
                  ...row,
                  status: updatedIssue?.status || "REASSIGNED",
                  requiresSupervisorIntervention: updatedIssue?.requiresSupervisorIntervention ?? false,
                  version: updatedIssue?.version || row.version,
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
      queryClient.setQueriesData({ queryKey: ["superior-issues"] }, (current) => {
        if (!current?.content) return current;
        return {
          ...current,
          content: current.content.map((row) => (
            row.id === variables.id
              ? {
                  ...row,
                  status: updatedIssue?.status || row.status,
                  requiresSupervisorIntervention: updatedIssue?.requiresSupervisorIntervention ?? false,
                  version: updatedIssue?.version || row.version,
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

  async function clearIntervention(issue) {
    const remarks = window.prompt("Enter supervisor remarks");
    if (!remarks) return;
    try {
      const updatedIssue = await supervisorClear(issue.id, { version: issue.version, remarks });
      queryClient.setQueriesData({ queryKey: ["superior-issues"] }, (current) => {
        if (!current?.content) return current;
        return {
          ...current,
          content: current.content.map((row) => (
            row.id === issue.id
              ? {
                  ...row,
                  status: updatedIssue?.status || row.status,
                  requiresSupervisorIntervention: false,
                  version: updatedIssue?.version || row.version,
                }
              : row
          )),
        };
      });
      showToast("Intervention cleared.", "success");
      await queryClient.refetchQueries({ queryKey: ["superior-issues"], type: "active" });
    } catch (err) {
      showToast(errorMessage(err), "danger");
    }
  }

  const issues = data?.content || [];
  const columns = [
    { key: "title", header: "Issue" },
    { key: "status", header: "Status", render: (issue) => <IssueStatusBadge status={issue.status} /> },
    {
      key: "reporterDetails",
      header: "Reported By",
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
      render: (issue) => {
        const name = pickFirst(issue.assignedOfficialName, issue.currentOfficialName, issue.officialName);
        const email = pickFirst(issue.assignedOfficialEmail, issue.currentOfficialEmail, issue.officialEmail);
        const phone = pickFirst(issue.assignedOfficialMobile, issue.currentOfficialMobile, issue.officialMobile);
        return renderContact(name, email, phone);
      },
    },
    { key: "departmentName", header: "Department", render: (issue) => issue.departmentName || "N/A" },
    {
      key: "hardSlaDeadline",
      header: "SLA Status",
      render: (issue) => {
        if (issue.hardSlaBreached) return <span className="sla-breached">Breached</span>;
        if (issue.softSlaBreached) return <span className="sla-warning">At risk</span>;
        return <span className="sla-on-track">On track</span>;
      },
    },
    { key: "requiresSupervisorIntervention", header: "Intervention", render: (issue) => issue.requiresSupervisorIntervention ? "Required" : "No" },
    {
      key: "actions",
      header: "Actions",
      render: (issue) => (
        <div className="action-cell">
          <Link to={`/superior/issues/${issue.id}`}>View</Link>
          {issue.status === "ESCALATED" && <button disabled={reassignMutation.isPending} onClick={() => reassignMutation.mutate(issue.id)}>{reassignMutation.isPending ? "Reassigning..." : "Reassign"}</button>}
          {issue.status === "ASSIGNED" && issue.requiresSupervisorIntervention && <button disabled={supervisorReassignMutation.isPending} onClick={() => supervisorReassignMutation.mutate({ id: issue.id, version: issue.version })}>{supervisorReassignMutation.isPending ? "Reassigning..." : "Supervisor reassign"}</button>}
          {issue.status === "ASSIGNED" && issue.requiresSupervisorIntervention && <button onClick={() => clearIntervention(issue)}>Clear</button>}
          {issue.requiresSupervisorIntervention && issue.status !== "ASSIGNED" && <span className="action-note">Intervention flag present, but only ASSIGNED issues can be supervisor-reassigned.</span>}
          {issue.status !== "ESCALATED" && !issue.requiresSupervisorIntervention && <span className="action-note">No action needed</span>}
        </div>
      ),
    },
  ];

  return (
    <section className="page-stack">
      {toast.message && (
        <div className={`toast-message toast-${toast.tone}`} role={toast.tone === "danger" ? "alert" : "status"} aria-live="polite">
          {toast.message}
        </div>
      )}
      <PageHeader
        eyebrow="Escalation queue"
        title="Ward issues needing attention"
        actions={
        <div className="page-actions">
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
      <DataTable
        caption="Ward superior escalation issues"
        columns={columns}
        rows={issues}
        getRowKey={(issue) => issue.id}
        isLoading={isLoading}
        loadingText="Loading escalations..."
        emptyTitle="No issues need intervention"
      />
      <Pagination page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
      <OpenStreetMapAttribution />
    </section>
  );
}
