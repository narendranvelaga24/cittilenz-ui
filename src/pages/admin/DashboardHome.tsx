import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Shield, TrendingUp } from "lucide-react";

const DashboardHome = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Shield className="w-10 h-10 text-primary" />
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
            <p className="text-sm text-success mt-2">↑ 8% this month</p>
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
            <p className="text-sm text-success mt-2">↑ 12% this month</p>
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
            <p className="text-sm text-success mt-2">↑ 3% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-marcellus">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>API Response Time</span>
                <span className="font-bold text-success">Excellent</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-success h-3 rounded-full" style={{ width: "95%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Database Load</span>
                <span className="font-bold text-info">Normal</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-info h-3 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>User Satisfaction</span>
                <span className="font-bold text-success">High</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-success h-3 rounded-full" style={{ width: "88%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-marcellus">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover-scale">
              <Users className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">New user registered</p>
                <p className="text-sm text-muted-foreground">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover-scale">
              <FileText className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Issue marked resolved</p>
                <p className="text-sm text-muted-foreground">12 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover-scale">
              <Shield className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">System backup completed</p>
                <p className="text-sm text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover-scale">
              <TrendingUp className="w-5 h-5 mt-0.5 text-success" />
              <div>
                <p className="font-medium">SLA compliance improved</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
