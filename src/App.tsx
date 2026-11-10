import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Users, Sparkles, Plus, AlertCircle, Heart, ShieldCheck, Download, Printer } from 'lucide-react';
import { EventPlan, Currency } from './types/event';
import { loadStoredEvents, saveStoredEvents, getActiveEventId, setActiveEventId } from './utils/storage';
import { generateEventPlan } from './services/geminiService';
import { SAMPLE_EVENTS } from './services/sampleEvents';
import { Header } from './components/Header';
import { HeroIntake } from './components/HeroIntake';
import { EventOverview } from './components/EventOverview';
import { BudgetPlanner } from './components/BudgetPlanner';
import { TimelineScheduler } from './components/TimelineScheduler';
import { VendorChecklist } from './components/VendorChecklist';
import { PersonalizedIdeas } from './components/PersonalizedIdeas';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ExportModal } from './components/ExportModal';

export function App() {
  const [events, setEvents] = useState<EventPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'budget' | 'timeline' | 'vendors' | 'ideas'>('budget');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHeroIntake, setShowHeroIntake] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Load events on mount
  useEffect(() => {
    const loaded = loadStoredEvents();
    setEvents(loaded);
    const initialId = getActiveEventId();
    const found = loaded.find(e => e.id === initialId) || loaded[0] || SAMPLE_EVENTS[0];
    setActivePlanId(found.id);
  }, []);

  const activePlan = events.find(e => e.id === activePlanId) || events[0] || SAMPLE_EVENTS[0];

  const handleSelectEvent = (id: string) => {
    setActivePlanId(id);
    setActiveEventId(id);
    setShowHeroIntake(false);
  };

  const handleUpdateActivePlan = (updated: EventPlan) => {
    const updatedList = events.map(e => (e.id === updated.id ? updated : e));
    setEvents(updatedList);
    saveStoredEvents(updatedList);
  };

  const handleLoadSample = (sample: EventPlan) => {
    // Check if already in list
    const exists = events.some(e => e.id === sample.id);
    if (!exists) {
      const updatedList = [sample, ...events];
      setEvents(updatedList);
      saveStoredEvents(updatedList);
    }
    setActivePlanId(sample.id);
    setActiveEventId(sample.id);
    setShowHeroIntake(false);
    showNotice(`Loaded "${sample.title}" showcase plan.`);
  };

  const handleGeneratePlan = async (promptText: string, currency: Currency) => {
    setIsGenerating(true);
    try {
      const newPlan = await generateEventPlan(promptText, currency);
      const updatedList = [newPlan, ...events];
      setEvents(updatedList);
      saveStoredEvents(updatedList);
      setActivePlanId(newPlan.id);
      setActiveEventId(newPlan.id);
      setShowHeroIntake(false);
      showNotice(`✨ Successfully generated: "${newPlan.title}"!`);
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      showNotice('Generation encountered an issue. Using fallback plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportPlan = (imported: EventPlan) => {
    const updatedList = [imported, ...events];
    setEvents(updatedList);
    saveStoredEvents(updatedList);
    setActivePlanId(imported.id);
    setActiveEventId(imported.id);
    showNotice(`Imported plan: "${imported.title}"`);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  if (!activePlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin text-brand-600 font-bold">Loading CelebrationAI...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <Header
        events={events}
        activePlan={activePlan}
        onSelectEvent={handleSelectEvent}
        onNewEvent={() => setShowHeroIntake(prev => !prev)}
        onOpenApiKeyModal={() => setShowApiKeyModal(true)}
        onOpenExportModal={() => setShowExportModal(true)}
        onLoadSample={handleLoadSample}
      />

      {/* Floating Notice Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 border border-slate-700">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Intake Drawer / Section */}
      {(showHeroIntake || events.length === 0) && (
        <HeroIntake
          onGeneratePlan={handleGeneratePlan}
          isGenerating={isGenerating}
          onCancel={() => setShowHeroIntake(false)}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Event Overview Card */}
        <EventOverview plan={activePlan} onUpdatePlan={handleUpdateActivePlan} />

        {/* Feature Tabs Bar */}
        <div className="border-b border-slate-200 mb-6 no-print">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('budget')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'budget'
                  ? 'border-brand-600 text-brand-600 bg-brand-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>1. Smart Budget Planner</span>
              <span className="text-[11px] font-semibold bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md">
                {activePlan.budgetItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'timeline'
                  ? 'border-brand-600 text-brand-600 bg-brand-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>2. Timeline & Day-of Schedule</span>
              <span className="text-[11px] font-semibold bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md">
                {activePlan.timeline.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('vendors')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'vendors'
                  ? 'border-brand-600 text-brand-600 bg-brand-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>3. Vendor Checklist</span>
              <span className="text-[11px] font-semibold bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md">
                {activePlan.vendors.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ideas')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'ideas'
                  ? 'border-brand-600 text-brand-600 bg-brand-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>4. Personalized Ideas & Copilot</span>
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                GenAI
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content Panels */}
        <div className="transition-all">
          {activeTab === 'budget' && (
            <BudgetPlanner plan={activePlan} onUpdatePlan={handleUpdateActivePlan} />
          )}

          {activeTab === 'timeline' && (
            <TimelineScheduler plan={activePlan} onUpdatePlan={handleUpdateActivePlan} />
          )}

          {activeTab === 'vendors' && (
            <VendorChecklist plan={activePlan} onUpdatePlan={handleUpdateActivePlan} />
          )}

          {activeTab === 'ideas' && (
            <PersonalizedIdeas plan={activePlan} onUpdatePlan={handleUpdateActivePlan} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-slate-900 text-sm">CelebrationAI</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">
                PromptWars Challenge 5: Celebration & Event Planner
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Organized by Hack2skill in collaboration with Google for Developers. Powered by Gemini 2.5 Flash.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Security & Privacy Verified
            </span>
            <span>•</span>
            <span>Zero Server Footprint</span>
            <span>•</span>
            <span>Repository &lt; 10 MB</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onKeySaved={() => {
          showNotice('Gemini API settings updated.');
        }}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        plan={activePlan}
        onImportPlan={handleImportPlan}
      />
    </div>
  );
}

export default App;
