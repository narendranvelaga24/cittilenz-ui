import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Calendar } from "lucide-react";
import { IssueDetailDialog } from "@/components/citizen/IssueDetailDialog";
import potholeImg from "@/assets/pothole.jpg";
import streetlightImg from "@/assets/streetlight.jpg";
import garbageImg from "@/assets/garbage.jpg";
import waterleakImg from "@/assets/waterleak.jpg";

const MyIssues = () => {
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const mockIssues = [
    { id: 1, title: "Pothole on Main Street", status: "In Progress", date: "2025-11-01", category: "Road", image: potholeImg, priority: "high", location: "Main Street, Downtown" },
    { id: 2, title: "Broken Streetlight", status: "Pending", date: "2025-11-03", category: "Lighting", image: streetlightImg, priority: "medium", location: "Oak Avenue" },
    { id: 3, title: "Garbage Not Collected", status: "Resolved", date: "2025-10-28", category: "Waste", image: garbageImg, priority: "low", location: "Park Road" },
    { id: 4, title: "Water Leak in Pipeline", status: "Assigned", date: "2025-11-05", category: "Water", image: waterleakImg, priority: "high", location: "Elm Street" },
    { id: 5, title: "Damaged Road Sign", status: "Pending", date: "2025-11-02", category: "Road", image: potholeImg, priority: "medium", location: "Highway 101" },
    { id: 6, title: "Overflowing Drain", status: "In Progress", date: "2025-10-30", category: "Water", image: waterleakImg, priority: "high", location: "Market Street" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-warning text-warning-foreground";
      case "Assigned":
        return "bg-info text-info-foreground";
      case "In Progress":
        return "bg-info text-info-foreground";
      case "Resolved":
        return "bg-success text-success-foreground";
      case "Reopened":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-destructive";
      case "medium":
        return "border-l-4 border-warning";
      case "low":
        return "border-l-4 border-success";
      default:
        return "";
    }
  };

  const filteredIssues = mockIssues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-marcellus font-bold mb-2">My Issues</h1>
        <p className="text-muted-foreground">Track and manage all your reported issues</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Road">Road</SelectItem>
                <SelectItem value="Waste">Waste</SelectItem>
                <SelectItem value="Water">Water</SelectItem>
                <SelectItem value="Lighting">Lighting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredIssues.length} of {mockIssues.length} issues
        </p>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIssues.map((issue) => (
          <Card
            key={issue.id}
            className={`hover-lift cursor-pointer overflow-hidden ${getPriorityColor(issue.priority)}`}
            onClick={() => setSelectedIssue(issue)}
          >
            <div className="relative">
              <img src={issue.image} alt={issue.title} className="w-full h-48 object-cover" />
              <Badge className={`absolute top-3 right-3 ${getStatusColor(issue.status)}`}>
                {issue.status}
              </Badge>
            </div>
            <CardContent className="pt-4 space-y-2">
              <h3 className="font-semibold text-lg line-clamp-1">{issue.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">📍 {issue.location}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{issue.date}</span>
                </div>
                <Badge variant="outline" className="text-xs">{issue.category}</Badge>
              </div>
              <Button variant="outline" className="w-full mt-3">Track Issue</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-semibold text-lg mb-2">No issues found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </CardContent>
        </Card>
      )}

      <IssueDetailDialog
        open={!!selectedIssue}
        onOpenChange={(open) => !open && setSelectedIssue(null)}
        issue={selectedIssue}
      />
    </div>
  );
};

export default MyIssues;
