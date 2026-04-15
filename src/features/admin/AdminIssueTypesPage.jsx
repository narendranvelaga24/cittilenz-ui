import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createIssueType, getAdminIssueTypes, setIssueTypeActive, updateIssueType } from "../../api/admin.api";
import { getDepartments } from "../../api/departments.api";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { FormField } from "../../components/ui/FormField.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { errorMessage } from "../../lib/apiResponse";

const PAGE_SIZE = 10;

export function AdminIssueTypesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", departmentId: "", slaHours: 24, priority: "MEDIUM", description: "" });
  const [toast, setToast] = useState({ message: "", tone: "info" });
  const [editingIssueTypeId, setEditingIssueTypeId] = useState(null);
  const [editForm, setEditForm] = useState({ departmentId: "", slaHours: "", priority: "", description: "", active: "" });
  const [page, setPage] = useState(0);
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: getDepartments, staleTime: 30 * 60_000 });
  const { data: issueTypes = [], isFetching: issueTypesFetching } = useQuery({ queryKey: ["admin-issue-types"], queryFn: getAdminIssueTypes, staleTime: 10 * 60_000 });

  useEffect(() => {
    if (!toast.message) return;
    const timeout = setTimeout(() => setToast({ message: "", tone: "info" }), 4000);
    return () => clearTimeout(timeout);
  }, [toast.message]);

  function showToast(message, tone = "info") {
    setToast({ message, tone });
  }

  const mutation = useMutation({
    mutationFn: createIssueType,
    onSuccess: () => {
      showToast("Issue type created.", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-issue-types"] });
    },
    onError: (err) => showToast(errorMessage(err), "danger"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateIssueType(id, payload),
    onSuccess: () => {
      showToast("Issue type updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-issue-types"] });
    },
    onError: (err) => showToast(errorMessage(err), "danger"),
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(issueType) {
    setEditingIssueTypeId(issueType.id);
    setEditForm({
      departmentId: String(issueType.departmentId ?? issueType.department_id ?? ""),
      slaHours: String(issueType.slaHours ?? ""),
      priority: String(issueType.priority ?? ""),
      description: String(issueType.description ?? ""),
      active: issueType.active === false ? "false" : "true",
    });
  }

  function updateEdit(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  function cancelEdit() {
    setEditingIssueTypeId(null);
    setEditForm({ departmentId: "", slaHours: "", priority: "", description: "", active: "" });
  }

  async function saveEdit(issueType) {
    const payload = {};
    const currentDepartment = String(issueType.departmentId ?? issueType.department_id ?? "");
    const currentSlaHours = String(issueType.slaHours ?? "");
    const currentPriority = String(issueType.priority ?? "");
    const currentDescription = String(issueType.description ?? "");
    const currentActive = issueType.active !== false;
    let nextActive = currentActive;
    let activeChanged = false;

    if (editForm.departmentId && editForm.departmentId !== currentDepartment) {
      payload.departmentId = Number(editForm.departmentId);
    }
    if (editForm.slaHours && editForm.slaHours !== currentSlaHours) {
      payload.slaHours = Number(editForm.slaHours);
    }
    if (editForm.priority && editForm.priority !== currentPriority) {
      payload.priority = editForm.priority;
    }
    if (editForm.description !== currentDescription) {
      payload.description = editForm.description.trim();
    }
    if (editForm.active !== "") {
      nextActive = editForm.active === "true";
      activeChanged = nextActive !== currentActive;
    }

    if (!Object.keys(payload).length && !activeChanged) {
      showToast("No changes to update.", "info");
      return;
    }

    if (payload.slaHours != null && (!Number.isFinite(payload.slaHours) || payload.slaHours <= 0)) {
      showToast("SLA hours must be greater than 0.", "danger");
      return;
    }

    if (payload.priority && !["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(payload.priority)) {
      showToast("Priority must be CRITICAL, HIGH, MEDIUM, or LOW.", "danger");
      return;
    }

    try {
      if (Object.keys(payload).length) {
        await updateIssueType(issueType.id, payload);
      }
      if (activeChanged) {
        await setIssueTypeActive(issueType.id, nextActive);
      }
      showToast("Issue type updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-issue-types"] });
      setEditingIssueTypeId(null);
      setEditForm({ departmentId: "", slaHours: "", priority: "", description: "", active: "" });
    } catch (error) {
      showToast(errorMessage(error), "danger");
    }
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
          {editingIssueTypeId === type.id ? (
            <>
              <select value={editForm.departmentId} onChange={(event) => updateEdit("departmentId", event.target.value)}>
                <option value="">No department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                placeholder="SLA hours"
                value={editForm.slaHours}
                onChange={(event) => updateEdit("slaHours", event.target.value)}
              />
              <select value={editForm.active} onChange={(event) => updateEdit("active", event.target.value)}>
                <option value="">Keep active status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <select value={editForm.priority} onChange={(event) => updateEdit("priority", event.target.value)}>
                <option value="">Keep priority</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <input
                placeholder="Description"
                value={editForm.description}
                onChange={(event) => updateEdit("description", event.target.value)}
              />
              <button type="button" onClick={() => saveEdit(type)} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={cancelEdit}>Cancel</button>
            </>
          ) : null}
          {editingIssueTypeId !== type.id && (
            <button type="button" onClick={() => startEdit(type)}>
              Edit
            </button>
          )}
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
      <PageHeader eyebrow="Admin" title="Issue types" />
      <div className="detail-grid">
        <form className="panel form-grid" onSubmit={submit}>
          <h2>Create issue type</h2>
          <FormField label="Name"><input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Pothole" required /></FormField>
          <FormField label="Department"><select value={form.departmentId} onChange={(event) => update("departmentId", event.target.value)} required><option value="">Select department</option>{departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}</select></FormField>
          <FormField label="SLA hours"><input type="number" min={1} value={form.slaHours} onChange={(event) => update("slaHours", event.target.value)} required /></FormField>
          <FormField label="Priority"><select value={form.priority} onChange={(event) => update("priority", event.target.value)}><option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></FormField>
          <FormField label="Description"><textarea rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} /></FormField>
          <button className="primary-button">Create issue type</button>
        </form>
        <DataTable caption="Issue types" columns={columns} rows={visibleTypes} getRowKey={(type) => type.id} emptyTitle="No issue types found" toolbar={<><strong>Latest issue types</strong><span>{issueTypesFetching ? "Refreshing..." : `Showing ${rangeStart}-${rangeEnd} of ${issueTypes.length}`}</span></>} />
      </div>
      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
