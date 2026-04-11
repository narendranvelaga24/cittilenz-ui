import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function getOfficialDashboard() {
  return unwrapResponse(await api.get("/official/issues/dashboard"));
}

export async function getSuperiorDashboard() {
  return unwrapResponse(await api.get("/superior/issues/dashboard"));
}
