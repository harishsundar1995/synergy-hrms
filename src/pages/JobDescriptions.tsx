import React, { useState, useEffect } from 'react';
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
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import {
  PlusIcon,
  Sparkles,
  Search,
  Filter,
  TrendingUp,
  Shield,
  Target,
  Zap,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Share,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface JobDescription {
  _id: string;
  title: string;
  department: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'on-site';
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
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
  status: 'draft' | 'active' | 'paused' | 'closed';
  aiGenerated?: {
    isGenerated: boolean;
    confidence?: number;
    humanEdited?: boolean;
  };
  biasCheck?: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  marketAnalysis?: {
    avgSalary: number;
    demandLevel: 'low' | 'medium' | 'high' | 'very-high';
    competitionLevel: 'low' | 'medium' | 'high';
  };
  optimization?: {
    seoScore: number;
    readabilityScore: number;
    diversityScore: number;
  };
  posting?: {
    isActive: boolean;
    applicantCount: number;
    viewCount: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface AIGenerationForm {
  jobTitle: string;
  department: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  workMode: 'remote' | 'hybrid' | 'on-site';
  location: string;
  companyDescription?: string;
  specificRequirements?: string[];
  industryType?: string;
  teamSize?: number;
}

export default function JobDescriptions() {
  const { getToken } = useAuth();
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    department: 'all',
    aiGenerated: 'all'
  });

  // AI Generation Form State
  const [aiForm, setAiForm] = useState<AIGenerationForm>({
    jobTitle: '',
    department: '',
    experienceLevel: 'mid',
    workMode: 'hybrid',
    location: 'Remote',
    companyDescription: '',
    specificRequirements: [],
    industryType: '',
    teamSize: undefined
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    aiGenerated: 0,
    avgBiasScore: 0,
    avgSEOScore: 0
  });

  // Fetch job descriptions
  const fetchJobDescriptions = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.department !== 'all' && { department: filters.department }),
        ...(filters.aiGenerated !== 'all' && { aiGenerated: filters.aiGenerated })
      });

      const response = await fetch(`http://localhost:3001/api/job-descriptions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobDescriptions(data.data.jobDescriptions);
        
        // Calculate stats from the response
        const jobs = data.data.jobDescriptions;
        setStats({
          total: jobs.length,
          active: jobs.filter((j: JobDescription) => j.status === 'active').length,
          draft: jobs.filter((j: JobDescription) => j.status === 'draft').length,
          aiGenerated: jobs.filter((j: JobDescription) => j.aiGenerated?.isGenerated).length,
          avgBiasScore: jobs.reduce((acc: number, j: JobDescription) => acc + (j.biasCheck?.score || 0), 0) / jobs.length,
          avgSEOScore: jobs.reduce((acc: number, j: JobDescription) => acc + (j.optimization?.seoScore || 0), 0) / jobs.length
        });
      } else {
        toast.error('Failed to fetch job descriptions');
      }
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
      toast.error('Network error while fetching job descriptions');
    } finally {
      setLoading(false);
    }
  };

  // Generate AI job description
  const generateAIJobDescription = async () => {
    try {
      setGenerating(true);
      const token = await getToken();
      
      const response = await fetch('http://localhost:3001/api/job-descriptions/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiForm)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`✨ AI generated job description for "${data.data.jobDescription.title}" with ${data.data.aiMetrics.confidence}% confidence!`);
        setShowAIGenerator(false);
        fetchJobDescriptions(); // Refresh the list
        
        // Reset form
        setAiForm({
          jobTitle: '',
          department: '',
          experienceLevel: 'mid',
          workMode: 'hybrid',
          location: 'Remote',
          companyDescription: '',
          specificRequirements: [],
          industryType: '',
          teamSize: undefined
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error?.message || 'Failed to generate job description');
      }
    } catch (error) {
      console.error('Error generating job description:', error);
      toast.error('Network error during AI generation');
    } finally {
      setGenerating(false);
    }
  };

  // Analyze bias for a job description
  const analyzeBias = async (jobId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3001/api/job-descriptions/${jobId}/analyze-bias`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Bias analysis completed. Score: ${data.data.biasAnalysis.score}/100`);
        fetchJobDescriptions(); // Refresh to show updated scores
      } else {
        toast.error('Failed to analyze bias');
      }
    } catch (error) {
      console.error('Error analyzing bias:', error);
      toast.error('Network error during bias analysis');
    }
  };

  useEffect(() => {
    fetchJobDescriptions();
  }, [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBiasScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDemandLevelIcon = (level: string) => {
    switch (level) {
      case 'very-high': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'medium': return <BarChart3 className="h-4 w-4 text-yellow-600" />;
      case 'low': return <BarChart3 className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
            <p className="text-gray-600 mt-3">
              AI-powered job management and optimization
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowAIGenerator(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
            <Button variant="outline" className="px-6 py-3">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Manual
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Total Jobs</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-600 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Active</p>
                  <p className="text-3xl font-bold text-green-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-600 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-700">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.draft}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">AI Generated</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.aiGenerated}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-emerald-700">Avg Bias Score</p>
                  <p className="text-3xl font-bold text-emerald-900">{Math.round(stats.avgBiasScore)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-600 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-indigo-700">Avg SEO Score</p>
                  <p className="text-3xl font-bold text-indigo-900">{Math.round(stats.avgSEOScore)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-wrap gap-8 items-center">
              <div className="flex-1 min-w-[320px]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search job descriptions..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-12 h-12 text-base"
                  />
                </div>
              </div>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="w-[160px] h-12">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.department}
                onValueChange={(value) => setFilters({ ...filters, department: value })}
              >
                <SelectTrigger className="w-[180px] h-12">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.aiGenerated}
                onValueChange={(value) => setFilters({ ...filters, aiGenerated: value })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="AI Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="true">AI Generated</SelectItem>
                  <SelectItem value="false">Manual</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={fetchJobDescriptions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Descriptions List */}
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4 text-lg">Loading job descriptions...</p>
            </div>
          ) : jobDescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-20">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-3">No job descriptions found</h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  Get started by creating your first AI-powered job description.
                </p>
                <Button
                  onClick={() => setShowAIGenerator(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 text-lg"
                >
                  <Sparkles className="h-5 w-5 mr-3" />
                  Generate with AI
                </Button>
              </CardContent>
            </Card>
          ) : (
            jobDescriptions.map((job) => (
              <Card key={job._id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader className="pb-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <CardTitle className="text-2xl font-semibold">{job.title}</CardTitle>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        {job.aiGenerated?.isGenerated && (
                          <Badge variant="outline" className="border-purple-200 text-purple-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-6 text-base mt-3">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {job.department}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {job.location} • {job.workMode}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="h-10 px-4">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-10 px-4">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-10 px-4">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {/* Overview */}
                    <p className="text-gray-700 line-clamp-3 text-base leading-relaxed">{job.overview}</p>

                    {/* AI Metrics */}
                    {(job.biasCheck || job.optimization || job.marketAnalysis) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg">
                        {job.biasCheck && (
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getBiasScoreColor(job.biasCheck.score)}`}>
                              {job.biasCheck.score}/100
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Bias Score</p>
                            {job.biasCheck.score < 70 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => analyzeBias(job._id)}
                                className="mt-3"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Re-analyze
                              </Button>
                            )}
                          </div>
                        )}

                        {job.optimization && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {job.optimization.seoScore}/100
                            </div>
                            <p className="text-xs text-gray-600">SEO Score</p>
                          </div>
                        )}

                        {job.marketAnalysis && (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {getDemandLevelIcon(job.marketAnalysis.demandLevel)}
                              <span className="text-sm font-medium capitalize">
                                {job.marketAnalysis.demandLevel}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">Market Demand</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-3">
                      {job.tags.slice(0, 5).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                          {tag}
                        </Badge>
                      ))}
                      {job.tags.length > 5 && (
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          +{job.tags.length - 5} more
                        </Badge>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-6">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        {job.posting && (
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-2" />
                            {job.posting.viewCount} views
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {job.aiGenerated?.isGenerated && (
                          <span className="text-purple-600 text-sm font-medium">
                            AI Confidence: {job.aiGenerated.confidence}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* AI Generation Modal */}
        {showAIGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  AI Job Description Generator
                </CardTitle>
                <CardDescription>
                  Let AI create a comprehensive, bias-free job description for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      value={aiForm.jobTitle}
                      onChange={(e) => setAiForm({ ...aiForm, jobTitle: e.target.value })}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={aiForm.department}
                      onValueChange={(value) => setAiForm({ ...aiForm, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel">Experience Level *</Label>
                    <Select
                      value={aiForm.experienceLevel}
                      onValueChange={(value: 'entry' | 'mid' | 'senior' | 'executive') => 
                        setAiForm({ ...aiForm, experienceLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="workMode">Work Mode *</Label>
                    <Select
                      value={aiForm.workMode}
                      onValueChange={(value: 'remote' | 'hybrid' | 'on-site') => 
                        setAiForm({ ...aiForm, workMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="on-site">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={aiForm.location}
                      onChange={(e) => setAiForm({ ...aiForm, location: e.target.value })}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>

                  <div>
                    <Label htmlFor="industryType">Industry</Label>
                    <Input
                      id="industryType"
                      value={aiForm.industryType}
                      onChange={(e) => setAiForm({ ...aiForm, industryType: e.target.value })}
                      placeholder="e.g., SaaS, Fintech, Healthcare"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyDescription">Company Description</Label>
                  <Textarea
                    id="companyDescription"
                    value={aiForm.companyDescription}
                    onChange={(e) => setAiForm({ ...aiForm, companyDescription: e.target.value })}
                    placeholder="Brief description of your company, culture, and mission..."
                    rows={3}
                  />
                </div>

                {generating && (
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      AI is generating your job description... This may take 10-30 seconds.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAIGenerator(false)}
                    disabled={generating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={generateAIJobDescription}
                    disabled={!aiForm.jobTitle || !aiForm.department || generating}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
