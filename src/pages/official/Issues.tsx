import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Eye, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockIssues = [
  { id: "1", title: "Large pothole on Main St", category: "Roads", citizen: "Rahul S.", zone: "Ward 9", date: "07-Nov-2024", status: "pending", severity: "high", assignedTo: "Unassigned" },
  { id: "2", title: "Overflowing garbage bin", category: "Waste", citizen: "Priya K.", zone: "Ward 12", date: "07-Nov-2024", status: "in-progress", severity: "medium", assignedTo: "Team A" },
  { id: "3", title: "Street light not working", category: "Lighting", citizen: "Amit P.", zone: "Ward 5", date: "06-Nov-2024", status: "pending", severity: "low", assignedTo: "Unassigned" },
  { id: "4", title: "Water leak on Park Road", category: "Water", citizen: "Neha M.", zone: "Ward 9", date: "07-Nov-2024", status: "urgent", severity: "critical", assignedTo: "Team B" },
  { id: "5", title: "Broken sidewalk", category: "Roads", citizen: "Vikram T.", zone: "Ward 7", date: "06-Nov-2024", status: "resolved", severity: "medium", assignedTo: "Team C" },
  { id: "6", title: "Illegal dumping reported", category: "Waste", citizen: "Anjali R.", zone: "Ward 12", date: "05-Nov-2024", status: "in-progress", severity: "high", assignedTo: "Team A" },
];

const Issues = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredIssues = mockIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         issue.zone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusVariant = (status: string) => {
    switch(status) {
      case "pending": return "secondary";
      case "in-progress": return "default";
      case "resolved": return "outline";
      case "urgent": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-marcellus font-bold">Issues Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage all reported issues</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Roads">Roads</SelectItem>
              <SelectItem value="Waste">Waste</SelectItem>
              <SelectItem value="Water">Water</SelectItem>
              <SelectItem value="Lighting">Lighting</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{filteredIssues.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-warning">{filteredIssues.filter(i => i.status === "pending").length}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-info">{filteredIssues.filter(i => i.status === "in-progress").length}</div>
          <div className="text-xs text-muted-foreground">In Progress</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-destructive">{filteredIssues.filter(i => i.status === "urgent").length}</div>
          <div className="text-xs text-muted-foreground">Urgent</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-success">{filteredIssues.filter(i => i.status === "resolved").length}</div>
          <div className="text-xs text-muted-foreground">Resolved</div>
        </Card>
      </div>

      {/* Issues Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Issue</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Zone</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Reporter</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Assigned</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map(issue => (
                <tr key={issue.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-sm font-mono text-muted-foreground">#{issue.id}</td>
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
                    <Badge variant={getStatusVariant(issue.status)} className="text-xs">
                      {issue.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{issue.assignedTo}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/official-dashboard/issues/${issue.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {issue.assignedTo === "Unassigned" && (
                        <Button size="sm" variant="ghost">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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

export default Issues;
