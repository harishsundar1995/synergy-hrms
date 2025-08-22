import OpenAI from 'openai';

interface AIServiceConfig {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

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
  burnoutRiskScore: number; // 0-100
  keywords: string[];
}

interface BurnoutPredictionResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
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
  probability: number; // 0-100
  timeframe: string;
  factors: string[];
  recommendations: string[];
}

class AIService {
  private openai: OpenAI | null;
  private rateLimitTracker: Map<string, { count: number; resetTime: number }>;
  private readonly RATE_LIMIT_PER_MINUTE = 60;
  private readonly RATE_LIMIT_PER_HOUR = 1000;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !!process.env.OPENAI_API_KEY;
    
    if (!this.isEnabled) {
      console.warn('⚠️  OpenAI API key not provided. AI features will be limited to mock responses.');
      this.openai = null;
    } else {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('✅ OpenAI service initialized successfully');
    }

    this.rateLimitTracker = new Map();
  }

  /**
   * Check if AI service is enabled
   */
  isAIEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Check rate limits before making API calls
   */
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimits = this.rateLimitTracker.get(userId);

    if (!userLimits || now > userLimits.resetTime) {
      this.rateLimitTracker.set(userId, {
        count: 1,
        resetTime: now + 60000, // Reset in 1 minute
      });
      return true;
    }

    if (userLimits.count >= this.RATE_LIMIT_PER_MINUTE) {
      return false;
    }

    userLimits.count++;
    return true;
  }

  /**
   * Analyze sentiment of text content (emails, messages, feedback)
   */
  async analyzeSentiment(
    text: string, 
    userId: string,
    config: AIServiceConfig = {}
  ): Promise<SentimentAnalysisResult> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded for user');
    }

    // If OpenAI is not available, return mock data
    if (!this.openai) {
      return this.getMockSentimentAnalysis(text);
    }

    try {
      const prompt = `
Analyze the sentiment and emotional state of the following text. 
Consider workplace context and signs of burnout, stress, or disengagement.

Text: "${text}"

Provide analysis in the following JSON format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.95,
  "emotions": {
    "joy": 0.2,
    "sadness": 0.1,
    "anger": 0.05,
    "fear": 0.15,
    "surprise": 0.1
  },
  "burnoutRiskScore": 25,
  "keywords": ["stressed", "overwhelmed", "deadline"]
}

Focus on workplace burnout indicators like exhaustion, cynicism, reduced efficacy.
`;

      const response = await this.openai.chat.completions.create({
        model: config.model || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert workplace psychologist specializing in burnout detection and sentiment analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: config.maxTokens || 500,
        temperature: config.temperature || 0.3,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content!);
      return result as SentimentAnalysisResult;

    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  /**
   * Generate mock sentiment analysis when OpenAI is not available
   */
  private getMockSentimentAnalysis(text: string): SentimentAnalysisResult {
    // Simple keyword-based mock analysis
    const negativeKeywords = ['stress', 'overwhelm', 'tired', 'burnout', 'frustrated', 'difficult', 'problem'];
    const positiveKeywords = ['great', 'excellent', 'happy', 'excited', 'good', 'amazing', 'love'];
    
    const lowerText = text.toLowerCase();
    const negativeCount = negativeKeywords.filter(word => lowerText.includes(word)).length;
    const positiveCount = positiveKeywords.filter(word => lowerText.includes(word)).length;
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let burnoutRiskScore = 30;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      burnoutRiskScore = 15;
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      burnoutRiskScore = 65;
    }

    return {
      sentiment,
      confidence: 0.75, // Mock confidence
      emotions: {
        joy: sentiment === 'positive' ? 0.7 : 0.2,
        sadness: sentiment === 'negative' ? 0.6 : 0.1,
        anger: negativeCount > 1 ? 0.4 : 0.1,
        fear: negativeCount > 2 ? 0.5 : 0.1,
        surprise: 0.2
      },
      burnoutRiskScore,
      keywords: text.split(' ').slice(0, 5) // Simple keyword extraction
    };
  }

  /**
   * Predict burnout risk based on multiple data points
   */
  async predictBurnout(
    employeeData: {
      workHours: number[];
      sentimentHistory: SentimentAnalysisResult[];
      performanceMetrics: any;
      workloadIndicators: any;
      communicationPatterns: any;
    },
    userId: string
  ): Promise<BurnoutPredictionResult> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded for user');
    }

    // If OpenAI is not available, return mock data
    if (!this.openai) {
      return this.getMockBurnoutPrediction(employeeData);
    }

    try {
      const prompt = `
Analyze the following employee data to predict burnout risk:

Work Hours (last 4 weeks): ${JSON.stringify(employeeData.workHours)}
Recent Sentiment Scores: ${JSON.stringify(employeeData.sentimentHistory.map(s => s.burnoutRiskScore))}
Performance Trends: ${JSON.stringify(employeeData.performanceMetrics)}
Workload Indicators: ${JSON.stringify(employeeData.workloadIndicators)}

Provide burnout prediction in JSON format:
{
  "riskLevel": "low|medium|high|critical",
  "score": 65,
  "factors": [
    {
      "name": "Excessive overtime",
      "impact": 85,
      "description": "Working 60+ hours consistently"
    }
  ],
  "recommendations": [
    "Schedule immediate 1:1 with manager",
    "Redistribute workload"
  ],
  "confidence": 0.89
}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in workplace psychology and burnout prediction. Analyze data patterns to identify burnout risk factors.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content!);
      return result as BurnoutPredictionResult;

    } catch (error) {
      console.error('Error in burnout prediction:', error);
      throw new Error('Failed to predict burnout risk');
    }
  }

  /**
   * Generate mock burnout prediction when OpenAI is not available
   */
  private getMockBurnoutPrediction(employeeData: any): BurnoutPredictionResult {
    const avgWorkHours = employeeData.workHours?.reduce((a: number, b: number) => a + b, 0) / (employeeData.workHours?.length || 1) || 40;
    const avgSentiment = employeeData.sentimentHistory?.reduce((a: number, s: any) => a + s.burnoutRiskScore, 0) / (employeeData.sentimentHistory?.length || 1) || 30;
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let score = 25;
    
    if (avgWorkHours > 55 || avgSentiment > 70) {
      riskLevel = 'critical';
      score = 85;
    } else if (avgWorkHours > 50 || avgSentiment > 50) {
      riskLevel = 'high';
      score = 70;
    } else if (avgWorkHours > 45 || avgSentiment > 35) {
      riskLevel = 'medium';
      score = 50;
    }

    return {
      riskLevel,
      score,
      factors: [
        {
          name: 'Work Hours Analysis',
          impact: Math.min(avgWorkHours * 2, 100),
          description: `Averaging ${avgWorkHours.toFixed(1)} hours per week`
        },
        {
          name: 'Sentiment Analysis',
          impact: avgSentiment,
          description: `Recent communications show ${avgSentiment > 50 ? 'elevated stress' : 'normal patterns'}`
        }
      ],
      recommendations: [
        avgWorkHours > 50 ? 'Consider workload redistribution' : 'Maintain current work-life balance',
        avgSentiment > 50 ? 'Schedule stress management discussion' : 'Continue regular check-ins',
        'Monitor communication patterns for early warning signs'
      ],
      confidence: 0.75
    };
  }

  /**
   * Predict turnover probability
   */
  async predictTurnover(
    employeeData: {
      tenure: number;
      salaryHistory: number[];
      performanceRatings: number[];
      engagementScores: number[];
      managerChanges: number;
      roleChanges: number;
    },
    userId: string
  ): Promise<TurnoverPredictionResult> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded for user');
    }

    // If OpenAI is not available, return mock data
    if (!this.openai) {
      return this.getMockTurnoverPrediction(employeeData);
    }

    try {
      const prompt = `
Analyze employee data to predict turnover risk:

Tenure: ${employeeData.tenure} months
Salary History: ${JSON.stringify(employeeData.salaryHistory)}
Performance Ratings: ${JSON.stringify(employeeData.performanceRatings)}
Engagement Scores: ${JSON.stringify(employeeData.engagementScores)}
Manager Changes: ${employeeData.managerChanges}
Role Changes: ${employeeData.roleChanges}

Provide turnover prediction in JSON format:
{
  "riskLevel": "low|medium|high",
  "probability": 75,
  "timeframe": "3-6 months",
  "factors": [
    "Declining engagement scores",
    "Below market salary"
  ],
  "recommendations": [
    "Salary review and adjustment",
    "Career development conversation"
  ]
}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR data analyst specializing in employee retention and turnover prediction.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content!);
      return result as TurnoverPredictionResult;

    } catch (error) {
      console.error('Error in turnover prediction:', error);
      throw new Error('Failed to predict turnover risk');
    }
  }

  /**
   * Generate mock turnover prediction when OpenAI is not available
   */
  private getMockTurnoverPrediction(employeeData: any): TurnoverPredictionResult {
    const avgEngagement = employeeData.engagementScores?.reduce((a: number, b: number) => a + b, 0) / (employeeData.engagementScores?.length || 1) || 7;
    const avgPerformance = employeeData.performanceRatings?.reduce((a: number, b: number) => a + b, 0) / (employeeData.performanceRatings?.length || 1) || 8;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let probability = 15;
    
    if (avgEngagement < 5 || employeeData.managerChanges > 2) {
      riskLevel = 'high';
      probability = 75;
    } else if (avgEngagement < 7 || employeeData.managerChanges > 1) {
      riskLevel = 'medium';
      probability = 45;
    }

    return {
      riskLevel,
      probability,
      timeframe: riskLevel === 'high' ? '1-3 months' : riskLevel === 'medium' ? '3-6 months' : '6+ months',
      factors: [
        `Engagement score: ${avgEngagement.toFixed(1)}/10`,
        `Performance rating: ${avgPerformance.toFixed(1)}/10`,
        `Manager changes: ${employeeData.managerChanges}`,
        `Tenure: ${employeeData.tenure} months`
      ],
      recommendations: [
        avgEngagement < 6 ? 'Immediate engagement discussion needed' : 'Continue regular check-ins',
        employeeData.managerChanges > 1 ? 'Focus on relationship stability' : 'Maintain current management approach',
        'Consider career development opportunities'
      ]
    };
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
    userId: string
  ): Promise<{
    insights: string[];
    conversationStarters: string[];
    actionItems: string[];
    teamHealthScore: number;
  }> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded for user');
    }

    // If OpenAI is not available, return mock data
    if (!this.openai) {
      return this.getMockManagerInsights(teamData);
    }

    try {
      const prompt = `
Generate manager insights for team management:

Team Size: ${teamData.teamSize}
Average Engagement: ${teamData.averageEngagement}
High Burnout Risk Members: ${teamData.burnoutRisks.filter(b => b.riskLevel === 'high' || b.riskLevel === 'critical').length}
Recent Feedback Themes: ${JSON.stringify(teamData.recentFeedback)}

Provide insights in JSON format:
{
  "insights": [
    "Team engagement has declined 15% this quarter",
    "3 team members showing burnout warning signs"
  ],
  "conversationStarters": [
    "I've noticed you've been working late frequently. How are you feeling about your current workload?",
    "What's one thing I could do to better support you this week?"
  ],
  "actionItems": [
    "Schedule 1:1s with high-risk team members",
    "Review and redistribute project assignments"
  ],
  "teamHealthScore": 72
}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert leadership coach specializing in team management and employee engagement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.4,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content!);
      return result;

    } catch (error) {
      console.error('Error generating manager insights:', error);
      throw new Error('Failed to generate manager insights');
    }
  }

  /**
   * Generate mock manager insights when OpenAI is not available
   */
  private getMockManagerInsights(teamData: any) {
    const highRiskCount = teamData.burnoutRisks?.filter((b: any) => b.riskLevel === 'high' || b.riskLevel === 'critical').length || 0;
    const engagementLevel = teamData.averageEngagement || 7;
    const teamHealthScore = Math.max(20, Math.min(100, (engagementLevel * 10) - (highRiskCount * 15)));

    return {
      insights: [
        `Team of ${teamData.teamSize} members with ${engagementLevel.toFixed(1)}/10 average engagement`,
        highRiskCount > 0 ? `${highRiskCount} team members showing elevated burnout risk` : 'No immediate burnout concerns detected',
        engagementLevel < 6 ? 'Team engagement below optimal levels' : 'Team engagement within healthy range',
        `Overall team health score: ${teamHealthScore}/100`
      ],
      conversationStarters: [
        "How are you feeling about your current workload and priorities?",
        "What's working well for you in your role right now?",
        "Is there anything I can do to better support you this week?",
        "What would help you feel more engaged in your work?"
      ],
      actionItems: [
        highRiskCount > 0 ? 'Schedule immediate 1:1s with high-risk team members' : 'Continue regular check-ins',
        engagementLevel < 6 ? 'Investigate engagement concerns' : 'Maintain current engagement practices',
        'Review workload distribution across team',
        'Plan team building or recognition activities'
      ],
      teamHealthScore
    };
  }

  /**
   * Get rate limit status for a user
   */
  getRateLimitStatus(userId: string): {
    remaining: number;
    resetTime: number;
  } {
    const userLimits = this.rateLimitTracker.get(userId);
    if (!userLimits) {
      return { remaining: this.RATE_LIMIT_PER_MINUTE, resetTime: 0 };
    }

    return {
      remaining: Math.max(0, this.RATE_LIMIT_PER_MINUTE - userLimits.count),
      resetTime: userLimits.resetTime
    };
  }
}

export default new AIService();
export type { 
  SentimentAnalysisResult, 
  BurnoutPredictionResult, 
  TurnoverPredictionResult,
  AIServiceConfig 
};
