const TOAST_KEY = "cittilenz_toast";

export function pushRouteToast(message) {
  if (!message || typeof window === "undefined") return;
  window.sessionStorage.setItem(TOAST_KEY, message);
}

export function popRouteToast() {
  if (typeof window === "undefined") return "";
  const value = window.sessionStorage.getItem(TOAST_KEY) || "";
  if (value) window.sessionStorage.removeItem(TOAST_KEY);
  return value;
}
