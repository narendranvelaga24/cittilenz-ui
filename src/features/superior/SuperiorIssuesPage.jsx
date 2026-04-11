import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getRoleIssues, reassignIssue, supervisorClear, supervisorReassign } from "../../api/issues.api";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { errorMessage } from "../../lib/apiResponse";

export function SuperiorIssuesPage() {
  const [status, setStatus] = useState("ESCALATED");
  const [departmentId, setDepartmentId] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["superior-issues", status, departmentId, reportedBy, page],
    queryFn: () => getRoleIssues("WARD_SUPERIOR", {
      status: status || undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
      reportedBy: reportedBy ? Number(reportedBy) : undefined,
      page,
      size: 10,
    }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["superior-issues"] });
  const reassignMutation = useMutation({
    mutationFn: reassignIssue,
    onSuccess: () => { setMessage("Escalated issue reassigned."); invalidate(); },
    onError: (err) => setError(errorMessage(err)),
  });
  const supervisorReassignMutation = useMutation({
    mutationFn: supervisorReassign,
    onSuccess: () => { setMessage("Supervisor reassignment completed."); invalidate(); },
    onError: (err) => setError(errorMessage(err)),
  });

  async function clearIntervention(issue) {
    const remarks = window.prompt("Enter supervisor remarks");
    if (!remarks) return;
    try {
      await supervisorClear(issue.id, { version: issue.version, remarks });
      setMessage("Intervention cleared.");
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
    { key: "requiresSupervisorIntervention", header: "Intervention", render: (issue) => issue.requiresSupervisorIntervention ? "Required" : "No" },
    {
      key: "actions",
      header: "Actions",
      render: (issue) => (
        <div className="action-cell">
          {issue.status === "ESCALATED" && <button onClick={() => reassignMutation.mutate(issue.id)}>Reassign</button>}
          {issue.requiresSupervisorIntervention && <button onClick={() => supervisorReassignMutation.mutate(issue.id)}>Supervisor reassign</button>}
          {issue.requiresSupervisorIntervention && <button onClick={() => clearIntervention(issue)}>Clear</button>}
          {issue.status !== "ESCALATED" && !issue.requiresSupervisorIntervention && <span className="action-note">No action needed</span>}
        </div>
      ),
    },
  ];

  return (
    <section className="page-stack">
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
    </section>
  );
}
