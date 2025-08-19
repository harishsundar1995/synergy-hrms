import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, AlertTriangle, CheckCircle } from "lucide-react";

export default function Analytics() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Deep insights into your organization's well-being metrics and trends.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Key Metrics */}
          <Card className="lg:col-span-2 shadow-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Engagement Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Weekly Engagement Score</p>
                    <p className="text-sm text-muted-foreground">Average across all teams</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">8.4</p>
                    <Badge className="bg-success text-success-foreground">+12% from last week</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Burnout Risk Reduction</p>
                    <p className="text-sm text-muted-foreground">Compared to baseline</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">23%</p>
                    <Badge className="bg-success text-success-foreground">Improved</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Psychological Safety Index</p>
                    <p className="text-sm text-muted-foreground">Team communication health</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">7.8</p>
                    <Badge className="bg-accent text-accent-foreground">Stable</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Engineering Team Alert</p>
                    <p className="text-xs text-muted-foreground">Elevated stress indicators detected</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Marketing Team</p>
                    <p className="text-xs text-muted-foreground">Strong collaboration patterns</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Hiring Recommendation</p>
                    <p className="text-xs text-muted-foreground">Consider team expansion for Sales</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}