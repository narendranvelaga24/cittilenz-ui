import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createStaffUser, deleteStaffUser, getUsers, resetStaffPassword, updateStaffUser } from "../../api/admin.api";
import { getDepartments } from "../../api/departments.api";
import { getWards } from "../../api/wards.api";
import { Alert } from "../../components/ui/Alert.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { FormField } from "../../components/ui/FormField.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { errorMessage } from "../../lib/apiResponse";

const PAGE_SIZE = 10;

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ username: "", fullName: "", email: "", mobile: "", password: "", role: "OFFICIAL", wardId: "", departmentId: "" });
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
      setError("");
      setForm({ username: "", fullName: "", email: "", mobile: "", password: "", role: "OFFICIAL", wardId: "", departmentId: "" });
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
    onSuccess: () => setMessage("Password reset successful."),
    onError: (err) => setError(errorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaffUser,
    onSuccess: () => {
      setMessage("User deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "role" && value === "WARD_SUPERIOR" ? { departmentId: "" } : {}),
    }));
  }

  function submit(event) {
    event.preventDefault();
    const payload = {
      username: form.username,
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      password: form.password,
      role: form.role,
      wardId: Number(form.wardId),
    };
    if (form.role === "OFFICIAL") payload.departmentId = Number(form.departmentId);
    mutation.mutate(payload);
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
  const columns = [
    { key: "fullName", header: "Name" },
    { key: "role", header: "Role" },
    { key: "email", header: "Email" },
    { key: "mobile", header: "Mobile" },
    { key: "isActive", header: "Active", render: (user) => (user.isActive ? "Yes" : "No") },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="action-cell">
          <button
            type="button"
            onClick={() => updateMutation.mutate({ id: row.id, payload: { isActive: !row.isActive } })}
          >
            {row.isActive ? "Deactivate" : "Activate"}
          </button>
          {row.role !== "CITIZEN" && (
            <button
              type="button"
              onClick={() => {
                const password = window.prompt("Enter new password (min 8 characters)");
                if (!password || password.length < 8) return;
                resetPasswordMutation.mutate({ id: row.id, password });
              }}
            >
              Reset password
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (!window.confirm(`Delete user ${row.username || row.fullName}? This cannot be undone.`)) return;
              deleteMutation.mutate(row.id);
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="page-stack">
      <PageHeader eyebrow="Admin" title="User management" />
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="detail-grid">
        <form className="panel form-grid" onSubmit={submit}>
          <h2>Create official or superior</h2>
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
          <button className="primary-button" disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Create user"}</button>
        </form>
        <DataTable
          caption="Admin users"
          columns={columns}
          rows={visibleUsers}
          getRowKey={(user) => user.id}
          emptyTitle="No users found"
          toolbar={<><strong>Latest users</strong><span>{usersFetching ? "Refreshing..." : `Showing ${rangeStart}-${rangeEnd} of ${users.length}`}</span></>}
        />
      </div>
      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
