import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function predictIssue(file) {
  const formData = new FormData();
  formData.append("file", file);
  return unwrapResponse(await api.post("/ai/predict", formData));
}
