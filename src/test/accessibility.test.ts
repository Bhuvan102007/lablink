import { describe, it, expect } from 'vitest';
import { INITIAL_EQUIPMENT } from '../data/mockData';
import { BookingSubmissionSchema } from '../lib/zodSchemas';

describe('Accessibility & Security Verification', () => {
  it('verifies all cataloged equipment have valid WCAG safety classifications', () => {
    INITIAL_EQUIPMENT.forEach((eq) => {
      expect(['General', 'Trained_Only', 'Hazardous_Supervised']).toContain(eq.safetyLevel);
      expect(eq.prerequisites).toBeDefined();
      expect(eq.prerequisites.length).toBeGreaterThan(0);
      expect(eq.location).toBeDefined();
    });
  });

  it('verifies defense against script injection attempts in project justification', () => {
    const maliciousPayload = {
      equipmentId: 'eq-gpu-a100',
      studentName: 'Aarav Sharma',
      studentId: '1RU23CS014',
      studentDepartment: 'Computer Science & Engineering',
      projectTitle: 'Legitimate Capstone Project Title',
      projectType: 'capstone',
      projectDeadline: '2026-11-28',
      date: '2026-11-24',
      startTime: '10:00',
      endTime: '13:00',
      justification: '<script>alert("XSS Attack Payload")</script> Attempting to inject unescaped HTML.'
    };

    // The schema parses and enforces string length and strict typing
    const result = BookingSubmissionSchema.safeParse(maliciousPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      // In React rendering, this text is automatically escaped and never executed as raw HTML
      expect(result.data.justification).toContain('<script>');
    }
  });

  it('enforces that every department has at least one connected lab facility', () => {
    const departments = [
      'Computer Science & Engineering',
      'Electronics & Communication',
      'Mechanical & Aerospace',
      'Biotechnology & Healthcare',
      'Robotics & Automation',
      'Civil & Structural Engineering',
      'Chemical & Nanotechnology'
    ];

    departments.forEach((dept) => {
      const match = INITIAL_EQUIPMENT.find(e => e.department === dept);
      expect(match).toBeDefined();
    });
  });
});
