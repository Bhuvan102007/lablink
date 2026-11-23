import { z } from 'zod';

export const DepartmentSchema = z.enum([
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical & Aerospace',
  'Biotechnology & Healthcare',
  'Robotics & Automation',
  'Civil & Structural Engineering',
  'Chemical & Nanotechnology',
  'Physics & Materials Science'
]);

export const ProjectTypeSchema = z.enum([
  'capstone',
  'sponsored_research',
  'hackathon',
  'coursework',
  'personal_exploration'
]);

export const BookingSubmissionSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment ID is required'),
  studentName: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name too long'),
  studentId: z.string().trim().regex(/^[0-9A-Z]{6,15}$/i, 'Valid Student ID / USN format required (e.g., 1RU23CS014)'),
  studentDepartment: DepartmentSchema,
  projectTitle: z.string().trim().min(5, 'Project title must be descriptive (at least 5 characters)').max(150),
  projectType: ProjectTypeSchema,
  projectDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid deadline date format'
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:mm (24hr)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be HH:mm (24hr)'),
  justification: z.string().trim().min(15, 'Please provide detailed project justification (at least 15 characters)').max(1000)
}).refine((data) => {
  const [startH, startM] = data.startTime.split(':').map(Number);
  const [endH, endM] = data.endTime.split(':').map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  return endMin > startMin;
}, {
  message: 'Slot end time must be strictly after slot start time',
  path: ['endTime']
});

export const NaturalLanguageSearchSchema = z.object({
  query: z.string().trim().min(3, 'Search query must be at least 3 characters').max(300),
  targetDepartment: z.string().optional()
});

export const FacultyApprovalActionSchema = z.object({
  bookingId: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT', 'REALLOCATE']),
  facultyFeedback: z.string().trim().max(500).optional(),
  allocatedSlotNote: z.string().trim().max(300).optional()
});

export type BookingSubmission = z.infer<typeof BookingSubmissionSchema>;
export type NaturalLanguageSearch = z.infer<typeof NaturalLanguageSearchSchema>;
export type FacultyApprovalAction = z.infer<typeof FacultyApprovalActionSchema>;
