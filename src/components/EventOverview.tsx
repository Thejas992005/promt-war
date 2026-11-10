import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Sparkles, Edit2, Check, X, Bot, ShieldCheck, Heart } from 'lucide-react';
import { EventPlan, EventType } from '../types/event';
import { formatDate, calculateDaysUntil } from '../utils/formatters';

interface EventOverviewProps {
  plan: EventPlan;
  onUpdatePlan: (updated: EventPlan) => void;
}

export const EventOverview: React.FC<EventOverviewProps> = ({ plan, onUpdatePlan }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(plan.title);

  // Countdown timer calculations
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isPast: boolean }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  useEffect(() => {
    setTempTitle(plan.title);
  }, [plan.title]);

  useEffect(() => {
    const updateCountdown = () => {
      if (!plan.date) return;
      const targetTime = new Date(`${plan.date}T${plan.time || '18:00'}:00`).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [plan.date, plan.time]);

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      onUpdatePlan({
        ...plan,
        title: tempTitle.trim(),
        updatedAt: new Date().toISOString()
      });
    }
    setIsEditingTitle(false);
  };

  const typeColorMap: Record<EventType, string> = {
    wedding: 'bg-rose-50 text-rose-700 border-rose-200',
    birthday: 'bg-amber-50 text-amber-700 border-amber-200',
    community: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    anniversary: 'bg-purple-50 text-purple-700 border-purple-200',
    corporate: 'bg-sky-50 text-sky-700 border-sky-200'
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Title & Metadata */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${typeColorMap[plan.type]}`}>
              {plan.type}
            </span>
            <span className="text-xs font-medium text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded-md">
              {plan.preferences.outdoorIndoor} Venue
            </span>
            {plan.aiMetadata.isLiveAi ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Live Gemini AI Model
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                <Bot className="w-3 h-3 text-brand-600" />
                Local Heuristic AI Model
              </span>
            )}
          </div>

          {/* Editable Title */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 w-full max-w-lg">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="text-xl sm:text-2xl font-bold text-slate-900 border border-brand-500 rounded-lg px-3 py-1 w-full focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200"
                  title="Save Title"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {plan.title}
                </h2>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-opacity"
                  title="Edit Event Title"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Specs */}
          <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{formatDate(plan.date)}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{plan.time || '18:00'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{plan.location}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{plan.guestCount} Guests</span>
            </div>
          </div>

          {/* Dietary & Theme Badges */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {plan.preferences.dietary.map((diet, idx) => (
              <span key={idx} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">
                🥗 {diet}
              </span>
            ))}
            {plan.preferences.theme && (
              <span className="text-[11px] font-medium bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200/60">
                ✨ {plan.preferences.theme}
              </span>
            )}
          </div>
        </div>

        {/* Right: Event Countdown Ticker Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-md min-w-[280px] shrink-0 border border-slate-700">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Countdown to Celebration</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          {timeLeft.isPast ? (
            <div className="py-2 text-center text-sm font-semibold text-emerald-400">
              Celebration Event Completed! 🎉
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">{timeLeft.days}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Days</div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">{timeLeft.hours}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Hours</div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">{timeLeft.minutes}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Mins</div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{timeLeft.seconds}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Secs</div>
              </div>
            </div>
          )}

          <div className="mt-2 text-center text-[11px] text-slate-400">
            Target: {formatDate(plan.date)} at {plan.time || '18:00'}
          </div>
        </div>
      </div>
    </div>
  );
};
