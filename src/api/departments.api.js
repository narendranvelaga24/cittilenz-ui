import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function getDepartments() {
  return unwrapResponse(await api.get("/departments"));
}

export async function getDepartmentById(id) {
  return unwrapResponse(await api.get(`/departments/${id}`));
}
