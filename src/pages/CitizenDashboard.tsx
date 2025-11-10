import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CitizenSidebar } from "@/components/citizen/CitizenSidebar";
import { MobileBottomNav } from "@/components/citizen/MobileBottomNav";
import { QuickReportDialog } from "@/components/citizen/QuickReportDialog";
import { IssueDetailDialog } from "@/components/citizen/IssueDetailDialog";
import { FAB } from "@/components/ui/floating-action-button";
import { Bell, LogOut, Menu, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardHome from "./citizen/DashboardHome";
import MyIssues from "./citizen/MyIssues";
import MapView from "./citizen/MapView";
import Notifications from "./citizen/Notifications";
import Profile from "./citizen/Profile";
import Help from "./citizen/Help";


const CitizenDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [quickReportOpen, setQuickReportOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <CitizenSidebar />
        </div>

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 md:h-16 items-center gap-2 md:gap-4 px-4 md:px-6">
              {/* Mobile Menu */}
              {isMobile ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <CitizenSidebar />
                  </SheetContent>
                </Sheet>
              ) : (
                <SidebarTrigger />
              )}

              {/* Title - visible on desktop/tablet */}
              <h1 className="hidden sm:block text-lg md:text-xl font-marcellus font-bold">Cittilenz</h1>
              <div className="flex-1" />

              {/* Actions */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => navigate("/citizen-dashboard/notifications")}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
              
              {/* Desktop user info and logout */}
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <Button variant="outline" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile logout */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="md:hidden"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route index element={<DashboardHome onQuickReport={() => setQuickReportOpen(true)} onIssueSelect={setSelectedIssue} />} />
                <Route path="my-issues" element={<MyIssues />} />
                <Route path="map" element={<MapView />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<Profile />} />
                <Route path="help" element={<Help />} />
                <Route path="*" element={<Navigate to="/citizen-dashboard" replace />} />
              </Routes>
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </div>

      {/* Floating Action Button for Quick Report */}
      <FAB onClick={() => setQuickReportOpen(true)}>
        <Plus className="h-6 w-6" />
      </FAB>

      {/* Dialogs */}
      <QuickReportDialog open={quickReportOpen} onOpenChange={setQuickReportOpen} />
      <IssueDetailDialog 
        open={!!selectedIssue} 
        onOpenChange={(open) => !open && setSelectedIssue(null)} 
        issue={selectedIssue}
      />
    </SidebarProvider>
  );
};

export default CitizenDashboard;
