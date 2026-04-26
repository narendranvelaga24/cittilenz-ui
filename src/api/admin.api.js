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

export async function getAdminIssueTypes() {
  return unwrapResponse(await api.get("/issue-types"));
}

export async function updateIssueType(id, payload) {
  return unwrapResponse(await api.put(`/admin/issue-types/${id}`, payload));
}

export async function setIssueTypeActive(id, active) {
  return unwrapResponse(await api.patch(`/admin/issue-types/${id}/status`, null, { params: { active } }));
}
