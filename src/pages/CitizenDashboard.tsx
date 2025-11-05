import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, MapPin, Upload, Award, LogOut, Home, FileText, User } from "lucide-react";
import logo from "@/assets/cittilenz-logo.jpeg";

const CitizenDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const mockIssues = [
    { id: 1, title: "Pothole on Main Street", status: "In Progress", date: "2025-11-01", image: "/placeholder.svg" },
    { id: 2, title: "Broken Streetlight", status: "Pending", date: "2025-11-03", image: "/placeholder.svg" },
    { id: 3, title: "Garbage Not Collected", status: "Resolved", date: "2025-10-28", image: "/placeholder.svg" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-500";
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
              <span className="text-2xl font-marcellus font-bold">Cittilenz</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => setActiveTab("home")} className={`flex items-center gap-2 transition-colors ${activeTab === "home" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Home className="w-4 h-4" /> Home
              </button>
              <button onClick={() => setActiveTab("issues")} className={`flex items-center gap-2 transition-colors ${activeTab === "issues" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <FileText className="w-4 h-4" /> My Issues
              </button>
              <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
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
        {activeTab === "home" && (
          <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-marcellus font-bold">Welcome, Citizen</h1>
              <p className="text-muted-foreground text-lg">Report issues and make your city better</p>
            </div>

            {/* Report Issue Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full md:w-auto mx-auto flex items-center gap-3 h-16 text-lg px-12 bg-gradient-to-r from-foreground to-foreground/80 hover:opacity-90 rounded-xl">
                  <Upload className="w-6 h-6" />
                  Report New Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-marcellus">Report an Issue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Upload Image</Label>
                    <Input type="file" accept="image/*" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pothole">Pothole</SelectItem>
                        <SelectItem value="garbage">Garbage</SelectItem>
                        <SelectItem value="streetlight">Streetlight</SelectItem>
                        <SelectItem value="water">Water Supply</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Auto-detected location" className="h-12 rounded-xl" />
                      <Button variant="outline" className="h-12 rounded-xl">
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Describe the issue..." className="min-h-24 rounded-xl" />
                  </div>
                  <Button className="w-full h-12 rounded-xl">Submit Report</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover-scale">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    My Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">12</p>
                </CardContent>
              </Card>
              <Card className="hover-scale">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Points Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">340</p>
                </CardContent>
              </Card>
              <Card className="hover-scale">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Resolved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">8</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Issues */}
            <div className="space-y-4">
              <h2 className="text-2xl font-marcellus font-bold">Recent Issues</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockIssues.map((issue) => (
                  <Card key={issue.id} className="hover-scale overflow-hidden">
                    <img src={issue.image} alt={issue.title} className="w-full h-48 object-cover" />
                    <CardContent className="pt-4">
                      <h3 className="font-semibold mb-2">{issue.title}</h3>
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                        <span className="text-sm text-muted-foreground">{issue.date}</span>
                      </div>
                      <Button variant="outline" className="w-full mt-4 rounded-xl">Track Issue</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "issues" && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl font-marcellus font-bold">My Issues</h1>
            <div className="grid grid-cols-1 gap-6">
              {mockIssues.map((issue) => (
                <Card key={issue.id} className="hover-scale">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img src={issue.image} alt={issue.title} className="w-full md:w-48 h-48 object-cover rounded-lg" />
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{issue.title}</h3>
                          <p className="text-muted-foreground">Reported on {issue.date}</p>
                        </div>
                        <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                        <Button className="rounded-xl">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-4xl font-marcellus font-bold">Profile</h1>
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
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reports</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Points</p>
                    <p className="text-2xl font-bold">340</p>
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

export default CitizenDashboard;
