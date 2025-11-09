import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, AlertTriangle, Clock, UserPlus, MessageSquare } from "lucide-react";

const mockNotifications = [
  { id: "1", type: "new-issue", title: "New issue assigned to your team", description: "Issue #247 - Pothole on Main Street", time: "5 minutes ago", read: false },
  { id: "2", type: "sla-warning", title: "SLA breach warning", description: "Issue #234 will breach SLA in 2 hours", time: "30 minutes ago", read: false },
  { id: "3", type: "feedback", title: "Citizen feedback received", description: "Issue #189 received 4-star rating", time: "2 hours ago", read: true },
  { id: "4", type: "assignment", title: "Issue reassigned", description: "Issue #215 reassigned from Team A to Team B", time: "3 hours ago", read: true },
  { id: "5", type: "comment", title: "New comment on issue", description: "Supervisor added comment on Issue #198", time: "5 hours ago", read: true },
  { id: "6", type: "resolved", title: "Issue marked resolved", description: "Issue #156 successfully resolved by Team C", time: "1 day ago", read: true },
];

const Notifications = () => {
  const getIcon = (type: string) => {
    switch(type) {
      case "new-issue": return <Bell className="h-5 w-5 text-primary" />;
      case "sla-warning": return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "feedback": return <MessageSquare className="h-5 w-5 text-info" />;
      case "assignment": return <UserPlus className="h-5 w-5 text-warning" />;
      case "comment": return <MessageSquare className="h-5 w-5 text-muted-foreground" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-marcellus font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Stay updated with all issue activities</p>
        </div>
        <Button variant="outline">
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark All as Read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {mockNotifications.map(notification => (
          <Card key={notification.id} className={`p-4 transition-all cursor-pointer hover:shadow-md ${!notification.read ? "bg-primary/5 border-primary/20" : ""}`}>
            <div className="flex gap-4">
              <div className="mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium mb-1 ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State (when all read) */}
      {mockNotifications.every(n => n.read) && (
        <Card className="p-12 text-center">
          <CheckCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">All caught up! No unread notifications.</p>
        </Card>
      )}
    </div>
  );
};

export default Notifications;
