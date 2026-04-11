import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function getDepartments() {
  return unwrapResponse(await api.get("/departments"));
}
