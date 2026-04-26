export function formatRoleLabel(role) {
  return role ? String(role).replaceAll("_", " ") : "Dashboard";
}
