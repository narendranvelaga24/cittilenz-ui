import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getRoleIssues, reassignIssue, supervisorClear, supervisorReassign } from "../../api/issues.api";
import { getDepartments } from "../../api/departments.api";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { errorMessage } from "../../lib/apiResponse";

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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(""), 4000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);
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

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["superior-issues"] });
  const reassignMutation = useMutation({
    mutationFn: reassignIssue,
    onSuccess: () => { setMessage("Escalated issue reassigned."); setToastMessage("Escalated issue reassigned."); invalidate(); },
    onError: (err) => setError(errorMessage(err)),
  });
  const supervisorReassignMutation = useMutation({
    mutationFn: supervisorReassign,
    onSuccess: () => { setMessage("Supervisor reassignment completed."); setToastMessage("Supervisor reassignment completed."); invalidate(); },
    onError: (err) => setError(errorMessage(err)),
  });

  async function clearIntervention(issue) {
    const remarks = window.prompt("Enter supervisor remarks");
    if (!remarks) return;
    try {
      await supervisorClear(issue.id, { version: issue.version, remarks });
      setMessage("Intervention cleared.");
      setToastMessage("Intervention cleared.");
      invalidate();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const issues = data?.content || [];
  const columns = [
    { key: "title", header: "Issue" },
    { key: "status", header: "Status", render: (issue) => <IssueStatusBadge status={issue.status} /> },
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
          {issue.status === "ESCALATED" && <button disabled={reassignMutation.isPending} onClick={() => reassignMutation.mutate(issue.id)}>{reassignMutation.isPending ? "Reassigning..." : "Reassign"}</button>}
          {issue.requiresSupervisorIntervention && <button disabled={supervisorReassignMutation.isPending} onClick={() => supervisorReassignMutation.mutate(issue.id)}>{supervisorReassignMutation.isPending ? "Reassigning..." : "Supervisor reassign"}</button>}
          {issue.requiresSupervisorIntervention && <button onClick={() => clearIntervention(issue)}>Clear</button>}
          {issue.status !== "ESCALATED" && !issue.requiresSupervisorIntervention && <span className="action-note">No action needed</span>}
        </div>
      ),
    },
  ];

  return (
    <section className="page-stack">
      {toastMessage && <div className="toast-message">{toastMessage}</div>}
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
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
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
