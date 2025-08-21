import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import {
  Target,
  Search,
  Filter,
  Users,
  MapPin,
  Calendar,
  Eye,
  Mail,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Brain,
  Sparkles,
  Briefcase,
  Timer,
  Download,
  BarChart3,
  Star,
  Clock,
  Video,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

interface Application {
  _id: string;
  candidateId: {
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    location: string;
    experience: number;
  };
  jobDescriptionId: {
    title: string;
    department: string;
  };
  pipeline: {
    currentStage: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };
  aiInsights: {
    candidateJobMatch: {
      overallScore: number;
    };
    hiringRecommendation: {
      recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire';
      confidence: number;
    };
  };
  appliedDate: string;
  timeInStage: number; // days
}

const ApplicationPipeline = () => {
  const { getToken } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const pipelineStages = [
    { id: 'applied', name: 'Applied', color: 'text-blue-600 bg-blue-50 border-blue-200', count: 0 },
    {
      id: 'screening',
      name: 'Screening',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      count: 1,
    },
    {
      id: 'interview',
      name: 'Interview',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      count: 1,
    },
    {
      id: 'assessment',
      name: 'Assessment',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      count: 1,
    },
    { id: 'offer', name: 'Offer', color: 'text-green-600 bg-green-50 border-green-200', count: 0 },
    {
      id: 'hired',
      name: 'Hired',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      count: 0,
    },
  ];

  // Mock data
  const mockApplications: Application[] = [
    {
      _id: '1',
      candidateId: {
        firstName: 'Emily',
        lastName: 'Watson',
        email: 'emily.watson@gmail.com',
        location: 'New York, NY',
        experience: 5,
      },
      jobDescriptionId: {
        title: 'Senior Frontend Developer',
        department: 'Engineering',
      },
      pipeline: {
        currentStage: 'screening',
        priority: 'high',
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 75,
        },
        hiringRecommendation: {
          recommendation: 'maybe',
          confidence: 72,
        },
      },
      appliedDate: '2025-08-18',
      timeInStage: 3,
    },
    {
      _id: '2',
      candidateId: {
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@gmail.com',
        location: 'San Francisco, CA',
        experience: 6,
      },
      jobDescriptionId: {
        title: 'Senior Backend Developer',
        department: 'Engineering',
      },
      pipeline: {
        currentStage: 'interview',
        priority: 'high',
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 92,
        },
        hiringRecommendation: {
          recommendation: 'strong_hire',
          confidence: 89,
        },
      },
      appliedDate: '2025-08-15',
      timeInStage: 6,
    },
    {
      _id: '3',
      candidateId: {
        firstName: 'Michael',
        lastName: 'Rodriguez',
        email: 'michael.r@gmail.com',
        location: 'Austin, TX',
        experience: 8,
      },
      jobDescriptionId: {
        title: 'Senior Product Manager',
        department: 'Product',
      },
      pipeline: {
        currentStage: 'assessment',
        priority: 'medium',
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 88,
        },
        hiringRecommendation: {
          recommendation: 'hire',
          confidence: 85,
        },
      },
      appliedDate: '2025-08-12',
      timeInStage: 5,
    },
    {
      _id: '4',
      candidateId: {
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex.johnson@gmail.com',
        location: 'Seattle, WA',
        experience: 3,
      },
      jobDescriptionId: {
        title: 'Frontend Developer',
        department: 'Engineering',
      },
      pipeline: {
        currentStage: 'applied',
        priority: 'medium',
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 68,
        },
        hiringRecommendation: {
          recommendation: 'maybe',
          confidence: 65,
        },
      },
      appliedDate: '2025-08-20',
      timeInStage: 1,
    },
    {
      _id: '5',
      candidateId: {
        firstName: 'Jessica',
        lastName: 'Martinez',
        email: 'jessica.martinez@gmail.com',
        location: 'Austin, TX',
        experience: 4,
      },
      jobDescriptionId: {
        title: 'UX Designer',
        department: 'Design',
      },
      pipeline: {
        currentStage: 'applied',
        priority: 'low',
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 71,
        },
        hiringRecommendation: {
          recommendation: 'hire',
          confidence: 78,
        },
      },
      appliedDate: '2025-08-19',
      timeInStage: 2,
    },
    {
      _id: '6',
      candidateId: {
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@gmail.com',
        location: 'Los Angeles, CA',
        experience: 7,
      },
      jobDescriptionId: {
        title: 'Senior DevOps Engineer',
        department: 'Engineering',
      },
      pipeline: {
        currentStage: 'screening',
        priority: 'urgent',
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 89,
        },
        hiringRecommendation: {
          recommendation: 'strong_hire',
          confidence: 94,
        },
      },
      appliedDate: '2025-08-17',
      timeInStage: 4,
    },
    {
      _id: '7',
      candidateId: {
        firstName: 'Rachel',
        lastName: 'Thompson',
        email: 'rachel.thompson@gmail.com',
        location: 'Chicago, IL',
        experience: 5,
      },
      jobDescriptionId: {
        title: 'Product Manager',
        department: 'Product',
      },
      pipeline: {
        currentStage: 'interview',
        priority: 'high',
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 83,
        },
        hiringRecommendation: {
          recommendation: 'hire',
          confidence: 81,
        },
      },
      appliedDate: '2025-08-15',
      timeInStage: 6,
    },
    {
      _id: '8',
      candidateId: {
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@gmail.com',
        location: 'Boston, MA',
        experience: 6,
      },
      jobDescriptionId: {
        title: 'Data Scientist',
        department: 'Analytics',
      },
      pipeline: {
        currentStage: 'assessment',
        priority: 'medium',
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 91,
        },
        hiringRecommendation: {
          recommendation: 'strong_hire',
          confidence: 88,
        },
      },
      appliedDate: '2025-08-10',
      timeInStage: 11,
    },
    {
      _id: '9',
      candidateId: {
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@gmail.com',
        location: 'Denver, CO',
        experience: 4,
      },
      jobDescriptionId: {
        title: 'Marketing Manager',
        department: 'Marketing',
      },
      pipeline: {
        currentStage: 'offer',
        priority: 'urgent',
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 87,
        },
        hiringRecommendation: {
          recommendation: 'strong_hire',
          confidence: 92,
        },
      },
      appliedDate: '2025-08-05',
      timeInStage: 16,
    },
    {
      _id: '10',
      candidateId: {
        firstName: 'Kevin',
        lastName: 'Brown',
        email: 'kevin.brown@gmail.com',
        location: 'Miami, FL',
        experience: 8,
      },
      jobDescriptionId: {
        title: 'Senior Sales Manager',
        department: 'Sales',
      },
      pipeline: {
        currentStage: 'hired',
        priority: 'medium',
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 95,
        },
        hiringRecommendation: {
          recommendation: 'strong_hire',
          confidence: 97,
        },
      },
      appliedDate: '2025-07-28',
      timeInStage: 24,
    },
    {
      _id: '11',
      candidateId: {
        firstName: 'Amanda',
        lastName: 'Davis',
        email: 'amanda.davis@gmail.com',
        location: 'Portland, OR',
        experience: 3,
      },
      jobDescriptionId: {
        title: 'Junior Designer',
        department: 'Design',
      },
      pipeline: {
        currentStage: 'screening',
        priority: 'low',
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 74,
        },
        hiringRecommendation: {
          recommendation: 'hire',
          confidence: 76,
        },
      },
      appliedDate: '2025-08-16',
      timeInStage: 5,
    },
    {
      _id: '12',
      candidateId: {
        firstName: 'Robert',
        lastName: 'Garcia',
        email: 'robert.garcia@gmail.com',
        location: 'Phoenix, AZ',
        experience: 9,
      },
      jobDescriptionId: {
        title: 'Engineering Manager',
        department: 'Engineering',
      },
      pipeline: {
        currentStage: 'interview',
        priority: 'urgent',
      },
      aiInsights: {
        candidateJobMatch: {
          overallScore: 88,
        },
        hiringRecommendation: {
          recommendation: 'strong_hire',
          confidence: 90,
        },
      },
      appliedDate: '2025-08-13',
      timeInStage: 8,
    },
  ];

  const fetchApplications = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApplications(mockApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStageApplications = (stageId: string) => {
    return applications.filter(app => app.pipeline.currentStage === stageId);
  };

  const handleMoveApplication = async (
    applicationId: string,
    direction: 'forward' | 'backward'
  ) => {
    toast.success(
      `Application ${direction === 'forward' ? 'advanced' : 'moved back'} successfully`
    );
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-4 border-gray-500 bg-gray-50';
      default:
        return 'border-l-4 border-gray-300 bg-white';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_hire':
        return <Star className="w-4 h-4 text-green-600" />;
      case 'hire':
        return <Sparkles className="w-4 h-4 text-blue-600" />;
      case 'maybe':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'no_hire':
        return <MoreHorizontal className="w-4 h-4 text-red-600" />;
      case 'strong_no_hire':
        return <MoreHorizontal className="w-4 h-4 text-red-700" />;
      default:
        return <Brain className="w-4 h-4 text-gray-600" />;
    }
  };

  const stats = [
    {
      label: 'Active Applications',
      value: '347',
      change: '+12%',
      changeColor: 'text-green-600',
      icon: Target,
    },
    {
      label: 'Interview Success Rate',
      value: '78%',
      change: '+5%',
      changeColor: 'text-green-600',
      icon: Video,
    },
    {
      label: 'Avg. Time to Hire',
      value: '18 days',
      change: '-2 days',
      changeColor: 'text-green-600',
      icon: Clock,
    },
    {
      label: 'AI Match Score',
      value: '85%',
      change: '+3%',
      changeColor: 'text-green-600',
      icon: Brain,
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Application Tracker</h1>
              <p className="text-gray-600 mt-2">
                Manage and track candidates through your hiring pipeline
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-300 text-gray-700">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <span className={`text-sm font-medium ${stat.changeColor}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="mb-8 border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search applications by candidate name or job title..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger className="w-48 border-gray-300">
                    <SelectValue placeholder="All Jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="frontend">Frontend Developer</SelectItem>
                    <SelectItem value="backend">Backend Developer</SelectItem>
                    <SelectItem value="product">Product Manager</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-gray-300 text-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Board - Only this section scrolls horizontally */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 w-full overflow-hidden">
            <div className="overflow-x-auto w-full">
              <div className="flex gap-6 pb-4" style={{ minWidth: 'fit-content' }}>
                {pipelineStages.map(stage => {
                  const stageApplications = getStageApplications(stage.id);
                  const stageCount = stageApplications.length;

                  return (
                    <div key={stage.id} className="w-80 flex-shrink-0">
                      <Card className="bg-white border-gray-200 min-h-[600px] shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-4 h-4 rounded-full ${stage.color.split(' ')[1]}`}
                              />
                              <CardTitle className="text-lg font-semibold text-gray-900">
                                {stage.name}
                              </CardTitle>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-white border text-gray-700 text-sm px-3 py-1.5 font-medium"
                            >
                              {stageCount}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm text-gray-500 mt-2 ml-7">
                            {stage.id === 'applied' && 'New applications'}
                            {stage.id === 'screening' && 'Initial review'}
                            {stage.id === 'interview' && 'Interview rounds'}
                            {stage.id === 'assessment' && 'Skills evaluation'}
                            {stage.id === 'offer' && 'Offer stage'}
                            {stage.id === 'hired' && 'Successful hires'}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                          {loading ? (
                            Array.from({ length: 2 }).map((_, i) => (
                              <div key={i} className="animate-pulse">
                                <div className="bg-gray-100 rounded-lg p-4">
                                  <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : stageApplications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-500 font-medium mb-1">
                                No applications
                              </p>
                              <p className="text-xs text-gray-400">in this stage</p>
                            </div>
                          ) : (
                            stageApplications.map(application => {
                              const isExpanded = expandedCards.has(application._id);

                              return (
                                <Card
                                  key={application._id}
                                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${getPriorityColor(application.pipeline.priority)}`}
                                >
                                  <CardContent className="p-4">
                                    {/* Always visible header */}
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center space-x-3 flex-1">
                                        <Avatar className="h-10 w-10">
                                          <AvatarImage
                                            src={application.candidateId?.profilePicture}
                                          />
                                          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-sm">
                                            {application.candidateId?.firstName?.[0]}
                                            {application.candidateId?.lastName?.[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                                            {application.candidateId?.firstName}{' '}
                                            {application.candidateId?.lastName}
                                          </h4>
                                          <p className="text-xs text-gray-600 truncate">
                                            {application.candidateId?.email}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {application.jobDescriptionId?.title}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 hover:bg-gray-100"
                                          onClick={() => toggleCardExpansion(application._id)}
                                        >
                                          {isExpanded ? (
                                            <ChevronUp className="h-3 w-3" />
                                          ) : (
                                            <ChevronDown className="h-3 w-3" />
                                          )}
                                        </Button>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 hover:bg-gray-100"
                                            >
                                              <MoreHorizontal className="h-3 w-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                              <Eye className="mr-2 h-4 w-4" />
                                              View Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                              <Mail className="mr-2 h-4 w-4" />
                                              Send Email
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                              <MessageSquare className="mr-2 h-4 w-4" />
                                              Add Note
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>

                                    {/* Always visible action buttons */}
                                    <div className="flex gap-2 mb-3">
                                      {stage.id !== 'applied' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 px-3 text-xs flex-1 hover:bg-gray-50"
                                          onClick={() =>
                                            handleMoveApplication(application._id, 'backward')
                                          }
                                        >
                                          <ArrowLeft className="w-3 h-3 mr-1" />
                                          Back
                                        </Button>
                                      )}
                                      {stage.id !== 'hired' && (
                                        <Button
                                          size="sm"
                                          className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white flex-1"
                                          onClick={() =>
                                            handleMoveApplication(application._id, 'forward')
                                          }
                                        >
                                          <span>Advance</span>
                                          <ArrowRight className="w-3 h-3 ml-1" />
                                        </Button>
                                      )}
                                    </div>

                                    {/* Collapsible details */}
                                    {isExpanded && (
                                      <div className="space-y-3 pt-3 border-t border-gray-100">
                                        <div>
                                          <p className="text-xs text-gray-600">
                                            {application.jobDescriptionId?.department}
                                          </p>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                          <MapPin className="w-3 h-3" />
                                          {application.candidateId?.location}
                                          <span>•</span>
                                          <Briefcase className="w-3 h-3" />
                                          {application.candidateId?.experience}y exp
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                          <Calendar className="w-3 h-3" />
                                          Applied{' '}
                                          {new Date(application.appliedDate).toLocaleDateString()}
                                          <span>•</span>
                                          <Timer className="w-3 h-3" />
                                          {application.timeInStage}d in stage
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={`text-xs px-2 py-1 rounded-full font-medium ${getMatchScoreColor(application.aiInsights?.candidateJobMatch?.overallScore || 0)}`}
                                            >
                                              {application.aiInsights?.candidateJobMatch
                                                ?.overallScore || 0}
                                              % match
                                            </span>
                                            {getRecommendationIcon(
                                              application.aiInsights?.hiringRecommendation
                                                ?.recommendation || 'maybe'
                                            )}
                                          </div>
                                          <Badge
                                            variant="outline"
                                            className="text-xs capitalize font-medium"
                                          >
                                            {application.pipeline.priority}
                                          </Badge>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationPipeline;
