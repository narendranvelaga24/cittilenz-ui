import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, AlertTriangle, Clock, CheckCircle, TrendingUp, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockIssues = [
  { id: "1", title: "Large pothole on Main St", category: "Roads", citizen: "Rahul S.", zone: "Ward 9", date: "2 hours ago", status: "pending", severity: "high", slaRemaining: "4h 30m" },
  { id: "2", title: "Overflowing garbage bin", category: "Waste", citizen: "Priya K.", zone: "Ward 12", date: "5 hours ago", status: "in-progress", severity: "medium", slaRemaining: "18h 15m" },
  { id: "3", title: "Street light not working", category: "Lighting", citizen: "Amit P.", zone: "Ward 5", date: "1 day ago", status: "pending", severity: "low", slaRemaining: "22h 45m" },
  { id: "4", title: "Water leak on Park Road", category: "Water", citizen: "Neha M.", zone: "Ward 9", date: "3 hours ago", status: "urgent", severity: "critical", slaRemaining: "2h 10m" },
];

const DashboardHome = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 hover-lift cursor-pointer transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Issues</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">247</h3>
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +12% this week
              </p>
            </div>
            <ClipboardList className="h-12 w-12 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6 hover-lift cursor-pointer transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <h3 className="text-3xl font-bold text-warning mt-1">42</h3>
              <p className="text-xs text-muted-foreground mt-1">Needs assignment</p>
            </div>
            <Clock className="h-12 w-12 text-warning opacity-20" />
          </div>
        </Card>

        <Card className="p-6 hover-lift cursor-pointer transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <h3 className="text-3xl font-bold text-info mt-1">89</h3>
              <p className="text-xs text-muted-foreground mt-1">Being resolved</p>
            </div>
            <Users className="h-12 w-12 text-info opacity-20" />
          </div>
        </Card>

        <Card className="p-6 hover-lift cursor-pointer transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <h3 className="text-3xl font-bold text-success mt-1">116</h3>
              <p className="text-xs text-success mt-1">87% within SLA</p>
            </div>
            <CheckCircle className="h-12 w-12 text-success opacity-20" />
          </div>
        </Card>
      </div>

      {/* SLA Warnings & Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Warnings */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold">SLA Warnings</h2>
            </div>
            <Badge variant="destructive">4 Critical</Badge>
          </div>
          <div className="space-y-3">
            {mockIssues.filter(i => i.severity === "critical" || i.severity === "high").map(issue => (
              <div key={issue.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate(`/official-dashboard/issues/${issue.id}`)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{issue.title}</h3>
                    <Badge variant={issue.severity === "critical" ? "destructive" : "secondary"} className="text-xs">
                      {issue.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {issue.zone}
                    </span>
                    <span>{issue.citizen}</span>
                    <span>{issue.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${issue.severity === "critical" ? "text-destructive" : "text-warning"}`}>
                    {issue.slaRemaining}
                  </div>
                  <div className="text-xs text-muted-foreground">remaining</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/official-dashboard/issues")}>
              <ClipboardList className="h-4 w-4 mr-2" />
              View All Issues
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/official-dashboard/map")}>
              <MapPin className="h-4 w-4 mr-2" />
              Map Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/official-dashboard/performance")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance Reports
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium mb-3">Today's Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Reports</span>
                <span className="font-medium">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resolved Today</span>
                <span className="font-medium text-success">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Response Time</span>
                <span className="font-medium">2.4h</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Issues Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Issues</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/official-dashboard/issues")}>
            View All →
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Issue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Zone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reporter</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockIssues.map(issue => (
                <tr key={issue.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">{issue.title}</div>
                    <div className="text-xs text-muted-foreground">{issue.date}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-xs">{issue.category}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm">{issue.zone}</td>
                  <td className="py-3 px-4 text-sm">{issue.citizen}</td>
                  <td className="py-3 px-4">
                    <Badge variant={issue.status === "pending" ? "secondary" : issue.status === "urgent" ? "destructive" : "default"} className="text-xs">
                      {issue.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/official-dashboard/issues/${issue.id}`)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardHome;
