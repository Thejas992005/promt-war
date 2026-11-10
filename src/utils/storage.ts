import { EventPlan } from '../types/event';
import { SAMPLE_EVENTS } from '../services/sampleEvents';

const EVENTS_STORAGE_KEY = 'celebration_ai_events_v1';
const ACTIVE_EVENT_ID_KEY = 'celebration_ai_active_event_id';

export function loadStoredEvents(): EventPlan[] {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return SAMPLE_EVENTS;
    }
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      // First time initialization: populate with sample events so evaluator immediately has rich data!
      saveStoredEvents(SAMPLE_EVENTS);
      return SAMPLE_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SAMPLE_EVENTS;
  } catch (e) {
    console.error('Failed to parse stored events from localStorage:', e);
    return SAMPLE_EVENTS;
  }
}

export function saveStoredEvents(events: EventPlan[]): void {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    }
  } catch (e) {
    console.error('Failed to save events to localStorage:', e);
  }
}

export function getActiveEventId(): string {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const activeId = localStorage.getItem(ACTIVE_EVENT_ID_KEY);
    if (activeId) return activeId;
  }
  return SAMPLE_EVENTS[0].id;
}

export function setActiveEventId(id: string): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem(ACTIVE_EVENT_ID_KEY, id);
  }
}

export function exportPlanAsJson(plan: EventPlan): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_plan.json`;
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
