import { Router } from 'express';
import { Employee } from '../models/Employee';
import { Organization } from '../models/Organization';
import { Department } from '../models/Department';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
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
    dateOfBirth: z.string().optional()
  }),
  employment: z.object({
    position: z.string().min(1),
    level: z.enum(['intern', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive']),
    status: z.enum(['active', 'inactive', 'onLeave', 'terminated']).default('active'),
    startDate: z.string(),
    employmentType: z.enum(['fullTime', 'partTime', 'contract', 'intern']),
    workLocation: z.enum(['onsite', 'remote', 'hybrid'])
  })
});

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional()
});

// GET /api/employees - Get all employees
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const query = querySchema.parse(req.query);
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    const filter: any = { isActive: true };

    if (query.search) {
      filter.$or = [
        { 'personalInfo.firstName': { $regex: query.search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: query.search, $options: 'i' } },
        { 'personalInfo.email': { $regex: query.search, $options: 'i' } }
      ];
    }

    if (query.department) {
      filter.departmentId = new Types.ObjectId(query.department);
    }

    if (query.status) {
      filter['employment.status'] = query.status;
    }

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate('organizationId', 'name')
        .populate('departmentId', 'name')
        .sort({ 'personalInfo.firstName': 1 })
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
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    return res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET /api/employees/:id - Get employee by ID
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id)
      .populate('organizationId')
      .populate('departmentId');

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
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
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

    // Prepare employee data
    const employeeData: any = {
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
        startDate: new Date(validatedData.employment.startDate)
      }
    };

    const employee = new Employee(employeeData);
    await employee.save();

    // Populate the response
    await employee.populate([
      { path: 'organizationId', select: 'name' },
      { path: 'departmentId', select: 'name' }
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
router.get('/stats/overview', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      departmentBreakdown,
      levelBreakdown
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
      ])
    ]);

    return res.json({
      totals: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees
      },
      breakdowns: {
        byDepartment: departmentBreakdown,
        byLevel: levelBreakdown
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
