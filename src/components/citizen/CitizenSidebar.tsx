import { Home, FileText, Bell, User, Map, Award, Settings, HelpCircle } from "lucide-react";
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
  { title: "Home", url: "/citizen-dashboard", icon: Home },
  { title: "My Issues", url: "/citizen-dashboard/issues", icon: FileText },
  { title: "Map View", url: "/citizen-dashboard/map", icon: Map },
  { title: "Notifications", url: "/citizen-dashboard/notifications", icon: Bell },
  { title: "Profile", url: "/citizen-dashboard/profile", icon: User },
  { title: "Help", url: "/citizen-dashboard/help", icon: HelpCircle },
];

export const CitizenSidebar = () => {
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
          {open && <SidebarGroupLabel>Main Menu</SidebarGroupLabel>}
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
