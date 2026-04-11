import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function login(payload) {
  return unwrapResponse(await api.post("/auth/login", payload));
}

export async function getCurrentUser() {
  return unwrapResponse(await api.get("/auth/me"));
}

export async function registerCitizen(payload) {
  return unwrapResponse(await api.post("/users/register", payload));
}
