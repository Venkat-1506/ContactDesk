import { describe, it, expect } from 'vitest';
import {
  getGroupStats,
  getPlaceStats,
  getRelationshipStats,
  getCloseContactStats,
  getDataCompleteness,
  generateInsights,
  getNetworkBalance
} from '../insightCalculations';

const sample = [
  { name: 'A', category: 'Work', location: 'Chennai', relationship: 'Colleague', favorite: true, phone: '123', email: 'a@x.com', organization: 'Acme', notes: 'n1' },
  { name: 'B', category: 'Work', location: 'Chennai', relationship: 'Colleague', favorite: false, phone: '123', email: '', organization: 'Acme', notes: '' },
  { name: 'C', category: 'College', location: 'Delhi', relationship: 'Classmate', favorite: false, phone: '', email: 'c@x.com', organization: '', notes: 'n3' },
  { name: 'D', category: 'Family', location: '', relationship: 'Family', favorite: true, phone: '', email: '', organization: '', notes: '' },
  { name: 'E', category: 'Work', location: 'chennai', relationship: '', favorite: false, phone: '999', email: '', organization: '', notes: '' }
];

describe('getGroupStats', () => {
  it('returns empty for empty input', () => {
    expect(getGroupStats([])).toEqual([]);
    expect(getGroupStats()).toEqual([]);
  });

  it('counts categories with percentages summing near 100', () => {
    const stats = getGroupStats(sample);
    const work = stats.find((s) => s.category === 'Work');
    expect(work.count).toBe(3);
    expect(work.percentage).toBe(60);
    const totalPct = stats.reduce((a, s) => a + s.percentage, 0);
    expect(totalPct).toBeGreaterThanOrEqual(99);
    expect(totalPct).toBeLessThanOrEqual(100);
  });

  it('sorts by count descending', () => {
    const stats = getGroupStats(sample);
    expect(stats[0].category).toBe('Work');
    expect(stats[stats.length - 1].count).toBeLessThanOrEqual(stats[0].count);
  });
});

describe('getPlaceStats', () => {
  it('treats empty location as Unspecified', () => {
    const { topPlaces, totalPlaces } = getPlaceStats(sample);
    const unspecified = topPlaces.find((p) => p.location === 'Unspecified');
    expect(unspecified.count).toBe(1);
    expect(totalPlaces).toBe(2);
  });

  it('returns empty structure for empty input', () => {
    expect(getPlaceStats([])).toEqual({ topPlaces: [], totalPlaces: 0 });
  });

  it('caps topPlaces at 6 entries', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ name: `P${i}`, location: `City${i}` }));
    const { topPlaces } = getPlaceStats(many);
    expect(topPlaces.length).toBeLessThanOrEqual(6);
  });
});

describe('getRelationshipStats', () => {
  it('ignores empty relationships', () => {
    const stats = getRelationshipStats(sample);
    const totalWithRel = stats.reduce((a, s) => a + s.count, 0);
    expect(totalWithRel).toBe(4);
    expect(stats.find((s) => s.relationship === '')).toBeUndefined();
  });

  it('returns empty for empty input', () => {
    expect(getRelationshipStats([])).toEqual([]);
  });
});

describe('getCloseContactStats', () => {
  it('computes close count and percentage', () => {
    const stats = getCloseContactStats(sample);
    expect(stats.total).toBe(5);
    expect(stats.closeCount).toBe(2);
    expect(stats.closePercentage).toBe(40);
  });

  it('handles empty input without NaN', () => {
    const stats = getCloseContactStats([]);
    expect(stats).toEqual({ total: 0, closeCount: 0, closePercentage: 0 });
  });
});

describe('getDataCompleteness', () => {
  it('computes per-field percentages', () => {
    const comp = getDataCompleteness(sample);
    const phone = comp.find((c) => c.field === 'PHONE');
    expect(phone.count).toBe(3);
    expect(phone.percentage).toBe(60);
    const email = comp.find((c) => c.field === 'EMAIL');
    expect(email.count).toBe(2);
  });

  it('returns empty for empty input', () => {
    expect(getDataCompleteness([])).toEqual([]);
  });
});

describe('generateInsights', () => {
  it('produces 3-5 observations', () => {
    const insights = generateInsights(sample);
    expect(insights.length).toBeGreaterThanOrEqual(3);
    expect(insights.length).toBeLessThanOrEqual(5);
  });

  it('every observation is a non-empty string', () => {
    generateInsights(sample).forEach((i) => {
      expect(typeof i).toBe('string');
      expect(i.length).toBeGreaterThan(10);
    });
  });

  it('mentions the largest group', () => {
    const insights = generateInsights(sample);
    expect(insights.some((i) => i.includes('Work'))).toBe(true);
  });

  it('returns empty for empty input', () => {
    expect(generateInsights([])).toEqual([]);
  });
});

describe('getNetworkBalance', () => {
  it('rates a three-group network as MODERATE diversity', () => {
    const balance = getNetworkBalance(sample);
    expect(balance.groupDiversity).toBe('MODERATE');
    expect(balance.closeCircle).toBe('40%');
  });

  it('returns NONE ratings for empty input', () => {
    const balance = getNetworkBalance([]);
    expect(balance.groupDiversity).toBe('NONE');
    expect(balance.placeDiversity).toBe('NONE');
    expect(balance.closeCircle).toBe('0%');
    expect(balance.dataCompleteness).toBe('NONE');
  });

  it('handles a single-contact network without NaN', () => {
    const balance = getNetworkBalance([{ name: 'Solo', category: 'Other', relationship: 'Friend', favorite: true }]);
    expect(balance.groupDiversity).toBe('CONCENTRATED');
    expect(balance.dataCompleteness).not.toBe('NaN');
    expect(Number.isNaN(parseInt(balance.closeCircle))).toBe(false);
  });
});
