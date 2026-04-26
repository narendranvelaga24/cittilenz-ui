import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

const currentUserPaths = ["/users/me", "/auth/me"];

export async function fetchCurrentUser() {
  let lastError = null;

  for (const path of currentUserPaths) {
    try {
      return unwrapResponse(await api.get(path));
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

  throw lastError;
}