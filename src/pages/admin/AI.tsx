import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

const AI = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-marcellus font-bold">AI & Automation</h1>
            <p className="text-muted-foreground">Monitor and control intelligent features</p>
          </div>
        </div>
        <Button className="gap-2">
          <RefreshCw className="w-4 h-4" /> Retrain Model
        </Button>
      </div>

      {/* Model Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classification Accuracy</p>
                <p className="text-3xl font-bold">94.2%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Precision Score</p>
                <p className="text-3xl font-bold">92.8%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">F1 Score</p>
                <p className="text-3xl font-bold">93.5%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold">23</p>
              </div>
              <AlertCircle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Training Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-marcellus">Model Training Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Last Training Run</span>
              <span className="text-muted-foreground">2 days ago</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Training Data Size</span>
              <span className="font-medium">12,450 samples</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Model Version</span>
              <Badge>v3.2.1</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Training Progress</span>
              <span>Idle</span>
            </div>
            <Progress value={0} />
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-marcellus">Automation Rules</CardTitle>
            <Button variant="outline">Add Rule</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg hover-scale">
            <div>
              <p className="font-medium">Auto-assign by Zone</p>
              <p className="text-sm text-muted-foreground">Automatically assign issues to departments based on location</p>
            </div>
            <Badge className="bg-success">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg hover-scale">
            <div>
              <p className="font-medium">Duplicate Detection</p>
              <p className="text-sm text-muted-foreground">Flag similar issues within 50m radius</p>
            </div>
            <Badge className="bg-success">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg hover-scale">
            <div>
              <p className="font-medium">SLA Auto-escalation</p>
              <p className="text-sm text-muted-foreground">Escalate to supervisor when SLA is breached</p>
            </div>
            <Badge className="bg-success">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg hover-scale">
            <div>
              <p className="font-medium">Spam Filter</p>
              <p className="text-sm text-muted-foreground">Automatically flag low-quality submissions</p>
            </div>
            <Badge variant="secondary">Paused</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-marcellus">Recent AI Classifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-background rounded-lg"></div>
              <div>
                <p className="font-medium">Issue #1567</p>
                <p className="text-sm text-muted-foreground">Predicted: Pothole</p>
              </div>
            </div>
            <Badge className="bg-success">98% confidence</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-background rounded-lg"></div>
              <div>
                <p className="font-medium">Issue #1568</p>
                <p className="text-sm text-muted-foreground">Predicted: Waste</p>
              </div>
            </div>
            <Badge className="bg-warning">65% confidence</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-background rounded-lg"></div>
              <div>
                <p className="font-medium">Issue #1569</p>
                <p className="text-sm text-muted-foreground">Predicted: Streetlight</p>
              </div>
            </div>
            <Badge className="bg-success">94% confidence</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AI;
