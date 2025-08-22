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
  Search,
  Filter,
  TrendingUp,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  Share,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Star,
  StarOff,
  Mail,
  Phone,
  Linkedin,
  FileText,
  Award,
  Target,
  Brain,
  Sparkles,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Video,
  ThumbsUp,
  ThumbsDown,
  Upload,
  RefreshCw
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

interface Candidate {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location: {
      city: string;
      state: string;
      country: string;
    };
    linkedinUrl?: string;
    profilePicture?: string;
  };
  experience: {
    totalYears: number;
    currentRole?: {
      title: string;
      company: string;
      current: boolean;
    };
  };
  skills: {
    technical: Array<{
      name: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }>;
  };
  aiAnalysis: {
    profileScore: number;
    resumeAnalysis?: {
      experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
      keyStrengths: string[];
    };
  };
  status: 'active' | 'passive' | 'not_interested' | 'hired' | 'archived';
  starred: boolean;
  tags: string[];
  createdAt: string;
  lastContactedAt?: string;
}

export default function Candidates() {
  const { getToken } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    experienceLevel: 'all',
    location: 'all',
    skills: 'all',
    starred: false
  });
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for development
  const mockCandidates: Candidate[] = [
    {
      _id: '1',
      personalInfo: {
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@email.com',
        phone: '+1 (555) 123-4567',
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'United States'
        },
        linkedinUrl: 'https://linkedin.com/in/sarah-chen',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b193?w=150&h=150&fit=crop&crop=face'
      },
      experience: {
        totalYears: 5,
        currentRole: {
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
          current: true
        }
      },
      skills: {
        technical: [
          { name: 'React', level: 'advanced' },
          { name: 'TypeScript', level: 'advanced' },
          { name: 'Python', level: 'intermediate' },
          { name: 'AWS', level: 'intermediate' }
        ]
      },
      aiAnalysis: {
        profileScore: 92,
        resumeAnalysis: {
          experienceLevel: 'senior',
          keyStrengths: ['Frontend Development', 'Team Leadership', 'Agile Methodologies']
        }
      },
      status: 'active',
      starred: true,
      tags: ['frontend', 'react', 'senior'],
      createdAt: '2024-01-15T10:30:00Z',
      lastContactedAt: '2024-01-18T14:20:00Z'
    },
    {
      _id: '2',
      personalInfo: {
        firstName: 'Michael',
        lastName: 'Rodriguez',
        email: 'michael.rodriguez@email.com',
        phone: '+1 (555) 987-6543',
        location: {
          city: 'Austin',
          state: 'TX',
          country: 'United States'
        },
        linkedinUrl: 'https://linkedin.com/in/michael-rodriguez'
      },
      experience: {
        totalYears: 8,
        currentRole: {
          title: 'Product Manager',
          company: 'Innovation Labs',
          current: true
        }
      },
      skills: {
        technical: [
          { name: 'Product Strategy', level: 'expert' },
          { name: 'Data Analysis', level: 'advanced' },
          { name: 'SQL', level: 'intermediate' },
          { name: 'Figma', level: 'intermediate' }
        ]
      },
      aiAnalysis: {
        profileScore: 88,
        resumeAnalysis: {
          experienceLevel: 'senior',
          keyStrengths: ['Product Strategy', 'Cross-functional Leadership', 'Data-driven Decisions']
        }
      },
      status: 'passive',
      starred: false,
      tags: ['product', 'strategy', 'leadership'],
      createdAt: '2024-01-10T09:15:00Z'
    },
    {
      _id: '3',
      personalInfo: {
        firstName: 'Emily',
        lastName: 'Watson',
        email: 'emily.watson@email.com',
        location: {
          city: 'New York',
          state: 'NY',
          country: 'United States'
        }
      },
      experience: {
        totalYears: 3,
        currentRole: {
          title: 'UX Designer',
          company: 'Design Studio',
          current: true
        }
      },
      skills: {
        technical: [
          { name: 'Figma', level: 'advanced' },
          { name: 'User Research', level: 'advanced' },
          { name: 'Prototyping', level: 'intermediate' },
          { name: 'HTML/CSS', level: 'intermediate' }
        ]
      },
      aiAnalysis: {
        profileScore: 85,
        resumeAnalysis: {
          experienceLevel: 'mid',
          keyStrengths: ['User Experience Design', 'Design Systems', 'User Research']
        }
      },
      status: 'active',
      starred: false,
      tags: ['design', 'ux', 'research'],
      createdAt: '2024-01-12T11:45:00Z',
      lastContactedAt: '2024-01-16T16:30:00Z'
    }
  ];

  const stats = [
    {
      title: "Total Candidates",
      value: "2,847",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Active Applications",
      value: "486",
      change: "+8%",
      trend: "up",
      icon: FileText,
      color: "bg-green-500"
    },
    {
      title: "Interview Ready",
      value: "94",
      change: "+15%",
      trend: "up",
      icon: Video,
      color: "bg-purple-500"
    },
    {
      title: "AI Match Score",
      value: "87%",
      change: "+3%",
      trend: "up",
      icon: Brain,
      color: "bg-orange-500"
    }
  ];

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const params = new URLSearchParams({
        search: searchQuery,
        ...(selectedFilters.status !== 'all' && { status: selectedFilters.status }),
        ...(selectedFilters.experienceLevel !== 'all' && { experience: selectedFilters.experienceLevel }),
        ...(selectedFilters.location !== 'all' && { location: selectedFilters.location }),
        page: '1',
        limit: '20'
      });

      const response = await fetch(`http://localhost:3001/api/candidates?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates(data.data.candidates);
        console.log('✅ Candidates loaded from API:', data.data.candidates.length);
      } else {
        throw new Error('Failed to fetch candidates');
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Failed to load candidates - using demo data');
      // Fallback to mock data if API fails
      setCandidates(mockCandidates);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      passive: { label: 'Passive', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      not_interested: { label: 'Not Interested', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
      hired: { label: 'Hired', variant: 'default' as const, color: 'bg-purple-100 text-purple-800' },
      archived: { label: 'Archived', variant: 'outline' as const, color: 'bg-gray-100 text-gray-600' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getExperienceLevelBadge = (level: string) => {
    const levelConfig = {
      entry: { label: 'Entry Level', color: 'bg-green-100 text-green-800' },
      mid: { label: 'Mid Level', color: 'bg-blue-100 text-blue-800' },
      senior: { label: 'Senior', color: 'bg-purple-100 text-purple-800' },
      executive: { label: 'Executive', color: 'bg-orange-100 text-orange-800' }
    };
    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.mid;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getProfileScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStarCandidate = (candidateId: string) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate._id === candidateId 
          ? { ...candidate, starred: !candidate.starred }
          : candidate
      )
    );
    toast.success('Candidate updated');
  };

  const handleBulkAction = (action: string) => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select candidates first');
      return;
    }
    
    switch (action) {
      case 'email':
        toast.success(`Sending email to ${selectedCandidates.length} candidates`);
        break;
      case 'tag':
        toast.success(`Adding tags to ${selectedCandidates.length} candidates`);
        break;
      case 'move':
        toast.success(`Moving ${selectedCandidates.length} candidates to pipeline`);
        break;
      case 'archive':
        setCandidates(prev => 
          prev.map(candidate => 
            selectedCandidates.includes(candidate._id)
              ? { ...candidate, status: 'archived' as const }
              : candidate
          )
        );
        toast.success(`Archived ${selectedCandidates.length} candidates`);
        break;
    }
    setSelectedCandidates([]);
    setShowBulkActions(false);
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchQuery === '' || 
      candidate.personalInfo?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.personalInfo?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.personalInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.experience?.currentRole?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills?.technical?.some(skill => skill.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = selectedFilters.status === 'all' || candidate.status === selectedFilters.status;
    const matchesExperience = selectedFilters.experienceLevel === 'all' || 
      candidate.aiAnalysis?.resumeAnalysis?.experienceLevel === selectedFilters.experienceLevel;
    const matchesStarred = !selectedFilters.starred || candidate.starred;
    
    return matchesSearch && matchesStatus && matchesExperience && matchesStarred;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Candidate Management
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Discover, evaluate, and manage top talent with intelligent candidate insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Candidates
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Candidate
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
                    placeholder="Search candidates by name, email, skills, or position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 h-11 border-border focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Select value={selectedFilters.status} onValueChange={(value) => 
                  setSelectedFilters(prev => ({ ...prev, status: value }))
                }>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="passive">Passive</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedFilters.experienceLevel} onValueChange={(value) => 
                  setSelectedFilters(prev => ({ ...prev, experienceLevel: value }))
                }>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={selectedFilters.starred ? "default" : "outline"}
                  onClick={() => setSelectedFilters(prev => ({ ...prev, starred: !prev.starred }))}
                  className="gap-2"
                >
                  <Star className="h-4 w-4" />
                  Starred Only
                </Button>

                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedCandidates.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {selectedCandidates.length} candidate(s) selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('email')} className="gap-2">
                    <Mail className="h-4 w-4" />
                    Send Email
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('tag')} className="gap-2">
                    <Target className="h-4 w-4" />
                    Add Tags
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('move')} className="gap-2">
                    <Briefcase className="h-4 w-4" />
                    Move to Job
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Archive
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setSelectedCandidates([])}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Candidate List */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => (
                <Card 
                  key={candidate._id} 
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header with Avatar and Basic Info */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                              {candidate.personalInfo?.profilePicture ? (
                                <AvatarImage src={candidate.personalInfo.profilePicture} />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                  {candidate.personalInfo?.firstName?.[0] || 'U'}{candidate.personalInfo?.lastName?.[0] || 'U'}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1">
                              <div className={`w-4 h-4 rounded-full border-2 border-white ${
                                candidate.status === 'active' ? 'bg-green-500' :
                                candidate.status === 'passive' ? 'bg-blue-500' :
                                candidate.status === 'hired' ? 'bg-purple-500' : 'bg-gray-400'
                              }`} />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground truncate">
                                {candidate.personalInfo?.firstName || 'Unknown'} {candidate.personalInfo?.lastName || 'User'}
                              </h3>
                              {candidate.starred && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {candidate.experience?.currentRole?.title} at {candidate.experience?.currentRole?.company}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {candidate.personalInfo?.location?.city || 'Unknown'}, {candidate.personalInfo?.location?.state || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStarCandidate(candidate._id);
                            }}
                          >
                            {candidate.starred ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* AI Score and Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">AI Match:</span>
                          <span className={`text-sm font-bold ${getProfileScoreColor(candidate.aiAnalysis?.profileScore || 0)}`}>
                            {candidate.aiAnalysis?.profileScore || 0}%
                          </span>
                        </div>
                        {getStatusBadge(candidate.status)}
                      </div>

                      {/* Experience and Level */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">
                            {candidate.experience?.totalYears || 0} years exp.
                          </span>
                        </div>
                        {candidate.aiAnalysis?.resumeAnalysis?.experienceLevel && 
                          getExperienceLevelBadge(candidate.aiAnalysis.resumeAnalysis.experienceLevel)
                        }
                      </div>

                      {/* Top Skills */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Top Skills:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills?.technical?.slice(0, 3).map((skill, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {skill.name}
                            </Badge>
                          ))}
                          {candidate.skills?.technical && candidate.skills.technical.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              +{candidate.skills.technical.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Key Strengths from AI */}
                      {candidate.aiAnalysis?.resumeAnalysis?.keyStrengths && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">AI Insights:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {candidate.aiAnalysis.resumeAnalysis.keyStrengths.slice(0, 2).map((strength, index) => (
                              <Badge 
                                key={index} 
                                className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200"
                              >
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact Information */}
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button size="sm" variant="outline" className="gap-1 h-8">
                              <Mail className="h-3 w-3" />
                              Email
                            </Button>
                            {candidate.personalInfo?.phone && (
                              <Button size="sm" variant="outline" className="gap-1 h-8">
                                <Phone className="h-3 w-3" />
                                Call
                              </Button>
                            )}
                            {candidate.personalInfo?.linkedinUrl && (
                              <Button size="sm" variant="outline" className="gap-1 h-8">
                                <Linkedin className="h-3 w-3" />
                                LinkedIn
                              </Button>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Last Activity */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Added {new Date(candidate.createdAt).toLocaleDateString()}
                        </div>
                        {candidate.lastContactedAt && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Last contact {new Date(candidate.lastContactedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredCandidates.length === 0 && !loading && (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No candidates found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedFilters.status !== 'all' || selectedFilters.experienceLevel !== 'all' || selectedFilters.starred
                    ? 'Try adjusting your search criteria or filters.'
                    : 'Start building your talent pipeline by adding candidates.'}
                </p>
                <Button className="gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Add First Candidate
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
