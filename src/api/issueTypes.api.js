import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function getIssueTypes(departmentId) {
  const params = departmentId ? { departmentId } : undefined;
  return unwrapResponse(await api.get("/issue-types", { params }));
}
