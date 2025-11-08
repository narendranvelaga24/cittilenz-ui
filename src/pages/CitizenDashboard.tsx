import { useState } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CitizenSidebar } from "@/components/citizen/CitizenSidebar";
import { QuickReportDialog } from "@/components/citizen/QuickReportDialog";
import { IssueDetailDialog } from "@/components/citizen/IssueDetailDialog";
import { Bell, Zap, WifiOff, Shield, Star, TrendingUp } from "lucide-react";
import potholeImg from "@/assets/pothole.jpg";
import streetlightImg from "@/assets/streetlight.jpg";
import garbageImg from "@/assets/garbage.jpg";
import MyIssues from "./citizen/MyIssues";
import MapView from "./citizen/MapView";
import Notifications from "./citizen/Notifications";
import Profile from "./citizen/Profile";
import Help from "./citizen/Help";

const DashboardHome = ({ onQuickReport, onIssueSelect }: { onQuickReport: () => void; onIssueSelect: (issue: any) => void }) => {
  const navigate = useNavigate();

  const mockIssues = [
    { id: 1, title: "Pothole on Main Street", status: "In Progress", date: "2025-11-01", image: potholeImg, priority: "high" },
    { id: 2, title: "Broken Streetlight", status: "Pending", date: "2025-11-03", image: streetlightImg, priority: "medium" },
    { id: 3, title: "Garbage Not Collected", status: "Resolved", date: "2025-10-28", image: garbageImg, priority: "low" },
  ];

  const achievements = [
    { name: "First Reporter", icon: "🏆", unlocked: true },
    { name: "Problem Solver", icon: "⭐", unlocked: true },
    { name: "Civic Hero", icon: "🦸", unlocked: false },
    { name: "Community Guardian", icon: "🛡️", unlocked: false },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-2xl border">
        <h2 className="text-3xl font-marcellus font-bold mb-2">Welcome back, Citizen!</h2>
        <p className="text-muted-foreground mb-6">Make your city better, one report at a time.</p>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button 
            size="lg" 
            className="gap-2 bg-foreground hover:opacity-90"
            onClick={onQuickReport}
          >
            <Zap className="w-5 h-5" />
            Quick Report
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Shield className="w-5 h-5" />
            Anonymous Report
          </Button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="gap-2 py-2 px-4">
          <WifiOff className="w-4 h-4" />
          Online Mode
        </Badge>
        <Badge variant="outline" className="gap-2 py-2 px-4">
          <Shield className="w-4 h-4 text-success" />
          Verified Account
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
            <p className="text-xs text-muted-foreground mt-1">+2 this month</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Civic Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">340</p>
              <Star className="w-5 h-5 text-warning" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Level 3 Citizen</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8</p>
            <p className="text-xs text-success mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              66% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2/4</p>
            <div className="flex gap-1 mt-2">
              {achievements.map((ach, i) => (
                <span key={i} className={`text-lg ${!ach.unlocked && 'opacity-30'}`}>
                  {ach.icon}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-marcellus font-bold">Recent Issues</h2>
          <Button variant="ghost" onClick={() => navigate("/citizen-dashboard/issues")}>View All</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockIssues.map((issue) => (
            <Card 
              key={issue.id} 
              className="hover-lift overflow-hidden cursor-pointer"
              onClick={() => onIssueSelect(issue)}
            >
              <div className="relative">
                <img src={issue.image} alt={issue.title} className="w-full h-48 object-cover" />
                <Badge 
                  className={`absolute top-2 right-2 ${
                    issue.status === "Pending" ? "bg-warning text-warning-foreground" :
                    issue.status === "In Progress" ? "bg-info text-info-foreground" : "bg-success text-success-foreground"
                  }`}
                >
                  {issue.status}
                </Badge>
              </div>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2">{issue.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">Reported {issue.date}</p>
                <Button variant="outline" className="w-full rounded-xl">Track Issue</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Neighborhood Feed Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-marcellus">Neighborhood Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-muted rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
                🚧
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Road work on Oak Street</p>
                <p className="text-xs text-muted-foreground">2 blocks away • Resolved</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-muted rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
                💡
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Street lights repaired</p>
                <p className="text-xs text-muted-foreground">5 blocks away • In Progress</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" className="w-full mt-3" onClick={() => navigate("/citizen-dashboard/map")}>View Neighborhood Map</Button>
        </CardContent>
      </Card>
    </div>
  );
};

const CitizenDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [quickReportOpen, setQuickReportOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CitizenSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-40 bg-card border-b border-border backdrop-blur-sm">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <h1 className="text-2xl font-marcellus font-bold">Dashboard</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => navigate("/citizen-dashboard/notifications")}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
                </Button>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route index element={<DashboardHome onQuickReport={() => setQuickReportOpen(true)} onIssueSelect={setSelectedIssue} />} />
                <Route path="issues" element={<MyIssues />} />
                <Route path="map" element={<MapView />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<Profile />} />
                <Route path="help" element={<Help />} />
                <Route path="*" element={<Navigate to="/citizen-dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>

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
