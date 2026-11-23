import { describe, it, expect } from 'vitest';
import { BookingSubmissionSchema } from '../lib/zodSchemas';

describe('Security & Input Validation: BookingSubmissionSchema', () => {
  const validPayload = {
    equipmentId: 'eq-gpu-a100',
    studentName: 'Bhuvan Krishna',
    studentId: '1RU23CS042',
    studentDepartment: 'Computer Science & Engineering',
    projectTitle: 'Autonomous Swarm Robotics with Edge Compute',
    projectType: 'capstone',
    projectDeadline: '2026-11-28',
    date: '2026-11-24',
    startTime: '10:00',
    endTime: '13:00',
    justification: 'Final year capstone testing neural inference on edge clusters with safety protocols.'
  };

  it('accepts valid booking requests', () => {
    const res = BookingSubmissionSchema.safeParse(validPayload);
    expect(res.success).toBe(true);
  });

  it('rejects slot where endTime is equal to or before startTime', () => {
    const invalidTimes = {
      ...validPayload,
      startTime: '14:00',
      endTime: '11:00'
    };
    const res = BookingSubmissionSchema.safeParse(invalidTimes);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors[0].message).toContain('Slot end time must be strictly after slot start time');
    }
  });

  it('rejects invalid or malformed student USN/ID', () => {
    const invalidId = {
      ...validPayload,
      studentId: 'abc' // Too short
    };
    const res = BookingSubmissionSchema.safeParse(invalidId);
    expect(res.success).toBe(false);
  });

  it('rejects excessively brief justification to enforce academic merit review', () => {
    const briefJustification = {
      ...validPayload,
      justification: 'Need GPU'
    };
    const res = BookingSubmissionSchema.safeParse(briefJustification);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors[0].message).toContain('at least 15 characters');
    }
  });
});
