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
import { formatRoleLabel } from "../../lib/branding";
import { useAuth } from "../../features/auth/useAuth";
import { popRouteToast } from "../../lib/toast";
import { Dock } from "../ui/Dock.jsx";
import { PageTransition } from "../routing/PageTransition.jsx";
import { ToastNotification } from "../ui/ToastNotification.jsx";
import { useThemeMode } from "../ui/useThemeMode.js";

const LOGO_SRC = "/logo.png";

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

const sidebarTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

const MotionAside = motion.aside;

function NavGlassFilter() {
  return (
    <svg aria-hidden="true" className="nav-glass-filter">
      <defs>
        <filter id="nav-liquid-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence baseFrequency="0.04 0.04" numOctaves="1" result="turbulence" seed="2" type="fractalNoise" />
          <feGaussianBlur in="turbulence" result="blurredNoise" stdDeviation="1.6" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" result="displaced" scale="24" xChannelSelector="R" yChannelSelector="B" />
          <feGaussianBlur in="displaced" result="finalBlur" stdDeviation="0.7" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

function isPathActive(pathname, path) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function DesktopSidebar({ isDarkTheme, links, onLogout, onThemeToggle, role }) {
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
      <div className="sidebar-brand-shell">
        <div className="sidebar-brand" title="Cittilenz">
          <span className="sidebar-brand-mark">
            <img alt="Cittilenz logo" className="brand-logo" height="36" src={LOGO_SRC} width="36" />
          </span>
          <div className="sidebar-brand-copy">
            <strong>Cittilenz</strong>
            <span>{formatRoleLabel(role)}</span>
          </div>
        </div>
      </div>
      <nav aria-label="Primary navigation" className="sidebar-nav">
        {links.map(({ icon: Icon, label, path }) => (
          <NavLink
            className={({ isActive }) => cn("sidebar-link", isActive && "active")}
            key={path}
            title={label}
            to={path}
          >
            {createElement(Icon, { size: 18, strokeWidth: 1.8 })}
            <span className="sidebar-link-label">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-actions">
        <button className="sidebar-link sidebar-action" onClick={onThemeToggle} title={isDarkTheme ? "Use light theme" : "Use dark theme"} type="button">
          {createElement(ThemeIcon, { size: 18, strokeWidth: 1.8 })}
          <span className="sidebar-link-label">{isDarkTheme ? "Light mode" : "Dark mode"}</span>
        </button>
        <button className="sidebar-link sidebar-action" onClick={onLogout} title="Logout" type="button">
          <LogOut size={18} strokeWidth={1.8} />
          <span className="sidebar-link-label">Logout</span>
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

  const moreChildren = items.slice(4);

  return [
    ...items.slice(0, 4),
    {
      active: moreChildren.some((item) => item.active),
      icon: MoreHorizontal,
      label: "More",
      children: moreChildren,
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

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
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
      <NavGlassFilter />
      <ToastNotification message={toastMessage} role="status" ariaLive="polite" />
      <DesktopSidebar isDarkTheme={isDarkTheme} links={links} onLogout={handleLogout} onThemeToggle={toggleTheme} role={user?.role} />
      <main className="main-panel">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Dock items={dockItems} />
    </div>
  );
}
