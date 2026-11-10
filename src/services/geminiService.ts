import { EventPlan, EventType, Currency, BudgetItem, TimelineTask, ScheduleItem, Vendor, PersonalizedIdeas } from '../types/event';

// Storage key for user's custom Gemini API key
const GEMINI_API_KEY_STORAGE = 'celebration_ai_gemini_api_key';

export function getStoredApiKey(): string {
  // Priority: 1. User configured in localStorage, 2. Vite env var
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const userKey = localStorage.getItem(GEMINI_API_KEY_STORAGE);
    if (userKey && userKey.trim().length > 0) {
      return userKey.trim();
    }
  }
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    if (!key) {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE);
    } else {
      localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
    }
  }
}

// System prompt explaining the required output format for the Event Planner
const SYSTEM_PROMPT = `You are CelebrationAI, an expert GenAI event planning consultant.
You help organize weddings, birthdays, anniversaries, corporate celebrations, and community events.
Your task is to parse the user's event prompt and generate a COMPLETE, highly structured, realistic, and practical event plan in JSON format.

Always strictly return valid JSON matching this structure without any markdown wrappers or comments:
{
  "title": "string",
  "type": "wedding" | "birthday" | "community" | "anniversary" | "corporate",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "location": "string",
  "guestCount": number,
  "totalBudget": number,
  "currency": "INR" | "USD" | "EUR" | "GBP",
  "preferences": {
    "dietary": ["string"],
    "theme": "string",
    "atmosphere": "string",
    "outdoorIndoor": "outdoor" | "indoor" | "hybrid",
    "specialRequirements": "string"
  },
  "budgetItems": [
    {
      "category": "Venue & Booking" | "Catering & Refreshments" | "Decorations & Flowers" | "Photography & Videography" | "Entertainment" | "Invitations & Stationery" | "Transportation & Misc",
      "name": "string",
      "estimatedCost": number,
      "actualCost": 0,
      "isEstimate": true,
      "notes": "string"
    }
  ],
  "timeline": [
    {
      "title": "string",
      "category": "string",
      "dueDate": "YYYY-MM-DD",
      "daysBeforeEvent": number,
      "priority": "high" | "medium" | "low",
      "completed": false,
      "notes": "string"
    }
  ],
  "dayOfSchedule": [
    {
      "time": "HH:mm AM/PM",
      "activity": "string",
      "responsiblePerson": "string",
      "notes": "string"
    }
  ],
  "vendors": [
    {
      "category": "string",
      "name": "string",
      "contactPerson": "string",
      "phone": "string",
      "email": "string",
      "estimatedQuote": number,
      "status": "pending",
      "isVerifiedUserVendor": false,
      "notes": "string"
    }
  ],
  "personalizedIdeas": {
    "themeConcept": "string",
    "themeDescription": "string",
    "colorPalette": [
      { "name": "string", "hex": "#HEX", "role": "string" }
    ],
    "decorIdeas": ["string"],
    "menuSuggestions": [
      { "course": "string", "items": ["string"], "dietaryNotes": "string" }
    ],
    "entertainmentActivities": ["string"],
    "specialTouches": ["string"]
  }
}

Important Rules:
1. Ensure the sum of estimatedCost across budgetItems is roughly equal to totalBudget.
2. Clearly mark budget items as estimates (isEstimate: true) and vendors as non-verified recommendations. Do NOT invent fake real-world businesses as verified.
3. Respect all dietary restrictions, theme colors, guest counts, and location constraints in the user's prompt.
4. Date must be realistic (if unspecified, choose a date 2-4 months in the future).
`;

/**
 * Generate an Event Plan from natural language using live Gemini or smart heuristic fallback.
 */
export async function generateEventPlan(prompt: string, preferredCurrency: Currency = 'INR'): Promise<EventPlan> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const response = await callGeminiApi(prompt, apiKey, preferredCurrency);
      if (response) {
        return response;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart heuristic engine:', err);
    }
  }

  // Fallback to high-fidelity heuristic generator
  return generateHeuristicPlan(prompt, preferredCurrency);
}

/**
 * Direct call to Google Gemini REST API
 */
async function callGeminiApi(prompt: string, apiKey: string, preferredCurrency: Currency): Promise<EventPlan | null> {
  // Using gemini-2.5-flash with fallback to gemini-1.5-flash
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nUser Event Request (preferred currency ${preferredCurrency}):\n"${prompt}"\n\nGenerate the complete JSON event plan now.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json'
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API error [${res.status}]: ${errorText}`);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response from Gemini');

      // Parse JSON from text
      const cleanJson = cleanJsonResponse(rawText);
      const parsed = JSON.parse(cleanJson);

      return formatParsedPlan(parsed, model, true, prompt);
    } catch (err) {
      lastError = err;
      // try next model
    }
  }

  throw lastError || new Error('Failed to connect to Gemini API');
}

/**
 * Cleans markdown code blocks from JSON string if present
 */
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
}

/**
 * Formats parsed AI response into a valid typed EventPlan
 */
function formatParsedPlan(raw: any, model: string, isLive: boolean, promptUsed?: string): EventPlan {
  const eventId = 'event-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  return {
    id: eventId,
    title: raw.title || 'Personalized Celebration Event',
    type: (raw.type as EventType) || 'birthday',
    date: raw.date || getFutureDate(45),
    time: raw.time || '18:00',
    location: raw.location || 'Local Celebration Venue',
    guestCount: Number(raw.guestCount) || 50,
    totalBudget: Number(raw.totalBudget) || 50000,
    currency: (raw.currency as Currency) || 'INR',
    preferences: {
      dietary: Array.isArray(raw.preferences?.dietary) ? raw.preferences.dietary : ['Vegetarian options'],
      theme: raw.preferences?.theme || 'Celebration Elegance',
      atmosphere: raw.preferences?.atmosphere || 'Warm, Joyful & Welcoming',
      outdoorIndoor: raw.preferences?.outdoorIndoor || 'hybrid',
      specialRequirements: raw.preferences?.specialRequirements || 'Eco-friendly and personalized touches'
    },
    budgetItems: (raw.budgetItems || []).map((item: any, idx: number): BudgetItem => ({
      id: `b-${idx + 1}-${Date.now()}`,
      category: item.category || 'Miscellaneous',
      name: item.name || 'Expense Item',
      estimatedCost: Number(item.estimatedCost) || 0,
      actualCost: Number(item.actualCost) || 0,
      isEstimate: item.isEstimate !== false,
      notes: item.notes || 'AI generated budget estimate'
    })),
    timeline: (raw.timeline || []).map((item: any, idx: number): TimelineTask => ({
      id: `t-${idx + 1}-${Date.now()}`,
      title: item.title || 'Task item',
      category: item.category || 'General',
      dueDate: item.dueDate || getFutureDate(30),
      daysBeforeEvent: Number(item.daysBeforeEvent) || 14,
      priority: item.priority || 'medium',
      completed: Boolean(item.completed),
      notes: item.notes || ''
    })),
    dayOfSchedule: (raw.dayOfSchedule || []).map((item: any, idx: number): ScheduleItem => ({
      id: `s-${idx + 1}-${Date.now()}`,
      time: item.time || '10:00 AM',
      activity: item.activity || 'Activity',
      responsiblePerson: item.responsiblePerson || 'Host',
      notes: item.notes || ''
    })),
    vendors: (raw.vendors || []).map((item: any, idx: number): Vendor => ({
      id: `v-${idx + 1}-${Date.now()}`,
      category: item.category || 'Vendor',
      name: item.name || 'Recommended Vendor',
      contactPerson: item.contactPerson || 'Vendor Lead',
      phone: item.phone || 'Contact via Directory',
      email: item.email || 'info@vendor.example.com',
      estimatedQuote: Number(item.estimatedQuote) || 0,
      actualQuote: item.actualQuote ? Number(item.actualQuote) : undefined,
      status: item.status || 'pending',
      isVerifiedUserVendor: Boolean(item.isVerifiedUserVendor),
      notes: item.notes || 'AI suggested vendor checklist category'
    })),
    personalizedIdeas: {
      themeConcept: raw.personalizedIdeas?.themeConcept || 'Celebration Style',
      themeDescription: raw.personalizedIdeas?.themeDescription || 'A tailored event experience designed around your requirements.',
      colorPalette: Array.isArray(raw.personalizedIdeas?.colorPalette) ? raw.personalizedIdeas.colorPalette : [
        { name: 'Royal Gold', hex: '#EAB308', role: 'Accent' },
        { name: 'Deep Sapphire', hex: '#1E3A8A', role: 'Dominant' },
        { name: 'Ivory Cream', hex: '#FEF3C7', role: 'Background' }
      ],
      decorIdeas: Array.isArray(raw.personalizedIdeas?.decorIdeas) ? raw.personalizedIdeas.decorIdeas : ['Atmospheric fairy light canopy', 'Custom welcome floral arch'],
      menuSuggestions: Array.isArray(raw.personalizedIdeas?.menuSuggestions) ? raw.personalizedIdeas.menuSuggestions : [
        { course: 'Welcome Drinks', items: ['Fresh Mint Lemonade', 'Mango Lassi'], dietaryNotes: 'Vegetarian' },
        { course: 'Main Feast', items: ['Paneer Tikka', 'Dal Makhani', 'Jeera Rice'], dietaryNotes: 'Vegetarian' }
      ],
      entertainmentActivities: Array.isArray(raw.personalizedIdeas?.entertainmentActivities) ? raw.personalizedIdeas.entertainmentActivities : ['Music playlist', 'Photo booth station'],
      specialTouches: Array.isArray(raw.personalizedIdeas?.specialTouches) ? raw.personalizedIdeas.specialTouches : ['Personalized gift favors', 'Memory guestbook']
    },
    aiMetadata: {
      modelUsed: model,
      generatedAt: now,
      isLiveAi: isLive,
      promptUsed
    },
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Intelligent Heuristic GenAI Engine:
 * Generates an event plan directly from text keywords and numbers when API key is offline or unavailable.
 */
export function generateHeuristicPlan(promptText: string, currency: Currency = 'INR'): EventPlan {
  const p = promptText.toLowerCase();

  // 1. Detect Event Type
  let type: EventType = 'birthday';
  if (p.includes('wedding') || p.includes('shaadi') || p.includes('reception') || p.includes('sangeet') || p.includes('haldi')) {
    type = 'wedding';
  } else if (p.includes('community') || p.includes('society') || p.includes('fair') || p.includes('neighbourhood') || p.includes('ngo') || p.includes('festival')) {
    type = 'community';
  } else if (p.includes('anniversary') || p.includes('silver jubilee') || p.includes('golden jubilee')) {
    type = 'anniversary';
  } else if (p.includes('corporate') || p.includes('office') || p.includes('annual day') || p.includes('seminar') || p.includes('conference')) {
    type = 'corporate';
  } else {
    type = 'birthday';
  }

  // 2. Extract Guest Count
  let guestCount = 40;
  const guestMatch = p.match(/(\d+)\s*(guests?|people|pax|members|attendees|persons?|kids?|friends?)/i);
  if (guestMatch) {
    guestCount = parseInt(guestMatch[1], 10);
  } else if (type === 'wedding') {
    guestCount = 200;
  } else if (type === 'community') {
    guestCount = 150;
  }

  // 3. Extract Budget
  let totalBudget = 30000;
  const lakhMatch = p.match(/(\d+(?:\.\d+)?)\s*(lakhs?|lacs?|lac|l)/i);
  const kMatch = p.match(/(\d+(?:\.\d+)?)\s*(k|thousand)/i);
  const directNumMatch = p.match(/(?:budget\s*(?:of|is|:)?\s*|[₹$€£]\s*)(\d[\d,]*)/i);

  if (lakhMatch) {
    totalBudget = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else if (kMatch) {
    totalBudget = Math.round(parseFloat(kMatch[1]) * 1000);
  } else if (directNumMatch) {
    totalBudget = parseInt(directNumMatch[1].replace(/,/g, ''), 10);
  } else {
    // defaults based on type
    if (type === 'wedding') totalBudget = 1000000;
    else if (type === 'community') totalBudget = 60000;
    else if (type === 'corporate') totalBudget = 120000;
    else totalBudget = 25000;
  }

  // 4. Outdoor vs Indoor
  let outdoorIndoor: 'outdoor' | 'indoor' | 'hybrid' = 'hybrid';
  if (p.includes('outdoor') || p.includes('lawn') || p.includes('garden') || p.includes('park') || p.includes('beach')) {
    outdoorIndoor = 'outdoor';
  } else if (p.includes('indoor') || p.includes('hall') || p.includes('banquet') || p.includes('hotel') || p.includes('resort')) {
    outdoorIndoor = 'indoor';
  }

  // 5. Dietary preferences
  const dietary: string[] = [];
  if (p.includes('veg') && !p.includes('non-veg')) dietary.push('Pure Vegetarian');
  if (p.includes('jain')) dietary.push('Jain Counter Available');
  if (p.includes('vegan')) dietary.push('Vegan Dishes Included');
  if (p.includes('non-veg') || p.includes('bbq') || p.includes('chicken')) dietary.push('Non-Vegetarian Specialties');
  if (p.includes('nut-free') || p.includes('allergy')) dietary.push('Nut-Free Safe Kitchen');
  if (dietary.length === 0) dietary.push('Vegetarian & Multi-Cuisine options');

  // Title generation
  let title = '';
  if (type === 'wedding') title = 'Grand Celebratory Wedding Ceremony & Reception';
  else if (type === 'birthday') title = `Festive Celebration Birthday Party (${guestCount} Guests)`;
  else if (type === 'community') title = 'Community Neighborhood Festival & Cultural Gathering';
  else if (type === 'anniversary') title = 'Silver Jubilee Celebration & Dinner Gala';
  else title = 'Annual Corporate Summit & Evening Celebration';

  // Specific custom title if user gave details
  const nameMatch = promptText.match(/(?:for|of)\s+([A-Z][a-zA-Z\s&]+?)(?:'s|\s+with|\s+at|\s+on|,|$)/);
  if (nameMatch && nameMatch[1].trim().length < 30) {
    title = `${nameMatch[1].trim()}’s ${type.charAt(0).toUpperCase() + type.slice(1)} Celebration`;
  }

  // 6. Realistic Budget Distribution by Category
  const budgetItems: BudgetItem[] = generateCategoryBudgets(type, totalBudget);

  // 7. Timeline Tasks
  const timeline: TimelineTask[] = generateTimelineTasks(type);

  // 8. Day of Schedule
  const dayOfSchedule: ScheduleItem[] = generateDayOfSchedule(type, outdoorIndoor);

  // 9. Vendor Checklist
  const vendors: Vendor[] = generateVendors(type, budgetItems);

  // 10. Personalized Ideas
  const personalizedIdeas: PersonalizedIdeas = generateIdeas(type, promptText, outdoorIndoor, dietary);

  const eventDate = getFutureDate(type === 'wedding' ? 90 : 30);
  const now = new Date().toISOString();

  return {
    id: 'plan-' + Date.now(),
    title,
    type,
    date: eventDate,
    time: '18:00',
    location: outdoorIndoor === 'outdoor' ? 'Riverside Open Lawn & Pavilion' : 'Grand Celebrations Banquet Hall',
    guestCount,
    totalBudget,
    currency,
    preferences: {
      dietary,
      theme: personalizedIdeas.themeConcept,
      atmosphere: 'Warm, Festive, High-Energy and Heartwarming',
      outdoorIndoor,
      specialRequirements: 'Eco-conscious decor, digital RSVP reminders, seamless vendor coordination'
    },
    budgetItems,
    timeline,
    dayOfSchedule,
    vendors,
    personalizedIdeas,
    aiMetadata: {
      modelUsed: 'CelebrationAI Heuristic Engine (Offline Safe)',
      generatedAt: now,
      isLiveAi: false,
      promptUsed: promptText
    },
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Distributes budget realistically across the 7 challenge-mandated categories
 */
function generateCategoryBudgets(type: EventType, total: number): BudgetItem[] {
  // Proportions based on real-world event planning standards
  let ratios: { category: string; name: string; pct: number; notes: string }[] = [];

  if (type === 'wedding') {
    ratios = [
      { category: 'Venue & Booking', name: 'Banquet Hall & Lawns Rental (2 Days)', pct: 0.28, notes: 'Includes ambient stage lighting and power backup' },
      { category: 'Catering & Refreshments', name: 'Full Multi-Course Wedding Buffet & Live Counters', pct: 0.32, notes: 'Appetizers, main banquet, artisanal beverage counters' },
      { category: 'Decorations & Flowers', name: 'Mandap Floral Sculptures, Fairy Light Canopy & Stage', pct: 0.16, notes: 'AI Estimate: Seasonal fresh flower rate variable' },
      { category: 'Photography & Videography', name: 'Drone 4K Coverage + Candid Photo Duo + Teaser Reel', pct: 0.10, notes: 'Includes pre-wedding shoot & hardbound album' },
      { category: 'Entertainment', name: 'Live Band / DJ, Sound Rig & Sangeet Choreographer', pct: 0.07, notes: 'Audio setup with wireless mics' },
      { category: 'Invitations & Stationery', name: 'E-invites, Video Motion Teasers & Printed Box Favors', pct: 0.03, notes: 'Eco seed paper cards included' },
      { category: 'Transportation & Misc', name: 'Guest Transfers, Emergency Contingency Buffer', pct: 0.04, notes: 'Includes 4% emergency reserve' },
    ];
  } else if (type === 'birthday') {
    ratios = [
      { category: 'Venue & Booking', name: 'Party Hall / Garden Pavilion Rental', pct: 0.20, notes: 'Includes tables, chairs, and cleanup fees' },
      { category: 'Catering & Refreshments', name: 'Finger Foods, Party Sliders, Themed Drinks & Custom Cake', pct: 0.38, notes: 'Special 2-tier designer theme cake included' },
      { category: 'Decorations & Flowers', name: 'Theme Balloon Arch, Backdrop Banner, Table Centerpieces', pct: 0.18, notes: 'AI Estimate: Biodegradable balloons and LED signage' },
      { category: 'Photography & Videography', name: '3-Hour Candid Birthday Event Photographer', pct: 0.10, notes: 'Edited digital high-res photos within 48 hours' },
      { category: 'Entertainment', name: 'Party Host / Magic Show / Game Emcee & Music System', pct: 0.08, notes: 'Interactive games and prizes for guests' },
      { category: 'Invitations & Stationery', name: 'Animated WhatsApp Video Invites & Welcome Signage', pct: 0.02, notes: 'Digital design with RSVP tracking' },
      { category: 'Transportation & Misc', name: 'Themed Return Goodie Bags & First Aid Buffer', pct: 0.04, notes: 'Personalized favor boxes for each attendee' },
    ];
  } else if (type === 'community') {
    ratios = [
      { category: 'Venue & Booking', name: 'Community Park / Plaza Maintenance & Permit Charges', pct: 0.12, notes: 'Civic permissions and sanitization' },
      { category: 'Catering & Refreshments', name: 'Community Tea, Regional Snacks & Potluck Stations', pct: 0.36, notes: 'Compostable areca palm leaf plates' },
      { category: 'Decorations & Flowers', name: 'Eco Banners, Potted Foliage & Welcome Archways', pct: 0.16, notes: 'Reusable decor materials' },
      { category: 'Photography & Videography', name: 'Community Media Volunteer Equipment & Highlights Reel', pct: 0.08, notes: 'Social media recap video' },
      { category: 'Entertainment', name: 'Public PA System, Stage Mic Setup & Cultural Performers', pct: 0.16, notes: 'Sound equipment rental and sound tech' },
      { category: 'Invitations & Stationery', name: 'Flyers, Posters, Digital Society Notices & Badges', pct: 0.04, notes: 'Direct outreach materials' },
      { category: 'Transportation & Misc', name: 'Waste Segregation Bins, First Aid, Contingency', pct: 0.08, notes: 'Emergency equipment & cleanup team' },
    ];
  } else {
    // corporate or anniversary
    ratios = [
      { category: 'Venue & Booking', name: 'Corporate Ballroom / Lounge Venue Hire', pct: 0.30, notes: 'Audio-visual project and staging included' },
      { category: 'Catering & Refreshments', name: 'Hors d’oeuvres, Gourmet Dinner & Cocktail Bar', pct: 0.35, notes: 'High-end culinary service' },
      { category: 'Decorations & Flowers', name: 'Minimalist Modern Floral Installations & Step-and-Repeat', pct: 0.12, notes: 'AI Estimate: Branded floral centerpieces' },
      { category: 'Photography & Videography', name: 'Executive Event Photographer & Video Interview Corner', pct: 0.10, notes: 'Press and marketing ready assets' },
      { category: 'Entertainment', name: 'Emcee Host, Keynote Setup & Jazz Trio / DJ', pct: 0.07, notes: 'Wireless microphone set and house music' },
      { category: 'Invitations & Stationery', name: 'Digital Lanyards, Agendas & Registration Badges', pct: 0.02, notes: 'QR check-in system' },
      { category: 'Transportation & Misc', name: 'Executive Chauffeur Shuttles & Event Insurance', pct: 0.04, notes: 'Contingency reserve' },
    ];
  }

  let allocated = 0;
  return ratios.map((r, i) => {
    // For last item adjust rounding so sum equals total exactly
    let cost = Math.round(total * r.pct);
    if (i === ratios.length - 1) {
      cost = Math.max(0, total - allocated);
    } else {
      allocated += cost;
    }
    return {
      id: `b-calc-${i + 1}-${Date.now()}`,
      category: r.category,
      name: r.name,
      estimatedCost: cost,
      actualCost: 0,
      isEstimate: true,
      notes: r.notes
    };
  });
}

function generateTimelineTasks(type: EventType): TimelineTask[] {
  if (type === 'wedding') {
    return [
      { id: 't1', title: 'Confirm wedding venue, banquet halls & lock dates', category: 'Venue', dueDate: getFutureDate(10), daysBeforeEvent: 80, priority: 'high', completed: false, notes: 'Verify parking and noise cutoff policies' },
      { id: 't2', title: 'Schedule menu tasting session with wedding caterer', category: 'Catering', dueDate: getFutureDate(20), daysBeforeEvent: 70, priority: 'high', completed: false, notes: 'Review live counters and allergen handling' },
      { id: 't3', title: 'Finalize decorator theme moodboards & stage lighting', category: 'Decor', dueDate: getFutureDate(35), daysBeforeEvent: 55, priority: 'medium', completed: false, notes: 'Review 3D layout of floral mandap' },
      { id: 't4', title: 'Send digital save-the-dates & collect guest RSVPs', category: 'Invitations', dueDate: getFutureDate(45), daysBeforeEvent: 45, priority: 'medium', completed: false, notes: 'Include lodging and transport questionnaire' },
      { id: 't5', title: 'Book candid photography and drone videography team', category: 'Photography', dueDate: getFutureDate(55), daysBeforeEvent: 35, priority: 'high', completed: false, notes: 'Provide specific shot list of family elders' },
      { id: 't6', title: 'Conduct soundcheck & timeline walkthrough with priest & emcee', category: 'Coordination', dueDate: getFutureDate(88), daysBeforeEvent: 2, priority: 'high', completed: false, notes: 'Review baraat entry and garland timing' }
    ];
  } else if (type === 'birthday') {
    return [
      { id: 't1', title: 'Confirm party venue / lawn booking and timing', category: 'Venue', dueDate: getFutureDate(5), daysBeforeEvent: 25, priority: 'high', completed: false, notes: 'Ensure electrical plugs for sound and bouncy castle' },
      { id: 't2', title: 'Order designer theme cake and finalize finger foods', category: 'Catering', dueDate: getFutureDate(10), daysBeforeEvent: 20, priority: 'high', completed: false, notes: 'Check dietary restrictions and nut-free safety' },
      { id: 't3', title: 'Dispatch WhatsApp animated video invites to parents', category: 'Invitations', dueDate: getFutureDate(12), daysBeforeEvent: 18, priority: 'medium', completed: false, notes: 'Request RSVP count for favor boxes' },
      { id: 't4', title: 'Confirm party host / magician / game entertainer', category: 'Entertainment', dueDate: getFutureDate(18), daysBeforeEvent: 12, priority: 'medium', completed: false, notes: 'Review game lineup and duration' },
      { id: 't5', title: 'Pack personalized return gift favor boxes with name tags', category: 'Favors', dueDate: getFutureDate(26), daysBeforeEvent: 4, priority: 'low', completed: false, notes: 'Include theme stickers and creative craft kit' },
      { id: 't6', title: 'Setup party balloon garland and photo corner', category: 'Day-Of', dueDate: getFutureDate(30), daysBeforeEvent: 0, priority: 'high', completed: false, notes: 'Begin setup 2.5 hours prior to guest arrival' }
    ];
  } else {
    // community
    return [
      { id: 't1', title: 'Resident Association approval and civic permissions', category: 'Permissions', dueDate: getFutureDate(5), daysBeforeEvent: 25, priority: 'high', completed: false, notes: 'Obtain sound permit and plaza booking' },
      { id: 't2', title: 'Invite stall registrations for local resident artisans and bakers', category: 'Vendors', dueDate: getFutureDate(12), daysBeforeEvent: 18, priority: 'high', completed: false, notes: 'Assign booth numbered spaces' },
      { id: 't3', title: 'Procure eco-friendly compostable cutlery & waste bins', category: 'Logistics', dueDate: getFutureDate(18), daysBeforeEvent: 12, priority: 'medium', completed: false, notes: 'Areca nut palm plates and segregators' },
      { id: 't4', title: 'Release resident cultural performance schedule', category: 'Program', dueDate: getFutureDate(22), daysBeforeEvent: 8, priority: 'medium', completed: false, notes: 'Music, dance, and poetry acts' },
      { id: 't5', title: 'Deploy youth volunteer team for banner setup & registration', category: 'Volunteers', dueDate: getFutureDate(29), daysBeforeEvent: 1, priority: 'high', completed: false, notes: 'Brief team on safety protocols' }
    ];
  }
}

function generateDayOfSchedule(type: EventType, mode: string): ScheduleItem[] {
  if (type === 'wedding') {
    return [
      { id: 's1', time: '09:00 AM', activity: 'Venue Access & Floral Mandap Construction', responsiblePerson: 'Decorator Lead', notes: 'Stage, lights and audio check' },
      { id: 's2', time: '01:00 PM', activity: 'Bridal & Groom Styling and Photography Pre-shoot', responsiblePerson: 'Photography Team', notes: 'Portraits before crowds arrive' },
      { id: 's3', time: '04:00 PM', activity: 'Baraat Assembly & Welcoming Refreshments', responsiblePerson: 'Family Coordinators', notes: 'Live dhol and welcome mocktails' },
      { id: 's4', time: '05:30 PM', activity: 'Varmala & Sunset Golden Hour Photo Session', responsiblePerson: 'Priest & Photographers', notes: 'Sunset backdrop timing is essential' },
      { id: 's5', time: '07:30 PM', activity: 'Dinner Buffet Opens & Live Musical Performance', responsiblePerson: 'Catering Manager', notes: 'Keep live counters continuously replenished' },
      { id: 's6', time: '10:00 PM', activity: 'Pheras, Blessings & Farewell Vidaai', responsiblePerson: 'Host Family', notes: 'Gift favors handed to departing guests' }
    ];
  } else if (type === 'birthday') {
    return [
      { id: 's1', time: '02:00 PM', activity: 'Decor Setup: Balloon Arch & Table Displays', responsiblePerson: 'Decor Vendor', notes: 'Check audio speaker Bluetooth connection' },
      { id: 's2', time: '04:00 PM', activity: 'Guest Arrival, Welcome Mocktails & Tattoos / Face Painting', responsiblePerson: 'Host Team', notes: 'Hand out name badges & party hats' },
      { id: 's3', time: '04:45 PM', activity: 'Interactive Games & Science / Magic Show', responsiblePerson: 'Entertainer', notes: 'High-energy group games with music' },
      { id: 's4', time: '05:45 PM', activity: 'Cake Cutting Ceremony & Birthday Song', responsiblePerson: 'Birthday Star & Family', notes: 'Sparkler candle & celebration photo' },
      { id: 's5', time: '06:15 PM', activity: 'Finger Food Feast & Slider Burgers Buffet', responsiblePerson: 'Caterer', notes: 'Juices and fruit skewers served' },
      { id: 's6', time: '07:00 PM', activity: 'Return Gift Favor Distribution & Wrap-up', responsiblePerson: 'Parents', notes: 'Personalized gift bag for every guest' }
    ];
  } else {
    // community
    return [
      { id: 's1', time: '01:00 PM', activity: 'Plaza Cleaning & Artisan Stall Allocation', responsiblePerson: 'Logistics Head', notes: 'Tables, umbrellas & electrical extension cords' },
      { id: 's2', time: '03:00 PM', activity: 'Eco-Fair Gates Open: Resident Stalls & Food Counters', responsiblePerson: 'Volunteers', notes: 'Ambient acoustic folk music playing' },
      { id: 's3', time: '04:30 PM', activity: 'Interactive Workshop: Zero-Waste Living & Terrace Gardening', responsiblePerson: 'Guest Speaker', notes: 'Live composting demonstration' },
      { id: 's4', time: '06:00 PM', activity: 'Resident Talent Night & Cultural Showcase', responsiblePerson: 'Stage Emcee', notes: '8 music, dance and poetry presentations' },
      { id: 's5', time: '07:30 PM', activity: 'Community Feast & Millet Dinner Fellowship', responsiblePerson: 'Catering Group', notes: 'Waste segregation bins actively monitored' },
      { id: 's6', time: '08:45 PM', activity: 'Plant Sapling Giveaway & Closing Address', responsiblePerson: 'RWA President', notes: 'Volunteer cleanup drive completes by 9:30 PM' }
    ];
  }
}

function generateVendors(type: EventType, budgetItems: BudgetItem[]): Vendor[] {
  const findCost = (cat: string) => budgetItems.find(b => b.category.includes(cat))?.estimatedCost || 10000;

  if (type === 'wedding') {
    return [
      { id: 'v1', category: 'Venue', name: 'Grand Heritage Palace Lawns (AI Match)', contactPerson: 'Event Sales Desk', phone: '+91 98000 11223', email: 'sales@heritagepalace.in', estimatedQuote: findCost('Venue'), status: 'pending', isVerifiedUserVendor: false, notes: 'AI Recommended: Renowned for outdoor courtyards and large banquet halls' },
      { id: 'v2', category: 'Catering', name: 'Royal Saffron Banquet Caterers (AI Match)', contactPerson: 'Chef Sanjeev', phone: '+91 98000 22334', email: 'quotes@royalsaffron.com', estimatedQuote: findCost('Catering'), status: 'pending', isVerifiedUserVendor: false, notes: 'AI Recommended: Specializes in 40+ item traditional feasts & live street food counters' },
      { id: 'v3', category: 'Decor & Floral', name: 'Petals & Lights Wedding Designers (AI Match)', contactPerson: 'Pooja Kapoor', phone: '+91 98000 33445', email: 'hello@petalslights.in', estimatedQuote: findCost('Decor'), status: 'pending', isVerifiedUserVendor: false, notes: 'AI Recommended: Expert in sustainable floral mandaps and fairy light canopies' },
      { id: 'v4', category: 'Photography', name: 'Artisan Lens Cinematic Studio (AI Match)', contactPerson: 'Rohan Verma', phone: '+91 98000 44556', email: 'contact@artisanlens.in', estimatedQuote: findCost('Photo'), status: 'pending', isVerifiedUserVendor: false, notes: 'AI Recommended: Dual candid shooters with 4K drone cinematography' },
      { id: 'v5', category: 'Entertainment', name: 'Rhythm & Strings Live Band (AI Match)', contactPerson: 'Kabir Band Lead', phone: '+91 98000 55667', email: 'bookings@rhythmstrings.in', estimatedQuote: findCost('Entertain'), status: 'pending', isVerifiedUserVendor: false, notes: 'AI Recommended: Fusion acoustic and Bollywood party playlist' }
    ];
  } else if (type === 'birthday') {
    return [
      { id: 'v1', category: 'Bakery & Cake', name: 'Sugar & Sparkle Designer Bakes (AI Match)', contactPerson: 'Baker Ritu', phone: '+91 98111 55667', email: 'orders@sugarsparkle.in', estimatedQuote: Math.round(findCost('Catering') * 0.35), status: 'pending', isVerifiedUserVendor: false, notes: 'AI Recommended: Custom 2-tier theme cake with eggless options' },
      { id: 'v2', category: 'Catering', name: 'Happy Bites Party Caterers (AI Match)', contactPerson: 'Manish Rawat', phone: '+91 98111 66778', email: 'info@happybites.in', estimatedQuote: Math.round(findCost('Catering') * 0.65), status: 'pending', isVerifiedUserVendor: false, notes: 'AI Recommended: Nut-free mini burgers, pasta cups & fruit skewers' },
      { id: 'v3', category: 'Decor', name: 'WonderBalloons Creative Studio (AI Match)', contactPerson: 'Sunil Decorator', phone: '+91 98111 77889', email: 'decor@wonderballoons.com', estimatedQuote: findCost('Decor'), status: 'pending', isVerifiedUserVendor: false, notes: 'AI Recommended: Organic balloon garlands, theme cutouts & illuminated marquee numbers' },
      { id: 'v4', category: 'Entertainment', name: 'Magic Star Kids Events (AI Match)', contactPerson: 'Emcee Rohit', phone: '+91 98111 88990', email: 'shows@magicstarkids.in', estimatedQuote: findCost('Entertain'), status: 'pending', isVerifiedUserVendor: false, notes: 'AI Recommended: Interactive magic, balloon twisting, and energetic party games' }
    ];
  } else {
    // community
    return [
      { id: 'v1', category: 'Audio & Stage', name: 'Acoustic Sound Rig Systems (AI Match)', contactPerson: 'Venkatesh S.', phone: '+91 98222 33445', email: 'sound@acousticsoundrig.in', estimatedQuote: findCost('Entertain'), status: 'pending', isVerifiedUserVendor: false, notes: 'AI Recommended: PA system, wireless stage microphones & stage spotlights' },
      { id: 'v2', category: 'Eco Catering', name: 'Prakriti Natural Foods (AI Match)', contactPerson: 'Leela Murthy', phone: '+91 98222 44556', email: 'orders@prakritifoods.org', estimatedQuote: findCost('Catering'), status: 'pending', isVerifiedUserVendor: false, notes: 'AI Recommended: Organic millet snacks, fresh buttermilk, and palm leaf tableware' },
      { id: 'v3', category: 'Green Supplies', name: 'Vriksha Native Nursery (AI Match)', contactPerson: 'Suresh Kumar', phone: '+91 98222 55667', email: 'saplings@vrikshanursery.org', estimatedQuote: Math.round(findCost('Transportation') * 0.7), status: 'pending', isVerifiedUserVendor: false, notes: 'AI Recommended: Native herb and tree saplings for community giveaways' }
    ];
  }
}

function generateIdeas(type: EventType, prompt: string, mode: string, dietary: string[]): PersonalizedIdeas {
  const p = prompt.toLowerCase();

  if (type === 'wedding') {
    return {
      themeConcept: 'Regal Twilight & Golden Botanical',
      themeDescription: 'A luxurious open-air evening celebrating timeless romance with glowing brass candlelight, fragrant jasmine curtains, and warm golden hour aesthetics.',
      colorPalette: [
        { name: 'Royal Emerald', hex: '#064E3B', role: 'Botanical foliage & drapery' },
        { name: 'Warm Terracotta', hex: '#C2410C', role: 'Earthy earthen pots & arches' },
        { name: 'Lustrous Gold', hex: '#D97706', role: 'Brass accents & lighting' },
        { name: 'Blush Rose', hex: '#F43F5E', role: 'Floral highlights' },
        { name: 'Ivory Shimmer', hex: '#FFFBEB', role: 'Linens and backdrop fabric' }
      ],
      decorIdeas: [
        'Curved wooden mandap adorned with overflowing tuberose (rajnigandha), baby breath, and deep crimson roses.',
        'Hanging vintage brass lanterns and floating water urulis with marigold petals flanking the guest entryway.',
        'Fairy light canopy ceiling over the dining lawn creating a starlit dinner atmosphere.',
        'Calligraphy mirror welcome standee featuring the couple’s monogram and customized celebration hashtag.'
      ],
      menuSuggestions: [
        { course: 'Welcome Refreshments', items: ['Kokum & Mint Sparkler', 'Saffron Cardamom Thandai', 'Fresh Coconut Water with Rose Essence'], dietaryNotes: 'Refreshing & Natural' },
        { course: 'Street Food Live Counters', items: ['Crispy Palak Patta Chaat with Tamarind Glaze', 'Mini Truffle Kulchas with Chole Shots', 'Smoked Paneer Tikka with Mint Coulis'], dietaryNotes: dietary.join(', ') },
        { course: 'Royal Main Course', items: ['Shahi Dal Makhani Simmered Overnight', 'Paneer Lababdar in Rich Tomato Cashew Gravy', 'Dum Subz Biryani with Burani Raita', 'Artisanal Naan & Tandoori Roti Basket'], dietaryNotes: 'Feast banquet' },
        { course: 'Artisanal Desserts', items: ['Live Hot Jalebis with Rabri Drops', 'Baked Gulab Jamun Tart', 'Pistachio Kulfi with Rose Petal Falooda'], dietaryNotes: 'Decadent Finale' }
      ],
      entertainmentActivities: [
        'Bridal walk under a bespoke phoolon ki chaadar illuminated with micro fairy lights.',
        'Interactive live sitar and acoustic flute duo during the sunset welcome hour.',
        'Instant Polaroid photo station with a guest blessing guestbook for Polaroid keepsake notes.'
      ],
      specialTouches: [
        'Biodegradable seed-paper wedding invites that guests can plant into marigold flowers.',
        'Warm pashmina stoles provided in woven baskets for outdoor evening breezes.'
      ]
    };
  } else if (type === 'birthday') {
    const isKids = p.includes('kid') || p.includes('child') || p.includes('7th') || p.includes('5th') || p.includes('10th') || p.includes('boy') || p.includes('girl');
    return {
      themeConcept: isKids ? 'Whimsical Adventure & Galactic Wonder' : 'Neon Chic Celebration & Sunset Vibes',
      themeDescription: isKids
        ? 'A vibrant wonderland of imaginative discoveries, interactive games, and festive delight tailored for young explorers and their families.'
        : 'An energetic, modern social celebration filled with photo-ready aesthetic nooks, ambient beats, and curated comfort foods.',
      colorPalette: [
        { name: 'Electric Azure', hex: '#0284C7', role: 'Primary Party Energy' },
        { name: 'Vibrant Coral', hex: '#F97316', role: 'Warm Playful Highlights' },
        { name: 'Sunbeam Gold', hex: '#FBBF24', role: 'Celebration Stars' },
        { name: 'Mint Breeze', hex: '#10B981', role: 'Fresh Secondary Accent' },
        { name: 'Lavender Glow', hex: '#8B5CF6', role: 'Ambient Backdrops' }
      ],
      decorIdeas: [
        'Organic asymmetric balloon garland arch with customized neon name LED sign for the central stage.',
        'Interactive dessert table framed with hanging geometric paper lanterns and fairy lights.',
        'Life-size cutout photobooth with customized speech bubbles and celebration props.'
      ],
      menuSuggestions: [
        { course: 'Welcome Drinks', items: ['Blueberry Bubble Mocktail', 'Fresh Watermelon Mint Coolers', 'Virgin Peach Sangria'], dietaryNotes: 'Kid-friendly & Refreshing' },
        { course: 'Fun Finger Foods', items: ['Mini Veggie Sliders on Brioche Buns', 'Crispy Corn & Jalapeño Cheese Poppers', 'Oven-Baked Potato Wedges with Creamy Herb Dip'], dietaryNotes: dietary.join(', ') },
        { course: 'Party Main Course', items: ['Artisan Thin-Crust Pizza Slices', 'Creamy Sweet Corn Fusilli Pasta', 'Stir-fried Hakka Noodles with Spring Veggies'], dietaryNotes: 'Popular Crowd Pleaser' },
        { course: 'The Sweet Spot', items: ['Custom 2-Tier Designer Theme Cake', 'Galaxy Glazed Cupcakes', 'Chocochip Brownie Bites with Ice Cream'], dietaryNotes: 'Eggless Options' }
      ],
      entertainmentActivities: [
        'Interactive science experiments / illusionist magic show that engages all the kids.',
        'Musical statues dance-off and balloon scavenger hunt with mystery prize boxes.',
        'DIY craft badge workshop where guests design and wear their own personalized party crests.'
      ],
      specialTouches: [
        'Personalized goodie bags featuring a custom storybook or mini craft puzzle matching the party theme.',
        'Digital memory video wall looping cheerful memories and baby milestones.'
      ]
    };
  } else {
    // community
    return {
      themeConcept: 'Eco-Harmony & Neighborhood Cultural Mosaic',
      themeDescription: 'A grassroots open festival uniting neighbors through sustainable living, local artisanal food stalls, and an evening of homegrown acoustic cultural performances.',
      colorPalette: [
        { name: 'Deep Meadow', hex: '#15803D', role: 'Eco Nature Foundation' },
        { name: 'Terracotta Earth', hex: '#B45309', role: 'Clay Artisan Warmth' },
        { name: 'Sunflower Yellow', hex: '#EAB308', role: 'Festive Cheer' },
        { name: 'Earthy Sage', hex: '#84CC16', role: 'Organic Accents' },
        { name: 'Warm Cream', hex: '#FEF3C7', role: 'Natural Cotton Fabric Canvas' }
      ],
      decorIdeas: [
        'Upcycled hand-painted cloth bunting made by resident children strung across tree branches.',
        'Potted medicinal plants and native flowering shrubs used as table and stage centerpieces (replanted afterwards).',
        'Handmade chalkboards with artistic typography detailing festival schedule and community achievements.'
      ],
      menuSuggestions: [
        { course: 'Welcome Sips', items: ['Herbal Amla & Ginger Sherbet', 'Spiced Buttermilk (Chaas)', 'Freshly Brewed South Indian Filter Coffee'], dietaryNotes: 'Healthy & Refreshing' },
        { course: 'Millet Street Snacks', items: ['Ragi & Sprouted Moong Bhel', 'Steamed Foxtail Millet Dhokla', 'Sweet Corn Chaat with Raw Mango Salsa'], dietaryNotes: 'Gluten-Free & Vegan Friendly' },
        { course: 'Community Dinner', items: ['Panchmel Dal Tadka with Brown Basmati Rice', 'Paneer Bhurji with Methi Parathas', 'Baingan Ka Bharta with Missi Roti'], dietaryNotes: 'Wholesome Vegetarian' },
        { course: 'Traditional Sweets', items: ['Jaggery Sesame Laddoos', 'Coconut Date Rolls', 'Sweet Jaggery Payasam'], dietaryNotes: 'Refined Sugar Free' }
      ],
      entertainmentActivities: [
        'Neighborhood Talent Showcase: 10-minute amateur acoustic music, folk songs, and poetry readings.',
        'DIY Kids Upcycling Corner: Transforming milk cartons into bird feeders and wildflower pots.',
        'Community Book & Plant Exchange: "Take a Plant, Leave a Plant".'
      ],
      specialTouches: [
        'Every attending family receives an indigenous sapling (Neem, Tulsi, Curry Leaf) to plant together.',
        'Zero-waste audit board showing how many kilograms of single-use plastic waste were prevented.'
      ]
    };
  }
}

/**
 * AI Refinement Engine: Updates an existing plan based on conversational user follow-up prompt!
 * e.g. "Make the menu vegan", "Add ₹10,000 to photography and reduce decor", "Change theme to Vintage Retro"
 */
export async function refineEventPlanWithAi(currentPlan: EventPlan, instruction: string): Promise<EventPlan> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nYou are updating an EXISTING event plan based on the user's refinement instructions.\n` +
                  `Current Event Plan:\n${JSON.stringify(currentPlan, null, 2)}\n\n` +
                  `User Refinement Instruction:\n"${instruction}"\n\n` +
                  `Return the COMPLETE updated event plan JSON with all changes seamlessly incorporated.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(cleanJsonResponse(rawText));
          return formatParsedPlan(parsed, 'gemini-2.5-flash', true, instruction);
        }
      }
    } catch (e) {
      console.warn('Live refinement failed, applying heuristic refinement:', e);
    }
  }

  // Smart Heuristic Refinement
  return applyHeuristicRefinement(currentPlan, instruction);
}

/**
 * Heuristic Refinement Engine for instant, offline or non-API key interactions
 */
function applyHeuristicRefinement(plan: EventPlan, instruction: string): EventPlan {
  const updated: EventPlan = JSON.parse(JSON.stringify(plan));
  const ins = instruction.toLowerCase();

  // 1. Budget adjustments
  const numberMatch = ins.match(/(?:increase|add|reduce|decrease|cut)\s*(?:by\s*)?[₹$€£]?\s*(\d+[\d,]*)/i);
  if (numberMatch) {
    const delta = parseInt(numberMatch[1].replace(/,/g, ''), 10);
    const isIncrease = ins.includes('increase') || ins.includes('add') || ins.includes('more');

    if (ins.includes('photo') || ins.includes('video')) {
      const photoItem = updated.budgetItems.find(b => b.category.includes('Photo'));
      if (photoItem) {
        photoItem.estimatedCost = Math.max(0, photoItem.estimatedCost + (isIncrease ? delta : -delta));
        photoItem.notes = (photoItem.notes || '') + ` (Adjusted via AI refinement: ${instruction})`;
      }
    } else if (ins.includes('decor') || ins.includes('flower')) {
      const decorItem = updated.budgetItems.find(b => b.category.includes('Decor'));
      if (decorItem) {
        decorItem.estimatedCost = Math.max(0, decorItem.estimatedCost + (isIncrease ? delta : -delta));
        decorItem.notes = (decorItem.notes || '') + ` (Adjusted via AI refinement)`;
      }
    } else if (ins.includes('catering') || ins.includes('food')) {
      const foodItem = updated.budgetItems.find(b => b.category.includes('Cater'));
      if (foodItem) {
        foodItem.estimatedCost = Math.max(0, foodItem.estimatedCost + (isIncrease ? delta : -delta));
      }
    }
  }

  // 2. Vegan / Dietary refinement
  if (ins.includes('vegan')) {
    if (!updated.preferences.dietary.includes('100% Plant-Based Vegan')) {
      updated.preferences.dietary.unshift('100% Plant-Based Vegan');
    }
    updated.personalizedIdeas.menuSuggestions.forEach(m => {
      m.dietaryNotes = '100% Vegan (Plant-based dairy alternatives)';
      m.items = m.items.map(it => it.replace(/paneer/gi, 'Tofu').replace(/cream/gi, 'Coconut Milk').replace(/ghee/gi, 'Cold-Pressed Oil'));
    });
  }

  // 3. Jain dietary refinement
  if (ins.includes('jain')) {
    if (!updated.preferences.dietary.includes('Strict Jain Safe (No onion/garlic/root veg)')) {
      updated.preferences.dietary.unshift('Strict Jain Safe (No onion/garlic/root veg)');
    }
    updated.personalizedIdeas.menuSuggestions.forEach(m => {
      m.dietaryNotes = 'Dedicated Jain Counter (Zero root vegetables)';
    });
  }

  // 4. Eco-friendly / Zero-waste
  if (ins.includes('eco') || ins.includes('sustainable') || ins.includes('green') || ins.includes('waste')) {
    updated.preferences.specialRequirements += ' | Strict zero-plastic policy with compostable palm leaf cutlery';
    updated.personalizedIdeas.specialTouches.unshift('100% Zero-Waste certification & live carbon footprint tally');
    updated.timeline.unshift({
      id: 't-eco-' + Date.now(),
      title: 'Partner with local composting agency for post-event food and floral waste',
      category: 'Sustainability',
      dueDate: getFutureDate(10),
      daysBeforeEvent: 20,
      priority: 'high',
      completed: false,
      notes: 'Added via AI refinement'
    });
  }

  // 5. Rain / Weather contingency
  if (ins.includes('rain') || ins.includes('weather') || ins.includes('indoor')) {
    updated.preferences.outdoorIndoor = 'hybrid';
    updated.timeline.unshift({
      id: 't-rain-' + Date.now(),
      title: 'Lock waterproof canopy tenting & indoor backup hall option',
      category: 'Contingency',
      dueDate: getFutureDate(5),
      daysBeforeEvent: 25,
      priority: 'high',
      completed: false,
      notes: 'Rain contingency plan added via AI refinement'
    });
    updated.personalizedIdeas.specialTouches.push('Decorative umbrellas and covered walkways provided for guests');
  }

  // 6. Theme change
  if (ins.includes('theme') || ins.includes('retro') || ins.includes('vintage') || ins.includes('boho')) {
    const themeName = instruction.replace(/change theme to|make it|theme:?/gi, '').trim();
    if (themeName) {
      updated.preferences.theme = themeName;
      updated.personalizedIdeas.themeConcept = themeName;
      updated.personalizedIdeas.themeDescription = `Updated concept curated around ${themeName} aesthetic with tailored styling, music, and decor accents.`;
    }
  }

  // Recompute total budget based on items
  const newEstimatedSum = updated.budgetItems.reduce((acc, it) => acc + it.estimatedCost, 0);
  updated.totalBudget = Math.max(updated.totalBudget, newEstimatedSum);
  updated.updatedAt = new Date().toISOString();
  updated.aiMetadata.promptUsed = instruction;

  return updated;
}

function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}
