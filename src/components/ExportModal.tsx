import React, { useState } from 'react';
import { Printer, Download, Upload, Copy, Check, X, FileText, Share2 } from 'lucide-react';
import { EventPlan } from '../types/event';
import { exportPlanAsJson } from '../utils/storage';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
  onImportPlan: (imported: EventPlan) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, plan, onImportPlan }) => {
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    exportPlanAsJson(plan);
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownSummary(plan);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.title && Array.isArray(parsed.budgetItems)) {
          onImportPlan(parsed);
          onClose();
        } else {
          setImportError('Invalid event file structure.');
        }
      } catch (err) {
        setImportError('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export & Share Plan</h3>
              <p className="text-xs text-slate-500">Save, print, or distribute this event plan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-brand-700">
                  Print or Save as PDF
                </div>
                <div className="text-xs text-slate-500">
                  Formatted, printer-friendly summary sheet with budgets & schedules
                </div>
              </div>
            </div>
          </button>

          {/* Download JSON */}
          <button
            onClick={handleDownloadJson}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                  Download JSON Backup
                </div>
                <div className="text-xs text-slate-500">
                  Export complete data structure to restore or edit anywhere
                </div>
              </div>
            </div>
          </button>

          {/* Copy Text Summary */}
          <button
            onClick={handleCopyMarkdown}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-purple-700">
                  {copied ? 'Summary Copied to Clipboard!' : 'Copy Summary as Text / Markdown'}
                </div>
                <div className="text-xs text-slate-500">
                  Share in WhatsApp, email, or planning docs
                </div>
              </div>
            </div>
          </button>

          {/* Import JSON */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import Plan from JSON File</span>
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
            {importError && (
              <div className="text-xs text-rose-600 mt-1">{importError}</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function generateMarkdownSummary(plan: EventPlan): string {
  return `# ${plan.title}
**Event Type:** ${plan.type.toUpperCase()}
**Date & Time:** ${formatDate(plan.date)} at ${plan.time || '18:00'}
**Location:** ${plan.location}
**Guest Count:** ${plan.guestCount}
**Total Target Budget:** ${formatCurrency(plan.totalBudget, plan.currency)}

---

## 💰 Budget Breakdown
${plan.budgetItems.map(b => `- **${b.category}** - ${b.name}: ${formatCurrency(b.estimatedCost, plan.currency)} ${b.isEstimate ? '(AI Estimate)' : '(Confirmed)'}`).join('\n')}

---

## 📅 Key Preparation Milestones
${plan.timeline.map(t => `- [${t.completed ? 'x' : ' '}] **${t.title}** (Due: ${formatDate(t.dueDate)} | Priority: ${t.priority.toUpperCase()})`).join('\n')}

---

## ⏰ Day-of Run of Show
${plan.dayOfSchedule.map(s => `- **${s.time}** - ${s.activity} *(Lead: ${s.responsiblePerson || 'Team'})*`).join('\n')}

---

## 🎨 Theme & Personalized Concepts
**Theme Concept:** ${plan.personalizedIdeas.themeConcept}
${plan.personalizedIdeas.themeDescription}

**Color Palette:** ${plan.personalizedIdeas.colorPalette.map(c => `${c.name} (${c.hex})`).join(', ')}

Generated with CelebrationAI (Google Developers Edition).
`;
}
