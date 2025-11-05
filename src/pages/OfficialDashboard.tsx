import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, BarChart3, Map, LogOut, Home, FileText, User, Search, Filter } from "lucide-react";
import logo from "@/assets/cittilenz-logo.jpeg";
import potholeImg from "@/assets/pothole.jpg";
import streetlightImg from "@/assets/streetlight.jpg";
import garbageImg from "@/assets/garbage.jpg";
import waterleakImg from "@/assets/waterleak.jpg";

const OfficialDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const mockIssues = [
    { id: "ISS001", title: "Pothole on Main St", citizen: "john@email.com", date: "2025-11-01", status: "New", type: "Road", zone: "Zone A" },
    { id: "ISS002", title: "Streetlight broken", citizen: "mary@email.com", date: "2025-11-02", status: "In Progress", type: "Electricity", zone: "Zone B" },
    { id: "ISS003", title: "Garbage overflow", citizen: "bob@email.com", date: "2025-11-03", status: "New", type: "Sanitation", zone: "Zone A" },
    { id: "ISS004", title: "Water leak", citizen: "alice@email.com", date: "2025-11-04", status: "Resolved", type: "Water", zone: "Zone C" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-yellow-500";
      case "In Progress": return "bg-blue-500";
      case "Resolved": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Cittilenz" className="h-10 w-10 rounded-lg" />
              <span className="text-2xl font-marcellus font-bold">Cittilenz Official</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-2 transition-colors ${activeTab === "dashboard" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Home className="w-4 h-4" /> Dashboard
              </button>
              <button onClick={() => setActiveTab("issues")} className={`flex items-center gap-2 transition-colors ${activeTab === "issues" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <FileText className="w-4 h-4" /> Issues
              </button>
              <button onClick={() => setActiveTab("map")} className={`flex items-center gap-2 transition-colors ${activeTab === "map" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Map className="w-4 h-4" /> Map
              </button>
              <button onClick={() => setActiveTab("analytics")} className={`flex items-center gap-2 transition-colors ${activeTab === "analytics" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <BarChart3 className="w-4 h-4" /> Analytics
              </button>
              <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">5</span>
              </button>
              <Button variant="ghost" onClick={() => setActiveTab("profile")} className="gap-2">
                <User className="w-4 h-4" /> Profile
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-4xl md:text-5xl font-marcellus font-bold mb-2">Dashboard Overview</h1>
              <p className="text-muted-foreground text-lg">Manage and track civic issues</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">248</p>
                  <p className="text-sm text-green-500 mt-2">↑ 12% from last month</p>
                </CardContent>
              </Card>
              <Card className="hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">New Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-yellow-500">45</p>
                  <p className="text-sm text-muted-foreground mt-2">Pending review</p>
                </CardContent>
              </Card>
              <Card className="hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-blue-500">78</p>
                  <p className="text-sm text-muted-foreground mt-2">Being worked on</p>
                </CardContent>
              </Card>
              <Card className="hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-500">125</p>
                  <p className="text-sm text-muted-foreground mt-2">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-marcellus">Recent Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockIssues.slice(0, 5).map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-mono">{issue.id}</TableCell>
                        <TableCell>{issue.title}</TableCell>
                        <TableCell>{issue.type}</TableCell>
                        <TableCell><Badge className={getStatusColor(issue.status)}>{issue.status}</Badge></TableCell>
                        <TableCell>{issue.date}</TableCell>
                        <TableCell><Button variant="outline" size="sm" className="rounded-lg">View</Button></TableCell>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-4xl font-marcellus font-bold">Issue Management</h1>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search issues..." className="pl-10 h-11 rounded-xl md:w-64" />
                </div>
                <Select>
                  <SelectTrigger className="h-11 rounded-xl w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Citizen</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockIssues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-mono">{issue.id}</TableCell>
                        <TableCell className="font-medium">{issue.title}</TableCell>
                        <TableCell>{issue.citizen}</TableCell>
                        <TableCell>{issue.type}</TableCell>
                        <TableCell>{issue.zone}</TableCell>
                        <TableCell><Badge className={getStatusColor(issue.status)}>{issue.status}</Badge></TableCell>
                        <TableCell>{issue.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-lg">View</Button>
                            <Button size="sm" className="rounded-lg">Update</Button>
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

        {activeTab === "map" && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl font-marcellus font-bold">Issue Heatmap</h1>
            <Card>
              <CardContent className="p-0">
                <div className="w-full h-[600px] bg-muted flex items-center justify-center rounded-lg">
                  <div className="text-center space-y-2">
                    <Map className="w-16 h-16 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Interactive map will be displayed here</p>
                    <p className="text-sm text-muted-foreground">Showing issues by location with color-coded status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl font-marcellus font-bold">Analytics & Reports</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Issues by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2"><span>Roads</span><span className="font-bold">45%</span></div>
                      <div className="w-full bg-muted rounded-full h-3"><div className="bg-foreground h-3 rounded-full" style={{ width: "45%" }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2"><span>Electricity</span><span className="font-bold">25%</span></div>
                      <div className="w-full bg-muted rounded-full h-3"><div className="bg-foreground h-3 rounded-full" style={{ width: "25%" }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2"><span>Sanitation</span><span className="font-bold">20%</span></div>
                      <div className="w-full bg-muted rounded-full h-3"><div className="bg-foreground h-3 rounded-full" style={{ width: "20%" }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2"><span>Water</span><span className="font-bold">10%</span></div>
                      <div className="w-full bg-muted rounded-full h-3"><div className="bg-foreground h-3 rounded-full" style={{ width: "10%" }}></div></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Resolution Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-bold">78%</div>
                    <p className="text-muted-foreground">Average resolution rate this month</p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <p className="text-2xl font-bold">3.5</p>
                        <p className="text-sm text-muted-foreground">Avg. Days to Resolve</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">125</p>
                        <p className="text-sm text-muted-foreground">Issues Resolved</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-4xl font-marcellus font-bold">Official Profile</h1>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl font-bold">
                    {user?.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user?.email}</h3>
                    <p className="text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned</p>
                    <p className="text-2xl font-bold">78</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold">125</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Time</p>
                    <p className="text-2xl font-bold">3.5d</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficialDashboard;
