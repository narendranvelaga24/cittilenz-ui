import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function getAdminDashboard() {
  return unwrapResponse(await api.get("/admin/issues/dashboard", { params: { _ts: Date.now() } }));
}

export async function getUsers() {
  return unwrapResponse(await api.get("/admin/users"));
}

export async function getUserById(id) {
  return unwrapResponse(await api.get(`/admin/users/${id}`));
}

export async function createStaffUser(payload) {
  return unwrapResponse(await api.post("/admin/users", payload));
}

export async function updateStaffUser(id, payload) {
  return unwrapResponse(await api.put(`/admin/users/${id}`, payload));
}

export async function resetStaffPassword(id, newPassword) {
  return unwrapResponse(await api.post(`/admin/users/${id}/reset-password`, { newPassword }));
}

export async function deleteStaffUser(id) {
  return unwrapResponse(await api.delete(`/admin/users/${id}`));
}

export async function createIssueType(payload) {
  return unwrapResponse(await api.post("/admin/issue-types", payload));
}

function normalizeIssueTypeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export async function getAdminIssueTypes() {
  const attempts = [
    () => api.get("/admin/issue-types", { params: { includeInactive: true } }),
    () => api.get("/admin/issue-types", { params: { all: true } }),
    () => api.get("/admin/issue-types"),
    () => api.get("/admin/issue-types", { params: { active: true } }),
    () => api.get("/admin/issue-types", { params: { active: false } }),
  ];

  let activeRows = [];
  let inactiveRows = [];
  let hadSuccess = false;

  for (const attempt of attempts) {
    try {
      const data = unwrapResponse(await attempt());
      const rows = normalizeIssueTypeList(data);
      hadSuccess = true;

      if (rows.length > 0 && rows.some((row) => typeof row?.active === "boolean")) {
        const hasActive = rows.some((row) => row.active === true);
        const hasInactive = rows.some((row) => row.active === false);
        if (hasActive && hasInactive) return rows;
      }

      const query = data?.query || {};
      if (query.active === false || rows.every((row) => row?.active === false)) {
        inactiveRows = rows;
      } else if (query.active === true || rows.every((row) => row?.active !== false)) {
        activeRows = rows;
      } else if (rows.length > 0) {
        return rows;
      }
    } catch {
      // Continue trying other endpoint variants.
    }
  }

  if (activeRows.length || inactiveRows.length) {
    const merged = [...activeRows, ...inactiveRows];
    const seen = new Set();
    return merged.filter((row) => {
      const key = row?.id ?? `${row?.name}-${row?.departmentId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  if (hadSuccess) return [];
  return unwrapResponse(await api.get("/issue-types"));
}

export async function updateIssueType(id, payload) {
  return unwrapResponse(await api.put(`/admin/issue-types/${id}`, payload));
}

export async function setIssueTypeActive(id, active) {
  return unwrapResponse(await api.patch(`/admin/issue-types/${id}/status`, null, { params: { active } }));
}
