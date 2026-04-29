import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";
import { fetchCurrentUser } from "./currentUser";

export async function login(payload) {
  return unwrapResponse(await api.post("/auth/login", payload));
}

export async function forgotPassword(payload) {
  return unwrapResponse(await api.post("/auth/forgot-password", payload));
}

export async function getCurrentUser() {
  return fetchCurrentUser();
}

export async function logout() {
  return unwrapResponse(await api.post("/auth/logout"));
}

export async function registerCitizen(payload) {
  return unwrapResponse(await api.post("/users/register", payload));
}
