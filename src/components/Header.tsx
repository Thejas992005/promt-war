import React, { useState } from 'react';
import { Sparkles, Calendar, Plus, Key, Printer, Download, CheckCircle2, ChevronDown, Wand2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { EventPlan } from '../types/event';
import { SAMPLE_EVENTS } from '../services/sampleEvents';
import { getStoredApiKey } from '../services/geminiService';

interface HeaderProps {
  events: EventPlan[];
  activePlan: EventPlan;
  onSelectEvent: (id: string) => void;
  onNewEvent: () => void;
  onOpenApiKeyModal: () => void;
  onOpenExportModal: () => void;
  onLoadSample: (sample: EventPlan) => void;
}

export const Header: React.FC<HeaderProps> = ({
  events,
  activePlan,
  onSelectEvent,
  onNewEvent,
  onOpenApiKeyModal,
  onOpenExportModal,
  onLoadSample
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sampleMenuOpen, setSampleMenuOpen] = useState(false);
  const hasApiKey = Boolean(getStoredApiKey());

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 font-sans">
                  Celebration<span className="text-brand-600">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  Google Developers Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Smart Event & Celebration Planner
              </p>
            </div>
          </div>

          {/* Event Switcher Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => { setDropdownOpen(!dropdownOpen); setSampleMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="max-w-[120px] sm:max-w-[190px] truncate font-medium text-left">
                  {activePlan.title}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Your Saved Events ({events.length})
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {events.map(ev => (
                      <button
                        key={ev.id}
                        onClick={() => {
                          onSelectEvent(ev.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          ev.id === activePlan.id ? 'bg-brand-50/80 text-brand-700 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <div className="truncate">{ev.title}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{ev.type} • {ev.guestCount} guests</div>
                        </div>
                        {ev.id === activePlan.id && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      onClick={() => {
                        onNewEvent();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-brand-600 hover:bg-brand-50 flex items-center gap-2 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Plan Another Event
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Showcase Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => { setSampleMenuOpen(!sampleMenuOpen); setDropdownOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Sample Events</span>
              </button>

              {sampleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Instant Demo Showcases
                  </div>
                  {SAMPLE_EVENTS.map(sample => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        onLoadSample(sample);
                        setSampleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 block transition-colors"
                    >
                      <div className="font-semibold text-slate-800">{sample.title}</div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {sample.type} • {sample.guestCount} guests • ₹{(sample.totalBudget / 1000).toFixed(0)}k budget
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* API Key Modal Button */}
            <button
              onClick={onOpenApiKeyModal}
              title={hasApiKey ? 'Gemini API Connected' : 'Configure Gemini API Key'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            >
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden lg:inline">Gemini API</span>
              <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Print & Export Report */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              title="Print, export or download event plan"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Export / Print</span>
            </button>

            {/* New Event CTA */}
            <button
              onClick={onNewEvent}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-lg shadow-xs shadow-brand-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Plan</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
