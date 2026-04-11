import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getRoleIssues, resolveIssue, startIssue } from "../../api/issues.api";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { FileUpload } from "../../components/ui/FileUpload.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { useAuth } from "../auth/useAuth";
import { errorMessage } from "../../lib/apiResponse";
import { formatDate } from "../../lib/format";

export function OfficialIssuesPage({ mode }) {
  const { user } = useAuth();
  const role = mode === "admin" ? "ADMIN" : user.role;
  const [status, setStatus] = useState("");
  const [wardId, setWardId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const queryKey = ["role-issues", role, status, wardId, departmentId, reportedBy, page];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getRoleIssues(role, {
      status: status || undefined,
      wardId: role === "ADMIN" && wardId ? Number(wardId) : undefined,
      departmentId: role === "ADMIN" && departmentId ? Number(departmentId) : undefined,
      reportedBy: reportedBy ? Number(reportedBy) : undefined,
      page,
      size: 10,
    }),
  });

  const startMutation = useMutation({
    mutationFn: (issue) => startIssue(issue.id, issue.version),
    onSuccess: () => {
      setMessage("Work started.");
      queryClient.invalidateQueries({ queryKey: ["role-issues"] });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  async function handleResolve(issue, file) {
    setError("");
    setMessage("");
    if (!file?.type?.startsWith("image/")) {
      setError("Upload a valid fixed image.");
      return;
    }
    const payload = new FormData();
    payload.append("version", issue.version);
    payload.append("image", file);
    try {
      await resolveIssue(issue.id, payload);
      setMessage("Issue resolved.");
      queryClient.invalidateQueries({ queryKey: ["role-issues"] });
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const issues = data?.content || [];
  const columns = [
    { key: "title", header: "Issue" },
    { key: "status", header: "Status", render: (issue) => <IssueStatusBadge status={issue.status} /> },
    { key: "wardName", header: "Ward", render: (issue) => issue.wardName || "N/A" },
    { key: "hardSlaDeadline", header: "SLA", render: (issue) => formatDate(issue.hardSlaDeadline) },
    {
      key: "actions",
      header: "Actions",
      render: (issue) => (
        <div className="action-cell">
          {role === "ADMIN" && <span className="action-note">Read-only</span>}
          {role === "OFFICIAL" && issue.status === "SUBMITTED" && <span className="action-note">Waiting for assignment</span>}
          {role === "OFFICIAL" && issue.status === "ASSIGNED" && (
            <button onClick={() => startMutation.mutate(issue)}>Start</button>
          )}
          {role === "OFFICIAL" && issue.status === "IN_PROGRESS" && (
            <ResolveIssueAction issue={issue} onError={setError} onResolve={handleResolve} />
          )}
          {role === "OFFICIAL" && ["RESOLVED", "ESCALATED", "REJECTED"].includes(issue.status) && <span className="action-note">No officer action</span>}
        </div>
      ),
    },
  ];

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow={role === "ADMIN" ? "Admin issue view" : "Official work queue"}
        title={role === "ADMIN" ? "All issues" : "Assigned issues"}
        actions={
        <div className="page-actions">
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>
            <option value="">All statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
          </select>
          {role === "ADMIN" && (
            <>
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
            </>
          )}
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
        caption={role === "ADMIN" ? "All reported issues" : "Official assigned issues"}
        columns={columns}
        rows={issues}
        getRowKey={(issue) => issue.id}
        isLoading={isLoading}
        loadingText="Loading issues..."
        emptyTitle="No matching issues"
      />
      <Pagination page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
    </section>
  );
}

function ResolveIssueAction({ issue, onError, onResolve }) {
  const [file, setFile] = useState(null);

  return (
    <div className="resolve-upload-action">
      <FileUpload
        buttonText="Fixed image"
        helperText="Upload proof before resolving."
        onChange={setFile}
        onError={onError}
        value={file}
        variant="compact"
      />
      <button disabled={!file} onClick={() => onResolve(issue, file)} type="button">
        Resolve
      </button>
    </div>
  );
}
