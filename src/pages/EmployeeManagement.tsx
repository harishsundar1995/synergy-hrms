import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Plus, Filter, Download, Mail, Phone, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@clerk/clerk-react';

interface Employee {
  _id: string;
  employeeId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  employment: {
    position: string;
    level: string;
    status: string;
    workLocation: string;
    startDate: string;
  };
  organizationId?: {
    name: string;
  };
  departmentId?: {
    name: string;
  };
  skills?: {
    technical: string[];
    soft: string[];
  };
  wellbeing?: {
    burnoutRisk?: string;
    jobSatisfaction?: number;
  };
}

interface EmployeeStats {
  totals: {
    total: number;
    active: number;
    inactive: number;
  };
  breakdowns: {
    byDepartment: Array<{ _id: string; count: number }>;
    byLevel: Array<{ _id: string; count: number }>;
  };
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const { getToken } = useAuth();

  const ITEMS_PER_PAGE = 10;

  // API calls
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      setError(null);
      
      // Get Clerk authentication token
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available. Please sign in.');
      }
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedDepartment && selectedDepartment !== 'all' && { department: selectedDepartment }),
        ...(selectedStatus && selectedStatus !== 'all' && { status: selectedStatus })
      });

      const response = await fetch(`http://localhost:3001/api/employees?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized access. Please check your authentication.');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found. Please check if the backend server is running.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      setEmployees(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employees';
      console.error('Failed to fetch employees:', error);
      setError(errorMessage);
      setEmployees([]);
      setTotalPages(1);
      
      toast({
        title: "Error loading employees",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setError(null);
      
      // Get Clerk authentication token
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available. Please sign in.');
      }
      
      const response = await fetch('http://localhost:3001/api/employees/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized access to stats');
        } else if (response.status === 404) {
          throw new Error('Stats API endpoint not found');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stats';
      console.error('Failed to fetch stats:', error);
      setError(errorMessage);
      setStats({
        totals: { total: 0, active: 0, inactive: 0 },
        breakdowns: { byDepartment: [], byLevel: [] }
      });
      
      toast({
        title: "Error loading statistics",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchEmployees();
    fetchStats();
  };

  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, [currentPage, searchTerm, selectedDepartment, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'onLeave': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'intern': return 'bg-blue-100 text-blue-800';
      case 'junior': return 'bg-indigo-100 text-indigo-800';
      case 'mid': return 'bg-purple-100 text-purple-800';
      case 'senior': return 'bg-orange-100 text-orange-800';
      case 'lead': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-green-100 text-green-800';
      case 'director': return 'bg-yellow-100 text-yellow-800';
      case 'executive': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBurnoutRiskColor = (risk?: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      employee.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || selectedDepartment === 'all' || employee.departmentId?.name === selectedDepartment;
    const matchesStatus = !selectedStatus || selectedStatus === 'all' || employee.employment.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Employee Management</h1>
            <p className="text-gray-600">Manage your workforce and employee data</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRetry} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={handleRetry} disabled={loading}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold">{stats.totals.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totals.active}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Departments</p>
                  <p className="text-2xl font-bold">{stats.breakdowns.byDepartment.length}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-purple-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Satisfaction</p>
                  <p className="text-2xl font-bold">8.0</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Human Resources">Human Resources</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="onLeave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <div key={employee._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {employee.personalInfo.firstName[0]}{employee.personalInfo.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {employee.employeeId}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">{employee.employment.position}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.personalInfo.email}
                        </div>
                        {employee.personalInfo.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {employee.personalInfo.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {employee.employment.workLocation}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(employee.employment.status)}>
                        {employee.employment.status}
                      </Badge>
                      <Badge className={getLevelColor(employee.employment.level)}>
                        {employee.employment.level}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-500">{employee.departmentId?.name || 'No Department'}</span>
                      {employee.wellbeing?.burnoutRisk && (
                        <Badge className={getBurnoutRiskColor(employee.wellbeing.burnoutRisk)} variant="outline">
                          {employee.wellbeing.burnoutRisk} risk
                        </Badge>
                      )}
                    </div>
                    
                    {employee.wellbeing?.jobSatisfaction && (
                      <div className="text-xs text-gray-500">
                        Satisfaction: {employee.wellbeing.jobSatisfaction}/10
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No employees found matching your criteria.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
};

export default EmployeeManagement;
