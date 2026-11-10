import { EventPlan } from '../types/event';

export const SAMPLE_EVENTS: EventPlan[] = [
  {
    id: 'sample-wedding-1',
    title: 'Aarav & Maya’s Royal Botanical Wedding',
    type: 'wedding',
    date: '2027-02-14',
    time: '17:00',
    location: 'Udaipur / Heritage Resort & Gardens',
    guestCount: 250,
    totalBudget: 1500000,
    currency: 'INR',
    preferences: {
      dietary: ['Vegetarian', 'Jain Options Available', 'Live Chaat Counters'],
      theme: 'Royal Botanical & Terracotta Elegance',
      atmosphere: 'Regal, Warm, Joyful & Culturally Vibrant',
      outdoorIndoor: 'hybrid',
      specialRequirements: 'Grand floral mandap, acoustic live sitar + flute, eco-friendly seed-paper wedding invites'
    },
    budgetItems: [
      { id: 'b1', category: 'Venue & Booking', name: 'Heritage Courtyard & Lawn Rental (2 Days)', estimatedCost: 450000, actualCost: 420000, isEstimate: false, notes: 'Includes heritage lighting and generator backup' },
      { id: 'b2', category: 'Catering & Refreshments', name: 'Royal Rajputana & Coastal Vegetarian Banquet (250 pax)', estimatedCost: 375000, actualCost: 360000, isEstimate: false, notes: '₹1,440 per head with 40-item live spread' },
      { id: 'b3', category: 'Decorations & Flowers', name: 'Fresh Marigold, Rose & Brass Hanging Installations', estimatedCost: 220000, actualCost: 240000, isEstimate: true, notes: 'AI Estimate: Seasonal flower rate fluctuations' },
      { id: 'b4', category: 'Photography & Videography', name: 'Cinematic 4K Drone + Candid Duo Photographers (3 days)', estimatedCost: 180000, actualCost: 175000, isEstimate: false, notes: 'Includes pre-wedding teaser & album' },
      { id: 'b5', category: 'Entertainment', name: 'Sufi Folk Fusion Band + Sangeet DJ with Sound System', estimatedCost: 120000, actualCost: 110000, isEstimate: false, notes: '3-hour live acoustic followed by party set' },
      { id: 'b6', category: 'Invitations & Stationery', name: 'Digital Animated Video + Eco Seed Paper Physical Cards', estimatedCost: 35000, actualCost: 28000, isEstimate: false, notes: '100 boxed seed-paper kits dispatched' },
      { id: 'b7', category: 'Transportation & Misc', name: 'Guest Shuttles, Turban Tie-up Artists & Contingency', estimatedCost: 120000, actualCost: 90000, isEstimate: true, notes: 'AI Estimate: Includes 5% buffer fund' },
    ],
    timeline: [
      { id: 't1', title: 'Finalize and book heritage venue & lodging blocks', category: 'Venue', dueDate: '2026-11-20', daysBeforeEvent: 86, priority: 'high', completed: true, notes: 'Advance token payment cleared' },
      { id: 't2', title: 'Schedule wedding menu tasting session & live counters', category: 'Catering', dueDate: '2026-12-05', daysBeforeEvent: 71, priority: 'high', completed: true, notes: 'Confirmed Jain counters menu' },
      { id: 't3', title: 'Send digital save-the-dates & collect dietary RSVPs', category: 'Invitations', dueDate: '2026-12-15', daysBeforeEvent: 61, priority: 'medium', completed: true, notes: '190 guests confirmed so far' },
      { id: 't4', title: 'Finalize floral mandap moodboards and light design', category: 'Decor', dueDate: '2027-01-10', daysBeforeEvent: 35, priority: 'medium', completed: false, notes: 'Reviewing 3D render from decorator' },
      { id: 't5', title: 'Confirm choreography for Sangeet & bridal entry song', category: 'Entertainment', dueDate: '2027-01-20', daysBeforeEvent: 25, priority: 'low', completed: false, notes: '3 rehearsals completed' },
      { id: 't6', title: 'Conduct day-of run-through with coordinator & priest', category: 'General', dueDate: '2027-02-12', daysBeforeEvent: 2, priority: 'high', completed: false, notes: 'Rehearsal at 5:00 PM' }
    ],
    dayOfSchedule: [
      { id: 's1', time: '08:00 AM', activity: 'Bridal & Groom Hair, Makeup & Styling Begins', responsiblePerson: 'MUA Team', notes: 'Room 204 & 206' },
      { id: 's2', time: '11:30 AM', activity: 'Mandap Floral Inspection & Sound Check', responsiblePerson: 'Event Coordinator', notes: 'Ensure brass lanterns and marigold garlands are pristine' },
      { id: 's3', time: '03:30 PM', activity: 'Baraat Assembly & Welcome Refreshments', responsiblePerson: 'Dhol Tasha Troupe', notes: 'Welcome coolers: Kokum sherbet & tender coconut' },
      { id: 's4', time: '05:00 PM', activity: 'Varmala & Sunset Wedding Ceremony', responsiblePerson: 'Head Priest & Couple', notes: 'Sunset golden hour photo session starts right after' },
      { id: 's5', time: '07:30 PM', activity: 'Royal Dinner Banquet & Live Sufi Performance', responsiblePerson: 'Catering Lead', notes: 'Buffet open until 11:30 PM' },
      { id: 's6', time: '10:00 PM', activity: 'Pheras & Vidaai Ceremony', responsiblePerson: 'Family Elders', notes: 'Seed-paper souvenir favor distribution' }
    ],
    vendors: [
      { id: 'v1', category: 'Venue', name: 'Udai Vilas Heritage Lawns', contactPerson: 'Mr. R. Shekhawat', phone: '+91 98290 12345', email: 'events@udaivilasresort.in', estimatedQuote: 450000, actualQuote: 420000, status: 'confirmed', isVerifiedUserVendor: true, notes: 'Contract signed; advance paid.' },
      { id: 'v2', category: 'Catering', name: 'Rasoi Royal Gourmet Caterers', contactPerson: 'Chef Devendra Singh', phone: '+91 98450 67890', email: 'catering@rasoiroyal.com', estimatedQuote: 375000, actualQuote: 360000, status: 'confirmed', isVerifiedUserVendor: true, notes: 'Menu finalized with live Rajasthani chaat' },
      { id: 'v3', category: 'Decor', name: 'Bloom & Petal Artistry (AI Recommended)', contactPerson: 'Ananya Sharma', phone: 'Contact via AI Directory', email: 'hello@bloompetalart.in', estimatedQuote: 220000, actualQuote: 240000, status: 'quoted', isVerifiedUserVendor: false, notes: 'AI Suggestion: Specializes in brass and sustainable local marigolds' },
      { id: 'v4', category: 'Photography', name: 'Lumiere Stories Studio', contactPerson: 'Karan Mehra', phone: '+91 99100 45678', email: 'karan@lumierestories.in', estimatedQuote: 180000, actualQuote: 175000, status: 'confirmed', isVerifiedUserVendor: true, notes: 'Drone clearance secured' },
      { id: 'v5', category: 'Entertainment', name: 'Dhwani Sufi & Folk Collective', contactPerson: 'Sameer Khan', phone: '+91 97110 88221', email: 'bookings@dhwaniband.com', estimatedQuote: 120000, actualQuote: 110000, status: 'confirmed', isVerifiedUserVendor: true, notes: '4 piece ensemble + sound equipment' }
    ],
    personalizedIdeas: {
      themeConcept: 'Royal Botanical & Terracotta Elegance',
      themeDescription: 'A timeless union of vintage Rajput architectural splendor and lush natural botanical motifs, featuring handcrafted terracotta pottery, brass urulis with floating jasmine, and fragrant marigold arches.',
      colorPalette: [
        { name: 'Royal Terracotta', hex: '#C85A32', role: 'Primary Warmth' },
        { name: 'Heritage Marigold', hex: '#F59E0B', role: 'Floral Accents' },
        { name: 'Forest Emerald', hex: '#065F46', role: 'Botanical Foliage' },
        { name: 'Antique Gold', hex: '#D4AF37', role: 'Metallic Accents' },
        { name: 'Ivory Silk', hex: '#FAF5EF', role: 'Backdrops & Linens' }
      ],
      decorIdeas: [
        'Floating brass urulis with yellow marigolds, mogra blossoms, and gentle floating diyas at entrance walkway.',
        'Open-air mandap framed with curved natural tree branches wound with tuberose (rajnigandha) and soft sheer ivory fabric.',
        'Personalized wooden signboards with calligraphy guiding guests to Chaat Street, Photobooth, and Sangeet stage.',
        'Fairylit olive and ficus tree canopies creating an enchanting starry dining experience.'
      ],
      menuSuggestions: [
        { course: 'Welcome Refreshments', items: ['Chilled Kokum & Mint Fizz', 'Tender Coconut with Khus Drops', 'Masala Kesar Chaas'], dietaryNotes: '100% Vegetarian & Refreshing' },
        { course: 'Live Street Starters', items: ['Agra Bedmi Puri with Hing Aloo', 'Palak Patta Chaat with Tamarind Glaze', 'Charcoal Grilled Paneer Tikka with Wild Herb Chutney'], dietaryNotes: 'Jain counter separate' },
        { course: 'Royal Main Course', items: ['Govind Gatta Curry in Silky Curd Gravy', 'Dal Baati Churma with Pure Desi Ghee', 'Paneer Kundan Kalia', 'Awadhi Subz Dum Biryani with Burani Raita'], dietaryNotes: 'Authentic Traditional' },
        { course: 'Celebration Desserts', items: ['Hot Jalebi with Rabri Shots', 'Gulab Jamun infused with Cardamom & Pistachio', 'Sitaphal Kulfi on Bamboo Skewers'], dietaryNotes: 'Sweet Finale' }
      ],
      entertainmentActivities: [
        'Bridal Entry under a traditional Phoolon ki Chaadar woven with fresh baby breath and fragrant roses.',
        'Interactive Folk Dance & Ghoomar workshop segment during the high-tea sangeet warmup.',
        'Vintage Polaroid guestbook station where friends snap an instant photo and write wedding blessings with metallic pens.'
      ],
      specialTouches: [
        'Eco-friendly wedding invites printed on biodegradable seed-paper that guests can plant into wildflowers.',
        'Hand-painted cotton shawls / stoles provided in wicker baskets for breezy outdoor evening chill.'
      ]
    },
    aiMetadata: {
      modelUsed: 'gemini-2.5-flash',
      generatedAt: '2026-11-10T12:00:00Z',
      isLiveAi: true,
      promptUsed: 'Royal heritage wedding in Udaipur for 250 guests with vegetarian catering, royal botanical decor, sufi folk music under 15 Lakhs budget.'
    },
    createdAt: '2026-11-10T12:00:00Z',
    updatedAt: '2026-11-10T12:30:00Z'
  },
  {
    id: 'sample-birthday-1',
    title: 'Aarush’s 7th Space Odyssey Adventure',
    type: 'birthday',
    date: '2026-12-05',
    time: '16:30',
    location: 'Greenwood Community Park & Pavilion',
    guestCount: 35,
    totalBudget: 25000,
    currency: 'INR',
    preferences: {
      dietary: ['Kid-friendly', 'Nut-free', 'Vegetarian and Eggless Treats'],
      theme: 'Cosmic Space Explorer & Stargazing',
      atmosphere: 'Adventurous, Playful, Interactive & High-Energy',
      outdoorIndoor: 'outdoor',
      specialRequirements: 'DIY rocket launching station, planetarium dome cake, zero single-use plastics'
    },
    budgetItems: [
      { id: 'bb1', category: 'Venue & Booking', name: 'Community Park Pavilion & Lawn Permission', estimatedCost: 3500, actualCost: 3000, isEstimate: false, notes: 'Approved by RWA committee' },
      { id: 'bb2', category: 'Catering & Refreshments', name: 'Mini Slider Burgers, Fries, Fruit Skewers & Galactic Juices', estimatedCost: 9500, actualCost: 9000, isEstimate: false, notes: '35 kids + 15 parents' },
      { id: 'bb3', category: 'Decorations & Flowers', name: 'Balloon Solar System Arch, Glow Stars & Inflatable Astronaut', estimatedCost: 4500, actualCost: 4800, isEstimate: true, notes: 'AI Estimate: Biodegradable latex balloons' },
      { id: 'bb4', category: 'Photography & Videography', name: '2-Hour Event & Cake-Cutting Photographer', estimatedCost: 3000, actualCost: 3000, isEstimate: false, notes: 'Digital album delivery within 48h' },
      { id: 'bb5', category: 'Entertainment', name: 'Science Explorer Host (Volcano & Water Bottle Rocket Science Show)', estimatedCost: 3500, actualCost: 3500, isEstimate: false, notes: '45-minute interactive science experiments' },
      { id: 'bb6', category: 'Invitations & Stationery', name: 'Boarding Pass Astronaut ID Cards & Digital Video', estimatedCost: 1000, actualCost: 700, isEstimate: false, notes: 'Self-printed astronaut pass lanyards' }
    ],
    timeline: [
      { id: 'bt1', title: 'Reserve park pavilion and pay community security deposit', category: 'Venue', dueDate: '2026-11-15', daysBeforeEvent: 20, priority: 'high', completed: true, notes: 'Permit slip secured' },
      { id: 'bt2', title: 'Order custom 2-tier Astronaut & Galaxy Chocolate Cake', category: 'Catering', dueDate: '2026-11-22', daysBeforeEvent: 13, priority: 'high', completed: true, notes: 'Eggless dark chocolate truffle' },
      { id: 'bt3', title: 'Send digital WhatsApp astronaut boarding pass invites', category: 'Invitations', dueDate: '2026-11-24', daysBeforeEvent: 11, priority: 'medium', completed: true, notes: '28 confirmed RSVPs' },
      { id: 'bt4', title: 'Assemble space mission goodie bags (glow stars + space puzzles)', category: 'Favors', dueDate: '2026-12-02', daysBeforeEvent: 3, priority: 'medium', completed: false, notes: '35 kits ready' },
      { id: 'bt5', title: 'Pick up cake and setup balloon solar system arch', category: 'Day-Of', dueDate: '2026-12-05', daysBeforeEvent: 0, priority: 'high', completed: false, notes: 'Setup starts at 2:30 PM' }
    ],
    dayOfSchedule: [
      { id: 'bs1', time: '02:30 PM', activity: 'Setup Balloon Arch, Solar System Cutouts & Snack Table', responsiblePerson: 'Parents & Decorator', notes: 'Plug in Bluetooth speaker with space ambient synth tunes' },
      { id: 'bs2', time: '04:30 PM', activity: 'Cadet Check-in: Receive Astronaut Badge & Mission Helmet', responsiblePerson: 'Host', notes: 'Kids take badge photo at entrance' },
      { id: 'bs3', time: '05:00 PM', activity: 'Galactic Science Show & Stomp Rocket Launch Competition', responsiblePerson: 'Science Entertainer', notes: 'Open lawn safety perimeter established' },
      { id: 'bs4', time: '06:00 PM', activity: 'Galactic Countdown & Cake Cutting Ceremony', responsiblePerson: 'Birthday Boy & Family', notes: 'Play Apollo 11 blast-off audio effect' },
      { id: 'bs5', time: '06:30 PM', activity: 'Dinner Sliders, Pizza Triangles & Nebula Punch', responsiblePerson: 'Caterer', notes: 'Buffet table served' },
      { id: 'bs6', time: '07:15 PM', activity: 'Return to Earth: Mission Accomplished Favors Distribution', responsiblePerson: 'Family', notes: 'Telescope star gazing if skies clear' }
    ],
    vendors: [
      { id: 'bv1', category: 'Catering / Bakery', name: 'Celestial Crumb Bakery', contactPerson: 'Neha Gupta', phone: '+91 98111 22334', email: 'orders@celestialcrumb.in', estimatedQuote: 4500, actualQuote: 4500, status: 'confirmed', isVerifiedUserVendor: true, notes: 'Eggless solar system galaxy cake' },
      { id: 'bv2', category: 'Entertainment', name: 'Little Einstein Science Labs', contactPerson: 'Vikram Joshi', phone: '+91 97222 33445', email: 'fun@littleeinsteinlabs.com', estimatedQuote: 3500, actualQuote: 3500, status: 'confirmed', isVerifiedUserVendor: true, notes: 'Includes 10 mini bottle rockets for kids' },
      { id: 'bv3', category: 'Decor', name: 'Galaxy Balloon Crafters (AI Recommended)', contactPerson: 'Rajesh Decor', phone: 'Contact via AI Directory', email: 'balloons@galaxyevent.in', estimatedQuote: 4500, actualQuote: 4800, status: 'quoted', isVerifiedUserVendor: false, notes: 'AI Suggestion: Specializes in organic balloon garlands & LED stars' }
    ],
    personalizedIdeas: {
      themeConcept: 'Cosmic Space Explorer & Stargazing',
      themeDescription: 'A high-energy, wondrous intergalactic voyage transforming the venue into an interstellar space station where every young guest becomes an honorary astronaut trainee.',
      colorPalette: [
        { name: 'Deep Space Navy', hex: '#0B132B', role: 'Dominant Canvas' },
        { name: 'Nebula Violet', hex: '#6B21A8', role: 'Atmospheric Accents' },
        { name: 'Cosmic Cyan', hex: '#06B6D4', role: 'Glow Elements' },
        { name: 'Solar Flare Gold', hex: '#FBBF24', role: 'Stars & Rockets' },
        { name: 'Stardust Silver', hex: '#E2E8F0', role: 'Astronaut Gear' }
      ],
      decorIdeas: [
        'Dark blue marquee draped with hanging LED fairy light constellations and honeycomb paper planets.',
        'Life-size cutout photo-op: "Walk on the Moon" astronaut standee with guest face cutout.',
        'Floating metallic astronaut balloon clusters at table centerpieces with glow-in-the-dark moon stones.'
      ],
      menuSuggestions: [
        { course: 'Mission Fuel (Drinks)', items: ['Meteorite Punch (Blueberry Mint Mojito)', 'Solar Flare Mango Slush', 'Warm Cocoa Comet'], dietaryNotes: 'Low-sugar, fresh fruit juices' },
        { course: 'Astronaut Rations (Finger Food)', items: ['Saturn Ring Onion Crisps', 'Rocket Shaped Veggie Sandwiches', 'Planet Cheese Balls with Herb Dip'], dietaryNotes: 'Kid-friendly & Nut-free' },
        { course: 'Galactic Feast', items: ['Mini Cheese Margherita Sliders', 'Creamy Basil Sweet Corn Pasta', 'Baked Potato Wedges with Tangy Dip'], dietaryNotes: 'Vegetarian' },
        { course: 'Zero-Gravity Sweets', items: ['Galaxy Swirl Cupcakes with Silver Sparkles', 'Starlight Marshmallow Pops', 'Rocket Ice Candies'], dietaryNotes: 'Eggless' }
      ],
      entertainmentActivities: [
        'Water-powered Stomp Rocket Championship: Each kid decorates their rocket fin and launches it high over the lawn.',
        'Meteorite Hunt Scavenger Quest: Searching for painted glow stones hidden across the playground with clues.',
        'DIY Astronaut Helmet Craft: Kids personalize cardboard helmets with holographic stickers and call signs.'
      ],
      specialTouches: [
        'Personalized Astronaut Trainee Certificate with the child’s name awarded during favor distribution.',
        'Spotify playlist blending Hans Zimmer space ambient themes with kid-friendly party hits.'
      ]
    },
    aiMetadata: {
      modelUsed: 'gemini-2.5-flash',
      generatedAt: '2026-11-10T14:15:00Z',
      isLiveAi: true,
      promptUsed: '7th birthday party for 35 kids in an outdoor park with 25k budget, space explorer theme, science show, nut-free snacks.'
    },
    createdAt: '2026-11-10T14:00:00Z',
    updatedAt: '2026-11-10T14:20:00Z'
  },
  {
    id: 'sample-community-1',
    title: 'Green Meadows Community Eco-Fair & Cultural Evening',
    type: 'community',
    date: '2027-01-26',
    time: '15:00',
    location: 'Central Neighborhood Amphitheater & Plaza',
    guestCount: 200,
    totalBudget: 75000,
    currency: 'INR',
    preferences: {
      dietary: ['Healthy Millets', 'Locally Sourced', 'Zero Waste Policy'],
      theme: 'Sustainable Living, Local Artisans & Community Harmony',
      atmosphere: 'Warm, Inclusive, Engaging, Green & Celebratory',
      outdoorIndoor: 'outdoor',
      specialRequirements: 'Solar-powered sound system, compostable palm leaf cutlery, plant sapling giveaway'
    },
    budgetItems: [
      { id: 'cb1', category: 'Venue & Booking', name: 'Amphitheater Maintenance & Cleaning Deposit', estimatedCost: 5000, actualCost: 5000, isEstimate: false, notes: 'Municipal permit waived for community event' },
      { id: 'cb2', category: 'Catering & Refreshments', name: 'Millet Snacks, Herbal Teas, Sprout Chaat & Filter Coffee', estimatedCost: 28000, actualCost: 26500, isEstimate: false, notes: 'Self-serve stations by resident women entrepreneurs' },
      { id: 'cb3', category: 'Decorations & Flowers', name: 'Jute Banners, Potted Ferns & Bamboo Archways', estimatedCost: 12000, actualCost: 11000, isEstimate: false, notes: 'Re-usable potted plants planted in community garden post-event' },
      { id: 'cb4', category: 'Photography & Videography', name: 'Resident Volunteer Drone & Photography Coverage', estimatedCost: 5000, actualCost: 4000, isEstimate: false, notes: 'Honorarium for community media team' },
      { id: 'cb5', category: 'Entertainment', name: 'Acoustic Sound System & Resident Cultural Performances', estimatedCost: 14000, actualCost: 13500, isEstimate: false, notes: 'Microphones, mixer, monitors & amphitheater lighting' },
      { id: 'cb6', category: 'Favors & Seedlings', name: '200 Native Medicinal Plant Saplings & Cloth Bags', estimatedCost: 8000, actualCost: 7500, isEstimate: false, notes: 'Direct from forest department nursery' },
      { id: 'cb7', category: 'Miscellaneous', name: 'Recycling Bins, Signage & First Aid Kit', estimatedCost: 3000, actualCost: 2200, isEstimate: true, notes: 'Contingency fund' }
    ],
    timeline: [
      { id: 'ct1', title: 'Resident Association meeting to approve date and eco-guidelines', category: 'Planning', dueDate: '2026-11-15', daysBeforeEvent: 72, priority: 'high', completed: true, notes: 'Unanimous resident approval' },
      { id: 'ct2', title: 'Open stall registrations for local home bakers and craftsmen', category: 'Vendors', dueDate: '2026-12-10', daysBeforeEvent: 47, priority: 'high', completed: true, notes: '14 stalls confirmed' },
      { id: 'ct3', title: 'Book native plant saplings with forestry nursery', category: 'Supplies', dueDate: '2026-12-28', daysBeforeEvent: 29, priority: 'medium', completed: false, notes: 'Tulsi, Neem, Curry leaf saplings' },
      { id: 'ct4', title: 'Publish resident performance schedule (Music, dance, poetry)', category: 'Program', dueDate: '2027-01-10', daysBeforeEvent: 16, priority: 'medium', completed: false, notes: '8 stage acts signed up' },
      { id: 'ct5', title: 'Setup recycling stations and banner installation', category: 'Day-Of', dueDate: '2027-01-26', daysBeforeEvent: 0, priority: 'high', completed: false, notes: 'Youth volunteers brigade assembled' }
    ],
    dayOfSchedule: [
      { id: 'cs1', time: '01:00 PM', activity: 'Artisan Stall Setup & Zero-Waste Bins Deployment', responsiblePerson: 'Volunteer Lead', notes: 'Signage placed at all amphitheater entry gates' },
      { id: 'cs2', time: '03:00 PM', activity: 'Eco-Fair Gates Open: Handicraft & Organic Produce Market', responsiblePerson: 'Market Committee', notes: 'Background classical instrumental music' },
      { id: 'cs3', time: '04:30 PM', activity: 'Interactive Workshop: Home Composting & Terrace Gardening 101', responsiblePerson: 'Guest Botanist', notes: 'Live potting demonstration' },
      { id: 'cs4', time: '05:45 PM', activity: 'Sunset Resident Cultural Program: Choir, Folk Dance & Sitar', responsiblePerson: 'Cultural Secretary', notes: 'Community felicitations for senior citizens' },
      { id: 'cs5', time: '07:30 PM', activity: 'Community Millet Feast & Chai Fellowship', responsiblePerson: 'Food Stalls', notes: 'Palm leaf plates collected for on-site composting' },
      { id: 'cs6', time: '08:30 PM', activity: 'Plant Sapling Giveaway & Green Pledge Ceremony', responsiblePerson: 'RWA President', notes: 'Tidy-up volunteer drive finishes by 9:15 PM' }
    ],
    vendors: [
      { id: 'cv1', category: 'Seedlings & Greenery', name: 'GreenRoots Forest Nursery', contactPerson: 'Mr. Arvind Pillai', phone: '+91 94440 12389', email: 'saplings@greenroots.org', estimatedQuote: 8000, actualQuote: 7500, status: 'confirmed', isVerifiedUserVendor: true, notes: '200 saplings in biodegradable bags' },
      { id: 'cv2', category: 'Sound & Audio', name: 'Sonic Harmony Audio Solutions', contactPerson: 'Dinesh Kumar', phone: '+91 98840 56781', email: 'dinesh@sonicharmony.in', estimatedQuote: 14000, actualQuote: 13500, status: 'confirmed', isVerifiedUserVendor: true, notes: 'Low-power eco acoustic rig + mics' }
    ],
    personalizedIdeas: {
      themeConcept: 'Sustainable Living, Local Artisans & Community Harmony',
      themeDescription: 'A vibrant community celebration celebrating earth-friendly living, supporting neighborhood home bakers and craftsmen, and strengthening neighbor bonds through cultural performances and shared meals.',
      colorPalette: [
        { name: 'Earthy Olive', hex: '#3F6212', role: 'Nature Base' },
        { name: 'Terracotta Clay', hex: '#B45309', role: 'Handicraft Warmth' },
        { name: 'Sunflower Yellow', hex: '#EAB308', role: 'Vibrant Accents' },
        { name: 'Sage Leaf', hex: '#84CC16', role: 'Foliage' },
        { name: 'Warm Cream Linen', hex: '#FEF3C7', role: 'Neutral Canvas' }
      ],
      decorIdeas: [
        'Upcycled hand-painted cloth bunting made by resident children hanging between amphitheater trees.',
        'Informative chalkboards highlighting community tree varieties, composting tips, and rain harvesting stats.',
        'Bamboo seating benches with colorful khadi cushions for senior citizens near the stage.'
      ],
      menuSuggestions: [
        { course: 'Welcome Drinks', items: ['Amla & Ginger Cooler', 'Bael Fruit Sherbet', 'Spiced Buttermilk (Chaas)'], dietaryNotes: 'Natural immunity boosters' },
        { course: 'Wholesome Millet Chaat', items: ['Ragi & Oats Bhel with Sprouted Moong', 'Foxtail Millet Dhokla with Mint Chutney', 'Steamed Sweet Corn with Himalayan Rock Salt'], dietaryNotes: 'Gluten-conscious & Vegan' },
        { course: 'Community Dinner', items: ['Jowar Roti with Desi Sarson Saag', 'Panchmel Dal Tadka with Brown Rice Pulao', 'Smoked Baingan Bharta'], dietaryNotes: 'Wholesome Vegetarian' },
        { course: 'Healthy Treats', items: ['Jaggery Sesame Laddoos', 'Coconut Date Rolls', 'Dry Fruit Payasam sweetened with raw honey'], dietaryNotes: 'Refined sugar free' }
      ],
      entertainmentActivities: [
        'Resident Talent Showcase: 10-minute amateur acoustic sets, classical dance, and neighbor storytelling.',
        'Children’s Upcycling Art Corner: Making bird feeders out of recycled coconut shells and milk cartons.',
        'Community Book & Plant Swap: "Take a Book, Leave a Book" stall.'
      ],
      specialTouches: [
        'Each family receives an indigenous sapling tagged with their family name to plant together.',
        'Live digital counter displaying estimated single-use plastic cups saved through reusable steel cups.'
      ]
    },
    aiMetadata: {
      modelUsed: 'gemini-2.5-flash',
      generatedAt: '2026-11-10T15:00:00Z',
      isLiveAi: true,
      promptUsed: 'Community eco-fair and cultural night for 200 residents at neighborhood amphitheater with ₹75,000 budget, millet catering, zero plastic.'
    },
    createdAt: '2026-11-10T15:00:00Z',
    updatedAt: '2026-11-10T15:10:00Z'
  }
];

