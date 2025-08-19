import OpenAI from 'openai';

// Initialize OpenAI client with null check
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } else {
    console.warn('OpenAI API key not provided. AI features will be limited.');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

// Type definitions
export interface JobGenerationPrompt {
  jobTitle: string;
  department: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  workMode: 'remote' | 'hybrid' | 'onsite';
  location: string;
  companyDescription?: string;
  industryType?: string;
  teamSize?: string;
  specificRequirements?: string[];
}

export interface GeneratedJobDescription {
  overview: string;
  responsibilities: string[];
  requirements: {
    essential: string[];
    preferred: string[];
  };
  skills: {
    technical: string[];
    soft: string[];
  };
  benefits: string[];
  tags: string[];
  confidence: number;
}

export interface BiasAnalysis {
  overallScore: number;
  biases: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestions: string[];
  }[];
  suggestions: string[];
  inclusivityScore: number;
}

export interface MarketAnalysis {
  demandLevel: 'low' | 'medium' | 'high';
  averageSalary: number;
  competitionLevel: 'low' | 'medium' | 'high';
  keySkillsInDemand: string[];
  marketTrends: string[];
  recommendations: string[];
}

export class AIJobDescriptionService {
  /**
   * Generate a complete job description using AI
   */
  static async generateJobDescription(prompt: JobGenerationPrompt): Promise<GeneratedJobDescription> {
    try {
      if (!openai) {
        throw new Error('OpenAI client not initialized. Please provide OPENAI_API_KEY environment variable.');
      }

      const systemPrompt = `You are an expert HR professional and job description writer. Create comprehensive, engaging, and bias-free job descriptions that attract diverse talent. Focus on:

1. Clear, concise language
2. Inclusive terminology
3. Realistic requirements
4. Competitive benefits
5. Growth opportunities
6. Company culture fit

Avoid:
- Gender-coded language
- Unnecessary degree requirements
- Overly long requirement lists
- Vague descriptions
- Discriminatory language`;

      const userPrompt = `Create a job description for:

Title: ${prompt.jobTitle}
Department: ${prompt.department}
Experience Level: ${prompt.experienceLevel}
Work Mode: ${prompt.workMode}
Location: ${prompt.location}
${prompt.companyDescription ? `Company: ${prompt.companyDescription}` : ''}
${prompt.industryType ? `Industry: ${prompt.industryType}` : ''}
${prompt.teamSize ? `Team Size: ${prompt.teamSize}` : ''}
${prompt.specificRequirements ? `Specific Requirements: ${prompt.specificRequirements.join(', ')}` : ''}

Return a JSON object with:
{
  "overview": "2-3 sentence engaging overview",
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "requirements": {
    "essential": ["requirement1", "requirement2", ...],
    "preferred": ["preferred1", "preferred2", ...]
  },
  "skills": {
    "technical": ["skill1", "skill2", ...],
    "soft": ["skill1", "skill2", ...]
  },
  "benefits": ["benefit1", "benefit2", ...],
  "tags": ["tag1", "tag2", ...],
  "confidence": 85
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(response);
      return {
        overview: result.overview || 'AI-generated overview not available',
        responsibilities: result.responsibilities || [],
        requirements: result.requirements || { essential: [], preferred: [] },
        skills: result.skills || { technical: [], soft: [] },
        benefits: result.benefits || [],
        tags: result.tags || [],
        confidence: result.confidence || 75
      };

    } catch (error) {
      console.error('Error generating job description:', error);
      // Return fallback data
      return {
        overview: `Join our team as a ${prompt.jobTitle} and make a meaningful impact in the ${prompt.department} department.`,
        responsibilities: [
          'Execute key responsibilities related to the role',
          'Collaborate with team members and stakeholders',
          'Contribute to departmental goals and objectives'
        ],
        requirements: {
          essential: ['Relevant experience in the field', 'Strong communication skills'],
          preferred: ['Advanced degree or certification', 'Leadership experience']
        },
        skills: {
          technical: ['Role-specific technical skills'],
          soft: ['Communication', 'Problem-solving', 'Teamwork']
        },
        benefits: [
          'Competitive salary and benefits',
          'Professional development opportunities',
          'Collaborative work environment'
        ],
        tags: [prompt.jobTitle.toLowerCase(), prompt.department.toLowerCase(), prompt.experienceLevel],
        confidence: 50
      };
    }
  }

  /**
   * Analyze job description for potential bias
   */
  static async analyzeBias(jobDescription: string): Promise<BiasAnalysis> {
    try {
      if (!openai) {
        // Return fallback bias analysis when OpenAI is not available
        return {
          overallScore: 7.5,
          biases: [
            {
              type: 'language',
              severity: 'low',
              description: 'Unable to perform AI bias analysis. Manual review recommended.',
              suggestions: ['Review job requirements for necessity', 'Use inclusive language', 'Avoid gender-coded terms']
            }
          ],
          suggestions: [
            'Review requirements to ensure they are essential',
            'Use gender-neutral language throughout',
            'Consider diverse candidate backgrounds',
            'Remove unnecessary degree requirements'
          ],
          inclusivityScore: 7.0
        };
      }

      const systemPrompt = `You are an expert in diversity, equity, and inclusion in hiring. Analyze job descriptions for potential bias and provide actionable feedback to improve inclusivity.

Focus on:
1. Gender-coded language
2. Age bias
3. Educational requirements bias
4. Cultural bias
5. Ability bias
6. Socioeconomic bias

Provide specific, actionable suggestions for improvement.`;

      const userPrompt = `Analyze this job description for bias and inclusivity:

"${jobDescription}"

Return a JSON object with:
{
  "overallScore": 8.5,
  "biases": [
    {
      "type": "gender|age|education|cultural|ability|socioeconomic",
      "severity": "low|medium|high",
      "description": "specific bias found",
      "suggestions": ["specific suggestion"]
    }
  ],
  "suggestions": ["overall improvement suggestion"],
  "inclusivityScore": 8.0
}

Score from 1-10 where 10 is completely bias-free and inclusive.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(response);
      return {
        overallScore: result.overallScore || 7.5,
        biases: result.biases || [],
        suggestions: result.suggestions || [],
        inclusivityScore: result.inclusivityScore || 7.0
      };

    } catch (error) {
      console.error('Error analyzing bias:', error);
      return {
        overallScore: 7.5,
        biases: [
          {
            type: 'unknown',
            severity: 'low',
            description: 'Bias analysis failed. Manual review recommended.',
            suggestions: ['Review for inclusive language', 'Check requirement necessity']
          }
        ],
        suggestions: [
          'Use gender-neutral language',
          'Avoid unnecessary requirements',
          'Consider diverse backgrounds'
        ],
        inclusivityScore: 7.0
      };
    }
  }

  /**
   * Optimize job description for better engagement
   */
  static async optimizeJobDescription(jobDescription: string, targetAudience?: string): Promise<{
    optimizedDescription: string;
    improvements: string[];
    seoScore: number;
    readabilityScore: number;
  }> {
    try {
      if (!openai) {
        // Return fallback optimization when OpenAI is not available
        return {
          optimizedDescription: jobDescription,
          improvements: [
            'AI optimization unavailable. Consider manual review for:',
            'Clarity and conciseness',
            'Engaging language',
            'SEO optimization',
            'Readability improvement'
          ],
          seoScore: 7.0,
          readabilityScore: 7.5
        };
      }

      const systemPrompt = `You are an expert content optimizer specializing in job descriptions. Optimize job descriptions for better candidate engagement, SEO, and readability while maintaining accuracy and professionalism.

Focus on:
1. Clear, engaging language
2. SEO optimization
3. Readability and flow
4. Call-to-action effectiveness
5. Keyword optimization
6. Structure and formatting`;

      const userPrompt = `Optimize this job description for better engagement and SEO:

"${jobDescription}"

${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Return a JSON object with:
{
  "optimizedDescription": "improved job description",
  "improvements": ["specific improvement made"],
  "seoScore": 8.5,
  "readabilityScore": 9.0
}

Scores from 1-10 where 10 is excellent.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(response);
      return {
        optimizedDescription: result.optimizedDescription || jobDescription,
        improvements: result.improvements || [],
        seoScore: result.seoScore || 7.0,
        readabilityScore: result.readabilityScore || 7.5
      };

    } catch (error) {
      console.error('Error optimizing job description:', error);
      return {
        optimizedDescription: jobDescription,
        improvements: ['AI optimization failed. Manual review recommended.'],
        seoScore: 7.0,
        readabilityScore: 7.5
      };
    }
  }

  /**
   * Generate market analysis for a job position
   */
  static async generateMarketAnalysis(jobTitle: string, location: string, experienceLevel: string): Promise<MarketAnalysis> {
    try {
      if (!openai) {
        // Return fallback market analysis when OpenAI is not available
        return {
          demandLevel: 'medium',
          averageSalary: 0,
          competitionLevel: 'medium',
          keySkillsInDemand: ['Professional skills in high demand'],
          marketTrends: ['Market analysis unavailable without AI'],
          recommendations: ['Configure OpenAI API key for detailed market analysis']
        };
      }

      const systemPrompt = `You are a market research expert specializing in job market analysis. Provide accurate, data-driven insights about job market conditions, salary ranges, and hiring trends.

Base your analysis on:
1. Current market demand
2. Salary benchmarks
3. Competition levels
4. Skill requirements
5. Industry trends
6. Geographic factors`;

      const userPrompt = `Analyze the job market for:

Position: ${jobTitle}
Location: ${location}
Experience Level: ${experienceLevel}

Return a JSON object with:
{
  "demandLevel": "low|medium|high",
  "averageSalary": 75000,
  "competitionLevel": "low|medium|high",
  "keySkillsInDemand": ["skill1", "skill2"],
  "marketTrends": ["trend1", "trend2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(response);
      return {
        demandLevel: result.demandLevel || 'medium',
        averageSalary: result.averageSalary || 0,
        competitionLevel: result.competitionLevel || 'medium',
        keySkillsInDemand: result.keySkillsInDemand || [],
        marketTrends: result.marketTrends || [],
        recommendations: result.recommendations || []
      };

    } catch (error) {
      console.error('Error generating market analysis:', error);
      return {
        demandLevel: 'medium',
        averageSalary: 0,
        competitionLevel: 'medium',
        keySkillsInDemand: ['Market analysis unavailable'],
        marketTrends: ['AI analysis failed'],
        recommendations: ['Manual market research recommended']
      };
    }
  }

  /**
   * Generate relevant tags for a job description
   */
  static async generateTags(jobTitle: string, skills: string[], industry?: string): Promise<string[]> {
    try {
      if (!openai) {
        // Return fallback tags when OpenAI is not available
        return [
          jobTitle.toLowerCase().replace(/\s+/g, '-'),
          'professional',
          'career-opportunity',
          ...(skills.length > 0 ? skills.slice(0, 3).map(s => s.toLowerCase()) : []),
          ...(industry ? [industry.toLowerCase()] : [])
        ];
      }

      const systemPrompt = `Generate SEO-optimized tags for job postings that will improve search visibility and candidate discovery.`;

      const userPrompt = `Generate 8-12 relevant tags for:

Job Title: ${jobTitle}
Key Skills: ${skills.join(', ')}
${industry ? `Industry: ${industry}` : ''}

Return as a JSON array: ["tag1", "tag2", "tag3", ...]

Focus on:
- Job function keywords
- Industry terms
- Skill-based tags
- Experience level indicators
- Work arrangement terms`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 300,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const tags = JSON.parse(response);
      return Array.isArray(tags) ? tags : [];

    } catch (error) {
      console.error('Error generating tags:', error);
      return [
        jobTitle.toLowerCase().replace(/\s+/g, '-'),
        'job-opportunity',
        'career',
        'professional',
        ...(skills.length > 0 ? skills.slice(0, 3).map(s => s.toLowerCase()) : [])
      ];
    }
  }
}

export default AIJobDescriptionService;
