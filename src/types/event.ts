export type EventType = 'wedding' | 'birthday' | 'community' | 'anniversary' | 'corporate';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export type Priority = 'high' | 'medium' | 'low';

export type VendorStatus = 'pending' | 'contacted' | 'quoted' | 'confirmed' | 'completed';

export interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimatedCost: number;
  actualCost: number;
  isEstimate: boolean;
  notes?: string;
  vendorId?: string;
}

export interface TimelineTask {
  id: string;
  title: string;
  category: string;
  dueDate: string; // YYYY-MM-DD
  daysBeforeEvent: number;
  priority: Priority;
  completed: boolean;
  notes?: string;
  assignedTo?: string;
}

export interface ScheduleItem {
  id: string;
  time: string; // e.g. "10:00 AM"
  activity: string;
  location?: string;
  responsiblePerson?: string;
  notes?: string;
  isCompleted?: boolean;
}

export interface Vendor {
  id: string;
  category: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  estimatedQuote: number;
  actualQuote?: number;
  status: VendorStatus;
  isVerifiedUserVendor: boolean;
  notes?: string;
  website?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  role: string; // e.g. "Primary Accent", "Background", "Floral Tone"
}

export interface MenuItem {
  course: string; // "Appetizers", "Main Course", "Dessert", "Beverages"
  items: string[];
  dietaryNotes?: string; // "Vegetarian", "Vegan", "Jain options", "Halal"
}

export interface PersonalizedIdeas {
  themeConcept: string;
  themeDescription: string;
  colorPalette: ColorSwatch[];
  decorIdeas: string[];
  menuSuggestions: MenuItem[];
  entertainmentActivities: string[];
  specialTouches: string[];
}

export interface EventPlan {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: Currency;
  preferences: {
    dietary: string[];
    theme: string;
    atmosphere: string;
    outdoorIndoor: 'outdoor' | 'indoor' | 'hybrid';
    specialRequirements: string;
  };
  budgetItems: BudgetItem[];
  timeline: TimelineTask[];
  dayOfSchedule: ScheduleItem[];
  vendors: Vendor[];
  personalizedIdeas: PersonalizedIdeas;
  aiMetadata: {
    modelUsed: string;
    generatedAt: string;
    isLiveAi: boolean;
    promptUsed?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NaturalLanguagePromptInput {
  prompt: string;
  preferredCurrency?: Currency;
}

