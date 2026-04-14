import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function createIssue(payload) {
  return unwrapResponse(await api.post("/issues", payload));
}

export async function getIssues(params) {
  return unwrapResponse(await api.get("/issues", { params }));
}

export async function getCitizenDashboard() {
  return unwrapResponse(await api.get("/issues/dashboard"));
}

export async function getMyIssues(params) {
  return unwrapResponse(await api.get("/issues/my", { params }));
}

export async function getIssueById(id) {
  return unwrapResponse(await api.get(`/issues/${id}`));
}

export async function getRoleIssues(role, params) {
  const basePath = role === "ADMIN" ? "/admin/issues" : role === "WARD_SUPERIOR" ? "/superior/issues" : "/official/issues";
  return unwrapResponse(await api.get(basePath, { params }));
}

export async function startIssue(id, version) {
  return unwrapResponse(await api.post(`/issues/${id}/start`, { version }));
}

export async function resolveIssue(id, payload) {
  return unwrapResponse(await api.post(`/issues/${id}/resolve`, payload));
}

export async function reassignIssue(id) {
  return unwrapResponse(await api.post(`/issues/${id}/reassign`));
}

export async function supervisorReassign(id, payload) {
  return unwrapResponse(await api.post(`/issues/${id}/supervisor-reassign`, payload || {}));
}

export async function supervisorClear(id, payload) {
  return unwrapResponse(await api.post(`/issues/${id}/supervisor-clear`, payload));
}

export async function linkDuplicate(id) {
  return unwrapResponse(await api.post(`/issues/${id}/duplicate`));
}
