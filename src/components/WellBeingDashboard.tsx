import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import MetricCard from "./MetricCard";
import { 
  Brain, 
  Heart, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  MessageSquare,
  Lightbulb
} from "lucide-react";

const WellBeingDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Employee Engagement"
          value="74%"
          change={5.2}
          changeLabel="vs last month"
          trend="up"
          status="success"
          icon={<Heart className="h-4 w-4" />}
          subtitle="Above industry avg (68%)"
        />
        <MetricCard
          title="Burnout Risk"
          value="12%"
          change={-2.1}
          changeLabel="vs last month"
          trend="down"
          status="success"
          icon={<Brain className="h-4 w-4" />}
          subtitle="23 employees flagged"
        />
        <MetricCard
          title="Turnover Prediction"
          value="8.3%"
          change={1.2}
          changeLabel="next 6 months"
          trend="up"
          status="warning"
          icon={<Users className="h-4 w-4" />}
          subtitle="16 at-risk employees"
        />
        <MetricCard
          title="Psychological Safety"
          value="4.2/5"
          change={0.3}
          changeLabel="vs last quarter"
          trend="up"
          status="success"
          icon={<CheckCircle className="h-4 w-4" />}
          subtitle="Team average score"
        />
      </div>

      {/* AI Insights and Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  AI Insights
                </CardTitle>
                <CardDescription>
                  Proactive recommendations based on predictive analysis
                </CardDescription>
              </div>
              <Badge className="bg-gradient-secondary text-secondary-foreground">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
              <AlertTriangle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">High Burnout Risk Detected</p>
                <p className="text-xs text-muted-foreground">
                  Engineering team showing 67% increase in after-hours activity. 
                  Recommend immediate workload assessment.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Engagement Opportunity</p>
                <p className="text-xs text-muted-foreground">
                  Marketing team sentiment improved 23% after new recognition program launch.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-success/5 border border-success/20">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Positive Trend</p>
                <p className="text-xs text-muted-foreground">
                  Customer Success team psychological safety score increased to 4.6/5.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-secondary" />
              Action Items
            </CardTitle>
            <CardDescription>
              Prioritized recommendations for immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Schedule 1:1 with Sarah Chen</p>
                  <p className="text-xs text-muted-foreground">Sentiment analysis indicates stress</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-warning text-warning">High</Badge>
                  <Button size="sm" variant="outline">Schedule</Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Review workload distribution</p>
                  <p className="text-xs text-muted-foreground">Engineering team capacity at 112%</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-warning text-warning">High</Badge>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Celebrate team milestone</p>
                  <p className="text-xs text-muted-foreground">Design team completed major project</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-success text-success">Medium</Badge>
                  <Button size="sm" variant="outline">Plan</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Health Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Health Overview
          </CardTitle>
          <CardDescription>
            Real-time sentiment and engagement across teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engineering</span>
                <Badge variant="outline" className="border-warning text-warning">At Risk</Badge>
              </div>
              <Progress value={67} className="h-2" />
              <p className="text-xs text-muted-foreground">23 members • Workload concerns</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Marketing</span>
                <Badge variant="outline" className="border-success text-success">Healthy</Badge>
              </div>
              <Progress value={84} className="h-2" />
              <p className="text-xs text-muted-foreground">12 members • High engagement</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Customer Success</span>
                <Badge variant="outline" className="border-success text-success">Thriving</Badge>
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-muted-foreground">18 members • Excellent morale</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Design</span>
                <Badge variant="outline" className="border-primary text-primary">Good</Badge>
              </div>
              <Progress value={76} className="h-2" />
              <p className="text-xs text-muted-foreground">8 members • Stable performance</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sales</span>
                <Badge variant="outline" className="border-primary text-primary">Good</Badge>
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-xs text-muted-foreground">15 members • Meeting targets</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Operations</span>
                <Badge variant="outline" className="border-success text-success">Healthy</Badge>
              </div>
              <Progress value={81} className="h-2" />
              <p className="text-xs text-muted-foreground">11 members • Process improvements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellBeingDashboard;