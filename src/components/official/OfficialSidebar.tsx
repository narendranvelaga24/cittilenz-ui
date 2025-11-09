import { Home, ClipboardList, Map, BarChart3, Users, Truck, Package, Bell, Settings } from "lucide-react";
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
  { title: "Dashboard", url: "/official-dashboard", icon: Home },
  { title: "Issues", url: "/official-dashboard/issues", icon: ClipboardList },
  { title: "Map Analytics", url: "/official-dashboard/map", icon: Map },
  { title: "Performance", url: "/official-dashboard/performance", icon: BarChart3 },
  { title: "Notifications", url: "/official-dashboard/notifications", icon: Bell },
  { title: "Profile", url: "/official-dashboard/profile", icon: Settings },
];

export const OfficialSidebar = () => {
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
          {open && <SidebarGroupLabel>Official Portal</SidebarGroupLabel>}
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
