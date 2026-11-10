import React, { useState } from 'react';
import { Sparkles, Wand2, SlidersHorizontal, ArrowRight, Loader2, Calendar, MapPin, Users, Coins, Heart, PartyPopper } from 'lucide-react';
import { EventType, Currency } from '../types/event';

interface HeroIntakeProps {
  onGeneratePlan: (promptText: string, currency: Currency) => Promise<void>;
  isGenerating: boolean;
  onCancel?: () => void;
}

const SAMPLE_PROMPT_PILLS = [
  {
    label: '🎂 30-Guest Outdoor Birthday (₹20,000)',
    prompt: 'I want to organize a 7th birthday party for 30 guests with a budget of ₹20,000. I prefer an outdoor garden park, simple eco balloon decorations, vegetarian finger foods, and a candid photography service.'
  },
  {
    label: '💍 Royal Heritage Wedding (₹15 Lakhs)',
    prompt: 'Royal heritage destination wedding in Rajasthan for 250 guests with a budget of 15 Lakhs INR. Vegetarian banquet, Rajasthani folk music, brass and marigold decor, cinematic drone photography.'
  },
  {
    label: '🌿 Community Eco-Fair (₹75,000)',
    prompt: 'Community Eco-Fair and Cultural Evening for 200 neighbors in the local amphitheater with a budget of ₹75,000. Zero single-use plastic, millet snack counters, solar sound system, resident talent showcase.'
  },
  {
    label: '🥂 25th Silver Anniversary Gala ($5,000)',
    prompt: '25th Silver Wedding Anniversary dinner celebration for 60 guests with a budget of $5,000. Elegant indoor ballroom, warm champagne and gold palette, multi-cuisine gourmet dinner, acoustic trio band.'
  }
];

export const HeroIntake: React.FC<HeroIntakeProps> = ({ onGeneratePlan, isGenerating, onCancel }) => {
  const [prompt, setPrompt] = useState('');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [isWizardMode, setIsWizardMode] = useState(false);

  // Wizard state
  const [wizardType, setWizardType] = useState<EventType>('birthday');
  const [wizardTitle, setWizardTitle] = useState('');
  const [wizardDate, setWizardDate] = useState('');
  const [wizardLocation, setWizardLocation] = useState('');
  const [wizardGuests, setWizardGuests] = useState(35);
  const [wizardBudget, setWizardBudget] = useState(25000);
  const [wizardDietary, setWizardDietary] = useState('Vegetarian, Kid-friendly');
  const [wizardTheme, setWizardTheme] = useState('Space Odyssey & Stargazing');
  const [wizardSetting, setWizardSetting] = useState<'outdoor' | 'indoor' | 'hybrid'>('outdoor');

  // Loading phase ticker
  const [loadingStep, setLoadingStep] = useState(0);

  React.useEffect(() => {
    if (!isGenerating) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const loadingSteps = [
    '✨ Analyzing celebration context, atmosphere & scope...',
    '💰 Structuring 7-category budget distribution with realistic estimates...',
    '📅 Sequencing preparation timeline milestones & day-of run of show...',
    '📋 Generating customized vendor checklist & quotation targets...',
    '🎨 Curating personalized color palette, menu courses & special touches...'
  ];

  const handleSubmitPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    await onGeneratePlan(prompt.trim(), currency);
  };

  const handleApplyPill = (p: string) => {
    setPrompt(p);
    if (p.includes('$')) setCurrency('USD');
    else setCurrency('INR');
  };

  const handleWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const constructedPrompt = `${wizardType.toUpperCase()} celebration: "${wizardTitle || wizardType + ' event'}" on ${wizardDate || 'upcoming month'} at ${wizardLocation || 'local venue'} for ${wizardGuests} guests with total budget of ${currency} ${wizardBudget}. Theme: ${wizardTheme}, Setting: ${wizardSetting}, Dietary requirements: ${wizardDietary}. Please generate complete budget, vendor checklist, timeline, and personalized ideas.`;
    await onGeneratePlan(constructedPrompt, currency);
  };

  return (
    <div className="bg-gradient-to-b from-brand-50/60 via-slate-50 to-slate-50 py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/80 text-brand-700 text-xs font-semibold mb-4 border border-brand-200">
          <PartyPopper className="w-3.5 h-3.5 text-brand-600" />
          <span>PromptWars Challenge 5: Celebration & Event Planner</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Turn your celebration vision into an{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-sky-500">
            actionable plan
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Describe any wedding, birthday, or community gathering. Our GenAI planning assistant organizes smart budgets, milestone schedules, vendor checklists, and bespoke concepts in seconds.
        </p>

        {/* Mode Switcher */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setIsWizardMode(false)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              !isWizardMode
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
            Natural Language AI Prompt
          </button>
          <button
            type="button"
            onClick={() => setIsWizardMode(true)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              isWizardMode
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1.5" />
            Structured Intake Wizard
          </button>
        </div>

        {/* Natural Language Prompt Input Card */}
        {!isWizardMode ? (
          <div className="mt-6 bg-white rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-200/50 border border-slate-200 text-left">
            <form onSubmit={handleSubmitPrompt}>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="prompt-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-brand-600" />
                  Describe Your Event
                </label>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Currency:</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="border border-slate-200 rounded-md px-2 py-0.5 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="GBP">£ GBP</option>
                  </select>
                </div>
              </div>

              <textarea
                id="prompt-input"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. "I want to organize a birthday party for 30 guests with a budget of ₹20,000. I prefer an outdoor venue, simple decorations, vegetarian food, and a photography service."'
                className="w-full text-sm sm:text-base p-3.5 text-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-slate-400 resize-none transition-all"
                disabled={isGenerating}
              />

              {/* Sample Pills */}
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Or Try Sample Prompts:
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PROMPT_PILLS.map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPill(pill.prompt)}
                      className="text-xs text-slate-600 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors text-left"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-500/25 transition-all hover:scale-[1.01]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Plan with GenAI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Complete Event Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Structured Wizard Form */
          <div className="mt-6 bg-white rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-200/50 border border-slate-200 text-left">
            <form onSubmit={handleWizardSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                  <select
                    value={wizardType}
                    onChange={(e) => setWizardType(e.target.value as EventType)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                  >
                    <option value="birthday">Birthday Party</option>
                    <option value="wedding">Wedding / Reception</option>
                    <option value="community">Community / Society Gathering</option>
                    <option value="anniversary">Anniversary Celebration</option>
                    <option value="corporate">Corporate Celebration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    value={wizardTitle}
                    onChange={(e) => setWizardTitle(e.target.value)}
                    placeholder="e.g. Maya's 30th Birthday Bash"
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={wizardDate}
                    onChange={(e) => setWizardDate(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Venue</label>
                  <input
                    type="text"
                    value={wizardLocation}
                    onChange={(e) => setWizardLocation(e.target.value)}
                    placeholder="e.g. Central Park Pavilion"
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Count</label>
                  <input
                    type="number"
                    min="5"
                    max="5000"
                    value={wizardGuests}
                    onChange={(e) => setWizardGuests(parseInt(e.target.value, 10) || 10)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Budget</label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2 text-xs bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-slate-600 font-semibold">
                      {currency}
                    </span>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={wizardBudget}
                      onChange={(e) => setWizardBudget(parseInt(e.target.value, 10) || 5000)}
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-r-lg p-2 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Environment</label>
                  <select
                    value={wizardSetting}
                    onChange={(e) => setWizardSetting(e.target.value as any)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                  >
                    <option value="outdoor">Outdoor (Lawn/Park)</option>
                    <option value="indoor">Indoor (Banquet/Hall)</option>
                    <option value="hybrid">Hybrid (Indoor + Garden)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Theme & Aesthetic</label>
                  <input
                    type="text"
                    value={wizardTheme}
                    onChange={(e) => setWizardTheme(e.target.value)}
                    placeholder="e.g. Boho Botanical, Retro Disco, Space Adventure"
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary & Menu Focus</label>
                  <input
                    type="text"
                    value={wizardDietary}
                    onChange={(e) => setWizardDietary(e.target.value)}
                    placeholder="e.g. Vegetarian, Jain Counter, Nut-free, Vegan"
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-500/25 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Build Structured Event Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Real-time GenAI Progress Ticker Modal / Overlay */}
        {isGenerating && (
          <div className="mt-6 p-4 rounded-xl bg-brand-50 border border-brand-200 text-left animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-brand-600 animate-spin shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-bold text-brand-900 uppercase tracking-wider mb-1">
                  GenAI Event Assistant Processing...
                </div>
                <div className="text-sm font-medium text-brand-700">
                  {loadingSteps[loadingStep]}
                </div>
              </div>
            </div>
            <div className="w-full bg-brand-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

