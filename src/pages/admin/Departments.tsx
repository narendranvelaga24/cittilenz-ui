import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Plus, Edit, Users, MapPin } from "lucide-react";

const Departments = () => {
  const mockDepartments = [
    { id: 1, name: "Waste Management", zone: "Zone A", officials: 6, openIssues: 48, slaPercent: 90, color: "bg-green-500" },
    { id: 2, name: "Roads & Infrastructure", zone: "Zone B", officials: 10, openIssues: 75, slaPercent: 85, color: "bg-blue-500" },
    { id: 3, name: "Water Department", zone: "Zone C", officials: 8, openIssues: 32, slaPercent: 92, color: "bg-cyan-500" },
    { id: 4, name: "Electricity & Lighting", zone: "Zone D", officials: 5, openIssues: 28, slaPercent: 88, color: "bg-yellow-500" },
    { id: 5, name: "Public Safety", zone: "Zone E", officials: 12, openIssues: 15, slaPercent: 95, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-marcellus font-bold">Departments & Zones</h1>
            <p className="text-muted-foreground">Manage organizational structure and territories</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Department
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Departments</p>
                <p className="text-3xl font-bold">5</p>
              </div>
              <Database className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Zones</p>
                <p className="text-3xl font-bold">5</p>
              </div>
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Officials</p>
                <p className="text-3xl font-bold">41</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg SLA</p>
                <p className="text-3xl font-bold text-success">90%</p>
              </div>
              <Database className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Officials</TableHead>
                <TableHead>Open Issues</TableHead>
                <TableHead>SLA Compliance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                      <span className="font-medium">{dept.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{dept.zone}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{dept.officials}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{dept.openIssues}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 w-24">
                        <div
                          className={`h-2 rounded-full ${dept.slaPercent >= 90 ? "bg-success" : dept.slaPercent >= 80 ? "bg-warning" : "bg-destructive"}`}
                          style={{ width: `${dept.slaPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{dept.slaPercent}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="View Officials">
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="View on Map">
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Zone Map Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-marcellus">Zone Map Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Interactive zone map will be displayed here</p>
              <p className="text-sm text-muted-foreground mt-2">Click zones to view details and metrics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Departments;
