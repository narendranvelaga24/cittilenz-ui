import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, TrendingUp, AlertCircle, Filter } from "lucide-react";
import { useState } from "react";

const MapAnalytics = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const zoneStats = [
    { zone: "Ward 9", total: 45, pending: 12, resolved: 33, trend: "up" },
    { zone: "Ward 12", total: 38, pending: 8, resolved: 30, trend: "down" },
    { zone: "Ward 5", total: 29, pending: 15, resolved: 14, trend: "up" },
    { zone: "Ward 7", total: 22, pending: 5, resolved: 17, trend: "stable" },
  ];

  const topIssues = [
    { category: "Roads", count: 45, percent: 34 },
    { category: "Waste", count: 38, percent: 29 },
    { category: "Lighting", count: 24, percent: 18 },
    { category: "Water", count: 25, percent: 19 },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-marcellus font-bold">Map Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Geospatial overview of issues across the city</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="lg:col-span-2 p-6">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Placeholder for actual map */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
            <div className="relative z-10 text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Interactive Map View</p>
              <p className="text-xs text-muted-foreground mt-1">Integrate Leaflet/Mapbox for live pins and heatmap</p>
            </div>
            
            {/* Mock pins */}
            <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-destructive rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-warning rounded-full animate-pulse" />
            <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-success rounded-full animate-pulse" />
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded-full" />
                <span className="text-xs">Urgent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded-full" />
                <span className="text-xs">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-info rounded-full" />
                <span className="text-xs">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full" />
                <span className="text-xs">Resolved</span>
              </div>
            </div>
            <Button variant="outline" size="sm">Toggle Heatmap</Button>
          </div>
        </Card>

        {/* Insights */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Zone Insights</h2>
          <div className="space-y-4">
            {zoneStats.map(stat => (
              <div key={stat.zone} className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{stat.zone}</span>
                  <Badge variant="outline" className="text-xs">{stat.total} issues</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Pending: {stat.pending}</span>
                  <span>Resolved: {stat.resolved}</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-destructive" />}
                  {stat.trend === "down" && <TrendingUp className="h-3 w-3 text-success rotate-180" />}
                  <span className={stat.trend === "up" ? "text-destructive" : "text-success"}>
                    {stat.trend === "up" ? "Increasing" : stat.trend === "down" ? "Decreasing" : "Stable"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Issue Categories Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topIssues.map(issue => (
            <div key={issue.category} className="p-4 rounded-lg bg-muted/50 hover-lift cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{issue.category}</span>
                <Badge variant="outline">{issue.count}</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${issue.percent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{issue.percent}% of total issues</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Alerts */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-warning" />
          <h2 className="text-lg font-semibold">Hotspot Alerts</h2>
        </div>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm font-medium">Ward 5 - High concentration of road issues</p>
            <p className="text-xs text-muted-foreground mt-1">15 unresolved issues reported in the last 7 days</p>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-medium">Ward 9 - SLA breach risk</p>
            <p className="text-xs text-muted-foreground mt-1">8 issues approaching deadline in next 4 hours</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MapAnalytics;
