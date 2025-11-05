import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, Users, FileText, LogOut, Home, Shield, BarChart3 } from "lucide-react";
import logo from "@/assets/cittilenz-logo.jpeg";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const mockUsers = [
    { id: 1, email: "citizen@gmail.com", role: "citizen", status: "Active", reports: 12 },
    { id: 2, email: "official@gmail.com", role: "official", status: "Active", resolved: 125 },
    { id: 3, email: "john@example.com", role: "citizen", status: "Active", reports: 8 },
    { id: 4, email: "mary@example.com", role: "official", status: "Active", resolved: 89 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Cittilenz" className="h-10 w-10 rounded-lg" />
              <span className="text-2xl font-marcellus font-bold">Cittilenz Admin</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => setActiveTab("overview")} className={`flex items-center gap-2 transition-colors ${activeTab === "overview" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Home className="w-4 h-4" /> Overview
              </button>
              <button onClick={() => setActiveTab("users")} className={`flex items-center gap-2 transition-colors ${activeTab === "users" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Users className="w-4 h-4" /> Users
              </button>
              <button onClick={() => setActiveTab("issues")} className={`flex items-center gap-2 transition-colors ${activeTab === "issues" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <FileText className="w-4 h-4" /> All Issues
              </button>
              <button onClick={() => setActiveTab("analytics")} className={`flex items-center gap-2 transition-colors ${activeTab === "analytics" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <BarChart3 className="w-4 h-4" /> Analytics
              </button>
              <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">7</span>
              </button>
              <Button variant="ghost" onClick={() => setActiveTab("settings")} className="gap-2">
                <Settings className="w-4 h-4" /> Settings
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10" />
              <div>
                <h1 className="text-4xl md:text-5xl font-marcellus font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground text-lg">System-wide management and oversight</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" /> Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">1,245</p>
                  <p className="text-sm text-green-500 mt-2">↑ 8% this month</p>
                </CardContent>
              </Card>
              <Card className="hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Total Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">3,567</p>
                  <p className="text-sm text-green-500 mt-2">↑ 12% this month</p>
                </CardContent>
              </Card>
              <Card className="hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Officials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">45</p>
                  <p className="text-sm text-muted-foreground mt-2">Managing zones</p>
                </CardContent>
              </Card>
              <Card className="hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">82%</p>
                  <p className="text-sm text-green-500 mt-2">↑ 3% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-marcellus">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2"><span>API Response Time</span><span className="font-bold text-green-500">Excellent</span></div>
                    <div className="w-full bg-muted rounded-full h-3"><div className="bg-green-500 h-3 rounded-full" style={{ width: "95%" }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2"><span>Database Load</span><span className="font-bold text-blue-500">Normal</span></div>
                    <div className="w-full bg-muted rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full" style={{ width: "60%" }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2"><span>User Satisfaction</span><span className="font-bold text-green-500">High</span></div>
                    <div className="w-full bg-muted rounded-full h-3"><div className="bg-green-500 h-3 rounded-full" style={{ width: "88%" }}></div></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-marcellus">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Users className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-medium">New user registered</p>
                      <p className="text-sm text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-medium">Issue marked resolved</p>
                      <p className="text-sm text-muted-foreground">12 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Shield className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-medium">System backup completed</p>
                      <p className="text-sm text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-marcellus font-bold">User Management</h1>
              <Button className="gap-2 rounded-xl">
                <Users className="w-4 h-4" /> Add New User
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono">#{user.id}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge className="capitalize">{user.role}</Badge></TableCell>
                        <TableCell><Badge className="bg-green-500">{user.status}</Badge></TableCell>
                        <TableCell>
                          {user.role === "citizen" ? `${user.reports} reports` : `${user.resolved} resolved`}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-lg">Edit</Button>
                            <Button variant="outline" size="sm" className="rounded-lg text-red-500">Block</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "issues" && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl font-marcellus font-bold">All System Issues</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover-scale">
                <CardHeader>
                  <CardTitle>Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-yellow-500">45</p>
                </CardContent>
              </Card>
              <Card className="hover-scale">
                <CardHeader>
                  <CardTitle>In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-blue-500">156</p>
                </CardContent>
              </Card>
              <Card className="hover-scale">
                <CardHeader>
                  <CardTitle>Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-500">2,956</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl font-marcellus font-bold">Platform Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-muted-foreground">Chart visualization here</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Issue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-muted-foreground">Chart visualization here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-4xl font-marcellus font-bold">Admin Settings</h1>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl font-bold">
                    {user?.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user?.email}</h3>
                    <Badge className="mt-1 capitalize">{user?.role}</Badge>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-3">
                  <Button variant="outline" className="w-full justify-start rounded-xl">
                    <Settings className="w-4 h-4 mr-2" /> System Configuration
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-xl">
                    <Shield className="w-4 h-4 mr-2" /> Security Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-xl">
                    <Users className="w-4 h-4 mr-2" /> Role Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
