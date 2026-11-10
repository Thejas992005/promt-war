import React, { useState } from 'react';
import { Sparkles, Palette, Utensils, Lightbulb, Music, HeartHandshake, Copy, Check, Send, Loader2, ArrowRight } from 'lucide-react';
import { EventPlan, ColorSwatch, MenuItem } from '../types/event';
import { refineEventPlanWithAi } from '../services/geminiService';

interface PersonalizedIdeasProps {
  plan: EventPlan;
  onUpdatePlan: (updated: EventPlan) => void;
}

const REFINEMENT_PROMPT_PILLS = [
  '🌱 Make all catering 100% plant-based vegan',
  '🧅 Add dedicated Jain food counter with zero root vegetables',
  '☔ Add outdoor rain contingency canopy & backup timeline',
  '📸 Increase photography budget by ₹15,000 and adjust decor',
  '🪩 Change aesthetic theme to Vintage Retro Disco'
];

export const PersonalizedIdeas: React.FC<PersonalizedIdeasProps> = ({ plan, onUpdatePlan }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState<string | null>(null);

  const { personalizedIdeas } = plan;

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleRefine = async (instructionToUse?: string) => {
    const text = instructionToUse || refinementInput;
    if (!text.trim() || isRefining) return;

    setIsRefining(true);
    setRefineFeedback(null);
    try {
      const updated = await refineEventPlanWithAi(plan, text.trim());
      onUpdatePlan(updated);
      setRefinementInput('');
      setRefineFeedback(`✨ Plan refined with: "${text.trim()}"`);
      setTimeout(() => setRefineFeedback(null), 6000);
    } catch (err) {
      console.error('Refinement failed:', err);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* GenAI Conversational Refinement Copilot Card */}
      <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-brand-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-7 w-7 rounded-lg bg-brand-500/30 flex items-center justify-center text-brand-300 border border-brand-400/40">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight">
              GenAI Planning Copilot • Refine & Evolve Your Plan
            </h3>
            <p className="text-xs text-slate-300">
              Change requirements dynamically through follow-up prompts without restarting your event
            </p>
          </div>
        </div>

        {/* Refinement input bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleRefine(); }}
          className="mt-4 flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={refinementInput}
              onChange={(e) => setRefinementInput(e.target.value)}
              placeholder="e.g. 'Make menu 100% vegan', 'Add acoustic flute to day-of schedule', 'Add rain contingency'..."
              disabled={isRefining}
              className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
            />
          </div>
          <button
            type="submit"
            disabled={!refinementInput.trim() || isRefining}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
          >
            {isRefining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Refining...</span>
              </>
            ) : (
              <>
                <span>Refine Plan</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Refinement Pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 self-center">Try Quick Adjustments:</span>
          {REFINEMENT_PROMPT_PILLS.map((pill, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleRefine(pill)}
              disabled={isRefining}
              className="text-[11px] text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Success toast */}
        {refineFeedback && (
          <div className="mt-3 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-700 px-3 py-1.5 rounded-lg animate-in fade-in">
            {refineFeedback}
          </div>
        )}
      </div>

      {/* Theme & Concept Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900">
            Theme Narrative: {personalizedIdeas.themeConcept}
          </h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {personalizedIdeas.themeDescription}
        </p>

        {/* Color Palette Section */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-brand-600" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Curated Celebration Color Palette
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {personalizedIdeas.colorPalette.map((swatch, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between group hover:border-brand-300 transition-colors"
              >
                <div
                  className="w-full h-16 rounded-lg shadow-inner mb-2 flex items-end justify-end p-1.5 transition-transform group-hover:scale-102"
                  style={{ backgroundColor: swatch.hex }}
                >
                  <button
                    onClick={() => handleCopyHex(swatch.hex)}
                    className="p-1 rounded bg-black/40 text-white hover:bg-black/60 transition-colors"
                    title="Copy HEX code"
                  >
                    {copiedHex === swatch.hex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 truncate">{swatch.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">{swatch.hex}</div>
                  <div className="text-[10px] text-brand-700 font-medium truncate mt-0.5">{swatch.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Decor Concepts & Special Touches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Decor Concepts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <h4 className="text-sm font-bold text-slate-900">Atmosphere & Decor Concepts</h4>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              {personalizedIdeas.decorIdeas.map((idea, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Special Touches & Favors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HeartHandshake className="w-4 h-4 text-rose-500" />
              <h4 className="text-sm font-bold text-slate-900">Signature Touches & Souvenirs</h4>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              {personalizedIdeas.specialTouches.map((touch, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span>{touch}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Menu Suggestions by Course */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Curated Banquet Menu & Food Concepts
              </h4>
              <p className="text-xs text-slate-500">
                Custom culinary curation aligned with guest count ({plan.guestCount}) and dietary requirements
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {personalizedIdeas.menuSuggestions.map((course, idx) => (
            <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  {course.course}
                </div>
                {course.dietaryNotes && (
                  <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-2.5">
                    {course.dietaryNotes}
                  </span>
                )}
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {course.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-1.5">
                      <span className="text-brand-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entertainment & Interactive Activities */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Music className="w-5 h-5 text-purple-600" />
          <h4 className="text-base font-bold text-slate-900">
            Celebration Entertainment & Guest Experiences
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {personalizedIdeas.entertainmentActivities.map((act, idx) => (
            <div key={idx} className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-xs">
                {idx + 1}
              </span>
              <span>{act}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
