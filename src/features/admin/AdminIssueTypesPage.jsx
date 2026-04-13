import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createIssueType, getAdminIssueTypes, setIssueTypeActive, updateIssueType } from "../../api/admin.api";
import { getDepartments } from "../../api/departments.api";
import { Alert } from "../../components/ui/Alert.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { FormField } from "../../components/ui/FormField.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { errorMessage } from "../../lib/apiResponse";

const PAGE_SIZE = 10;

export function AdminIssueTypesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", departmentId: "", slaHours: 24, priority: "MEDIUM", description: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [page, setPage] = useState(0);
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: getDepartments, staleTime: 30 * 60_000 });
  const { data: issueTypes = [], isFetching: issueTypesFetching } = useQuery({ queryKey: ["admin-issue-types"], queryFn: getAdminIssueTypes, staleTime: 10 * 60_000 });

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(""), 4000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const mutation = useMutation({
    mutationFn: createIssueType,
    onSuccess: () => {
      setMessage("Issue type created.");
      setToastMessage("Issue type created.");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["admin-issue-types"] });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateIssueType(id, payload),
    onSuccess: () => {
      setMessage("Issue type updated.");
      setToastMessage("Issue type updated.");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["admin-issue-types"] });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, active }) => setIssueTypeActive(id, active),
    onSuccess: () => {
      setMessage("Issue type status updated.");
      setToastMessage("Issue type status updated.");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["admin-issue-types"] });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    mutation.mutate({ ...form, departmentId: Number(form.departmentId), slaHours: Number(form.slaHours), name: form.name.toUpperCase().replaceAll(" ", "_") });
  }

  const sortedTypes = [...issueTypes].sort((first, second) => {
    const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
    const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;
    if (firstDate !== secondDate) return secondDate - firstDate;
    return Number(second.id || 0) - Number(first.id || 0);
  });
  const totalPages = Math.max(1, Math.ceil(sortedTypes.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * PAGE_SIZE;
  const visibleTypes = sortedTypes.slice(start, start + PAGE_SIZE);
  const rangeStart = sortedTypes.length ? start + 1 : 0;
  const rangeEnd = Math.min(start + PAGE_SIZE, sortedTypes.length);

  const columns = [
    { key: "name", header: "Type", render: (type) => type.displayName },
    { key: "departmentName", header: "Department" },
    { key: "priority", header: "Priority" },
    { key: "slaHours", header: "SLA", render: (type) => `${type.slaHours}h` },
    { key: "description", header: "Description", render: (type) => type.description || "-" },
    { key: "active", header: "Active", render: (type) => (type.active ? "Yes" : "No") },
    {
      key: "actions",
      header: "Actions",
      render: (type) => (
        <div className="action-cell">
          <button
            type="button"
            onClick={() => {
              const slaHours = window.prompt("SLA hours", String(type.slaHours || 24));
              if (!slaHours) return;
              updateMutation.mutate({
                id: type.id,
                payload: { slaHours: Number(slaHours) },
              });
            }}
          >
            Update SLA
          </button>
          <button type="button" onClick={() => statusMutation.mutate({ id: type.id, active: !type.active })}>
            {type.active ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="page-stack">
      {toastMessage && <div className="toast-message">{toastMessage}</div>}
      <PageHeader eyebrow="Admin" title="Issue types" />
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="detail-grid">
        <form className="panel form-grid" onSubmit={submit}>
          <h2>Create issue type</h2>
          <FormField label="Name"><input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Pothole" required /></FormField>
          <FormField label="Department"><select value={form.departmentId} onChange={(event) => update("departmentId", event.target.value)} required><option value="">Select department</option>{departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}</select></FormField>
          <FormField label="SLA hours"><input type="number" min={1} value={form.slaHours} onChange={(event) => update("slaHours", event.target.value)} required /></FormField>
          <FormField label="Priority"><select value={form.priority} onChange={(event) => update("priority", event.target.value)}><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></FormField>
          <FormField label="Description"><textarea rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} /></FormField>
          <button className="primary-button">Create issue type</button>
        </form>
        <DataTable caption="Issue types" columns={columns} rows={visibleTypes} getRowKey={(type) => type.id} emptyTitle="No issue types found" toolbar={<><strong>Latest issue types</strong><span>{issueTypesFetching ? "Refreshing..." : `Showing ${rangeStart}-${rangeEnd} of ${issueTypes.length}`}</span></>} />
      </div>
      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
