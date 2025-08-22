import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Sparkles,
  Activity,
  Target
} from 'lucide-react';
import { aiService, SentimentAnalysisResult, BurnoutPredictionResult } from '../services/aiService';
import { toast } from 'sonner';

const AIIntelligence = () => {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'sentiment' | 'burnout' | 'turnover' | 'insights'>('sentiment');
  const [loading, setLoading] = useState(false);
  
  // Sentiment Analysis State
  const [sentimentText, setSentimentText] = useState('');
  const [sentimentResult, setSentimentResult] = useState<SentimentAnalysisResult | null>(null);
  
  // Burnout Prediction State
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [burnoutResult, setBurnoutResult] = useState<BurnoutPredictionResult | null>(null);

  const mockEmployees = [
    { id: '1', name: 'John Smith', department: 'Engineering' },
    { id: '2', name: 'Sarah Johnson', department: 'Marketing' },
    { id: '3', name: 'Mike Chen', department: 'Sales' },
  ];

  const handleSentimentAnalysis = async () => {
    if (!sentimentText.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const result = await aiService.analyzeSentiment(sentimentText, 'workplace', token || undefined);
      setSentimentResult(result);
      toast.success('Sentiment analysis completed');
    } catch (error: any) {
      console.error('Error analyzing sentiment:', error);
      toast.error(error.message || 'Failed to analyze sentiment');
    } finally {
      setLoading(false);
    }
  };

  const handleBurnoutPrediction = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      
      // Mock employee data for demonstration
      const mockEmployeeData = {
        workHours: [45, 52, 48, 60, 55, 58, 62], // Last 7 weeks
        sentimentHistory: [
          { sentiment: 'neutral' as const, confidence: 0.7, burnoutRiskScore: 30, emotions: { joy: 0.3, sadness: 0.2, anger: 0.1, fear: 0.2, surprise: 0.2 }, keywords: ['busy', 'deadline'] },
          { sentiment: 'negative' as const, confidence: 0.8, burnoutRiskScore: 65, emotions: { joy: 0.1, sadness: 0.4, anger: 0.3, fear: 0.1, surprise: 0.1 }, keywords: ['stressed', 'overwhelmed'] }
        ],
        performanceMetrics: { lastReview: 7.5, goalsCompleted: 0.75 },
        workloadIndicators: { projectCount: 8, urgentTasks: 12 },
        communicationPatterns: { avgResponseTime: 2.5, afterHourEmails: 15 }
      };

      const result = await aiService.predictBurnout(selectedEmployee, mockEmployeeData, token || undefined);
      setBurnoutResult(result.prediction);
      toast.success('Burnout prediction completed');
    } catch (error: any) {
      console.error('Error predicting burnout:', error);
      toast.error(error.message || 'Failed to predict burnout');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      case 'neutral': return '😐';
      default: return '🤔';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Intelligence Hub</h1>
            <p className="text-gray-600 mt-2">
              Advanced AI-powered analytics for employee well-being and engagement
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <span className="text-lg font-semibold text-purple-600">AI Powered</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'sentiment', label: 'Sentiment Analysis', icon: MessageSquare },
              { id: 'burnout', label: 'Burnout Prediction', icon: AlertTriangle },
              { id: 'turnover', label: 'Turnover Risk', icon: TrendingUp },
              { id: 'insights', label: 'Manager Insights', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {activeTab === 'sentiment' && <MessageSquare className="w-5 h-5" />}
                {activeTab === 'burnout' && <AlertTriangle className="w-5 h-5" />}
                {activeTab === 'turnover' && <TrendingUp className="w-5 h-5" />}
                {activeTab === 'insights' && <Users className="w-5 h-5" />}
                <span>
                  {activeTab === 'sentiment' && 'Sentiment Analysis'}
                  {activeTab === 'burnout' && 'Burnout Prediction'}
                  {activeTab === 'turnover' && 'Turnover Risk Assessment'}
                  {activeTab === 'insights' && 'Manager Insights'}
                </span>
              </CardTitle>
              <CardDescription>
                {activeTab === 'sentiment' && 'Analyze the emotional tone and burnout indicators in text'}
                {activeTab === 'burnout' && 'Predict employee burnout risk using AI algorithms'}
                {activeTab === 'turnover' && 'Assess likelihood of employee turnover'}
                {activeTab === 'insights' && 'Generate actionable insights for managers'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTab === 'sentiment' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Text to Analyze
                    </label>
                    <Textarea
                      value={sentimentText}
                      onChange={(e) => setSentimentText(e.target.value)}
                      placeholder="Enter employee feedback, email, or any workplace communication..."
                      rows={6}
                      className="w-full"
                    />
                  </div>
                  <Button 
                    onClick={handleSentimentAnalysis}
                    disabled={loading || !sentimentText.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze Sentiment
                      </>
                    )}
                  </Button>
                </>
              )}

              {activeTab === 'burnout' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Employee
                    </label>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Choose an employee...</option>
                      {mockEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This demo uses mock data. In production, real employee metrics would be analyzed.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={handleBurnoutPrediction}
                    disabled={loading || !selectedEmployee}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Predict Burnout Risk
                      </>
                    )}
                  </Button>
                </>
              )}

              {(activeTab === 'turnover' || activeTab === 'insights') && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This feature will be available in the next update. Currently focusing on sentiment analysis and burnout prediction.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Results</CardTitle>
              <CardDescription>
                AI-powered insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === 'sentiment' && sentimentResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getSentimentEmoji(sentimentResult.sentiment)}</span>
                      <div>
                        <p className="font-semibold capitalize">{sentimentResult.sentiment}</p>
                        <p className="text-sm text-gray-600">
                          {aiService.formatConfidence(sentimentResult.confidence)} confidence
                        </p>
                      </div>
                    </div>
                    <Badge className={aiService.getSentimentColor(sentimentResult.sentiment)}>
                      {sentimentResult.sentiment}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Burnout Risk Score</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={sentimentResult.burnoutRiskScore} className="flex-1" />
                      <span className="text-sm font-semibold">{sentimentResult.burnoutRiskScore}/100</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Emotional Breakdown</p>
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      {Object.entries(sentimentResult.emotions).map(([emotion, value]) => (
                        <div key={emotion} className="text-center">
                          <div className={`h-2 bg-blue-200 rounded`}>
                            <div 
                              className="h-full bg-blue-500 rounded" 
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                          <p className="mt-1 capitalize">{emotion}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {sentimentResult.keywords.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Key Indicators</p>
                      <div className="flex flex-wrap gap-1">
                        {sentimentResult.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'burnout' && burnoutResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{aiService.getRiskEmoji(burnoutResult.riskLevel)}</span>
                      <div>
                        <p className="font-semibold capitalize">{burnoutResult.riskLevel} Risk</p>
                        <p className="text-sm text-gray-600">
                          Score: {burnoutResult.score}/100
                        </p>
                      </div>
                    </div>
                    <Badge className={aiService.getBurnoutRiskColor(burnoutResult.riskLevel)}>
                      {burnoutResult.riskLevel}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Risk Factors</p>
                    <div className="space-y-2">
                      {burnoutResult.factors.map((factor, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm">{factor.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {factor.impact}% impact
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{factor.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Recommendations</p>
                    <ul className="space-y-1">
                      {burnoutResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Confidence:</span> {aiService.formatConfidence(burnoutResult.confidence)}
                    </p>
                  </div>
                </div>
              )}

              {!sentimentResult && !burnoutResult && (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No analysis results yet</p>
                  <p className="text-sm">Run an analysis to see AI-powered insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIIntelligence;
