import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function getOfficialDashboard() {
  return unwrapResponse(await api.get("/official/issues/dashboard", { params: { _ts: Date.now() } }));
}

export async function getSuperiorDashboard() {
  return unwrapResponse(await api.get("/superior/issues/dashboard", { params: { _ts: Date.now() } }));
}
