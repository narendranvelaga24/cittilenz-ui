import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Zap, Mic } from "lucide-react";

interface QuickReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickReportDialog = ({ open, onOpenChange }: QuickReportDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const suggestedCategories = [
    { name: "Pothole", confidence: 95, icon: "🕳️" },
    { name: "Streetlight", confidence: 85, icon: "💡" },
    { name: "Garbage", confidence: 78, icon: "🗑️" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-marcellus text-2xl">
            <Zap className="w-6 h-6 text-yellow-500" />
            Quick Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Camera Capture */}
          <div className="relative aspect-video bg-muted rounded-xl flex items-center justify-center border-2 border-dashed">
            <div className="text-center space-y-2">
              <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Tap to capture photo</p>
            </div>
          </div>

          {/* Auto Location */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
            <MapPin className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Auto-detected location</p>
              <p className="text-xs text-muted-foreground">123 Main Street, Downtown</p>
            </div>
          </div>

          {/* AI Suggested Categories */}
          <div className="space-y-2">
            <p className="text-sm font-medium">AI Suggested Categories</p>
            <div className="flex flex-wrap gap-2">
              {suggestedCategories.map((cat) => (
                <Button
                  key={cat.name}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.name)}
                  className="gap-2"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <Badge variant="secondary" className="text-xs">{cat.confidence}%</Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Voice Note Option */}
          <Button variant="outline" className="w-full gap-2">
            <Mic className="w-4 h-4" />
            Add voice note (optional)
          </Button>

          {/* Submit */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1">Submit Report</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
