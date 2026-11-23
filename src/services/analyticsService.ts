import { Equipment, BookingRequest, Department } from '../types';

export interface LabOptimizationInsight {
  id: string;
  type: 'BOTTLENECK' | 'UNDERUTILIZED' | 'CROSS_DEPARTMENT_COLLABORATION' | 'ENERGY_EFFICIENCY';
  department: Department;
  title: string;
  description: string;
  suggestedAction: string;
}

export class AnalyticsService {
  public static computeDepartmentalMetrics(equipment: Equipment[], bookings: BookingRequest[]) {
    const departments: Department[] = [
      'Computer Science & Engineering',
      'Electronics & Communication',
      'Mechanical & Aerospace',
      'Biotechnology & Healthcare',
      'Robotics & Automation',
      'Physics & Materials Science'
    ];

    return departments.map((dept) => {
      const deptEquipment = equipment.filter((e) => e.department === dept);
      const totalAssets = deptEquipment.length;
      const averageUtilization = totalAssets > 0
        ? Math.round(deptEquipment.reduce((acc, curr) => acc + curr.utilizationRate, 0) / totalAssets)
        : 0;

      // Count cross-department requests where student is from another department
      const crossDeptRequests = bookings.filter((b) => {
        const targetEq = equipment.find((e) => e.id === b.equipmentId);
        return targetEq?.department === dept && b.studentDepartment !== dept;
      }).length;

      const bottleneckAssets = deptEquipment
        .filter((e) => e.utilizationRate >= 80)
        .map((e) => e.name);

      const underutilizedAssets = deptEquipment
        .filter((e) => e.utilizationRate <= 35)
        .map((e) => e.name);

      return {
        department: dept,
        totalAssets,
        averageUtilization,
        crossDeptRequests,
        bottleneckAssets,
        underutilizedAssets
      };
    });
  }

  public static generateOptimizationInsights(equipment: Equipment[], bookings: BookingRequest[]): LabOptimizationInsight[] {
    const insights: LabOptimizationInsight[] = [];

    // Bottleneck detection
    const bottleneck = equipment.find((e) => e.utilizationRate >= 85);
    if (bottleneck) {
      insights.push({
        id: 'opt-1',
        type: 'BOTTLENECK',
        department: bottleneck.department,
        title: `High Peak Strain on ${bottleneck.name}`,
        description: `Current utilization is at ${bottleneck.utilizationRate}%. High frequency of overlapping requests from multiple departments.`,
        suggestedAction: 'Enable AI batch scheduling during 18:00–22:00 evening windows and route exploratory assignments to virtual emulators.'
      });
    }

    // Underutilized asset detection
    const underutilized = equipment.find((e) => e.utilizationRate <= 30);
    if (underutilized) {
      insights.push({
        id: 'opt-2',
        type: 'UNDERUTILIZED',
        department: underutilized.department,
        title: `Underutilized Asset: ${underutilized.name}`,
        description: `Operating at only ${underutilized.utilizationRate}% capacity. Excellent opportunity for cross-disciplinary hackathon and capstone projects.`,
        suggestedAction: 'Feature this tool in the GenAI Discovery Hub for Robotics and Biotech students seeking hardware acceleration.'
      });
    }

    // Interdisciplinary Collaboration Insight
    const crossBookingsCount = bookings.filter((b) => {
      const eq = equipment.find((e) => e.id === b.equipmentId);
      return eq && eq.department !== b.studentDepartment;
    }).length;

    insights.push({
      id: 'opt-3',
      type: 'CROSS_DEPARTMENT_COLLABORATION',
      department: 'Biotechnology & Healthcare',
      title: 'Surge in Interdisciplinary Biotech-Mechanical Research',
      description: `${crossBookingsCount} active cross-department reservations logged. Students are combining microfluidic designs with SLA 3D printing and CAN-bus telemetry.`,
      suggestedAction: 'Establish an automated joint-approval pipeline between Bio and Mech lab supervisors for streamlined access.'
    });

    return insights;
  }
}
