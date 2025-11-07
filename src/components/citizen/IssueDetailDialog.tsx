import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, MessageSquare, CheckCircle2, AlertCircle, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface IssueDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: any;
}

export const IssueDetailDialog = ({ open, onOpenChange, issue }: IssueDetailDialogProps) => {
  const [comment, setComment] = useState("");

  const timeline = [
    { status: "Reported", date: "2025-11-01 10:30 AM", user: "You", type: "created" },
    { status: "Assigned", date: "2025-11-01 11:15 AM", user: "City Official", type: "assigned" },
    { status: "In Progress", date: "2025-11-02 09:00 AM", user: "Field Worker", type: "progress", comment: "Team dispatched to location" },
    { status: "Awaiting Verification", date: "2025-11-03 02:30 PM", user: "Field Worker", type: "pending", hasAfterPhoto: true },
  ];

  const handleVerify = () => {
    toast({
      title: "Resolution Verified",
      description: "Thank you for confirming the issue is resolved!",
    });
    onOpenChange(false);
  };

  const handleDispute = () => {
    toast({
      title: "Dispute Filed",
      description: "The issue has been reopened for review.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-marcellus text-2xl">{issue?.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Images - Before/After */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Before</p>
              <img src={issue?.image} alt="Before" className="w-full h-64 object-cover rounded-xl" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                After
                {timeline.some(t => t.hasAfterPhoto) && (
                  <Badge variant="secondary" className="text-xs">Awaiting Verification</Badge>
                )}
              </p>
              {timeline.some(t => t.hasAfterPhoto) ? (
                <img src={issue?.image} alt="After" className="w-full h-64 object-cover rounded-xl" />
              ) : (
                <div className="w-full h-64 bg-muted rounded-xl flex items-center justify-center">
                  <p className="text-muted-foreground">Not yet resolved</p>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>123 Main Street, Downtown</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Reported {issue?.date}</span>
            </div>
          </div>

          {/* Status Badge */}
          <Badge className="bg-blue-500">{issue?.status}</Badge>

          {/* Timeline */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timeline
            </h3>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.type === 'created' ? 'bg-blue-500' :
                      event.type === 'progress' ? 'bg-yellow-500' :
                      event.type === 'pending' ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      {event.type === 'pending' ? <AlertCircle className="w-4 h-4 text-white" /> : <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    {index < timeline.length - 1 && <div className="w-0.5 h-12 bg-border" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">{event.status}</p>
                    <p className="text-sm text-muted-foreground">{event.date} • {event.user}</p>
                    {event.comment && <p className="text-sm mt-1">{event.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Actions */}
          {timeline.some(t => t.hasAfterPhoto) && (
            <div className="flex gap-2 p-4 bg-muted rounded-xl">
              <div className="flex-1">
                <p className="font-medium mb-1">Verify Resolution</p>
                <p className="text-sm text-muted-foreground">Has this issue been properly resolved?</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDispute}>Dispute</Button>
                <Button onClick={handleVerify}>Verify</Button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-muted rounded-xl">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>FW</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Field Worker</p>
                  <p className="text-sm text-muted-foreground">Materials ordered, work scheduled for tomorrow morning.</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Textarea 
                placeholder="Add a comment..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="rounded-xl"
              />
              <Button>Send</Button>
            </div>
          </div>

          {/* Share */}
          <Button variant="outline" className="w-full gap-2">
            <Share2 className="w-4 h-4" />
            Share Issue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
