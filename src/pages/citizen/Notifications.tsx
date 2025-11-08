import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Check, X, Mail, Smartphone, Settings as SettingsIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Notifications = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const notifications = [
    {
      id: 1,
      type: "success",
      icon: "✅",
      title: "Issue Resolved",
      message: "Your reported pothole on Main Street has been marked as resolved",
      time: "5 minutes ago",
      read: false,
      issueId: 1,
    },
    {
      id: 2,
      type: "info",
      icon: "🔧",
      title: "Issue Update",
      message: "Work has started on the broken streetlight you reported",
      time: "2 hours ago",
      read: false,
      issueId: 2,
    },
    {
      id: 3,
      type: "warning",
      icon: "⏰",
      title: "Reminder",
      message: "Please verify the resolution of issue #1256",
      time: "1 day ago",
      read: true,
      issueId: 3,
    },
    {
      id: 4,
      type: "info",
      icon: "👷",
      title: "Issue Assigned",
      message: "Your garbage collection issue has been assigned to the sanitation department",
      time: "2 days ago",
      read: true,
      issueId: 4,
    },
    {
      id: 5,
      type: "success",
      icon: "🏆",
      title: "Achievement Unlocked",
      message: "You've earned the 'Problem Solver' badge! Keep up the great work.",
      time: "3 days ago",
      read: true,
    },
    {
      id: 6,
      type: "info",
      icon: "📢",
      title: "Community Update",
      message: "5 new issues reported in your neighborhood this week",
      time: "1 week ago",
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationStyle = (type: string, read: boolean) => {
    const baseStyle = read ? "opacity-60" : "";
    const borderStyle = !read ? "border-l-4" : "";
    
    switch (type) {
      case "success":
        return `${baseStyle} ${borderStyle} border-success`;
      case "warning":
        return `${baseStyle} ${borderStyle} border-warning`;
      case "info":
        return `${baseStyle} ${borderStyle} border-info`;
      default:
        return baseStyle;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-marcellus font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your reported issues</p>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" className="gap-2">
            <Check className="w-4 h-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-info">{unreadCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Unread</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-success">12</div>
            <div className="text-sm text-muted-foreground mt-1">This Week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-muted-foreground">45</div>
            <div className="text-sm text-muted-foreground mt-1">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5" />
            <h3 className="font-semibold">Notification Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="email-alerts" className="cursor-pointer">Email Notifications</Label>
              </div>
              <Switch
                id="email-alerts"
                checked={emailAlerts}
                onCheckedChange={setEmailAlerts}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="push-alerts" className="cursor-pointer">Push Notifications</Label>
              </div>
              <Switch
                id="push-alerts"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="sms-alerts" className="cursor-pointer">SMS Alerts</Label>
              </div>
              <Switch
                id="sms-alerts"
                checked={smsAlerts}
                onCheckedChange={setSmsAlerts}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Recent Notifications</h3>
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            className={`hover-scale transition-all cursor-pointer ${getNotificationStyle(notif.type, notif.read)}`}
          >
            <CardContent className="pt-4">
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0">{notif.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold">{notif.title}</h4>
                    {!notif.read && (
                      <Badge variant="default" className="shrink-0 h-6">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                    {notif.issueId && (
                      <Button variant="ghost" size="sm" className="h-7">
                        View Issue
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="font-semibold text-lg mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">You'll see updates about your issues here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;
