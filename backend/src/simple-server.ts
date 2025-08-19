import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// Mock employee data for testing
const mockEmployees = [
  {
    _id: '68a43a11f6c7ca053fa9f7d0',
    employeeId: 'EMP001',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@techcorp.com',
      phone: '+1-555-0123'
    },
    employment: {
      position: 'Senior Software Engineer',
      level: 'senior',
      status: 'active',
      workLocation: 'hybrid',
      startDate: '2023-01-15T00:00:00.000Z'
    },
    organizationId: { name: 'TechCorp Solutions' },
    departmentId: { name: 'Engineering' }
  },
  {
    _id: '68a43a11f6c7ca053fa9f7d1',
    employeeId: 'EMP002',
    personalInfo: {
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'sarah.smith@techcorp.com',
      phone: '+1-555-0456'
    },
    employment: {
      position: 'Marketing Manager',
      level: 'mid',
      status: 'active',
      workLocation: 'onsite',
      startDate: '2023-06-01T00:00:00.000Z'
    },
    organizationId: { name: 'TechCorp Solutions' },
    departmentId: { name: 'Marketing' }
  },
  {
    _id: '68a43a11f6c7ca053fa9f7d2',
    employeeId: 'EMP003',
    personalInfo: {
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@techcorp.com',
      phone: '+1-555-0789'
    },
    employment: {
      position: 'HR Manager',
      level: 'manager',
      status: 'active',
      workLocation: 'hybrid',
      startDate: '2022-09-01T00:00:00.000Z'
    },
    organizationId: { name: 'TechCorp Solutions' },
    departmentId: { name: 'Human Resources' }
  }
];

// Employee routes
app.get('/api/employees', (req, res) => {
  const { page = 1, limit = 20, search = '', department = '', status = '' } = req.query;
  
  let filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = !search || 
      emp.personalInfo.firstName.toLowerCase().includes(search.toString().toLowerCase()) ||
      emp.personalInfo.lastName.toLowerCase().includes(search.toString().toLowerCase()) ||
      emp.personalInfo.email.toLowerCase().includes(search.toString().toLowerCase());
    
    const matchesDepartment = !department || emp.departmentId.name === department;
    const matchesStatus = !status || emp.employment.status === status;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  res.json({
    data: paginatedEmployees,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: filteredEmployees.length,
      pages: Math.ceil(filteredEmployees.length / Number(limit))
    }
  });
});

app.get('/api/employees/stats/overview', (req, res) => {
  const stats = {
    totals: { total: 3, active: 3, inactive: 0 },
    breakdowns: {
      byDepartment: [
        { _id: 'Engineering', count: 1 },
        { _id: 'Marketing', count: 1 },
        { _id: 'Human Resources', count: 1 }
      ],
      byLevel: [
        { _id: 'senior', count: 1 },
        { _id: 'mid', count: 1 },
        { _id: 'manager', count: 1 }
      ]
    }
  };
  res.json(stats);
});

app.get('/api/employees/:id', (req, res) => {
  const employee = mockEmployees.find(emp => emp._id === req.params.id);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  return res.json(employee);
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Synergy Well API',
    version: '1.0.0',
    health: '/health',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Synergy Well Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;
