import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { ThemeSwitch } from "../ui/ThemeSwitch.jsx";
import { useAuth } from "../../features/auth/useAuth";

const navByRole = {
  CITIZEN: [
    ["Dashboard", "/citizen/dashboard"],
    ["Report Issue", "/citizen/report-issue"],
    ["My Issues", "/citizen/issues"],
    ["Profile", "/profile"],
  ],
  OFFICIAL: [
    ["Dashboard", "/official/dashboard"],
    ["Assigned Issues", "/official/issues"],
    ["Profile", "/profile"],
  ],
  WARD_SUPERIOR: [
    ["Dashboard", "/superior/dashboard"],
    ["Escalations", "/superior/issues"],
    ["Analytics", "/analytics"],
    ["Profile", "/profile"],
  ],
  ADMIN: [
    ["Dashboard", "/admin/dashboard"],
    ["Users", "/admin/users"],
    ["Issue Types", "/admin/issue-types"],
    ["Issues", "/admin/issues"],
    ["Analytics", "/admin/analytics"],
  ],
};

export function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const links = navByRole[user?.role] || [];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck />
          <div>
            <strong>Cittilenz</strong>
            <span>{user?.role?.replace("_", " ")}</span>
          </div>
        </div>
        <nav>
          {links.map(([label, path]) => (
            <NavLink key={path} to={path}>
              {label}
            </NavLink>
          ))}
        </nav>
        <ThemeSwitch />
        <button className="ghost-button" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </aside>
      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}
