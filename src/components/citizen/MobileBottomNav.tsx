import { Home, FileText, Map, Bell, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

export const MobileBottomNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex items-center justify-around h-16">
        <NavLink
          to="/citizen-dashboard"
          end
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>
        
        <NavLink
          to="/citizen-dashboard/my-issues"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-foreground transition-colors"
          activeClassName="text-primary"
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1">Issues</span>
        </NavLink>
        
        <NavLink
          to="/citizen-dashboard/map"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Map className="h-5 w-5" />
          <span className="text-xs mt-1">Map</span>
        </NavLink>
        
        <NavLink
          to="/citizen-dashboard/notifications"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-foreground transition-colors relative"
          activeClassName="text-primary"
        >
          <Bell className="h-5 w-5" />
          <span className="text-xs mt-1">Alerts</span>
          <span className="absolute top-2 right-1/4 h-2 w-2 rounded-full bg-destructive" />
        </NavLink>
        
        <NavLink
          to="/citizen-dashboard/profile"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-foreground transition-colors"
          activeClassName="text-primary"
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
