import React, { useState } from 'react';
import { DollarSign, Plus, Edit2, Trash2, Check, X, AlertCircle, Info, Sparkles, CheckCircle2, TrendingUp, PieChart, ShieldAlert } from 'lucide-react';
import { BudgetItem, EventPlan } from '../types/event';
import { formatCurrency, calculateBudgetSummary } from '../utils/formatters';

interface BudgetPlannerProps {
  plan: EventPlan;
  onUpdatePlan: (updated: EventPlan) => void;
}

const MANDATED_CATEGORIES = [
  'Venue & Booking',
  'Catering & Refreshments',
  'Decorations & Flowers',
  'Photography & Videography',
  'Entertainment',
  'Invitations & Stationery',
  'Transportation & Misc'
];

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ plan, onUpdatePlan }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BudgetItem>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState(MANDATED_CATEGORIES[0]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState(5000);
  const [newItemNotes, setNewItemNotes] = useState('');
  const [isNewItemEstimate, setIsNewItemEstimate] = useState(true);

  // Editable total budget
  const [isEditingTotalBudget, setIsEditingTotalBudget] = useState(false);
  const [tempTotalBudget, setTempTotalBudget] = useState(plan.totalBudget);

  const summary = calculateBudgetSummary(plan.budgetItems, plan.totalBudget);

  const handleStartEdit = (item: BudgetItem) => {
    setEditingItemId(item.id);
    setEditForm({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditForm({});
  };

  const handleSaveEdit = (id: string) => {
    const updatedItems = plan.budgetItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          name: editForm.name || item.name,
          category: editForm.category || item.category,
          estimatedCost: Number(editForm.estimatedCost) || 0,
          actualCost: Number(editForm.actualCost) || 0,
          isEstimate: editForm.isEstimate !== undefined ? editForm.isEstimate : item.isEstimate,
          notes: editForm.notes !== undefined ? editForm.notes : item.notes
        };
      }
      return item;
    });

    onUpdatePlan({
      ...plan,
      budgetItems: updatedItems,
      updatedAt: new Date().toISOString()
    });

    setEditingItemId(null);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = plan.budgetItems.filter(item => item.id !== id);
    onUpdatePlan({
      ...plan,
      budgetItems: updatedItems,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: BudgetItem = {
      id: 'b-user-' + Date.now(),
      category: newItemCategory,
      name: newItemName.trim(),
      estimatedCost: Number(newItemCost) || 0,
      actualCost: 0,
      isEstimate: isNewItemEstimate,
      notes: newItemNotes.trim()
    };

    onUpdatePlan({
      ...plan,
      budgetItems: [...plan.budgetItems, newItem],
      updatedAt: new Date().toISOString()
    });

    setShowAddModal(false);
    setNewItemName('');
    setNewItemCost(5000);
    setNewItemNotes('');
  };

  const handleSaveTotalBudget = () => {
    onUpdatePlan({
      ...plan,
      totalBudget: Number(tempTotalBudget) || 10000,
      updatedAt: new Date().toISOString()
    });
    setIsEditingTotalBudget(false);
  };

  const handleAutoRebalance = () => {
    if (plan.budgetItems.length === 0) return;
    const currentSum = plan.budgetItems.reduce((acc, it) => acc + it.estimatedCost, 0);
    if (currentSum === 0) return;

    const ratio = plan.totalBudget / currentSum;
    let allocated = 0;

    const rebalanced = plan.budgetItems.map((item, idx) => {
      let newCost = Math.round(item.estimatedCost * ratio);
      if (idx === plan.budgetItems.length - 1) {
        newCost = Math.max(0, plan.totalBudget - allocated);
      } else {
        allocated += newCost;
      }
      return {
        ...item,
        estimatedCost: newCost,
        notes: (item.notes || '') + ' (Auto-rebalanced to match total budget)'
      };
    });

    onUpdatePlan({
      ...plan,
      budgetItems: rebalanced,
      updatedAt: new Date().toISOString()
    });
  };

  // Group items by category for visual analytics
  const categoryTotals: Record<string, number> = {};
  plan.budgetItems.forEach(item => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.estimatedCost;
  });

  const categoryColors: Record<string, string> = {
    'Venue & Booking': 'bg-blue-500',
    'Catering & Refreshments': 'bg-emerald-500',
    'Decorations & Flowers': 'bg-rose-500',
    'Photography & Videography': 'bg-purple-500',
    'Entertainment': 'bg-amber-500',
    'Invitations & Stationery': 'bg-teal-500',
    'Transportation & Misc': 'bg-slate-500'
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Estimates Disclaimer per challenge specification */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Transparent AI Budget Estimates:</span> Items tagged with{' '}
          <span className="inline-block bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded text-[11px] border border-amber-300">
            AI Estimate
          </span>{' '}
          are data-driven approximations based on regional celebration averages and guest counts, not confirmed vendor contracts. Mark items as confirmed once you verify vendor quotes.
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Total Target Budget</span>
            <button
              onClick={() => { setTempTotalBudget(plan.totalBudget); setIsEditingTotalBudget(true); }}
              className="text-brand-600 hover:text-brand-700 text-[11px] font-medium"
            >
              Edit
            </button>
          </div>
          {isEditingTotalBudget ? (
            <div className="mt-2 flex items-center gap-1">
              <input
                type="number"
                value={tempTotalBudget}
                onChange={(e) => setTempTotalBudget(Number(e.target.value))}
                className="w-full text-base font-bold border border-brand-500 rounded p-1 text-slate-900"
                autoFocus
              />
              <button onClick={handleSaveTotalBudget} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setIsEditingTotalBudget(false)} className="p-1 text-slate-500 hover:bg-slate-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900">
              {formatCurrency(plan.totalBudget, plan.currency)}
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1">Planned cap for event</div>
        </div>

        {/* Estimated Allocations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Total Estimated</span>
            <span className="text-[11px] font-bold text-brand-600">{summary.percentAllocated}%</span>
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(summary.totalEstimated, plan.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {plan.budgetItems.length} planned items
          </div>
        </div>

        {/* Actual Confirmed Spent */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Actual Logged Spend</span>
            <span className="text-[11px] font-bold text-emerald-600">{summary.percentSpent}%</span>
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(summary.totalActual, plan.currency)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Paid or committed funds
          </div>
        </div>

        {/* Remaining / Variance */}
        <div className={`p-4 rounded-xl border shadow-xs ${
          summary.status === 'over'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : summary.status === 'under'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="text-xs font-semibold flex items-center justify-between">
            <span>Budget Health</span>
            <span className="text-[11px] font-bold uppercase">{summary.status}</span>
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-black">
            {formatCurrency(Math.abs(summary.variance), plan.currency)}
          </div>
          <div className="text-[11px] mt-1 font-medium">
            {summary.variance >= 0 ? 'Surplus buffer available' : 'Exceeds budget target!'}
          </div>
        </div>
      </div>

      {/* Visual Category Distribution Progress Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-600" />
              Category Budget Distribution
            </h3>
            <p className="text-xs text-slate-500">Visual breakdown across all 7 essential event pillars</p>
          </div>
          {summary.variance !== 0 && (
            <button
              onClick={handleAutoRebalance}
              className="text-xs px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium rounded-lg border border-brand-200 transition-colors self-start sm:self-auto"
            >
              ⚡ Auto-Rebalance to Match Target
            </button>
          )}
        </div>

        {/* Multi-segmented Bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {Object.entries(categoryTotals).map(([cat, amount]) => {
            const widthPct = Math.max(1, (amount / Math.max(1, summary.totalEstimated)) * 100);
            const colorClass = categoryColors[cat] || 'bg-slate-400';
            return (
              <div
                key={cat}
                style={{ width: `${widthPct}%` }}
                className={`${colorClass} hover:opacity-85 transition-all`}
                title={`${cat}: ${formatCurrency(amount, plan.currency)} (${widthPct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
          {Object.entries(categoryTotals).map(([cat, amount]) => {
            const widthPct = ((amount / Math.max(1, summary.totalEstimated)) * 100).toFixed(0);
            const colorClass = categoryColors[cat] || 'bg-slate-400';
            return (
              <div key={cat} className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                <span>{cat}:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(amount, plan.currency)}</span>
                <span className="text-slate-400">({widthPct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Items Table & Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Itemized Budget Breakdown ({plan.budgetItems.length} Categories)
            </h3>
            <p className="text-xs text-slate-500">
              Compare AI estimates with actual vendor quotations and manage expenses
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Expense
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Category & Item</th>
                <th className="py-3 px-4">Estimate vs Confirmed</th>
                <th className="py-3 px-4 text-right">Estimated Cost</th>
                <th className="py-3 px-4 text-right">Actual Cost</th>
                <th className="py-3 px-4">Notes / Vendor</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {plan.budgetItems.map((item) => {
                const isEditing = editingItemId === item.id;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Category & Name */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="space-y-1">
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full text-xs border rounded p-1"
                          >
                            {MANDATED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full text-xs border rounded p-1 font-medium"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500">{item.category}</div>
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <label className="flex items-center gap-1.5 text-xs">
                          <input
                            type="checkbox"
                            checked={editForm.isEstimate}
                            onChange={(e) => setEditForm({ ...editForm, isEstimate: e.target.checked })}
                          />
                          <span>Is AI Estimate</span>
                        </label>
                      ) : item.isEstimate ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          AI Estimate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Confirmed
                        </span>
                      )}
                    </td>

                    {/* Estimated Cost */}
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.estimatedCost}
                          onChange={(e) => setEditForm({ ...editForm, estimatedCost: Number(e.target.value) })}
                          className="w-24 text-right text-xs border rounded p-1"
                        />
                      ) : (
                        formatCurrency(item.estimatedCost, plan.currency)
                      )}
                    </td>

                    {/* Actual Cost */}
                    <td className="py-3 px-4 text-right font-medium">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.actualCost}
                          onChange={(e) => setEditForm({ ...editForm, actualCost: Number(e.target.value) })}
                          className="w-24 text-right text-xs border rounded p-1"
                        />
                      ) : item.actualCost > 0 ? (
                        <span className="text-emerald-700 font-semibold">
                          {formatCurrency(item.actualCost, plan.currency)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">—</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.notes || ''}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-full text-xs border rounded p-1"
                        />
                      ) : (
                        <span className="line-clamp-2">{item.notes || '—'}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-xs sm:text-sm">
              <tr>
                <td className="py-3 px-4" colSpan={2}>
                  Total Itemized Sum
                </td>
                <td className="py-3 px-4 text-right text-brand-700">
                  {formatCurrency(summary.totalEstimated, plan.currency)}
                </td>
                <td className="py-3 px-4 text-right text-emerald-700">
                  {formatCurrency(summary.totalActual, plan.currency)}
                </td>
                <td className="py-3 px-4 text-slate-500 font-normal" colSpan={2}>
                  Target Budget: {formatCurrency(plan.totalBudget, plan.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add New Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add New Expense Item</h3>
            <p className="text-xs text-slate-500 mb-4">Add a customized budget line item to your event plan</p>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50"
                >
                  {MANDATED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item / Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Photo Booth Rental with Instant Prints"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Cost ({plan.currency})</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={newItemCost}
                  onChange={(e) => setNewItemCost(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Quotation includes 4 hours of prints"
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is-est-cb"
                  checked={isNewItemEstimate}
                  onChange={(e) => setIsNewItemEstimate(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="is-est-cb" className="text-xs text-slate-700 font-medium">
                  Mark as unconfirmed estimate (not yet booked)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-xs"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
