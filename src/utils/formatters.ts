import { Currency, BudgetItem } from '../types/event';

export function formatCurrency(amount: number, currency: Currency = 'INR'): string {
  const safeAmount = isNaN(amount) ? 0 : Math.round(amount);

  if (currency === 'INR') {
    // Format according to Indian Numbering System (Lakhs/Crores)
    return '₹' + safeAmount.toLocaleString('en-IN');
  }

  const currencySymbols: Record<Currency, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  const symbol = currencySymbols[currency] || '₹';
  return symbol + safeAmount.toLocaleString('en-US');
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function calculateDaysUntil(targetDateStr: string): { days: number; isPast: boolean; label: string } {
  if (!targetDateStr) return { days: 0, isPast: false, label: 'Date not set' };

  const target = new Date(targetDateStr + 'T00:00:00').getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const diffMs = target - today;
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return { days: 0, isPast: false, label: 'Today is Event Day! 🎉' };
  } else if (days === 1) {
    return { days: 1, isPast: false, label: 'Tomorrow! ⏰' };
  } else if (days > 1) {
    return { days, isPast: false, label: `${days} Days to go` };
  } else {
    return { days: Math.abs(days), isPast: true, label: `${Math.abs(days)} Days ago (Completed)` };
  }
}

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  remainingBudget: number;
  variance: number; // positive = under budget, negative = over budget
  percentAllocated: number;
  percentSpent: number;
  status: 'under' | 'on-track' | 'over';
}

export function calculateBudgetSummary(items: BudgetItem[], totalBudget: number): BudgetSummary {
  const safeTotalBudget = Math.max(1, totalBudget);
  const totalEstimated = items.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0);
  const totalActual = items.reduce((sum, item) => sum + (Number(item.actualCost) || 0), 0);

  // We compare with actual if actual is logged, else compare with estimated
  const activeSpend = totalActual > 0 ? totalActual : totalEstimated;
  const remainingBudget = totalBudget - activeSpend;
  const variance = totalBudget - totalEstimated;

  const percentAllocated = Math.round((totalEstimated / safeTotalBudget) * 100);
  const percentSpent = Math.round((totalActual / safeTotalBudget) * 100);

  let status: 'under' | 'on-track' | 'over' = 'on-track';
  if (totalEstimated > totalBudget * 1.05) {
    status = 'over';
  } else if (totalEstimated < totalBudget * 0.90) {
    status = 'under';
  }

  return {
    totalBudget,
    totalEstimated,
    totalActual,
    remainingBudget,
    variance,
    percentAllocated,
    percentSpent,
    status
  };
}
