import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createIssueType, getAdminIssueTypes, setIssueTypeActive, updateIssueType } from "../../api/admin.api";
import { getDepartments } from "../../api/departments.api";
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
import { FormField } from "../../components/ui/FormField.jsx";
import { Input } from "../../components/ui/input.jsx";
import { Label } from "../../components/ui/label.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { ToastNotification } from "../../components/ui/ToastNotification.jsx";
import { errorMessage } from "../../lib/apiResponse";

const PAGE_SIZE = 10;

export function AdminIssueTypesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", departmentId: "", slaHours: 24, priority: "MEDIUM", description: "" });
  const [isCreateIssueTypeDialogOpen, setIsCreateIssueTypeDialogOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", tone: "info" });
  const [editingIssueTypeId, setEditingIssueTypeId] = useState(null);
  const [editForm, setEditForm] = useState({ departmentId: "", slaHours: "", priority: "", description: "", active: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
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

  function upsertIssueTypeInCache(nextIssueType) {
    queryClient.setQueryData(["admin-issue-types"], (current = []) => {
      const rows = Array.isArray(current) ? current : [];
      const nextRows = [nextIssueType, ...rows.filter((row) => row.id !== nextIssueType.id)];
      return nextRows.sort((first, second) => Number(second.id || 0) - Number(first.id || 0));
    });
  }

  const mutation = useMutation({
    mutationFn: createIssueType,
    onSuccess: (createdIssueType) => {
      if (createdIssueType?.id) {
        upsertIssueTypeInCache(createdIssueType);
      }
      showToast("Issue type created.", "success");
      setIsCreateIssueTypeDialogOpen(false);
      setForm({ name: "", departmentId: "", slaHours: 24, priority: "MEDIUM", description: "" });
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

    setIsSavingEdit(true);
    try {
      let nextIssueType = { ...issueType };

      if (Object.keys(payload).length) {
        const updatedIssueType = await updateIssueType(issueType.id, payload);
        nextIssueType = {
          ...nextIssueType,
          ...updatedIssueType,
        };
      }
      if (activeChanged) {
        await setIssueTypeActive(issueType.id, nextActive);
        nextIssueType.active = nextActive;
      }

      if (payload.departmentId != null) {
        nextIssueType.departmentId = payload.departmentId;
        nextIssueType.departmentName = departments.find((department) => department.id === payload.departmentId)?.name || nextIssueType.departmentName;
      }
      if (payload.slaHours != null) nextIssueType.slaHours = payload.slaHours;
      if (payload.priority) nextIssueType.priority = payload.priority;
      if (payload.description !== undefined) nextIssueType.description = payload.description;

      upsertIssueTypeInCache(nextIssueType);
      showToast("Issue type updated.", "success");
      setEditingIssueTypeId(null);
      setEditForm({ departmentId: "", slaHours: "", priority: "", description: "", active: "" });
    } catch (error) {
      showToast(errorMessage(error), "danger");
    } finally {
      setIsSavingEdit(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    const name = form.name.trim();
    const departmentId = Number(form.departmentId);
    const slaHours = Number(form.slaHours);

    if (!name) {
      showToast("Name is required.", "danger");
      return;
    }
    if (!Number.isFinite(departmentId) || departmentId <= 0) {
      showToast("Department is required.", "danger");
      return;
    }
    if (!Number.isFinite(slaHours) || slaHours <= 0) {
      showToast("SLA hours must be greater than 0.", "danger");
      return;
    }

    mutation.mutate({ ...form, departmentId, slaHours, name: name.toUpperCase().replaceAll(" ", "_") });
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
  const editingIssueType = issueTypes.find((issueType) => issueType.id === editingIssueTypeId) || null;

  const columns = [
    { key: "name", header: "Type", accessor: (type) => type.displayName || type.name, render: (type) => type.displayName },
    { key: "departmentName", header: "Department" },
    { key: "priority", header: "Priority" },
    { key: "slaHours", header: "SLA", accessor: (type) => type.slaHours, render: (type) => `${type.slaHours}h` },
    { key: "description", header: "Description", accessor: (type) => type.description || "-", render: (type) => type.description || "-" },
    { key: "active", header: "Active", accessor: (type) => (type.active ? "Yes" : "No"), render: (type) => (type.active ? "Yes" : "No") },
    {
      key: "actions",
      header: "Actions",
      enableSort: false,
      searchable: false,
      render: (type) => (
        <div className="action-cell">
          <button type="button" onClick={() => startEdit(type)}>
            Edit
          </button>
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
        eyebrow="Admin"
        title="Issue types"
        actions={(
          <button type="button" className="primary-button" onClick={() => setIsCreateIssueTypeDialogOpen(true)}>
            Create issue type
          </button>
        )}
      />
      <DataTable
        caption="Issue types"
        columns={columns}
        rows={visibleTypes}
        getRowKey={(type) => type.id}
        emptyTitle="No issue types found"
        searchPlaceholder="Search issue types, department, priority..."
        toolbar={<><strong>Latest issue types</strong><span>{issueTypesFetching ? "Refreshing..." : `Showing ${rangeStart}-${rangeEnd} of ${issueTypes.length}`}</span></>}
      />

      <Dialog
        open={isCreateIssueTypeDialogOpen}
        onOpenChange={(open) => {
          setIsCreateIssueTypeDialogOpen(open);
          if (!open) {
            setForm({ name: "", departmentId: "", slaHours: 24, priority: "MEDIUM", description: "" });
          }
        }}
      >
        <DialogContent className="admin-edit-dialog">
          <DialogHeader>
            <DialogTitle>Create issue type</DialogTitle>
            <DialogDescription>
              Add a new issue type with SLA, priority, and department mapping.
            </DialogDescription>
          </DialogHeader>
          <form className="form-grid" onSubmit={submit} noValidate>
            <FormField label="Name"><input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Pothole" /></FormField>
            <FormField label="Department"><select value={form.departmentId} onChange={(event) => update("departmentId", event.target.value)}><option value="">Select department</option>{departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}</select></FormField>
            <FormField label="SLA hours"><input inputMode="numeric" value={form.slaHours} onChange={(event) => update("slaHours", event.target.value.replace(/\D/g, ""))} /></FormField>
            <FormField label="Priority"><select value={form.priority} onChange={(event) => update("priority", event.target.value)}><option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></FormField>
            <FormField label="Description"><textarea rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} /></FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateIssueTypeDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Create issue type"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingIssueType)}
        onOpenChange={(open) => {
          if (!open) cancelEdit();
        }}
      >
        <DialogContent className="admin-edit-dialog">
          <DialogHeader>
            <DialogTitle>Edit issue type</DialogTitle>
            <DialogDescription>
              Update SLA, priority, department, and active state.
            </DialogDescription>
          </DialogHeader>

          {editingIssueType && (
            <div className="admin-edit-grid">
              <div className="admin-edit-field">
                <Label>Name</Label>
                <Input value={editingIssueType.displayName || editingIssueType.name || "-"} disabled />
              </div>

              <div className="admin-edit-field">
                <Label htmlFor="admin-issue-type-department">Department</Label>
                <select
                  id="admin-issue-type-department"
                  value={editForm.departmentId}
                  onChange={(event) => updateEdit("departmentId", event.target.value)}
                >
                  <option value="">No department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="admin-edit-field">
                <Label htmlFor="admin-issue-type-sla">SLA hours</Label>
                <Input
                  id="admin-issue-type-sla"
                  inputMode="numeric"
                  value={editForm.slaHours}
                  onChange={(event) => updateEdit("slaHours", event.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div className="admin-edit-field">
                <Label htmlFor="admin-issue-type-priority">Priority</Label>
                <select
                  id="admin-issue-type-priority"
                  value={editForm.priority}
                  onChange={(event) => updateEdit("priority", event.target.value)}
                >
                  <option value="">Keep priority</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div className="admin-edit-field">
                <Label htmlFor="admin-issue-type-active">Active</Label>
                <select
                  id="admin-issue-type-active"
                  value={editForm.active}
                  onChange={(event) => updateEdit("active", event.target.value)}
                >
                  <option value="">Keep active status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="admin-edit-field admin-edit-field-full">
                <Label htmlFor="admin-issue-type-description">Description</Label>
                <textarea
                  id="admin-issue-type-description"
                  rows={4}
                  value={editForm.description}
                  onChange={(event) => updateEdit("description", event.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
            <Button
              type="button"
              onClick={() => editingIssueType && saveEdit(editingIssueType)}
              disabled={!editingIssueType || isSavingEdit}
            >
              {isSavingEdit ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
