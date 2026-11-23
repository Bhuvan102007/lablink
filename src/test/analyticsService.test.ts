import { describe, it, expect } from 'vitest';
import { AnalyticsService } from '../services/analyticsService';
import { INITIAL_EQUIPMENT, INITIAL_BOOKINGS } from '../data/mockData';

describe('Campus Resource Analytics & Optimization: AnalyticsService', () => {
  it('computes departmental utilization metrics accurately', () => {
    const metrics = AnalyticsService.computeDepartmentalMetrics(INITIAL_EQUIPMENT, INITIAL_BOOKINGS);
    expect(metrics.length).toBe(6);

    const cseDept = metrics.find(m => m.department === 'Computer Science & Engineering');
    expect(cseDept).toBeDefined();
    expect(cseDept?.totalAssets).toBeGreaterThan(0);
    expect(cseDept?.bottleneckAssets).toContain('NVIDIA DGX A100 AI Supercomputing Workstation');
  });

  it('generates actionable optimization insights for bottleneck assets', () => {
    const insights = AnalyticsService.generateOptimizationInsights(INITIAL_EQUIPMENT, INITIAL_BOOKINGS);
    expect(insights.length).toBeGreaterThan(0);

    const bottleneckInsight = insights.find(i => i.type === 'BOTTLENECK');
    expect(bottleneckInsight).toBeDefined();
    expect(bottleneckInsight?.suggestedAction).toBeDefined();
  });
});
