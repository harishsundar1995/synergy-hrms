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
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  Phone,
  Building,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  Send,
  Filter,
  Search,
  MoreHorizontal,
  CalendarDays,
  Timer,
  UserCheck,
  Zap
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

interface Interview {
  _id: string;
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  job: {
    _id: string;
    title: string;
    department: string;
  };
  type: 'phone' | 'video' | 'in_person' | 'panel' | 'technical' | 'behavioral' | 'final';
  round: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  scheduledAt: string;
  duration: number; // minutes
  location?: string;
  meetingLink?: string;
  interviewers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }>;
  notes?: string;
  feedback?: {
    overall: string;
    strengths: string[];
    concerns: string[];
    recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire';
  };
  createdAt: string;
}

const InterviewScheduling = () => {
  const { getToken } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  // Mock data for development
  const mockInterviews: Interview[] = [
    {
      _id: '1',
      candidate: {
        _id: '1',
        firstName: 'Emily',
        lastName: 'Watson',
        email: 'emily.watson@email.com',
        profilePicture: null
      },
      job: {
        _id: '1',
        title: 'Senior Frontend Developer',
        department: 'Engineering'
      },
      type: 'video',
      round: 1,
      status: 'scheduled',
      scheduledAt: '2024-08-22T14:00:00Z',
      duration: 60,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      interviewers: [
        {
          _id: '1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@company.com',
          role: 'Engineering Manager'
        }
      ],
      notes: 'Technical interview focusing on React and TypeScript',
      createdAt: '2024-08-20T10:00:00Z'
    },
    {
      _id: '2',
      candidate: {
        _id: '2',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@email.com',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b193?w=150&h=150&fit=crop&crop=face'
      },
      job: {
        _id: '2',
        title: 'Senior Backend Developer',
        department: 'Engineering'
      },
      type: 'panel',
      round: 2,
      status: 'completed',
      scheduledAt: '2024-08-21T10:30:00Z',
      duration: 90,
      location: 'Conference Room A',
      interviewers: [
        {
          _id: '2',
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@company.com',
          role: 'Senior Developer'
        },
        {
          _id: '3',
          firstName: 'Bob',
          lastName: 'Wilson',
          email: 'bob.wilson@company.com',
          role: 'Tech Lead'
        }
      ],
      feedback: {
        overall: 'Excellent candidate with strong technical skills',
        strengths: ['Deep knowledge of Python', 'Great problem-solving skills', 'Good communication'],
        concerns: ['Limited experience with microservices'],
        recommendation: 'strong_hire'
      },
      createdAt: '2024-08-19T15:30:00Z'
    },
    {
      _id: '3',
      candidate: {
        _id: '3',
        firstName: 'Michael',
        lastName: 'Rodriguez',
        email: 'michael.rodriguez@email.com'
      },
      job: {
        _id: '3',
        title: 'Senior Product Manager',
        department: 'Product'
      },
      type: 'behavioral',
      round: 1,
      status: 'scheduled',
      scheduledAt: '2024-08-23T16:00:00Z',
      duration: 45,
      meetingLink: 'https://zoom.us/j/123456789',
      interviewers: [
        {
          _id: '4',
          firstName: 'Lisa',
          lastName: 'Davis',
          email: 'lisa.davis@company.com',
          role: 'VP Product'
        }
      ],
      notes: 'Focus on product strategy and leadership experience',
      createdAt: '2024-08-20T09:15:00Z'
    }
  ];

  const stats = [
    {
      title: "Today's Interviews",
      value: "5",
      change: "+2",
      icon: CalendarDays,
      color: "text-blue-600"
    },
    {
      title: "This Week",
      value: "18",
      change: "+3",
      icon: Timer,
      color: "text-green-600"
    },
    {
      title: "Completion Rate",
      value: "94%",
      change: "+5%",
      icon: CheckCircle,
      color: "text-purple-600"
    },
    {
      title: "Avg Duration",
      value: "62 min",
      change: "-8 min",
      icon: Clock,
      color: "text-orange-600"
    }
  ];

  const loadInterviews = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get auth token
      const token = await getToken();
      
      // Try real API first
      try {
        const response = await fetch('http://localhost:3001/api/interviews', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setInterviews(data.interviews || data);
          return;
        }
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
      }
      
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      setInterviews(mockInterviews);
      
    } catch (error) {
      console.error('Error loading interviews:', error);
      toast.error('Failed to load interviews');
      // Use mock data as final fallback
      setInterviews(mockInterviews);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Calendar },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: X },
      no_show: { label: 'No Show', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const IconComponent = config.icon;
    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'in_person': return <Building className="w-4 h-4" />;
      case 'panel': return <Users className="w-4 h-4" />;
      case 'technical': return <Zap className="w-4 h-4" />;
      case 'behavioral': return <UserCheck className="w-4 h-4" />;
      case 'final': return <CheckCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = searchQuery === '' || 
      interview.candidate?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.candidate?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Interview Management</h1>
                  <p className="text-gray-600 mt-1">Schedule and track all candidate interviews</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  <Zap className="w-3 h-3 mr-1" />
                  Smart Scheduling
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="text-gray-600">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filters */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by candidate name or job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 border-gray-300">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Interviews List */}
          <div className="space-y-4">
            {loading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-white border-gray-200 animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredInterviews.length === 0 ? (
              // Empty state
              <Card className="bg-white border-gray-200">
                <CardContent className="p-12 text-center">
                  <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Schedule your first interview to get started'
                    }
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Interviews
              filteredInterviews.map((interview) => {
                const dateTime = formatDateTime(interview.scheduledAt);
                
                return (
                  <Card key={interview._id} className="bg-white border-gray-200 hover:border-gray-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Candidate Avatar */}
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            {interview.candidate?.profilePicture ? (
                              <AvatarImage src={interview.candidate.profilePicture} />
                            ) : (
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                                {interview.candidate?.firstName?.[0] || '?'}{interview.candidate?.lastName?.[0] || '?'}
                              </AvatarFallback>
                            )}
                          </Avatar>

                          {/* Interview Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {interview.candidate?.firstName || 'Unknown'} {interview.candidate?.lastName || 'Candidate'}
                                </h3>
                                <p className="text-gray-600 text-sm mt-0.5">
                                  {interview.job?.title || 'No Title'} • {interview.job?.department || 'No Department'}
                                </p>
                              </div>
                              {getStatusBadge(interview.status)}
                            </div>

                            {/* Interview Info */}
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                {getInterviewTypeIcon(interview.type)}
                                <span className="capitalize">{interview.type?.replace('_', ' ') || 'Unknown Type'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{dateTime.date}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{dateTime.time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Timer className="w-4 h-4" />
                                <span>{interview.duration} min</span>
                              </div>
                            </div>

                            {/* Interviewers */}
                            <div className="flex items-center space-x-2 mt-3">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {interview.interviewers.map(i => `${i.firstName} ${i.lastName}`).join(', ')}
                              </span>
                            </div>

                            {/* Location/Link */}
                            {(interview.location || interview.meetingLink) && (
                              <div className="flex items-center space-x-2 mt-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {interview.location || 'Video call'}
                                </span>
                              </div>
                            )}

                            {/* Feedback (if completed) */}
                            {interview.feedback && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Interview Feedback</span>
                                  <Badge className={
                                    interview.feedback?.recommendation === 'strong_hire' ? 'bg-green-100 text-green-800' :
                                    interview.feedback?.recommendation === 'hire' ? 'bg-blue-100 text-blue-800' :
                                    interview.feedback?.recommendation === 'maybe' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {interview.feedback?.recommendation?.replace('_', ' ') || 'No recommendation'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{interview.feedback?.overall || 'No feedback available'}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {interview.status === 'scheduled' && (
                            <>
                              {interview.meetingLink && (
                                <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                                  <Video className="w-4 h-4 mr-1" />
                                  Join
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="text-gray-600">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </>
                          )}
                          
                          {interview.status === 'completed' && !interview.feedback && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Add Feedback
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="w-4 h-4 mr-2" />
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Interview
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewScheduling;
