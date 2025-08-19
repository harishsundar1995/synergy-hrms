import Header from "@/components/Header";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, AlertTriangle } from "lucide-react";

export default function Teams() {
  const teams = [
    {
      id: 1,
      name: "Engineering",
      manager: "Sarah Chen",
      memberCount: 12,
      engagement: 78,
      burnoutRisk: "Medium",
      recentTrend: "improving"
    },
    {
      id: 2,
      name: "Marketing",
      manager: "Mike Johnson",
      memberCount: 8,
      engagement: 92,
      burnoutRisk: "Low",
      recentTrend: "stable"
    },
    {
      id: 3,
      name: "Sales",
      manager: "Lisa Wang",
      memberCount: 15,
      engagement: 65,
      burnoutRisk: "High",
      recentTrend: "declining"
    },
    {
      id: 4,
      name: "Product",
      manager: "Alex Rivera",
      memberCount: 6,
      engagement: 88,
      burnoutRisk: "Low",
      recentTrend: "improving"
    }
  ];

  const getBurnoutColor = (risk: string) => {
    switch (risk) {
      case "High": return "destructive";
      case "Medium": return "warning";
      case "Low": return "success";
      default: return "secondary";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="h-4 w-4 text-success" />;
      case "declining": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground">
            Monitor team health, engagement levels, and well-being metrics across your organization.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="shadow-card border-border hover:shadow-elegant transition-smooth">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {team.name}
                  </CardTitle>
                  {getTrendIcon(team.recentTrend)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={team.manager} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {team.manager.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{team.manager}</p>
                    <p className="text-xs text-muted-foreground">Team Manager</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team Size</span>
                    <span className="font-medium">{team.memberCount} members</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="font-medium">{team.engagement}%</span>
                    </div>
                    <Progress value={team.engagement} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">Burnout Risk</span>
                  <Badge variant={getBurnoutColor(team.burnoutRisk) as any}>
                    {team.burnoutRisk}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 shadow-card border-border">
          <CardHeader>
            <CardTitle>Team Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">85%</p>
                <p className="text-sm text-muted-foreground">Average Engagement</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-success">23%</p>
                <p className="text-sm text-muted-foreground">Improvement This Quarter</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-warning">2</p>
                <p className="text-sm text-muted-foreground">Teams Needing Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}