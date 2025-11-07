import { Home, Users, Shield, FileText, Wrench, Database, Zap, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/cittilenz-logo.jpeg";

const menuItems = [
  { title: "Dashboard", url: "/admin-dashboard", icon: Home },
  { title: "User Management", url: "/admin-dashboard/users", icon: Users },
  { title: "Role & Permissions", url: "/admin-dashboard/roles", icon: Shield },
  { title: "Audit Logs", url: "/admin-dashboard/audit", icon: FileText },
  { title: "Workflow Editor", url: "/admin-dashboard/workflows", icon: Wrench },
  { title: "AI Training", url: "/admin-dashboard/ai", icon: Zap },
  { title: "Data Export", url: "/admin-dashboard/export", icon: Database },
  { title: "System Settings", url: "/admin-dashboard/settings", icon: Settings },
];

export const AdminSidebar = () => {
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarContent>
        <div className={`p-4 border-b flex items-center gap-3 ${!open && "justify-center"}`}>
          <img src={logo} alt="Cittilenz" className="h-8 w-8 rounded-lg" />
          {open && <span className="font-marcellus font-bold text-lg">Cittilenz</span>}
        </div>

        <SidebarGroup>
          {open && <SidebarGroupLabel>Admin Portal</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className={open ? "mr-2 h-4 w-4" : "h-4 w-4"} />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
