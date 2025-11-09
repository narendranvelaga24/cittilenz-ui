import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, AlertTriangle, Eye, Trash2, Flag } from "lucide-react";

const Issues = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const mockIssues = [
    { id: 1452, category: "Pothole", citizen: "Rahul S", zone: "Ward 9", status: "In Progress", department: "Roads", sla: "2h left", urgent: false },
    { id: 1323, category: "Waste", citizen: "Anjali P", zone: "Ward 4", status: "Resolved", department: "Waste Mgmt", sla: "Met", urgent: false },
    { id: 1501, category: "Streetlight", citizen: "John D", zone: "Ward 12", status: "Pending", department: "Electricity", sla: "30m left", urgent: true },
    { id: 1489, category: "Water Leak", citizen: "Mary S", zone: "Ward 7", status: "Pending", department: "Water Dept", sla: "Breached", urgent: true },
    { id: 1467, category: "Garbage", citizen: "Priya K", zone: "Ward 3", status: "In Progress", department: "Waste Mgmt", sla: "4h left", urgent: false },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-warning";
      case "In Progress": return "bg-info";
      case "Resolved": return "bg-success";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-marcellus font-bold">Issue Oversight</h1>
            <p className="text-muted-foreground">Monitor all issues across departments</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Issues</p>
                <p className="text-3xl font-bold">3,567</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-warning">45</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-info">156</p>
              </div>
              <FileText className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SLA Breached</p>
                <p className="text-3xl font-bold text-destructive">12</p>
              </div>
              <Flag className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="all-status">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-category">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-category">All Categories</SelectItem>
                <SelectItem value="pothole">Pothole</SelectItem>
                <SelectItem value="waste">Waste</SelectItem>
                <SelectItem value="streetlight">Streetlight</SelectItem>
                <SelectItem value="water">Water Leak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Citizen</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockIssues.map((issue) => (
                <TableRow key={issue.id} className={issue.urgent ? "bg-destructive/5" : ""}>
                  <TableCell className="font-mono">#{issue.id}</TableCell>
                  <TableCell className="font-medium">{issue.category}</TableCell>
                  <TableCell>{issue.citizen}</TableCell>
                  <TableCell>{issue.zone}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                  </TableCell>
                  <TableCell>{issue.department}</TableCell>
                  <TableCell>
                    <span className={issue.sla === "Breached" ? "text-destructive font-semibold" : issue.sla.includes("left") ? "text-warning" : "text-success"}>
                      {issue.sla}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" title="View Details">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Flag Issue">
                        <Flag className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Issues;
