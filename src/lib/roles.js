export const roleHome = {
  CITIZEN: "/citizen/dashboard",
  OFFICIAL: "/official/dashboard",
  WARD_SUPERIOR: "/superior/dashboard",
  ADMIN: "/admin/dashboard",
};

export function getHomeForRole(role) {
  return roleHome[role] || "/login";
}
