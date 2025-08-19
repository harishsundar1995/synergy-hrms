import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@clerk/clerk-react';
import { 
  Users, 
  Search, 
  Shield, 
  UserCheck, 
  UserX, 
  RefreshCw,
  AlertCircle 
} from 'lucide-react';

interface User {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  role: string;
  permissions: string[];
  status: string;
  lastLoginAt: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const { toast } = useToast();
  const { getToken } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available. Please sign in.');
      }

      const response = await fetch('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      console.error('Failed to fetch users:', error);
      setError(errorMessage);
      setUsers([]);
      
      toast({
        title: "Error loading users",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available. Please sign in.');
      }

      const response = await fetch(`http://localhost:3001/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.status}`);
      }

      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        )
      );

      toast({
        title: "User role updated",
        description: `Successfully updated user role to ${newRole}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user role';
      console.error('Failed to update user role:', error);
      
      toast({
        title: "Error updating user role",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available. Please sign in.');
      }

      const response = await fetch(`http://localhost:3001/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user status: ${response.status}`);
      }

      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );

      toast({
        title: "User status updated",
        description: `Successfully updated user status to ${newStatus}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user status';
      console.error('Failed to update user status:', error);
      
      toast({
        title: "Error updating user status",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super admin':
        return 'bg-red-100 text-red-800';
      case 'org admin':
        return 'bg-purple-100 text-purple-800';
      case 'hr manager':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-green-100 text-green-800';
      case 'employee':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-gray-600">Manage user roles and permissions</p>
            </div>
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>
          <Button onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" className="ml-2" onClick={fetchUsers}>
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role.includes('Admin')).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === 'inactive').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Super Admin">Super Admin</SelectItem>
              <SelectItem value="Org Admin">Org Admin</SelectItem>
              <SelectItem value="HR Manager">HR Manager</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Employee">Employee</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{user.fullName || `${user.firstName} ${user.lastName}`}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      
                      <Select 
                        value={user.role} 
                        onValueChange={(newRole) => updateUserRole(user._id, newRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Employee">Employee</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="HR Manager">HR Manager</SelectItem>
                          <SelectItem value="Org Admin">Org Admin</SelectItem>
                          <SelectItem value="Super Admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={user.status} 
                        onValueChange={(newStatus) => updateUserStatus(user._id, newStatus)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
