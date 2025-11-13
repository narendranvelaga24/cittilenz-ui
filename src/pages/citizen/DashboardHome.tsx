import { useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, WifiOff, Shield, Star, TrendingUp } from "lucide-react";
import potholeImg from "@/assets/pothole.jpg";
import streetlightImg from "@/assets/streetlight.jpg";
import garbageImg from "@/assets/garbage.jpg";

interface CitizenOutletContext {
  onQuickReport?: () => void;
  onIssueSelect?: (issue: any) => void;
}

const DashboardHome = ({ onQuickReport, onIssueSelect }: { onQuickReport?: () => void; onIssueSelect?: (issue: any) => void }) => {
  const navigate = useNavigate();
  const outletCtx = useOutletContext<CitizenOutletContext>() || {};
  const quickReportFn = onQuickReport || outletCtx.onQuickReport || (() => {});
  const issueSelectFn = onIssueSelect || outletCtx.onIssueSelect || (() => {});

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
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8 rounded-2xl border">
        <h2 className="text-2xl md:text-3xl font-marcellus font-bold mb-2">Welcome back, Citizen!</h2>
        <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">Make your city better, one report at a time.</p>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button 
            size="lg" 
            className="gap-2 bg-foreground hover:opacity-90 w-full sm:w-auto"
            onClick={quickReportFn}
          >
            <Zap className="w-5 h-5" />
            Quick Report
          </Button>
          <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
            <Shield className="w-5 h-5" />
            Anonymous Report
          </Button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        <Badge variant="outline" className="gap-2 py-2 px-3 md:px-4">
          <WifiOff className="w-4 h-4" />
          <span className="text-xs md:text-sm">Online Mode</span>
        </Badge>
        <Badge variant="outline" className="gap-2 py-2 px-3 md:px-4">
          <Shield className="w-4 h-4 text-success" />
          <span className="text-xs md:text-sm">Verified Account</span>
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold">12</p>
            <p className="text-xs text-muted-foreground mt-1">+2 this month</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Civic Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl md:text-3xl font-bold">340</p>
              <Star className="w-4 h-4 md:w-5 md:h-5 text-warning" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Level 3 Citizen</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold">8</p>
            <p className="text-xs text-success mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              66% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold">2/4</p>
            <div className="flex gap-1 mt-2">
              {achievements.map((ach, i) => (
                <span key={i} className={`text-base md:text-lg ${!ach.unlocked && 'opacity-30'}`}>
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
          <h2 className="text-xl md:text-2xl font-marcellus font-bold">Recent Issues</h2>
          <Button variant="ghost" onClick={() => navigate("/citizen-dashboard/my-issues")} className="hidden sm:flex">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {mockIssues.map((issue) => (
            <Card 
              key={issue.id} 
              className="hover-lift overflow-hidden cursor-pointer"
              onClick={() => issueSelectFn(issue)}
            >
              <div className="relative">
                <img src={issue.image} alt={issue.title} className="w-full h-40 md:h-48 object-cover" />
                <Badge 
                  className={`absolute top-2 right-2 text-xs ${
                    issue.status === "Pending" ? "bg-warning text-warning-foreground" :
                    issue.status === "In Progress" ? "bg-info text-info-foreground" : "bg-success text-success-foreground"
                  }`}
                >
                  {issue.status}
                </Badge>
              </div>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2 text-sm md:text-base">{issue.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-3">Reported {issue.date}</p>
                <Button variant="outline" className="w-full rounded-xl text-xs md:text-sm">Track Issue</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Mobile View All Button */}
        <Button 
          variant="ghost" 
          className="w-full sm:hidden" 
          onClick={() => navigate("/citizen-dashboard/my-issues")}
        >
          View All Issues
        </Button>
      </div>

      {/* Neighborhood Feed Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-marcellus text-base md:text-lg">Neighborhood Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-muted rounded-xl">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-background flex items-center justify-center text-lg md:text-xl">
                🚧
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm md:text-base truncate">Road work on Oak Street</p>
                <p className="text-xs text-muted-foreground">2 blocks away • Resolved</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-muted rounded-xl">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-background flex items-center justify-center text-lg md:text-xl">
                💡
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm md:text-base truncate">Street lights repaired</p>
                <p className="text-xs text-muted-foreground">5 blocks away • In Progress</p>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full mt-3 text-xs md:text-sm" 
            onClick={() => navigate("/citizen-dashboard/map")}
          >
            View Neighborhood Map
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
