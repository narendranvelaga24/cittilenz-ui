import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CirclePlus,
  ClipboardList,
  FileClock,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Moon,
  MoreHorizontal,
  Sun,
  Tags,
  UserCircle,
  Users,
} from "lucide-react";
import { createElement, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuth } from "../../features/auth/useAuth";
import { popRouteToast } from "../../lib/toast";
import { Dock } from "../ui/Dock.jsx";
import { useThemeMode } from "../ui/useThemeMode.js";

const navByRole = {
  CITIZEN: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/citizen/dashboard" },
    { icon: CirclePlus, label: "Report Issue", path: "/citizen/report-issue" },
    { icon: ListChecks, label: "My Issues", path: "/citizen/issues" },
    { icon: UserCircle, label: "Profile", path: "/profile" },
  ],
  OFFICIAL: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/official/dashboard" },
    { icon: ClipboardList, label: "Assigned Issues", path: "/official/issues" },
    { icon: UserCircle, label: "Profile", path: "/profile" },
  ],
  WARD_SUPERIOR: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/superior/dashboard" },
    { icon: AlertTriangle, label: "Escalations", path: "/superior/issues" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: UserCircle, label: "Profile", path: "/profile" },
  ],
  ADMIN: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Tags, label: "Issue Types", path: "/admin/issue-types" },
    { icon: FileClock, label: "Issues", path: "/admin/issues" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  ],
};

const sidebarVariants = {
  open: { width: "15rem" },
  closed: { width: "3.05rem" },
};

const labelVariants = {
  open: { display: "inline", opacity: 1, x: 0 },
  closed: { opacity: 0, x: -10, transitionEnd: { display: "none" } },
};

const sidebarTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

const MotionAside = motion.aside;
const MotionSpan = motion.span;

function isPathActive(pathname, path) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function DesktopSidebar({ isDarkTheme, links, onLogout, onThemeToggle }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const ThemeIcon = isDarkTheme ? Sun : Moon;

  return (
    <MotionAside
      animate={isCollapsed ? "closed" : "open"}
      className={cn("sidebar app-sidebar", isCollapsed ? "is-collapsed" : "is-open")}
      initial={isCollapsed ? "closed" : "open"}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      transition={sidebarTransition}
      variants={sidebarVariants}
    >
      <nav aria-label="Primary navigation" className="sidebar-nav">
        {links.map(({ icon: Icon, label, path }) => (
          <NavLink
            className={({ isActive }) => cn("sidebar-link", isActive && "active")}
            key={path}
            title={label}
            to={path}
          >
            {createElement(Icon, { size: 18, strokeWidth: 1.8 })}
            <MotionSpan className="sidebar-link-label" variants={labelVariants}>
              {label}
            </MotionSpan>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-actions">
        <button className="sidebar-link sidebar-action" onClick={onThemeToggle} title={isDarkTheme ? "Use light theme" : "Use dark theme"} type="button">
          {createElement(ThemeIcon, { size: 18, strokeWidth: 1.8 })}
          <MotionSpan className="sidebar-link-label" variants={labelVariants}>
            {isDarkTheme ? "Light mode" : "Dark mode"}
          </MotionSpan>
        </button>
        <button className="sidebar-link sidebar-action" onClick={onLogout} title="Logout" type="button">
          <LogOut size={18} strokeWidth={1.8} />
          <MotionSpan className="sidebar-link-label" variants={labelVariants}>
            Logout
          </MotionSpan>
        </button>
      </div>
    </MotionAside>
  );
}

function getDockItems({ isDarkTheme, links, navigate, onLogout, onThemeToggle, pathname }) {
  const navigationItems = links.map(({ icon, label, path }) => ({
    active: isPathActive(pathname, path),
    icon,
    label,
    onClick: () => navigate(path),
  }));

  const utilityItems = [
    {
      icon: isDarkTheme ? Sun : Moon,
      label: isDarkTheme ? "Light" : "Dark",
      onClick: onThemeToggle,
    },
    {
      icon: LogOut,
      label: "Logout",
      onClick: onLogout,
    },
  ];

  const items = [...navigationItems, ...utilityItems];
  if (items.length <= 5) return items;

  return [
    ...items.slice(0, 4),
    {
      icon: MoreHorizontal,
      label: "More",
      children: items.slice(4),
    },
  ];
}

export function AppLayout() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();
  const links = navByRole[user?.role] || [];
  const [toastMessage, setToastMessage] = useState(() => popRouteToast() || "");
  const isDarkTheme = theme === "dark";

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const dockItems = getDockItems({
    isDarkTheme,
    links,
    navigate,
    onLogout: handleLogout,
    onThemeToggle: toggleTheme,
    pathname: location.pathname,
  });

  return (
    <div className="shell">
      {toastMessage && <div className="toast-message" role="status" aria-live="polite">{toastMessage}</div>}
      <DesktopSidebar isDarkTheme={isDarkTheme} links={links} onLogout={handleLogout} onThemeToggle={toggleTheme} />
      <main className="main-panel">
        <Outlet />
      </main>
      <Dock items={dockItems} />
    </div>
  );
}
