import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createStaffUser, deleteStaffUser, getUsers, resetStaffPassword, updateStaffUser } from "../../api/admin.api";
import { getDepartments } from "../../api/departments.api";
import { getWards } from "../../api/wards.api";
import { Alert } from "../../components/ui/Alert.jsx";
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

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ username: "", fullName: "", email: "", mobile: "", password: "", role: "OFFICIAL", wardId: "", departmentId: "" });
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", mobile: "", wardId: "", departmentId: "", isActive: "" });
  const [toastMessage, setToastMessage] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const { data: users = [], isFetching: usersFetching } = useQuery({ queryKey: ["admin-users"], queryFn: getUsers });
  const { data: wards = [] } = useQuery({ queryKey: ["wards"], queryFn: getWards, staleTime: 30 * 60_000 });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: getDepartments, staleTime: 30 * 60_000 });

  const mutation = useMutation({
    mutationFn: createStaffUser,
    onSuccess: (createdUser) => {
      queryClient.setQueryData(["admin-users"], (current = []) => {
        if (!createdUser?.id || current.some((user) => user.id === createdUser.id)) return current;
        return [createdUser, ...current];
      });
      setMessage("Staff user created.");
      setToastMessage("Staff user created");
      setError("");
      setForm({ username: "", fullName: "", email: "", mobile: "", password: "", role: "OFFICIAL", wardId: "", departmentId: "" });
      setIsCreateUserDialogOpen(false);
      setPage(0);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateStaffUser(id, payload),
    onSuccess: () => {
      setMessage("User updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }) => resetStaffPassword(id, password),
    onSuccess: () => {
      setMessage("Password reset successful.");
      setToastMessage("Password reset successful");
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaffUser,
    onSuccess: () => {
      setMessage("User deleted.");
      setToastMessage("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "role" && value === "WARD_SUPERIOR" ? { departmentId: "" } : {}),
    }));
  }

  function submit(event) {
    event.preventDefault();
    const normalizedUsername = form.username.trim().toLowerCase();
    const normalizedEmail = form.email.trim().toLowerCase();
    const normalizedMobile = form.mobile.trim();
    const role = form.role;

    if (role !== "OFFICIAL" && role !== "WARD_SUPERIOR") {
      setError("Role must be OFFICIAL or WARD_SUPERIOR.");
      return;
    }
    if (!form.wardId) {
      setError("Ward is required.");
      return;
    }
    if (role === "OFFICIAL" && !form.departmentId) {
      setError("Department is required for OFFICIAL role.");
      return;
    }
    if (users.some((user) => String(user.username || "").trim().toLowerCase() === normalizedUsername)) {
      setError("Username already exists.");
      return;
    }
    if (users.some((user) => String(user.email || "").trim().toLowerCase() === normalizedEmail)) {
      setError("Email already exists.");
      return;
    }
    if (users.some((user) => String(user.mobile || "").trim() === normalizedMobile)) {
      setError("Mobile already exists.");
      return;
    }

    setError("");
    const payload = {
      username: form.username.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      mobile: normalizedMobile,
      password: form.password,
      role,
      wardId: Number(form.wardId),
    };
    if (role === "OFFICIAL") payload.departmentId = Number(form.departmentId);
    mutation.mutate(payload);
  }

  function activeState(user) {
    const raw = user?.isActive ?? user?.is_active ?? user?.active;
    return typeof raw === "boolean" ? raw : null;
  }

  function startEdit(user) {
    setError("");
    setMessage("");
    setEditingUserId(user.id);
    setEditForm({
      fullName: user.fullName || "",
      email: user.email || "",
      mobile: user.mobile || "",
      wardId: String(user.wardId ?? user.ward_id ?? ""),
      departmentId: String(user.departmentId ?? user.department_id ?? ""),
      isActive: "",
    });
  }

  function updateEdit(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  function cancelEdit() {
    setEditingUserId(null);
    setEditForm({ fullName: "", email: "", mobile: "", wardId: "", departmentId: "", isActive: "" });
  }

  function saveEdit(row) {
    const payload = {};
    const currentWard = String(row.wardId ?? row.ward_id ?? "");
    const currentDepartment = String(row.departmentId ?? row.department_id ?? "");
    const currentActive = activeState(row);

    const normalizedFullName = editForm.fullName.trim();
    const normalizedEmail = editForm.email.trim().toLowerCase();
    const normalizedMobile = editForm.mobile.trim();

    if (!normalizedFullName) {
      setError("Full name is required.");
      return;
    }
    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }
    if (!normalizedMobile) {
      setError("Mobile is required.");
      return;
    }

    if (users.some((user) => user.id !== row.id && String(user.email || "").trim().toLowerCase() === normalizedEmail)) {
      setError("Email already exists.");
      return;
    }
    if (users.some((user) => user.id !== row.id && String(user.mobile || "").trim() === normalizedMobile)) {
      setError("Mobile already exists.");
      return;
    }

    if (normalizedFullName !== String(row.fullName || "")) payload.fullName = normalizedFullName;
    if (normalizedEmail !== String(row.email || "").trim().toLowerCase()) payload.email = normalizedEmail;
    if (normalizedMobile !== String(row.mobile || "").trim()) payload.mobile = normalizedMobile;
    if (editForm.wardId !== currentWard) payload.wardId = editForm.wardId ? Number(editForm.wardId) : null;
    if (editForm.departmentId !== currentDepartment) payload.departmentId = editForm.departmentId ? Number(editForm.departmentId) : null;
    if (editForm.isActive !== "") {
      const nextActive = editForm.isActive === "true";
      if (nextActive !== currentActive) payload.isActive = nextActive;
    }

    if (!Object.keys(payload).length) {
      setMessage("No changes to update.");
      return;
    }

    setError("");
    updateMutation.mutate(
      { id: row.id, payload },
      {
        onSuccess: () => {
          setEditingUserId(null);
          setEditForm({ fullName: "", email: "", mobile: "", wardId: "", departmentId: "", isActive: "" });
          setMessage("User updated.");
          setToastMessage("User saved successfully");
        },
      },
    );
  }

  const sortedUsers = [...users]
    .sort((first, second) => {
      const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;
      if (firstDate !== secondDate) return secondDate - firstDate;
      return Number(second.id || 0) - Number(first.id || 0);
    });
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * PAGE_SIZE;
  const visibleUsers = sortedUsers.slice(start, start + PAGE_SIZE);
  const rangeStart = sortedUsers.length ? start + 1 : 0;
  const rangeEnd = Math.min(start + PAGE_SIZE, sortedUsers.length);
  const editingUser = users.find((user) => user.id === editingUserId) || null;
  const viewingUser = users.find((user) => user.id === viewingUserId) || null;

  const columns = [
    { key: "fullName", header: "Name" },
    { key: "role", header: "Role" },
    { key: "email", header: "Email" },
    { key: "mobile", header: "Mobile" },
    {
      key: "wardId",
      header: "Ward ID",
      accessor: (user) => user.wardId ?? user.ward_id ?? "-",
      render: (user) => user.wardId ?? user.ward_id ?? "-",
    },
    {
      key: "departmentId",
      header: "Department ID",
      accessor: (user) => user.departmentId ?? user.department_id ?? "-",
      render: (user) => user.departmentId ?? user.department_id ?? "-",
    },
    {
      key: "actions",
      header: "Actions",
      enableSort: false,
      searchable: false,
      render: (row) => (
        <div className="action-cell">
          <button type="button" onClick={() => setViewingUserId(row.id)}>View</button>
          <button type="button" onClick={() => startEdit(row)}>Edit</button>
        </div>
      ),
    },
  ];

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Admin"
        title="User management"
        actions={(
          <button type="button" className="primary-button" onClick={() => setIsCreateUserDialogOpen(true)}>
            Create user
          </button>
        )}
      />
      <ToastNotification message={toastMessage} role="status" ariaLive="polite" />
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
      <DataTable
        caption="Admin users"
        columns={columns}
        rows={visibleUsers}
        getRowKey={(user) => user.id}
        emptyTitle="No users found"
        searchPlaceholder="Search users, email, mobile, role..."
        toolbar={<><strong>Latest users</strong><span>{usersFetching ? "Refreshing..." : `Showing ${rangeStart}-${rangeEnd} of ${users.length}`}</span></>}
      />

      <Dialog
        open={isCreateUserDialogOpen}
        onOpenChange={(open) => {
          setIsCreateUserDialogOpen(open);
          if (!open) {
            setForm({ username: "", fullName: "", email: "", mobile: "", password: "", role: "OFFICIAL", wardId: "", departmentId: "" });
          }
        }}
      >
        <DialogContent className="admin-edit-dialog">
          <DialogHeader>
            <DialogTitle>Create official or superior</DialogTitle>
            <DialogDescription>
              Add a new staff account with role and assignment details.
            </DialogDescription>
          </DialogHeader>
          <form className="form-grid" onSubmit={submit}>
            <FormField label="Role"><select value={form.role} onChange={(event) => update("role", event.target.value)}><option value="OFFICIAL">Official</option><option value="WARD_SUPERIOR">Ward superior</option></select></FormField>
            <FormField label="Username"><input value={form.username} onChange={(event) => update("username", event.target.value)} required /></FormField>
            <FormField label="Full name"><input value={form.fullName} onChange={(event) => update("fullName", event.target.value)} required /></FormField>
            <FormField label="Email"><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required /></FormField>
            <FormField label="Mobile"><input value={form.mobile} onChange={(event) => update("mobile", event.target.value)} required /></FormField>
            <FormField label="Password"><input type="password" minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} required /></FormField>
            <FormField label="Ward"><select value={form.wardId} onChange={(event) => update("wardId", event.target.value)} required><option value="">Select ward</option>{wards.map((ward) => <option key={ward.id} value={ward.id}>{ward.wardName}</option>)}</select></FormField>
            {form.role === "OFFICIAL" && (
              <FormField label="Department"><select value={form.departmentId} onChange={(event) => update("departmentId", event.target.value)} required><option value="">Select department</option>{departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}</select></FormField>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Create user"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewingUser)}
        onOpenChange={(open) => {
          if (!open) setViewingUserId(null);
        }}
      >
        <DialogContent className="admin-view-dialog">
          <DialogHeader>
            <DialogTitle>{viewingUser?.fullName || "User details"}</DialogTitle>
            <DialogDescription>
              Read-only user details snapshot.
            </DialogDescription>
          </DialogHeader>

          {viewingUser && (
            <div className="dialog-body">
              <dl className="details-list">
                <dt>User ID</dt>
                <dd>{viewingUser.id}</dd>

                <dt>Username</dt>
                <dd>{viewingUser.username || "N/A"}</dd>

                <dt>Full Name</dt>
                <dd>{viewingUser.fullName || "N/A"}</dd>

                <dt>Email</dt>
                <dd>{viewingUser.email || "N/A"}</dd>

                <dt>Mobile</dt>
                <dd>{viewingUser.mobile || "N/A"}</dd>

                <dt>Role</dt>
                <dd>{viewingUser.role || "N/A"}</dd>

                <dt>Ward ID</dt>
                <dd>{viewingUser.wardId ?? viewingUser.ward_id ?? "N/A"}</dd>

                <dt>Department ID</dt>
                <dd>{viewingUser.departmentId ?? viewingUser.department_id ?? "N/A"}</dd>

                <dt>Active</dt>
                <dd>{activeState(viewingUser) === null ? "N/A" : activeState(viewingUser) ? "Yes" : "No"}</dd>
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingUser)}
        onOpenChange={(open) => {
          if (!open) cancelEdit();
        }}
      >
        <DialogContent className="admin-edit-dialog">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update profile and assignment details for this staff account.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="admin-edit-grid">
              <div className="admin-edit-field">
                <Label htmlFor="admin-user-full-name">Full name</Label>
                <Input
                  id="admin-user-full-name"
                  value={editForm.fullName}
                  onChange={(event) => updateEdit("fullName", event.target.value)}
                />
              </div>

              <div className="admin-edit-field">
                <Label htmlFor="admin-user-email">Email</Label>
                <Input
                  id="admin-user-email"
                  type="email"
                  value={editForm.email}
                  onChange={(event) => updateEdit("email", event.target.value)}
                />
              </div>

              <div className="admin-edit-field">
                <Label htmlFor="admin-user-mobile">Mobile</Label>
                <Input
                  id="admin-user-mobile"
                  value={editForm.mobile}
                  onChange={(event) => updateEdit("mobile", event.target.value)}
                />
              </div>

              <div className="admin-edit-field">
                <Label htmlFor="admin-user-ward">Ward</Label>
                <select
                  id="admin-user-ward"
                  value={editForm.wardId}
                  onChange={(event) => updateEdit("wardId", event.target.value)}
                >
                  <option value="">No ward</option>
                  {wards.map((ward) => <option key={ward.id} value={ward.id}>{ward.wardName}</option>)}
                </select>
              </div>

              {editingUser.role === "OFFICIAL" && (
                <div className="admin-edit-field">
                  <Label htmlFor="admin-user-department">Department</Label>
                  <select
                    id="admin-user-department"
                    value={editForm.departmentId}
                    onChange={(event) => updateEdit("departmentId", event.target.value)}
                  >
                    <option value="">No department</option>
                    {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                  </select>
                </div>
              )}

              <div className="admin-edit-field">
                <Label htmlFor="admin-user-active">Active status</Label>
                <select
                  id="admin-user-active"
                  value={editForm.isActive}
                  onChange={(event) => updateEdit("isActive", event.target.value)}
                >
                  <option value="">Keep active status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
            <Button
              type="button"
              onClick={() => editingUser && saveEdit(editingUser)}
              disabled={!editingUser || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>

            {editingUser && ["OFFICIAL", "WARD_SUPERIOR"].includes(editingUser.role) && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const password = window.prompt("Enter new password (min 8 characters)");
                  if (!password || password.length < 8) return;
                  resetPasswordMutation.mutate({ id: editingUser.id, password });
                }}
              >
                Reset password
              </Button>
            )}

            {editingUser && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (!window.confirm(`Delete user ${editingUser.username || editingUser.fullName}? This cannot be undone.`)) return;
                  deleteMutation.mutate(editingUser.id, {
                    onSuccess: () => {
                      cancelEdit();
                    },
                  });
                }}
              >
                Delete user
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
