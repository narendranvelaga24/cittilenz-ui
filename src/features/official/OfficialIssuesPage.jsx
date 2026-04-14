import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getIssueById, getRoleIssues, resolveIssue, startIssue } from "../../api/issues.api";
import { IssueStatusBadge } from "../../components/issues/IssueStatusBadge.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { FileUpload } from "../../components/ui/FileUpload.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { useAuth } from "../auth/useAuth";
import { errorMessage } from "../../lib/apiResponse";
import { formatDate } from "../../lib/format";

function normalizeStatus(status) {
  return String(status || "").trim().toUpperCase();
}

function isAssignedToUser(issue, user) {
  if (issue?.assignedOfficialId != null) {
    return Number(issue.assignedOfficialId) === Number(user?.id);
  }
  if (issue?.assignedOfficialName) {
    return issue.assignedOfficialName === user?.fullName;
  }
  return true;
}

function isResolvedByUser(issue, user) {
  if (normalizeStatus(issue?.status) !== "RESOLVED") return false;

  // Check by ID (most reliable)
  if (issue?.resolvedByOfficialId != null && user?.id != null) {
    return Number(issue.resolvedByOfficialId) === Number(user.id);
  }

  // Check by name (fallback, only check resolved-by fields, NOT assigned)
  const resolvedName = pickFirst(issue?.resolvedByOfficialName, issue?.resolverName, issue?.resolvedByName);
  if (resolvedName && user?.fullName) {
    return resolvedName === user.fullName;
  }

  // No resolved-by information available → not by this user
  return false;
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

function normalizeIssuePayload(payload) {
  return payload?.updatedIssue || payload?.issue || payload?.data || payload;
}

function reconcileRoleIssueCaches(queryClient, role, issueId, updatedIssue) {
  const allRoleIssueQueries = queryClient.getQueriesData({ queryKey: ["role-issues", role] });
  const nextStatus = normalizeStatus(updatedIssue?.status);

  allRoleIssueQueries.forEach(([key, snapshot]) => {
    if (!Array.isArray(key) || !snapshot?.content) return;
    const statusFilter = normalizeStatus(key[2]);
    const keepInThisList = !statusFilter || statusFilter === nextStatus;
    const existingIndex = snapshot.content.findIndex((row) => String(row.id) === String(issueId));
    if (existingIndex === -1) return;

    const nextContent = [...snapshot.content];
    if (keepInThisList) {
      nextContent[existingIndex] = { ...nextContent[existingIndex], ...updatedIssue };
    } else {
      nextContent.splice(existingIndex, 1);
    }

    queryClient.setQueryData(key, {
      ...snapshot,
      content: nextContent,
      totalElements: typeof snapshot.totalElements === "number"
        ? Math.max(0, snapshot.totalElements + (keepInThisList ? 0 : -1))
        : snapshot.totalElements,
    });
  });
}

function updateIssueDetailCache(queryClient, issueId, updatedIssue) {
  queryClient.setQueryData(["issue", String(issueId)], (current) => ({
    ...(current || {}),
    ...updatedIssue,
  }));
}

function updateOfficialDashboardCache(queryClient, previousStatus, nextStatus) {
  queryClient.setQueryData(["official-dashboard"], (current) => {
    if (!current) return current;

    const nextDashboard = { ...current };
    const statusPairs = [
      ["ASSIGNED", "totalAssigned"],
      ["IN_PROGRESS", "totalInProgress"],
      ["RESOLVED", "totalResolved"],
      ["ESCALATED", "totalEscalated"],
    ];

    for (const [status, key] of statusPairs) {
      if (normalizeStatus(previousStatus) === status) {
        nextDashboard[key] = Math.max(0, Number(nextDashboard[key] || 0) - 1);
      }
      if (normalizeStatus(nextStatus) === status) {
        nextDashboard[key] = Math.max(0, Number(nextDashboard[key] || 0) + 1);
      }
    }

    return nextDashboard;
  });
}

function snapshotLifecycleCaches(queryClient, role, issueId) {
  return {
    roleIssueQueries: queryClient.getQueriesData({ queryKey: ["role-issues", role] }),
    issueDetail: queryClient.getQueryData(["issue", String(issueId)]),
    officialDashboard: queryClient.getQueryData(["official-dashboard"]),
  };
}

function restoreLifecycleCaches(queryClient, snapshot, issueId) {
  if (!snapshot) return;

  (snapshot.roleIssueQueries || []).forEach(([key, data]) => {
    queryClient.setQueryData(key, data);
  });
  queryClient.setQueryData(["issue", String(issueId)], snapshot.issueDetail);
  queryClient.setQueryData(["official-dashboard"], snapshot.officialDashboard);
}

function applyLifecycleTransition(queryClient, role, issue, toStatus, fromStatus) {
  const nextIssue = {
    ...issue,
    status: toStatus,
  };
  reconcileRoleIssueCaches(queryClient, role, issue.id, nextIssue);
  updateIssueDetailCache(queryClient, issue.id, nextIssue);
  updateOfficialDashboardCache(queryClient, fromStatus, toStatus);
}

async function verifyAndApplyTransition({
  queryClient,
  role,
  issue,
  expectedStatus,
  fromStatus,
  successMessage,
  showToast,
}) {
  const latestIssue = await getIssueById(issue.id).catch(() => null);
  if (!latestIssue) return false;

  if (normalizeStatus(latestIssue.status) !== normalizeStatus(expectedStatus)) {
    return false;
  }

  const finalIssue = {
    ...issue,
    ...latestIssue,
    status: expectedStatus,
  };

  reconcileRoleIssueCaches(queryClient, role, issue.id, finalIssue);
  updateIssueDetailCache(queryClient, issue.id, finalIssue);
  updateOfficialDashboardCache(queryClient, fromStatus, expectedStatus);
  showToast(successMessage, "success");
  return true;
}

export function OfficialIssuesPage({ mode }) {
  const { user } = useAuth();
  const role = mode === "admin" ? "ADMIN" : user.role;
  const [status, setStatus] = useState("");
  const [showResolvedByMe, setShowResolvedByMe] = useState(false);
  const [wardId, setWardId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [page, setPage] = useState(0);
  const [debouncedWardId, setDebouncedWardId] = useState("");
  const [debouncedDepartmentId, setDebouncedDepartmentId] = useState("");
  const [debouncedReportedBy, setDebouncedReportedBy] = useState("");

  // Debounce filter inputs to prevent excessive API calls per contract
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedWardId(wardId);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [wardId]);

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

  const queryKey = ["role-issues", role, status, debouncedWardId, debouncedDepartmentId, debouncedReportedBy, page];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getRoleIssues(role, {
      status: status || undefined,
      wardId: role === "ADMIN" && debouncedWardId ? Number(debouncedWardId) : undefined,
      departmentId: role === "ADMIN" && debouncedDepartmentId ? Number(debouncedDepartmentId) : undefined,
      reportedBy: debouncedReportedBy ? Number(debouncedReportedBy) : undefined,
      page,
      size: 10,
    }),
  });

  const [isResolving, setIsResolving] = useState(false);

  const startMutation = useMutation({
    onMutate: async (issue) => {
      const snapshot = snapshotLifecycleCaches(queryClient, role, issue.id);
      applyLifecycleTransition(queryClient, role, issue, "IN_PROGRESS", "ASSIGNED");
      return { snapshot, issueId: issue.id };
    },
    mutationFn: async (issue) => {
      const latestIssue = await getIssueById(issue.id);
      const latestStatus = normalizeStatus(latestIssue?.status || issue.status);
      if (latestStatus !== "ASSIGNED") {
        const statusLabel = latestStatus || "UNKNOWN";
        throw new Error(`Issue is already ${statusLabel}. List refreshed.`);
      }
      return startIssue(issue.id, latestIssue?.version ?? issue.version);
    },
    onSuccess: async (updatedIssue, issue) => {
      const finalIssue = {
        ...issue,
        ...normalizeIssuePayload(updatedIssue),
        status: "IN_PROGRESS",
      };

      reconcileRoleIssueCaches(queryClient, role, issue.id, finalIssue);
      updateIssueDetailCache(queryClient, issue.id, finalIssue);

      if (normalizeStatus(finalIssue?.status) === "IN_PROGRESS") {
        showToast("Work started.", "success");
      } else {
        showToast("Issue status did not move to in progress. List refreshed.", "warning");
      }

      await queryClient.refetchQueries({ queryKey: ["role-issues", role], type: "active" });
      await queryClient.refetchQueries({ queryKey: ["official-dashboard"], type: "active" });
    },
    onError: async (err, issue, context) => {
      const message = errorMessage(err);
      showToast(message, "danger");

      const recovered = await verifyAndApplyTransition({
        queryClient,
        role,
        issue,
        expectedStatus: "IN_PROGRESS",
        fromStatus: "ASSIGNED",
        successMessage: "Work started.",
        showToast,
      });
      if (recovered) return;

      restoreLifecycleCaches(queryClient, context?.snapshot, context?.issueId ?? issue.id);

      if (
        message.toLowerCase().includes("version conflict") ||
        message.toLowerCase().includes("already in_progress") ||
        message.toLowerCase().includes("already in progress") ||
        message.toLowerCase().includes("invalid lifecycle transition") ||
        message.toLowerCase().includes("do not have permission") ||
        message.toLowerCase().includes("list refreshed")
      ) {
        await queryClient.refetchQueries({ queryKey: ["role-issues", role], type: "active" });
        showToast("Issue list refreshed with latest version. Please try again.", "warning");
      }
    },
  });

  async function handleResolve(issue, file) {
    if (isResolving) return;
    if (!file?.type?.startsWith("image/")) {
      showToast("Upload a valid fixed image.", "danger");
      return;
    }
    setIsResolving(true);
    const snapshot = snapshotLifecycleCaches(queryClient, role, issue.id);
    try {
      const latestIssue = await getIssueById(issue.id);
      const latestStatus = normalizeStatus(latestIssue?.status || issue.status);
      const isAssignedToCurrentOfficial = isAssignedToUser(latestIssue, user);

      if (latestStatus !== "IN_PROGRESS") {
        throw new Error(`Issue is already ${latestStatus || "UNKNOWN"}. List refreshed.`);
      }

      if (!isAssignedToCurrentOfficial) {
        throw new Error("You do not have permission to resolve this issue. It is assigned to another official.");
      }

      applyLifecycleTransition(queryClient, role, { ...issue, ...latestIssue }, "RESOLVED", "IN_PROGRESS");

      const payload = new FormData();
      payload.append("version", latestIssue?.version ?? issue.version);
      payload.append("image", file);
      const updatedIssue = await resolveIssue(issue.id, payload);
      const finalIssue = {
        ...issue,
        ...normalizeIssuePayload(updatedIssue),
        status: "RESOLVED",
      };

      reconcileRoleIssueCaches(queryClient, role, issue.id, finalIssue);
      updateIssueDetailCache(queryClient, issue.id, finalIssue);

      if (normalizeStatus(finalIssue?.status) === "RESOLVED") {
        showToast("Issue resolved.", "success");
      } else {
        showToast("Resolution submitted but status is not resolved yet. List refreshed.", "warning");
      }

      await queryClient.refetchQueries({ queryKey: ["role-issues", role], type: "active" });
      await queryClient.refetchQueries({ queryKey: ["official-dashboard"], type: "active" });
    } catch (err) {
      const message = errorMessage(err);
      showToast(message, "danger");

      const recovered = await verifyAndApplyTransition({
        queryClient,
        role,
        issue,
        expectedStatus: "RESOLVED",
        fromStatus: "IN_PROGRESS",
        successMessage: "Issue resolved.",
        showToast,
      });
      if (recovered) return;

      restoreLifecycleCaches(queryClient, snapshot, issue.id);

      if (
        message.toLowerCase().includes("version conflict") ||
        message.toLowerCase().includes("do not have permission") ||
        message.toLowerCase().includes("official not assigned") ||
        message.toLowerCase().includes("invalid lifecycle transition") ||
        message.toLowerCase().includes("list refreshed")
      ) {
        await queryClient.refetchQueries({ queryKey: ["role-issues", role], type: "active" });
      }
    } finally {
      setIsResolving(false);
    }
  }

  const issues = (data?.content || []).filter((issue) => {
    // For officials: must be assigned to them
    if (role === "OFFICIAL") {
      const isAssigned = isAssignedToUser(issue, user);
      // If "Solved by me" is checked, also filter by resolved-by
      if (showResolvedByMe) {
        return isAssigned && isResolvedByUser(issue, user);
      }
      return isAssigned;
    }
    // For admins and other roles: show all
    return true;
  });
  const columns = [
    { key: "title", header: "Issue" },
    { key: "status", header: "Status", render: (issue) => <IssueStatusBadge status={issue.status} /> },
    {
      key: "issueType",
      header: "Type",
      render: (issue) => issue.issueTypeName || issue.displayName || issue.type || "Uncategorized",
    },
    {
      key: "reporterDetails",
      header: "Reported By",
      render: (issue) => {
        const reporterName = pickFirst(issue.reporterName, issue.reportedByName, issue.reportedByFullName, issue.citizenName);
        return reporterName ? <strong>{reporterName}</strong> : <span className="muted">Not available</span>;
      },
    },
  ];

  if (role === "ADMIN") {
    columns.push({
      key: "officialDetails",
      header: "Official",
      render: (issue) => {
        const assignedName = pickFirst(issue.assignedOfficialName, issue.currentOfficialName, issue.officialName);
        const assignedEmail = pickFirst(issue.assignedOfficialEmail, issue.currentOfficialEmail, issue.officialEmail);
        const assignedPhone = pickFirst(issue.assignedOfficialMobile, issue.currentOfficialMobile, issue.officialMobile);
        const resolvedName = pickFirst(issue.resolvedByOfficialName, issue.resolverName);
        const resolvedEmail = pickFirst(issue.resolvedByOfficialEmail, issue.resolverEmail);
        const resolvedPhone = pickFirst(issue.resolvedByOfficialMobile, issue.resolverMobile);

        const officialName = normalizeStatus(issue.status) === "RESOLVED" ? pickFirst(resolvedName, assignedName) : assignedName;
        const officialEmail = normalizeStatus(issue.status) === "RESOLVED" ? pickFirst(resolvedEmail, assignedEmail) : assignedEmail;
        const officialPhone = normalizeStatus(issue.status) === "RESOLVED" ? pickFirst(resolvedPhone, assignedPhone) : assignedPhone;
        return renderContact(officialName, officialEmail, officialPhone);
      },
    });
  }

  if (role === "ADMIN") {
    columns.push({ key: "wardName", header: "Ward", render: (issue) => issue.wardName || "N/A" });
  }

  columns.push({
    key: "hardSlaDeadline",
    header: "SLA",
    render: (issue) => {
      const text = formatDate(issue.hardSlaDeadline);
      const isBreached = issue.hardSlaBreached ? "breached" : "on-track";
      return <span className={`sla-deadline sla-${isBreached}`}>{text}</span>;
    },
  });

  if (role !== "ADMIN") {
    columns.push({
      key: "actions",
      header: "Actions",
      render: (issue) => {
        const issueStatus = normalizeStatus(issue.status);
        const isAssignedToCurrentOfficial = isAssignedToUser(issue, user);

        return (
          <div className="action-cell">
            {role === "OFFICIAL" && <Link to={`/official/issues/${issue.id}`}>View</Link>}
            {role === "OFFICIAL" && issueStatus === "SUBMITTED" && <span className="action-note">Waiting for assignment</span>}
            {role === "OFFICIAL" && issueStatus === "ASSIGNED" && isAssignedToCurrentOfficial && (
              <button disabled={startMutation.isPending} onClick={() => startMutation.mutate(issue)}>{startMutation.isPending ? "Starting..." : "Start"}</button>
            )}
            {role === "OFFICIAL" && issueStatus === "ASSIGNED" && !isAssignedToCurrentOfficial && (
              <span className="action-note">Assigned to another official</span>
            )}
            {role === "OFFICIAL" && issueStatus === "IN_PROGRESS" && isAssignedToCurrentOfficial && (
              <ResolveIssueAction issue={issue} onError={(msg) => showToast(msg, "danger")} onResolve={handleResolve} isResolving={isResolving} />
            )}
            {role === "OFFICIAL" && issueStatus === "IN_PROGRESS" && !isAssignedToCurrentOfficial && (
              <span className="action-note">In progress by another official</span>
            )}
            {role === "OFFICIAL" && ["RESOLVED", "ESCALATED", "REJECTED"].includes(issueStatus) && <span className="action-note">No officer action</span>}
          </div>
        );
      },
    });
  }

  return (
    <section className="page-stack">
      {toast.message && (
        <div className={`toast-message toast-${toast.tone}`} role={toast.tone === "danger" ? "alert" : "status"} aria-live="polite">
          {toast.message}
        </div>
      )}
      <PageHeader
        eyebrow={role === "ADMIN" ? "Admin issue view" : "Official work queue"}
        title={role === "ADMIN" ? "All issues" : "Official issues"}
        actions={
        <div className="page-actions">
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>
            <option value="">All statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
          </select>
          {role === "OFFICIAL" && (
            <label>
              <input
                type="checkbox"
                checked={showResolvedByMe}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setShowResolvedByMe(checked);
                  setPage(0);
                  if (checked) {
                    setStatus("RESOLVED");
                  } else if (status === "RESOLVED") {
                    setStatus("");
                  }
                }}
              />
              Solved by me
            </label>
          )}
          {role === "ADMIN" && (
            <>
              <input
                placeholder="Ward id"
                value={wardId}
                onChange={(event) => {
                  setWardId(event.target.value.replace(/[^0-9]/g, ""));
                }}
              />
              <input
                placeholder="Department id"
                value={departmentId}
                onChange={(event) => {
                  setDepartmentId(event.target.value.replace(/[^0-9]/g, ""));
                }}
              />
            </>
          )}
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
        caption={role === "ADMIN" ? "All reported issues" : showResolvedByMe ? "Issues resolved by you" : "Official assigned issues"}
        columns={columns}
        rows={issues}
        getRowKey={(issue) => issue.id}
        isLoading={isLoading}
        loadingText="Loading issues..."
        emptyTitle="No matching issues"
      />
      <Pagination page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
      <OpenStreetMapAttribution />
    </section>
  );
}

function ResolveIssueAction({ issue, onError, onResolve, isResolving }) {
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
      <button disabled={!file || isResolving} onClick={() => onResolve(issue, file)} type="button">
        {isResolving ? "Resolving..." : "Resolve"}
      </button>
    </div>
  );
}
