import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";
import { fetchCurrentUser } from "./currentUser";

export async function getUserProfile() {
  return fetchCurrentUser();
}

export async function updateProfile(payload) {
  return unwrapResponse(await api.patch("/users/me", payload));
}

export async function changePassword(payload) {
  return unwrapResponse(await api.patch("/users/me/password", payload));
}

export async function deactivateAccount() {
  return unwrapResponse(await api.patch("/users/me/deactivate"));
}

export async function deleteAccount() {
  return unwrapResponse(await api.delete("/users/me"));
}
