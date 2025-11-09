import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Download, Award, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";

const Performance = () => {
  const [timeRange, setTimeRange] = useState("month");

  const kpis = [
    { label: "Avg Resolution Time", value: "2.4h", change: -12, trend: "down", good: true },
    { label: "SLA Compliance", value: "87%", change: 5, trend: "up", good: true },
    { label: "Reopen Rate", value: "8%", change: -3, trend: "down", good: true },
    { label: "Citizen Satisfaction", value: "4.2/5", change: 0.3, trend: "up", good: true },
  ];

  const teamLeaderboard = [
    { rank: 1, team: "Team A", resolved: 125, avgTime: "2.1h", rating: 4.5 },
    { rank: 2, team: "Team B", resolved: 118, avgTime: "2.3h", rating: 4.4 },
    { rank: 3, team: "Team C", resolved: 98, avgTime: "2.8h", rating: 4.1 },
    { rank: 4, team: "Team D", resolved: 89, avgTime: "3.2h", rating: 3.9 },
  ];

  const weeklyTrend = [
    { week: "Week 1", new: 45, resolved: 38 },
    { week: "Week 2", new: 52, resolved: 48 },
    { week: "Week 3", new: 48, resolved: 51 },
    { week: "Week 4", new: 51, resolved: 49 },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-marcellus font-bold">Performance Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Track KPIs and team performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="p-6 hover-lift">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              {kpi.trend === "up" ? (
                <TrendingUp className={`h-4 w-4 ${kpi.good ? "text-success" : "text-destructive"}`} />
              ) : (
                <TrendingDown className={`h-4 w-4 ${kpi.good ? "text-success" : "text-destructive"}`} />
              )}
            </div>
            <h3 className="text-2xl font-bold mb-1">{kpi.value}</h3>
            <p className={`text-xs flex items-center gap-1 ${kpi.good ? "text-success" : "text-destructive"}`}>
              {kpi.change > 0 ? "+" : ""}{kpi.change}% vs last period
            </p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Weekly Trend</h2>
          <div className="space-y-4">
            {weeklyTrend.map(data => (
              <div key={data.week}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-medium">{data.week}</span>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>New: {data.new}</span>
                    <span>Resolved: {data.resolved}</span>
                  </div>
                </div>
                <div className="flex gap-1 h-8">
                  <div
                    className="bg-primary/30 rounded flex items-center justify-center text-xs font-medium"
                    style={{ width: `${(data.new / 60) * 100}%` }}
                  >
                    {data.new}
                  </div>
                  <div
                    className="bg-success/30 rounded flex items-center justify-center text-xs font-medium"
                    style={{ width: `${(data.resolved / 60) * 100}%` }}
                  >
                    {data.resolved}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/30 rounded" />
              <span>New Issues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success/30 rounded" />
              <span>Resolved</span>
            </div>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Issues by Category</h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span>Roads</span>
                <span className="font-medium">45 (34%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "34%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span>Waste</span>
                <span className="font-medium">38 (29%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "29%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span>Water</span>
                <span className="font-medium">25 (19%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "19%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span>Lighting</span>
                <span className="font-medium">24 (18%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "18%" }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Leaderboard */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-warning" />
          <h2 className="text-lg font-semibold">Team Leaderboard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Team</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Issues Resolved</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Avg Resolution Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Citizen Rating</th>
              </tr>
            </thead>
            <tbody>
              {teamLeaderboard.map(team => (
                <tr key={team.rank} className="border-b hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <Badge variant={team.rank === 1 ? "default" : "outline"}>#{team.rank}</Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">{team.team}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>{team.resolved}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{team.avgTime}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{team.rating}</span>
                      <span className="text-warning">★</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Goal Tracker */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Performance Goals</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">SLA Compliance Target: 95%</span>
              <span className="text-sm font-bold">Current: 87%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-primary h-3 rounded-full" style={{ width: "87%" }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Monthly Resolution Target: 500</span>
              <span className="text-sm font-bold">Current: 380</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-success h-3 rounded-full" style={{ width: "76%" }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Performance;
