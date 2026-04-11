import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function getUserProfile() {
  return unwrapResponse(await api.get("/users/me"));
}

export async function updateProfile(payload) {
  return unwrapResponse(await api.patch("/users/me", payload));
}

export async function changePassword(payload) {
  return unwrapResponse(await api.patch("/users/me/password", payload));
}
