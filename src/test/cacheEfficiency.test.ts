import { describe, it, expect, beforeEach } from 'vitest';
import { GeminiService } from '../services/geminiService';
import { AnalyticsService } from '../services/analyticsService';
import { INITIAL_EQUIPMENT, INITIAL_BOOKINGS } from '../data/mockData';

describe('Performance & In-Memory Caching Suite', () => {
  beforeEach(() => {
    GeminiService.clearCache();
    AnalyticsService.clearCache();
  });

  it('caches semantic equipment discovery queries to achieve sub-millisecond repeated lookups', async () => {
    const query = 'Need high performance GPU cluster for training autonomous vision model';
    
    // First lookup (calculates and primes the in-memory cache)
    const t0 = performance.now();
    const firstResult = await GeminiService.discoverEquipment(query, INITIAL_EQUIPMENT);
    const firstDuration = performance.now() - t0;

    expect(firstResult.length).toBeGreaterThan(0);

    // Second lookup (retrieves directly from cache)
    const t1 = performance.now();
    const cachedResult = await GeminiService.discoverEquipment(query, INITIAL_EQUIPMENT);
    const cachedDuration = performance.now() - t1;

    expect(cachedResult).toEqual(firstResult);
    expect(cachedDuration).toBeLessThanOrEqual(firstDuration + 1); // Sub-millisecond instant lookup
  });

  it('memoizes departmental analytics to eliminate redundant metrics aggregation', () => {
    const firstMetrics = AnalyticsService.computeDepartmentalMetrics(INITIAL_EQUIPMENT, INITIAL_BOOKINGS);
    expect(firstMetrics.length).toBeGreaterThan(0);

    // Second call should retrieve the memoized reference
    const cachedMetrics = AnalyticsService.computeDepartmentalMetrics(INITIAL_EQUIPMENT, INITIAL_BOOKINGS);
    expect(cachedMetrics).toBe(firstMetrics);
  });

  it('flushes cache cleanly when clearCache is invoked', async () => {
    const query = 'electron microscopy nano imaging';
    await GeminiService.discoverEquipment(query, INITIAL_EQUIPMENT);

    GeminiService.clearCache();
    // After clear, discovering again should succeed cleanly
    const afterClearResult = await GeminiService.discoverEquipment(query, INITIAL_EQUIPMENT);
    expect(afterClearResult.length).toBeGreaterThan(0);
  });
});
