import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function getWards() {
  return unwrapResponse(await api.get("/wards"));
}

export async function lookupWard(lat, lng) {
  return unwrapResponse(await api.get("/wards/lookup", { params: { lat, lng } }));
}
