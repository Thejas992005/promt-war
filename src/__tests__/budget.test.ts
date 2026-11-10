import { describe, it, expect } from 'vitest';
import { calculateBudgetSummary, formatCurrency } from '../utils/formatters';
import { BudgetItem } from '../types/event';

describe('Budget Calculations & Currency Formatting', () => {
  const sampleItems: BudgetItem[] = [
    { id: '1', category: 'Venue & Booking', name: 'Hall', estimatedCost: 20000, actualCost: 18000, isEstimate: false },
    { id: '2', category: 'Catering & Refreshments', name: 'Food', estimatedCost: 30000, actualCost: 32000, isEstimate: true },
    { id: '3', category: 'Decorations & Flowers', name: 'Flowers', estimatedCost: 10000, actualCost: 0, isEstimate: true }
  ];

  it('calculates total estimated and actual costs accurately', () => {
    const summary = calculateBudgetSummary(sampleItems, 65000);
    expect(summary.totalEstimated).toBe(60000);
    expect(summary.totalActual).toBe(50000);
    expect(summary.variance).toBe(5000); // 65000 - 60000 = surplus 5000
    expect(summary.percentAllocated).toBe(92); // 60000 / 65000 = ~92%
    expect(summary.status).toBe('on-track');
  });

  it('detects over-budget scenarios', () => {
    const summary = calculateBudgetSummary(sampleItems, 50000);
    expect(summary.variance).toBe(-10000);
    expect(summary.status).toBe('over');
  });

  it('formats INR currency using the Indian numbering system', () => {
    expect(formatCurrency(1500000, 'INR')).toBe('₹15,00,000');
    expect(formatCurrency(25000, 'INR')).toBe('₹25,000');
    expect(formatCurrency(0, 'INR')).toBe('₹0');
  });

  it('formats USD and EUR currencies accurately', () => {
    expect(formatCurrency(5000, 'USD')).toBe('$5,000');
    expect(formatCurrency(3500, 'EUR')).toBe('€3,500');
  });
});

