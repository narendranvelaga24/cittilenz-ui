import { Navigate, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OfficialSidebar } from "@/components/official/OfficialSidebar";
import { Bell, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const OfficialDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <OfficialSidebar />
        </div>

        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-14 md:h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
            <div className="flex items-center gap-2 md:gap-4">
              {isMobile ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <OfficialSidebar />
                  </SheetContent>
                </Sheet>
              ) : (
                <SidebarTrigger />
              )}
              <h1 className="text-base md:text-xl font-marcellus font-semibold text-foreground">
                {isMobile ? "Portal" : "Official Portal"}
              </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </Button>
              {!isMobile && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OfficialDashboard;
