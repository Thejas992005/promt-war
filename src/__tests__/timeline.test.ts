import { describe, it, expect } from 'vitest';
import { calculateDaysUntil, formatDate } from '../utils/formatters';

describe('Timeline & Date Handling', () => {
  it('formats dates consistently', () => {
    const formatted = formatDate('2027-02-14');
    expect(formatted).toContain('Feb 14, 2027');
  });

  it('calculates days until upcoming target date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateStr = futureDate.toISOString().split('T')[0];

    const result = calculateDaysUntil(dateStr);
    expect(result.days).toBe(10);
    expect(result.isPast).toBe(false);
    expect(result.label).toContain('10 Days to go');
  });

  it('handles empty or missing date string gracefully', () => {
    const result = calculateDaysUntil('');
    expect(result.label).toBe('Date not set');
  });
});

