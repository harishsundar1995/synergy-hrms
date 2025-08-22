import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Heart,
  Brain,
  Clock,
  Target,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalEmployees: number;
    activeEmployees: number;
    engagementScore: number;
    engagementTrend: number;
    burnoutRisk: {
      low: number;
      medium: number;
      high: number;
    };
    satisfactionScore: number;
    satisfactionTrend: number;
  };
  trends: {
    engagement: Array<{ month: string; score: number; }>;
    burnout: Array<{ month: string; low: number; medium: number; high: number; }>;
    productivity: Array<{ month: string; score: number; }>;
  };
  departments: Array<{
    name: string;
    employeeCount: number;
    engagementScore: number;
    burnoutRisk: string;
    satisfactionScore: number;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    type: 'engagement' | 'burnout' | 'productivity' | 'wellness';
  }>;
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('3months');
  const { toast } = useToast();

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for demo
      const mockData: AnalyticsData = {
        overview: {
          totalEmployees: 124,
          activeEmployees: 118,
          engagementScore: 8.4,
          engagementTrend: 12,
          burnoutRisk: { low: 78, medium: 32, high: 14 },
          satisfactionScore: 7.8,
          satisfactionTrend: 8
        },
        trends: {
          engagement: [
            { month: 'Jan', score: 7.2 }, { month: 'Feb', score: 7.8 },
            { month: 'Mar', score: 8.1 }, { month: 'Apr', score: 8.4 },
            { month: 'May', score: 8.6 }, { month: 'Jun', score: 8.4 }
          ],
          burnout: [
            { month: 'Jan', low: 65, medium: 42, high: 17 },
            { month: 'Feb', low: 70, medium: 38, high: 16 },
            { month: 'Mar', low: 75, medium: 35, high: 14 },
            { month: 'Apr', low: 78, medium: 32, high: 14 },
            { month: 'May', low: 80, medium: 30, high: 14 },
            { month: 'Jun', low: 78, medium: 32, high: 14 }
          ],
          productivity: [
            { month: 'Jan', score: 7.5 }, { month: 'Feb', score: 7.8 },
            { month: 'Mar', score: 8.2 }, { month: 'Apr', score: 8.5 },
            { month: 'May', score: 8.7 }, { month: 'Jun', score: 8.6 }
          ]
        },
        departments: [
          { name: 'Engineering', employeeCount: 45, engagementScore: 8.6, burnoutRisk: 'low', satisfactionScore: 8.1 },
          { name: 'Marketing', employeeCount: 28, engagementScore: 8.2, burnoutRisk: 'medium', satisfactionScore: 7.9 },
          { name: 'Sales', employeeCount: 32, engagementScore: 7.8, burnoutRisk: 'medium', satisfactionScore: 7.5 },
          { name: 'HR', employeeCount: 12, engagementScore: 8.9, burnoutRisk: 'low', satisfactionScore: 8.8 },
          { name: 'Finance', employeeCount: 7, engagementScore: 7.4, burnoutRisk: 'high', satisfactionScore: 7.2 }
        ],
        recommendations: [
          {
            id: '1', title: 'Implement Flexible Work Hours',
            description: 'Engineering team shows high engagement but reports work-life balance concerns',
            priority: 'medium', type: 'wellness'
          },
          {
            id: '2', title: 'Finance Team Wellness Check',
            description: 'Finance department showing signs of burnout - consider workload redistribution',
            priority: 'high', type: 'burnout'
          },
          {
            id: '3', title: 'Recognition Program Expansion',
            description: 'Overall satisfaction could benefit from enhanced recognition initiatives',
            priority: 'low', type: 'engagement'
          }
        ]
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics data';
      console.error('Failed to fetch analytics:', error);
      setError(errorMessage);
      toast({
        title: "Error loading analytics",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange, toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getBurnoutRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-gray-600">Deep insights into your organization's well-being metrics</p>
            </div>
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600">Deep insights into your organization's well-being metrics</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" className="ml-2" onClick={fetchAnalytics}>
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {analyticsData && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.overview.totalEmployees}</div>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.overview.activeEmployees} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">{analyticsData.overview.engagementScore}</div>
                    {getTrendIcon(analyticsData.overview.engagementTrend)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.overview.engagementTrend > 0 ? '+' : ''}{analyticsData.overview.engagementTrend}% from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Burnout Risk</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{analyticsData.overview.burnoutRisk.high}</div>
                  <p className="text-xs text-muted-foreground">High risk employees</p>
                  <div className="flex space-x-1 mt-2">
                    <div className="flex-1 bg-green-200 h-2 rounded">
                      <div 
                        className="bg-green-500 h-2 rounded" 
                        style={{ width: `${(analyticsData.overview.burnoutRisk.low / analyticsData.overview.totalEmployees) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-yellow-200 h-2 rounded">
                      <div 
                        className="bg-yellow-500 h-2 rounded" 
                        style={{ width: `${(analyticsData.overview.burnoutRisk.medium / analyticsData.overview.totalEmployees) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-red-200 h-2 rounded">
                      <div 
                        className="bg-red-500 h-2 rounded" 
                        style={{ width: `${(analyticsData.overview.burnoutRisk.high / analyticsData.overview.totalEmployees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">{analyticsData.overview.satisfactionScore}</div>
                    {getTrendIcon(analyticsData.overview.satisfactionTrend)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.overview.satisfactionTrend > 0 ? '+' : ''}{analyticsData.overview.satisfactionTrend}% from last period
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Engagement Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.trends.engagement.slice(-3).map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.month}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={item.score * 10} className="w-20" />
                              <span className="text-sm text-muted-foreground">{item.score}/10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Wellness Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium text-green-800">Low Burnout Risk</p>
                            <p className="text-sm text-green-600">Healthy work-life balance</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {analyticsData.overview.burnoutRisk.low}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <p className="font-medium text-yellow-800">Medium Risk</p>
                            <p className="text-sm text-yellow-600">Monitor closely</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {analyticsData.overview.burnoutRisk.medium}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium text-red-800">High Risk</p>
                            <p className="text-sm text-red-600">Immediate attention needed</p>
                          </div>
                          <Badge className="bg-red-100 text-red-800">
                            {analyticsData.overview.burnoutRisk.high}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      6-Month Trend Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-medium">Engagement Scores</h4>
                        {analyticsData.trends.engagement.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{item.month}</span>
                            <span className="font-medium">{item.score}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Productivity Scores</h4>
                        {analyticsData.trends.productivity.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{item.month}</span>
                            <span className="font-medium">{item.score}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Burnout Trends</h4>
                        {analyticsData.trends.burnout.map((item, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{item.month}</span>
                              <span className="text-xs text-red-600">High: {item.high}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="departments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Department Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.departments.map((dept, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{dept.name}</h3>
                            <p className="text-sm text-muted-foreground">{dept.employeeCount} employees</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Engagement</p>
                              <p className="font-bold">{dept.engagementScore}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Satisfaction</p>
                              <p className="font-bold">{dept.satisfactionScore}</p>
                            </div>
                            <Badge className={getBurnoutRiskColor(dept.burnoutRisk)}>
                              {dept.burnoutRisk} risk
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      AI-Powered Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.recommendations.map((rec) => (
                        <div key={rec.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{rec.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority} priority
                              </Badge>
                              <Badge variant="outline">
                                {rec.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
