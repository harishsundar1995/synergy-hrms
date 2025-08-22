import { Router, Request, Response } from 'express';
import { Employee } from '../models/Employee.js';
import { Organization } from '../models/Organization.js';
import { Department } from '../models/Department.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { Types } from 'mongoose';

const router = Router();

// Validation schemas
const createEmployeeSchema = z.object({
  clerkId: z.string().min(1),
  employeeId: z.string().min(1),
  organizationId: z.string().min(1),
  departmentId: z.string().min(1),
  personalInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    emergencyContact: z.object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string(),
      email: z.string().optional()
    }).optional()
  }),
  employment: z.object({
    position: z.string().min(1),
    level: z.enum(['intern', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive']),
    status: z.enum(['active', 'inactive', 'onLeave', 'terminated']).default('active'),
    startDate: z.string(),
    endDate: z.string().optional(),
    employmentType: z.enum(['fullTime', 'partTime', 'contract', 'intern']),
    salary: z.object({
      amount: z.number().positive(),
      currency: z.string().default('USD'),
      frequency: z.enum(['hourly', 'monthly', 'yearly']).default('yearly')
    }).optional(),
    workLocation: z.enum(['onsite', 'remote', 'hybrid']),
    reportingManager: z.string().optional()
  }),
  skills: z.object({
    technical: z.array(z.string()).default([]),
    soft: z.array(z.string()).default([]),
    certifications: z.array(z.object({
      name: z.string(),
      issuingOrganization: z.string(),
      dateObtained: z.string(),
      expiryDate: z.string().optional(),
      credentialId: z.string().optional()
    })).default([]),
    languages: z.array(z.object({
      language: z.string(),
      proficiency: z.enum(['basic', 'intermediate', 'advanced', 'native'])
    })).default([])
  }).optional()
});

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  level: z.string().optional(),
  status: z.string().optional(),
  workLocation: z.string().optional(),
  sortBy: z.string().optional().default('personalInfo.firstName'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
});

// GET /api/employees - Get all employees with filtering, pagination, and search
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = querySchema.parse(req.query);
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, unknown> = { isActive: true };

    if (query.search) {
      filter.$or = [
        { 'personalInfo.firstName': { $regex: query.search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: query.search, $options: 'i' } },
        { 'personalInfo.email': { $regex: query.search, $options: 'i' } },
        { employeeId: { $regex: query.search, $options: 'i' } },
        { 'employment.position': { $regex: query.search, $options: 'i' } }
      ];
    }

    if (query.department) {
      filter.departmentId = new Types.ObjectId(query.department);
    }

    if (query.position) {
      filter['employment.position'] = { $regex: query.position, $options: 'i' };
    }

    if (query.level) {
      filter['employment.level'] = query.level;
    }

    if (query.status) {
      filter['employment.status'] = query.status;
    }

    if (query.workLocation) {
      filter['employment.workLocation'] = query.workLocation;
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate('organizationId', 'name')
        .populate('departmentId', 'name')
        .populate('employment.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Employee.countDocuments(filter)
    ]);

    return res.json({
      data: employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    return res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET /api/employees/:id - Get employee by ID
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id)
      .populate('organizationId')
      .populate('departmentId')
      .populate('employment.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId employment.position')
      .populate('employment.teamMembers', 'personalInfo.firstName personalInfo.lastName employeeId employment.position')
      .populate('notes.author', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    return res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    return res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// POST /api/employees - Create new employee
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = createEmployeeSchema.parse(req.body);

    // Verify organization and department exist
    const [organization, department] = await Promise.all([
      Organization.findById(validatedData.organizationId),
      Department.findById(validatedData.departmentId)
    ]);

    if (!organization) {
      return res.status(400).json({ error: 'Organization not found' });
    }

    if (!department) {
      return res.status(400).json({ error: 'Department not found' });
    }

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ 
      employeeId: validatedData.employeeId 
    });

    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }

    // Check if Clerk ID already exists
    const existingClerkEmployee = await Employee.findOne({ 
      clerkId: validatedData.clerkId 
    });

    if (existingClerkEmployee) {
      return res.status(400).json({ error: 'Clerk ID already exists' });
    }

    // Convert date strings to Date objects and prepare data
    const employeeData: Record<string, unknown> = {
      clerkId: validatedData.clerkId,
      employeeId: validatedData.employeeId,
      organizationId: new Types.ObjectId(validatedData.organizationId),
      departmentId: new Types.ObjectId(validatedData.departmentId),
      personalInfo: {
        ...validatedData.personalInfo,
        dateOfBirth: validatedData.personalInfo.dateOfBirth ? 
          new Date(validatedData.personalInfo.dateOfBirth) : undefined
      },
      employment: {
        ...validatedData.employment,
        startDate: new Date(validatedData.employment.startDate),
        endDate: validatedData.employment.endDate ? new Date(validatedData.employment.endDate) : undefined,
        reportingManager: validatedData.employment.reportingManager ? 
          new Types.ObjectId(validatedData.employment.reportingManager) : undefined
      },
      skills: validatedData.skills || {
        technical: [],
        soft: [],
        certifications: [],
        languages: []
      }
    };

    const employee = new Employee(employeeData);
    await employee.save();

    // Populate the response
    await employee.populate([
      { path: 'organizationId', select: 'name' },
      { path: 'departmentId', select: 'name' },
      { path: 'employment.reportingManager', select: 'personalInfo.firstName personalInfo.lastName employeeId' }
    ]);

    return res.status(201).json(employee);
  } catch (error) {
    console.error('Create employee error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create employee' });
  }
});

// GET /api/employees/stats/overview - Get employee statistics
router.get('/stats/overview', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      departmentBreakdown,
      levelBreakdown,
      locationBreakdown,
      recentHires
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ 'employment.status': 'active', isActive: true }),
      Employee.aggregate([
        { $match: { isActive: true } },
        { $lookup: { from: 'departments', localField: 'departmentId', foreignField: '_id', as: 'department' } },
        { $unwind: '$department' },
        { $group: { _id: '$department.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Employee.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$employment.level', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Employee.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$employment.workLocation', count: { $sum: 1 } } }
      ]),
      Employee.find({
        'employment.startDate': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        isActive: true
      })
      .select('personalInfo employeeId employment.startDate employment.position')
      .sort({ 'employment.startDate': -1 })
      .limit(10)
    ]);

    return res.json({
      totals: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees
      },
      breakdowns: {
        byDepartment: departmentBreakdown,
        byLevel: levelBreakdown,
        byLocation: locationBreakdown
      },
      recentHires
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
