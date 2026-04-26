import axios from "axios";
import { env } from "../lib/env";
import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function predictIssue(file) {
  const formData = new FormData();
  formData.append("file", file);
  return unwrapResponse(await api.post("/ai/predict", formData));
}

export async function predictIssueDirect(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${env.aiUrl}/predict`, formData, {
    timeout: 30_000,
  });

  return response.data;
}
