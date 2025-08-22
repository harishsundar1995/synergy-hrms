import React, { useState, useEffect, useCallback } from 'react';
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
import { Badge } from '../components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import {
  Target,
  Search,
  Filter,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Eye,
  Download,
  CheckCircle,
  Clock,
  BarChart3,
  Star,
  Mail,
  Phone,
  Video,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  MoreHorizontal,
  ExternalLink,
  Award,
  ChevronRight,
  Brain,
  Briefcase,
  Timer
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  description: string;
  position: number;
}

interface Application {
  _id: string;
  candidateId: string;
  jobId: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    location: string;
    experience: number;
  };
  job: {
    title: string;
    department: string;
  };
  pipeline: {
    currentStage: string;
    status: 'applied' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    stageHistory: Array<{
      stage: string;
      enteredAt: string;
      duration?: number;
    }>;
  };
  aiInsights: {
    candidateJobMatch: {
      overallScore: number;
      skillsMatch: number;
      experienceMatch: number;
    };
    hiringRecommendation: {
      recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire';
      confidence: number;
    };
  };
  appliedDate: string;
  lastActivity: string;
}

export default function Pipeline() {
  const { getToken } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const pipelineStages: PipelineStage[] = [
    { id: 'applied', name: 'Applied', color: 'bg-blue-500', description: 'New applications', position: 1 },
    { id: 'screening', name: 'Screening', color: 'bg-yellow-500', description: 'Initial review', position: 2 },
    { id: 'interview', name: 'Interview', color: 'bg-purple-500', description: 'Interview rounds', position: 3 },
    { id: 'assessment', name: 'Assessment', color: 'bg-orange-500', description: 'Skills evaluation', position: 4 },
    { id: 'offer', name: 'Offer', color: 'bg-green-500', description: 'Offer stage', position: 5 },
    { id: 'hired', name: 'Hired', color: 'bg-emerald-600', description: 'Successful hires', position: 6 },
  ];

  // Mock data for development
  const mockApplications: Application[] = [
    {
      _id: '1',
      candidateId: 'c1',
      jobId: 'j1',
      candidate: {
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@email.com',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b193?w=150&h=150&fit=crop&crop=face',
        location: 'San Francisco, CA',
        experience: 5
      },
      job: {
        title: 'Senior Frontend Developer',
        department: 'Engineering'
      },
      pipeline: {
        currentStage: 'interview',
        status: 'interview',
        priority: 'high',
        stageHistory: [
          { stage: 'applied', enteredAt: '2024-01-15T10:30:00Z', duration: 24 },
          { stage: 'screening', enteredAt: '2024-01-16T10:30:00Z', duration: 48 },
          { stage: 'interview', enteredAt: '2024-01-18T10:30:00Z' }
        ]
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 92,
          skillsMatch: 95,
          experienceMatch: 88
        },
        hiringRecommendation: {
          recommendation: 'strong_hire',
          confidence: 89
        }
      },
      appliedDate: '2024-01-15T10:30:00Z',
      lastActivity: '2024-01-19T14:20:00Z'
    },
    {
      _id: '2',
      candidateId: 'c2',
      jobId: 'j2',
      candidate: {
        firstName: 'Michael',
        lastName: 'Rodriguez',
        email: 'michael.rodriguez@email.com',
        location: 'Austin, TX',
        experience: 8
      },
      job: {
        title: 'Product Manager',
        department: 'Product'
      },
      pipeline: {
        currentStage: 'assessment',
        status: 'assessment',
        priority: 'medium',
        stageHistory: [
          { stage: 'applied', enteredAt: '2024-01-10T09:15:00Z', duration: 12 },
          { stage: 'screening', enteredAt: '2024-01-10T21:15:00Z', duration: 72 },
          { stage: 'interview', enteredAt: '2024-01-13T21:15:00Z', duration: 96 },
          { stage: 'assessment', enteredAt: '2024-01-17T21:15:00Z' }
        ]
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 88,
          skillsMatch: 82,
          experienceMatch: 94
        },
        hiringRecommendation: {
          recommendation: 'hire',
          confidence: 85
        }
      },
      appliedDate: '2024-01-10T09:15:00Z',
      lastActivity: '2024-01-18T11:45:00Z'
    },
    {
      _id: '3',
      candidateId: 'c3',
      jobId: 'j1',
      candidate: {
        firstName: 'Emily',
        lastName: 'Watson',
        email: 'emily.watson@email.com',
        location: 'New York, NY',
        experience: 3
      },
      job: {
        title: 'Senior Frontend Developer',
        department: 'Engineering'
      },
      pipeline: {
        currentStage: 'screening',
        status: 'screening',
        priority: 'low',
        stageHistory: [
          { stage: 'applied', enteredAt: '2024-01-12T11:45:00Z', duration: 36 },
          { stage: 'screening', enteredAt: '2024-01-13T23:45:00Z' }
        ]
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 75,
          skillsMatch: 78,
          experienceMatch: 65
        },
        hiringRecommendation: {
          recommendation: 'maybe',
          confidence: 72
        }
      },
      appliedDate: '2024-01-12T11:45:00Z',
      lastActivity: '2024-01-16T16:30:00Z'
    }
  ];

  const stats = [
    {
      title: "Active Applications",
      value: "347",
      change: "+12%",
      trend: "up",
      icon: Briefcase,
      color: "bg-blue-500"
    },
    {
      title: "Interview Success Rate",
      value: "78%",
      change: "+5%",
      trend: "up",
      icon: Video,
      color: "bg-green-500"
    },
    {
      title: "Avg. Time to Hire",
      value: "18 days",
      change: "-2 days",
      trend: "up",
      icon: Timer,
      color: "bg-purple-500"
    },
    {
      title: "AI Match Score",
      value: "85%",
      change: "+3%",
      trend: "up",
      icon: Brain,
      color: "bg-orange-500"
    }
  ];

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApplications(mockApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const getStageApplications = (stageId: string) => {
    return applications.filter(app => app.pipeline.currentStage === stageId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRecommendationBadge = (recommendation: string, confidence: number) => {
    const config = {
      strong_hire: { label: 'Strong Hire', color: 'bg-green-100 text-green-800' },
      hire: { label: 'Hire', color: 'bg-blue-100 text-blue-800' },
      maybe: { label: 'Maybe', color: 'bg-yellow-100 text-yellow-800' },
      no_hire: { label: 'No Hire', color: 'bg-red-100 text-red-800' },
      strong_no_hire: { label: 'Strong No Hire', color: 'bg-red-200 text-red-900' }
    };
    const rec = config[recommendation as keyof typeof config] || config.maybe;
    return (
      <Badge className={`${rec.color} text-xs`}>
        {rec.label} ({confidence}%)
      </Badge>
    );
  };

  const handleMoveApplication = (applicationId: string, newStage: string) => {
    setApplications(prev => 
      prev.map(app => 
        app._id === applicationId 
          ? { 
              ...app, 
              pipeline: { 
                ...app.pipeline, 
                currentStage: newStage,
                stageHistory: [
                  ...app.pipeline.stageHistory,
                  {
                    stage: newStage,
                    enteredAt: new Date().toISOString()
                  }
                ]
              }
            }
          : app
      )
    );
    toast.success('Application moved successfully');
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === '' || 
      app.candidate.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesJob = selectedJob === 'all' || app.jobId === selectedJob;
    
    return matchesSearch && matchesJob;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              Application Pipeline
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Track and manage candidate progress through your recruitment pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.color}`} />
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications by candidate name or job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 h-11 border-border focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="j1">Senior Frontend Developer</SelectItem>
                    <SelectItem value="j2">Product Manager</SelectItem>
                    <SelectItem value="j3">UX Designer</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Board */}
        <div className="w-full">
          <div className="overflow-x-auto">
            <div className="flex gap-6 pb-4 w-fit min-w-full">
              {pipelineStages.map((stage) => {
                const stageApplications = getStageApplications(stage.id).filter(app => 
                  filteredApplications.includes(app)
                );
                
                return (
                  <Card key={stage.id} className="min-h-[600px] w-80 flex-shrink-0 border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                          <CardTitle className="text-sm font-semibold">{stage.name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {stageApplications.length}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {stage.description}
                      </CardDescription>
                    </CardHeader>
                  
                  <CardContent className="pt-0 space-y-3">
                    {loading ? (
                      // Loading skeleton
                      Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full" />
                              <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-3/4" />
                                <div className="h-2 bg-gray-200 rounded w-1/2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      stageApplications.map((application) => (
                        <Card 
                          key={application._id} 
                          className="group hover:shadow-md transition-all duration-200 cursor-pointer border border-border"
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Candidate Info */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="relative">
                                  <Avatar className="h-8 w-8">
                                    {application.candidate.profilePicture ? (
                                      <AvatarImage src={application.candidate.profilePicture} />
                                    ) : (
                                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                        {application.candidate.firstName[0]}{application.candidate.lastName[0]}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${getPriorityColor(application.pipeline.priority)}`} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-foreground truncate">
                                    {application.candidate.firstName} {application.candidate.lastName}
                                  </h4>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {application.job.title}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {application.candidate.location}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => toast.success('Viewing candidate profile')}>
                                    <Eye className="h-3 w-3 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toast.success('Scheduling interview')}>
                                    <Calendar className="h-3 w-3 mr-2" />
                                    Schedule Interview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toast.success('Sending email')}>
                                    <Mail className="h-3 w-3 mr-2" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toast.success('Adding note')}>
                                    <MessageSquare className="h-3 w-3 mr-2" />
                                    Add Note
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* AI Insights */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Brain className="h-3 w-3 text-purple-500" />
                                  <span className="text-xs font-medium">AI Match:</span>
                                  <span className="text-xs font-bold text-purple-600">
                                    {application.aiInsights.candidateJobMatch.overallScore}%
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                  {application.candidate.experience}y exp
                                </Badge>
                              </div>
                              
                              {getRecommendationBadge(
                                application.aiInsights.hiringRecommendation.recommendation,
                                application.aiInsights.hiringRecommendation.confidence
                              )}
                            </div>

                            {/* Stage Progress */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  In stage: {Math.floor((Date.now() - new Date(application.pipeline.stageHistory[application.pipeline.stageHistory.length - 1].enteredAt).getTime()) / (1000 * 60 * 60 * 24))} days
                                </span>
                                <span className="text-muted-foreground">
                                  Applied {new Date(application.appliedDate).toLocaleDateString()}
                                </span>
                              </div>
                              
                              {/* Stage Actions */}
                              <div className="flex items-center gap-1 pt-2">
                                {stage.position > 1 && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-6 text-xs px-2"
                                    onClick={() => {
                                      const prevStage = pipelineStages.find(s => s.position === stage.position - 1);
                                      if (prevStage) handleMoveApplication(application._id, prevStage.id);
                                    }}
                                  >
                                    <ArrowLeft className="h-3 w-3" />
                                  </Button>
                                )}
                                {stage.position < pipelineStages.length && (
                                  <Button 
                                    size="sm" 
                                    variant="default" 
                                    className="h-6 text-xs px-2 flex-1"
                                    onClick={() => {
                                      const nextStage = pipelineStages.find(s => s.position === stage.position + 1);
                                      if (nextStage) handleMoveApplication(application._id, nextStage.id);
                                    }}
                                  >
                                    <ArrowRight className="h-3 w-3 mr-1" />
                                    Advance
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                    
                    {!loading && stageApplications.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className={`w-12 h-12 rounded-full ${stage.color} bg-opacity-10 flex items-center justify-center mb-3`}>
                          <Target className={`h-6 w-6 ${stage.color.replace('bg-', 'text-')}`} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No applications in this stage
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
