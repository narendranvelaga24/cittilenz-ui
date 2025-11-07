import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OfficialSidebar } from "@/components/official/OfficialSidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Bell, Clock, AlertTriangle, CheckCircle2, TrendingUp, Users, Package, FileText } from "lucide-react";
import potholeImg from "@/assets/pothole.jpg";
import streetlightImg from "@/assets/streetlight.jpg";
import garbageImg from "@/assets/garbage.jpg";
import waterleakImg from "@/assets/waterleak.jpg";

const OfficialDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const mockIssues = [
    { id: 1, title: "Pothole on Main Street", category: "Road", status: "In Progress", priority: "High", reporter: "John D.", date: "2025-11-01", location: "Downtown", image: potholeImg, slaRemaining: 2.5, assigned: "Team A" },
    { id: 2, title: "Broken Streetlight", category: "Lighting", status: "Pending", priority: "Medium", reporter: "Sarah M.", date: "2025-11-03", location: "Oak Street", image: streetlightImg, slaRemaining: 16, assigned: null },
    { id: 3, title: "Garbage Not Collected", category: "Sanitation", status: "Pending", priority: "High", reporter: "Mike R.", date: "2025-10-28", location: "Park Ave", image: garbageImg, slaRemaining: 0.5, assigned: null },
    { id: 4, title: "Water Leak", category: "Water", status: "Assigned", priority: "High", reporter: "Lisa K.", date: "2025-11-04", location: "Main Square", image: waterleakImg, slaRemaining: 8, assigned: "Team B" },
  ];

  const workOrders = [
    { id: "WO-001", issue: "Pothole on Main Street", team: "Team A", status: "In Progress", eta: "2 hours", materials: "Asphalt, Tools" },
    { id: "WO-002", issue: "Water Leak", team: "Team B", status: "En Route", eta: "30 mins", materials: "Pipe, Wrench" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <OfficialSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-40 bg-card border-b border-border backdrop-blur-sm">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-2xl font-marcellus font-bold">Official Dashboard</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">5</span>
                </Button>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover-scale">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Total Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">156</p>
                    <p className="text-xs text-muted-foreground mt-1">+12 this week</p>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Urgent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-500">8</p>
                    <p className="text-xs text-red-600 mt-1">SLA breach risk</p>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      In Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-500">42</p>
                    <p className="text-xs text-muted-foreground mt-1">Avg. 18h resolution</p>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Resolved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-green-500">106</p>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-xs text-green-600 mt-1">94% satisfaction</p>
                  </CardContent>
                </Card>
              </div>

              {/* SLA Warnings */}
              <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-lg font-marcellus flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    SLA Warnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockIssues.filter(i => i.slaRemaining < 4).map((issue) => (
                      <div key={issue.id} className="flex items-center gap-4 p-3 bg-background rounded-xl">
                        <img src={issue.image} alt={issue.title} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{issue.title}</p>
                          <p className="text-xs text-muted-foreground">{issue.location}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive" className="mb-1">
                            {issue.slaRemaining}h left
                          </Badge>
                          <Progress value={(issue.slaRemaining / 24) * 100} className="w-24 h-2" />
                        </div>
                        <Button size="sm">Escalate</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Work Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-marcellus flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Active Work Orders
                    </span>
                    <Button variant="outline" size="sm">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workOrders.map((wo) => (
                      <div key={wo.id} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">{wo.id}</Badge>
                            <Badge className="bg-blue-500">{wo.status}</Badge>
                          </div>
                          <p className="font-medium text-sm">{wo.issue}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Team: {wo.team} • ETA: {wo.eta}
                          </p>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs">{wo.materials}</span>
                          </div>
                          <Button size="sm" variant="outline">Track</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Issues Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-marcellus">All Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>SLA</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockIssues.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell>
                            <img src={issue.image} alt={issue.title} className="w-12 h-12 object-cover rounded-lg" />
                          </TableCell>
                          <TableCell className="font-medium">{issue.title}</TableCell>
                          <TableCell>{issue.category}</TableCell>
                          <TableCell>{issue.location}</TableCell>
                          <TableCell>
                            <Badge variant={issue.priority === "High" ? "destructive" : "secondary"}>
                              {issue.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={issue.slaRemaining < 4 ? "text-red-500 font-semibold" : ""}>
                              {issue.slaRemaining}h
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              issue.status === "Pending" ? "bg-yellow-500" :
                              issue.status === "In Progress" ? "bg-blue-500" :
                              issue.status === "Assigned" ? "bg-purple-500" : "bg-gray-500"
                            }>
                              {issue.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{issue.assigned || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Assign</Button>
                              <Button size="sm">View</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OfficialDashboard;
