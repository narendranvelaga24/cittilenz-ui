import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, User, Calendar, Clock, CheckCircle, AlertTriangle, MessageSquare, Upload } from "lucide-react";
import { useState } from "react";

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("pending");

  // Mock data
  const issue = {
    id: id,
    title: "Large pothole on Main St",
    description: "There is a large pothole on Main Street near the intersection with Park Road. It's causing damage to vehicles and is a safety hazard.",
    category: "Roads",
    severity: "high",
    status: "pending",
    citizen: {
      name: "Rahul Sharma",
      email: "rahul.s@example.com",
      phone: "+91 98765 43210"
    },
    location: {
      address: "Main Street, Ward 9, Sector 12",
      coordinates: "28.6139, 77.2090"
    },
    reportedAt: "Nov 07, 2024 10:30 AM",
    slaDeadline: "Nov 08, 2024 10:30 AM",
    slaRemaining: "4h 30m",
    assignedTo: "Unassigned",
    updates: [
      { user: "System", action: "Issue reported", timestamp: "Nov 07, 2024 10:30 AM", type: "created" },
      { user: "Official", action: "Status changed to pending", timestamp: "Nov 07, 2024 10:31 AM", type: "status" },
    ]
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/official-dashboard/issues")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-marcellus font-bold">{issue.title}</h1>
            <Badge variant="secondary" className="font-mono">#{issue.id}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Reported on {issue.reportedAt}</p>
        </div>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Upload Resolution Photo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Issue Details</h2>
            <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
              <img src="/placeholder.svg" alt="Issue" className="w-full h-full object-cover rounded-lg" />
            </div>
            <p className="text-sm text-foreground leading-relaxed">{issue.description}</p>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
            <div className="space-y-4">
              {issue.updates.map((update, index) => (
                <div key={index} className="flex gap-3">
                  <div className="mt-1">
                    {update.type === "created" ? (
                      <AlertTriangle className="h-5 w-5 text-primary" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{update.user}</span>
                      <span className="text-xs text-muted-foreground">{update.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{update.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Add Comment */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Add Update</h2>
            <Textarea
              placeholder="Add a comment or update about this issue..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-3"
              rows={4}
            />
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Post Update
            </Button>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Change Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Update Status</Button>
              <Button className="w-full" variant="outline">Assign to Team</Button>
              <Button className="w-full" variant="outline">Escalate Issue</Button>
              <Button className="w-full" variant="destructive">Reject Issue</Button>
            </div>
          </Card>

          {/* Issue Metadata */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Category</span>
                </div>
                <Badge variant="outline">{issue.category}</Badge>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Severity</span>
                </div>
                <Badge variant="destructive">{issue.severity}</Badge>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span>SLA Deadline</span>
                </div>
                <p className="text-sm font-medium">{issue.slaDeadline}</p>
                <p className="text-xs text-warning">{issue.slaRemaining} remaining</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </div>
                <p className="text-sm">{issue.location.address}</p>
                <p className="text-xs text-muted-foreground">{issue.location.coordinates}</p>
              </div>
            </div>
          </Card>

          {/* Citizen Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Reporter</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{issue.citizen.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{issue.citizen.email}</p>
                <p>{issue.citizen.phone}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">Contact Citizen</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
