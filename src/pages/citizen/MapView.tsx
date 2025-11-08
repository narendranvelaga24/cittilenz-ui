import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MapPin, Filter, Layers } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const MapView = () => {
  const [showMyIssues, setShowMyIssues] = useState(true);
  const [showAllIssues, setShowAllIssues] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["all"]);
  const [viewMode, setViewMode] = useState<"pins" | "heatmap">("pins");

  const mockPins = [
    { id: 1, lat: 28.7041, lng: 77.1025, title: "Pothole on Main Street", status: "In Progress", category: "Road" },
    { id: 2, lat: 28.7051, lng: 77.1035, title: "Broken Streetlight", status: "Pending", category: "Lighting" },
    { id: 3, lat: 28.7061, lng: 77.1015, title: "Garbage Not Collected", status: "Resolved", category: "Waste" },
  ];

  const categories = [
    { id: "road", label: "Road", color: "bg-destructive" },
    { id: "waste", label: "Waste", color: "bg-warning" },
    { id: "water", label: "Water", color: "bg-info" },
    { id: "lighting", label: "Lighting", color: "bg-success" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "🟡";
      case "In Progress": return "🔵";
      case "Resolved": return "🟢";
      default: return "⚪";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-marcellus font-bold mb-2">Map View</h1>
          <p className="text-muted-foreground">Visualize issues in your neighborhood</p>
        </div>
        
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Map Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-3">
                  <Label className="font-semibold">View Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="my-issues" 
                        checked={showMyIssues}
                        onCheckedChange={(checked) => setShowMyIssues(!!checked)}
                      />
                      <label htmlFor="my-issues" className="text-sm cursor-pointer">
                        Show My Issues
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="all-issues" 
                        checked={showAllIssues}
                        onCheckedChange={(checked) => setShowAllIssues(!!checked)}
                      />
                      <label htmlFor="all-issues" className="text-sm cursor-pointer">
                        Show All Nearby Issues
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold">Categories</Label>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center space-x-2">
                        <Checkbox id={cat.id} defaultChecked />
                        <label htmlFor={cat.id} className="text-sm cursor-pointer flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${cat.color}`}></span>
                          {cat.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold">View Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={viewMode === "pins" ? "default" : "outline"}
                      onClick={() => setViewMode("pins")}
                      className="gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Pins
                    </Button>
                    <Button
                      variant={viewMode === "heatmap" ? "default" : "outline"}
                      onClick={() => setViewMode("heatmap")}
                      className="gap-2"
                    >
                      <Layers className="w-4 h-4" />
                      Heatmap
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Map Container */}
      <Card className="overflow-hidden">
        <div className="h-[calc(100vh-16rem)] bg-muted relative rounded-lg">
          {/* Placeholder Map - Replace with actual Leaflet/Mapbox implementation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold">Interactive Map</h3>
              <p className="text-muted-foreground max-w-md">
                Map integration with Leaflet/Mapbox will show all issues with colored pins based on status.
                Click any pin to view issue details.
              </p>
            </div>
          </div>

          {/* Mock Pins Overlay */}
          <div className="absolute top-4 left-4 space-y-2">
            {mockPins.slice(0, 3).map((pin) => (
              <Card key={pin.id} className="p-3 max-w-xs hover-lift cursor-pointer">
                <div className="flex gap-2">
                  <div className="text-xl">{getStatusColor(pin.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{pin.title}</p>
                    <p className="text-xs text-muted-foreground">{pin.category}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Legend */}
          <Card className="absolute bottom-4 right-4 p-4">
            <h4 className="font-semibold text-sm mb-3">Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>🟡</span>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔵</span>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🟢</span>
                <span>Resolved</span>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Nearby Issues Summary */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Issues Near You</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <div className="text-3xl font-bold text-warning">5</div>
              <div className="text-sm text-muted-foreground mt-1">Pending</div>
            </div>
            <div className="text-center p-4 bg-info/10 rounded-lg">
              <div className="text-3xl font-bold text-info">8</div>
              <div className="text-sm text-muted-foreground mt-1">In Progress</div>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-3xl font-bold text-success">12</div>
              <div className="text-sm text-muted-foreground mt-1">Resolved</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapView;
