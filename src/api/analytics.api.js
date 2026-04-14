import { api } from "./client";
import { unwrapResponse } from "../lib/apiResponse";

export async function getSlaAnalytics() {
  return unwrapResponse(await api.get("/analytics/sla", { params: { _ts: Date.now() } }));
}

export async function getLast7Analytics(params) {
  return unwrapResponse(await api.get("/analytics/last7", {
    params: {
      ...(params || {}),
      _ts: Date.now(),
    },
  }));
}

export async function getLast30Analytics(params) {
  return unwrapResponse(await api.get("/analytics/last30", {
    params: {
      ...(params || {}),
      _ts: Date.now(),
    },
  }));
}

export async function getFilteredSlaAnalytics(payload) {
  return unwrapResponse(await api.post("/analytics/sla/filter", payload, {
    params: {
      _ts: Date.now(),
    },
  }));
}
