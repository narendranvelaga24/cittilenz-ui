import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Edit, Shield, Star, Award, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Rahul Kumar",
    email: user?.email || "citizen@gmail.com",
    phone: "+91 98765 43210",
    location: "New Delhi, India",
  });

  const stats = [
    { label: "Total Reports", value: "12", icon: "📋" },
    { label: "Resolved", value: "8", icon: "✅" },
    { label: "Civic Points", value: "340", icon: "⭐" },
    { label: "Level", value: "3", icon: "🏆" },
  ];

  const badges = [
    { name: "First Reporter", icon: "🏆", unlocked: true, date: "Nov 2025" },
    { name: "Problem Solver", icon: "⭐", unlocked: true, date: "Nov 2025" },
    { name: "Civic Hero", icon: "🦸", unlocked: false, date: "Locked" },
    { name: "Community Guardian", icon: "🛡️", unlocked: false, date: "Locked" },
    { name: "Serial Reporter", icon: "📱", unlocked: false, date: "Locked" },
    { name: "Verified Citizen", icon: "✓", unlocked: true, date: "Oct 2025" },
  ];

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-marcellus font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account and track your civic contributions</p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-32 h-32">
                <AvatarImage src="" />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {profileData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="gap-2">
                <Camera className="w-4 h-4" />
                Change Photo
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-marcellus">{profileData.name}</h2>
                  <p className="text-muted-foreground">Citizen Member</p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Shield className="w-3 h-3" />
                  Verified
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                disabled={!isEditing}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements & Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements & Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  badge.unlocked
                    ? "border-primary bg-primary/5 hover-scale"
                    : "border-muted bg-muted/20 opacity-50"
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                <p className="text-xs text-muted-foreground">{badge.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Privacy Settings
          </Button>
          <Separator />
          <Button variant="destructive" className="w-full">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
