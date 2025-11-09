import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Download, Eye } from "lucide-react";

const AuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const mockLogs = [
    { 
      id: 1, 
      timestamp: "2025-11-09 14:23:45", 
      user: "admin@gmail.com", 
      action: "Changed Status", 
      target: "Issue #1452", 
      details: "In Progress → Resolved",
      ip: "192.168.1.100"
    },
    { 
      id: 2, 
      timestamp: "2025-11-09 13:15:22", 
      user: "official@gmail.com", 
      action: "Assigned", 
      target: "Issue #1439", 
      details: "Assigned to Roads Dept",
      ip: "192.168.1.105"
    },
    { 
      id: 3, 
      timestamp: "2025-11-09 12:08:11", 
      user: "admin@gmail.com", 
      action: "Blocked User", 
      target: "User #345", 
      details: "Spam reports",
      ip: "192.168.1.100"
    },
    { 
      id: 4, 
      timestamp: "2025-11-09 11:45:33", 
      user: "admin@gmail.com", 
      action: "Updated Settings", 
      target: "SLA Config", 
      details: "Default time: 24h → 48h",
      ip: "192.168.1.100"
    },
    { 
      id: 5, 
      timestamp: "2025-11-09 10:22:19", 
      user: "supervisor@gmail.com", 
      action: "Created", 
      target: "Department", 
      details: "New dept: Public Safety",
      ip: "192.168.1.110"
    },
  ];

  const getActionColor = (action: string) => {
    if (action.includes("Blocked") || action.includes("Deleted")) return "bg-destructive";
    if (action.includes("Created") || action.includes("Assigned")) return "bg-success";
    if (action.includes("Updated") || action.includes("Changed")) return "bg-info";
    return "bg-muted";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-marcellus font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">Track all system activities and changes</p>
          </div>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" /> Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="all-users">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-users">All Users</SelectItem>
                <SelectItem value="admin">Admins Only</SelectItem>
                <SelectItem value="official">Officials Only</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-actions">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-actions">All Actions</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="today">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.target}</TableCell>
                  <TableCell className="text-muted-foreground">{log.details}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" title="View Full Details">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground text-center">
        Showing 5 of 1,234 log entries
      </div>
    </div>
  );
};

export default AuditLogs;
