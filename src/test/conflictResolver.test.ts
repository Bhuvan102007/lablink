import { describe, it, expect } from 'vitest';
import { ConflictResolver } from '../services/conflictResolver';
import { BookingRequest, Equipment } from '../types';
import { INITIAL_EQUIPMENT } from '../data/mockData';

describe('Intelligent Conflict Arbiter: ConflictResolver', () => {
  const mockBookingA: BookingRequest = {
    id: 'req-a',
    equipmentId: 'eq-gpu-a100',
    studentName: 'Aarav Sharma',
    studentId: '1RU23CS014',
    studentDepartment: 'Computer Science & Engineering',
    projectTitle: 'Final Year Capstone: Low-Latency Medical Imaging',
    projectType: 'capstone',
    projectDeadline: '2026-11-26', // Imminent deadline (3 days)
    date: '2026-11-24',
    startTime: '10:00',
    endTime: '14:00',
    status: 'pending_approval',
    justification: 'Final evaluation defense is on Nov 27. Need multi-GPU fine-tuning.',
    submittedAt: '2026-11-23T09:15:00Z',
    aiRiskAssessment: {
      riskLevel: 'low',
      readinessScore: 95,
      prerequisiteSatisfied: true,
      recommendation: 'APPROVE',
      summary: 'High priority capstone'
    }
  };

  const mockBookingB: BookingRequest = {
    id: 'req-b',
    equipmentId: 'eq-gpu-a100',
    studentName: 'Sneha Patel',
    studentId: '1RU24EC089',
    studentDepartment: 'Electronics & Communication',
    projectTitle: 'Coursework: YOLOv8 Campus Traffic Feeds',
    projectType: 'coursework',
    projectDeadline: '2026-12-10', // Relaxed deadline (17 days)
    date: '2026-11-24',
    startTime: '11:00',
    endTime: '13:00',
    status: 'pending_approval',
    justification: 'Semester mini-project submission for EC401 Computer Vision elective.',
    submittedAt: '2026-11-23T10:45:00Z',
    aiRiskAssessment: {
      riskLevel: 'low',
      readinessScore: 75,
      prerequisiteSatisfied: true,
      recommendation: 'CONDITIONAL_APPROVAL',
      summary: 'Coursework project with ample time'
    }
  };

  const targetEquipment: Equipment = INITIAL_EQUIPMENT.find(e => e.id === 'eq-gpu-a100')!;

  it('accurately identifies time collisions between overlapping slots', () => {
    // 10:00-14:00 overlaps with 11:00-13:00
    const hasConflict = ConflictResolver.hasTimeConflict(mockBookingA, mockBookingB);
    expect(hasConflict).toBe(true);
  });

  it('does not flag conflict for adjacent non-overlapping slots on same day', () => {
    const nonOverlappingBooking: BookingRequest = {
      ...mockBookingB,
      startTime: '14:00',
      endTime: '16:00'
    };
    const hasConflict = ConflictResolver.hasTimeConflict(mockBookingA, nonOverlappingBooking);
    expect(hasConflict).toBe(false);
  });

  it('does not flag conflict for identical times on different dates', () => {
    const differentDateBooking: BookingRequest = {
      ...mockBookingB,
      date: '2026-11-25'
    };
    const hasConflict = ConflictResolver.hasTimeConflict(mockBookingA, differentDateBooking);
    expect(hasConflict).toBe(false);
  });

  it('correctly resolves collision favoring Capstone with imminent deadline', () => {
    const plan = ConflictResolver.fallbackConflictResolution(
      mockBookingA,
      mockBookingB,
      targetEquipment,
      INITIAL_EQUIPMENT
    );

    expect(plan.severity).toBe('CRITICAL');
    expect(plan.recommendedResolution.primaryBookingId).toBe('req-a'); // Aarav wins primary slot
    expect(plan.recommendedResolution.secondaryBookingId).toBe('req-b'); // Sneha reallocated
    expect(plan.recommendedResolution.suggestedAlternativeSlot).toBeDefined();
    expect(plan.recommendedResolution.fairnessRationale).toContain('Fairness Index');
  });
});
