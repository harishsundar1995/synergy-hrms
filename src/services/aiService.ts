interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  burnoutRiskScore: number;
  keywords: string[];
}

interface BurnoutPredictionResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  recommendations: string[];
  confidence: number;
}

interface TurnoverPredictionResult {
  riskLevel: 'low' | 'medium' | 'high';
  probability: number;
  timeframe: string;
  factors: string[];
  recommendations: string[];
}

interface ManagerInsightsResult {
  insights: string[];
  conversationStarters: string[];
  actionItems: string[];
  teamHealthScore: number;
}

class AIService {
  private baseUrl: string;

  constructor() {
    // Explicitly set the base URL without /api since our endpoints already include it
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit,
    token?: string
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    return result.data;
  }

  /**
   * Analyze sentiment of text content
   */
  async analyzeSentiment(
    text: string, 
    context?: string,
    token?: string
  ): Promise<SentimentAnalysisResult> {
    return this.makeRequest<SentimentAnalysisResult>(
      '/api/ai/sentiment-analysis',
      {
        method: 'POST',
        body: JSON.stringify({ text, context }),
      },
      token
    );
  }

  /**
   * Analyze sentiment for multiple texts
   */
  async batchAnalyzeSentiment(
    texts: string[], 
    context?: string,
    token?: string
  ): Promise<{
    results: (SentimentAnalysisResult & { index: number })[];
    context: string;
    processedCount: number;
    totalCount: number;
  }> {
    return this.makeRequest(
      '/api/ai/batch-sentiment-analysis',
      {
        method: 'POST',
        body: JSON.stringify({ texts, context }),
      },
      token
    );
  }

  /**
   * Predict burnout risk for an employee
   */
  async predictBurnout(
    employeeId: string,
    employeeData: {
      workHours: number[];
      sentimentHistory: SentimentAnalysisResult[];
      performanceMetrics: any;
      workloadIndicators: any;
      communicationPatterns: any;
    },
    token?: string
  ): Promise<{
    employeeId: string;
    prediction: BurnoutPredictionResult;
    generatedAt: string;
  }> {
    return this.makeRequest(
      '/api/ai/burnout-prediction',
      {
        method: 'POST',
        body: JSON.stringify({ employeeId, employeeData }),
      },
      token
    );
  }

  /**
   * Predict turnover risk for an employee
   */
  async predictTurnover(
    employeeId: string,
    employeeData: {
      tenure: number;
      salaryHistory: number[];
      performanceRatings: number[];
      engagementScores: number[];
      managerChanges: number;
      roleChanges: number;
    },
    token?: string
  ): Promise<{
    employeeId: string;
    prediction: TurnoverPredictionResult;
    generatedAt: string;
  }> {
    return this.makeRequest(
      '/api/ai/turnover-prediction',
      {
        method: 'POST',
        body: JSON.stringify({ employeeId, employeeData }),
      },
      token
    );
  }

  /**
   * Generate manager insights and conversation starters
   */
  async generateManagerInsights(
    teamData: {
      teamSize: number;
      averageEngagement: number;
      burnoutRisks: BurnoutPredictionResult[];
      recentFeedback: string[];
    },
    token?: string
  ): Promise<{
    insights: ManagerInsightsResult;
    generatedAt: string;
  }> {
    return this.makeRequest(
      '/api/ai/manager-insights',
      {
        method: 'POST',
        body: JSON.stringify({ teamData }),
      },
      token
    );
  }

  /**
   * Get current rate limit status
   */
  async getRateLimitStatus(token?: string): Promise<{
    remaining: number;
    resetTime: number;
    resetIn: number;
  }> {
    return this.makeRequest(
      '/api/ai/rate-limit-status',
      { method: 'GET' },
      token
    );
  }

  /**
   * Helper: Get burnout risk color for UI
   */
  getBurnoutRiskColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  /**
   * Helper: Get sentiment color for UI
   */
  getSentimentColor(sentiment: string): string {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  /**
   * Helper: Format confidence score as percentage
   */
  formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  }

  /**
   * Helper: Get risk level emoji
   */
  getRiskEmoji(riskLevel: string): string {
    switch (riskLevel) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🟠';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types for use in components
export type {
  SentimentAnalysisResult,
  BurnoutPredictionResult,
  TurnoverPredictionResult,
  ManagerInsightsResult
};
