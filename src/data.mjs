// SiamDrive — single source of truth for brand, prices and the page catalog.
// Client prices = supplier cost x 2 (see internal rate card). Change MARKUP to reprice the whole site.
export const MARKUP = 2;
export const SITE = {
  name: "SiamDrive",
  domain: "https://siamdrive.vip",
  tagline: "Chauffeur · Security · Concierge",
  whatsapp: "66962212364",
  phoneDisplay: "+66 96 221 2364",
  city: "Bangkok",
  country: "TH",
  founded: 2026,
};

const x = (n) => n * MARKUP;

// Supplier cost columns: airport, bkk5h, bkk10h, outskirt10h, pattaya10h, longTransfer, longDayTrip, overtime/h
export const VEHICLES = [
  { slug: "toyota-camry", name: "Toyota Camry", year: "2025+", seats: "3+1", luggage: 2, cls: "Executive Sedan", img: "car-camry",
    blurb: "The discreet executive sedan — quiet, efficient and perfect for solo travellers and couples.",
    cost: [2500, 4000, 6000, 6500, 7000, 8000, 9500, 500] },
  { slug: "toyota-alphard-30", name: "Toyota Alphard 30", year: "2020", seats: "5+1", luggage: 4, cls: "Luxury MPV", img: "car-alphard30",
    blurb: "Bangkok's favourite VIP van: captain's chairs, room to stretch and space for the whole party.",
    cost: [3000, 5000, 7000, 7500, 8000, 9000, 10500, 600] },
  { slug: "toyota-alphard-40", name: "Toyota Alphard 40", year: "2024+", seats: "5+1", luggage: 4, cls: "Luxury MPV", img: "car-alphard40", badge: "Best Seller",
    blurb: "The new-generation Alphard in blacked-out finish — our most requested vehicle in Bangkok.",
    cost: [3500, 6000, 8000, 8500, 9000, 10000, 11500, 700] },
  { slug: "rowen-vellfire-z", name: "Rowen Vellfire Z", year: "2025+", seats: "5+1", luggage: 4, cls: "Limited Edition MPV", img: "car-vellfire", badge: "Limited Edition",
    blurb: "A Rowen-styled Vellfire with a statement presence — for arrivals that should be remembered.",
    cost: [4500, 7000, 9000, 9500, 10000, 11000, 12500, 800] },
  { slug: "toyota-alphard-40-executive", name: "Alphard 40 Executive", year: "2025+", seats: "5+1", luggage: 4, cls: "Executive Lounge MPV", img: "car-alphard40exec",
    blurb: "The flagship Executive Lounge: reclining ottoman seats, privacy and a first-class cabin on wheels.",
    cost: [5500, 8000, 10000, 10500, 11000, 12000, 13500, 900] },
  { slug: "porsche-cayenne-s", name: "Porsche Cayenne S", year: "2026+", seats: "3+1", luggage: 2, cls: "Performance SUV", img: "car-cayenne",
    blurb: "Performance, presence and a red-leather cabin — the choice when the journey is the statement.",
    cost: [9500, 18000, 25000, 28000, 28000, 32000, 40000, 2200] },
].map((v) => ({
  ...v,
  price: {
    airport: x(v.cost[0]), bkk5: x(v.cost[1]), bkk10: x(v.cost[2]), outskirt: x(v.cost[3]),
    pattaya: x(v.cost[4]), longTransfer: x(v.cost[5]), longDay: x(v.cost[6]), overtime: x(v.cost[7]),
  },
}));
export const OVERNIGHT = x(750);
export const MONTHLY = [
  { vehicle: "Toyota Alphard 40", price: x(189000) },
  { vehicle: "Toyota Alphard 30", price: x(149000) },
];
export const BODYGUARD = {
  transfer: x(2500), h5: x(2500), h10: x(4500), outside: x(1000), overtime: x(500),
  escort5: x(10000), escort10: x(13000), escortOvertime: x(1000),
};
export const FASTTRACK = { buggy: x(2500), arrival: x(3000), departure: x(2500) };
export const PA = { h10: x(8000), overtime: x(1000) };

// Route price tiers -> which vehicle price column applies.
// outskirt: within ~70 km (10h hire) · pattaya: 10h transfer/day incl. · long: transfer or 10h day trip · request: quote only
export const TIERS = {
  outskirt: { transfer: "outskirt", day: "outskirt", label: "Outskirt Bangkok (10 hrs)" },
  pattaya: { transfer: "pattaya", day: "pattaya", label: "Eastern Seaboard (10 hrs included)" },
  long: { transfer: "longTransfer", day: "longDay", label: "Long-distance" },
  request: { transfer: null, day: null, label: "Quote on request" },
};

export const ROUTES = [
  { slug: "pattaya", name: "Pattaya", km: 150, hrs: "2–2.5", tier: "pattaya", region: "Eastern Seaboard" },
  { slug: "hua-hin", name: "Hua Hin", km: 200, hrs: "3–3.5", tier: "long", region: "Royal Coast" },
  { slug: "cha-am", name: "Cha-am", km: 175, hrs: "2.5–3", tier: "long", region: "Royal Coast" },
  { slug: "pranburi", name: "Pranburi", km: 230, hrs: "3.5", tier: "long", region: "Royal Coast" },
  { slug: "rayong", name: "Rayong", km: 180, hrs: "2.5–3", tier: "long", region: "Eastern Seaboard" },
  { slug: "koh-samet", name: "Koh Samet (Ban Phe Pier)", km: 200, hrs: "3", tier: "long", region: "Eastern Seaboard" },
  { slug: "koh-chang", name: "Koh Chang (Laem Ngop Pier)", km: 315, hrs: "4.5–5", tier: "request", region: "Eastern Islands" },
  { slug: "chanthaburi", name: "Chanthaburi", km: 245, hrs: "3.5–4", tier: "request", region: "Eastern Islands" },
  { slug: "sriracha", name: "Sriracha", km: 120, hrs: "1.5–2", tier: "pattaya", region: "Eastern Seaboard" },
  { slug: "bang-saen", name: "Bang Saen", km: 100, hrs: "1.5", tier: "pattaya", region: "Eastern Seaboard" },
  { slug: "sattahip", name: "Sattahip", km: 180, hrs: "2.5", tier: "long", region: "Eastern Seaboard" },
  { slug: "khao-yai", name: "Khao Yai", km: 180, hrs: "2.5–3", tier: "long", region: "Northeast Gateway" },
  { slug: "nakhon-nayok", name: "Nakhon Nayok", km: 110, hrs: "2", tier: "pattaya", region: "Northeast Gateway" },
  { slug: "ayutthaya", name: "Ayutthaya", km: 80, hrs: "1.5", tier: "pattaya", region: "Central Heritage" },
  { slug: "lopburi", name: "Lopburi", km: 150, hrs: "2.5", tier: "long", region: "Central Heritage" },
  { slug: "kanchanaburi", name: "Kanchanaburi", km: 130, hrs: "2.5", tier: "long", region: "Western Frontier" },
  { slug: "ratchaburi", name: "Ratchaburi", km: 100, hrs: "1.5–2", tier: "long", region: "Western Frontier" },
  { slug: "damnoen-saduak", name: "Damnoen Saduak Floating Market", km: 100, hrs: "1.5–2", tier: "pattaya", region: "Western Frontier" },
  { slug: "amphawa", name: "Amphawa", km: 75, hrs: "1.5", tier: "pattaya", region: "Western Frontier" },
  { slug: "chachoengsao", name: "Chachoengsao", km: 80, hrs: "1.5", tier: "pattaya", region: "Central Heritage" },
  { slug: "nakhon-pathom", name: "Nakhon Pathom", km: 60, hrs: "1–1.5", tier: "outskirt", region: "Central Heritage" },
  { slug: "samut-prakan", name: "Samut Prakan", km: 30, hrs: "0.75–1", tier: "outskirt", region: "Greater Bangkok" },
];

export const AIRPORTS = [
  { slug: "suvarnabhumi-bkk", code: "BKK", name: "Suvarnabhumi Airport", short: "Suvarnabhumi", km: 30, hrs: "0.5–1", img: "air-bkk" },
  { slug: "don-mueang-dmk", code: "DMK", name: "Don Mueang International Airport", short: "Don Mueang", km: 25, hrs: "0.5–1", img: "air-dmk" },
  { slug: "u-tapao-utp", code: "UTP", name: "U-Tapao Rayong–Pattaya International Airport", short: "U-Tapao", km: 175, hrs: "2.5", img: "air-utp" },
];

// Airport -> destination pages (priced off the destination route tier)
export const AIRPORT_ROUTES = [
  { slug: "suvarnabhumi-to-pattaya", from: "suvarnabhumi-bkk", to: "pattaya", km: 125, hrs: "1.5–2" },
  { slug: "suvarnabhumi-to-hua-hin", from: "suvarnabhumi-bkk", to: "hua-hin", km: 230, hrs: "3–3.5" },
  { slug: "suvarnabhumi-to-rayong", from: "suvarnabhumi-bkk", to: "rayong", km: 160, hrs: "2–2.5" },
  { slug: "suvarnabhumi-to-khao-yai", from: "suvarnabhumi-bkk", to: "khao-yai", km: 190, hrs: "2.5–3" },
  { slug: "don-mueang-to-pattaya", from: "don-mueang-dmk", to: "pattaya", km: 165, hrs: "2–2.5" },
  { slug: "don-mueang-to-hua-hin", from: "don-mueang-dmk", to: "hua-hin", km: 220, hrs: "3–3.5" },
  { slug: "suvarnabhumi-to-don-mueang", from: "suvarnabhumi-bkk", to: null, km: 45, hrs: "0.75–1.25" },
];

export const DISTRICTS = [
  { slug: "sukhumvit", name: "Sukhumvit" }, { slug: "silom", name: "Silom" }, { slug: "sathorn", name: "Sathorn" },
  { slug: "siam", name: "Siam & Pathumwan" }, { slug: "riverside", name: "Chao Phraya Riverside" },
  { slug: "thonglor", name: "Thonglor" }, { slug: "ekkamai", name: "Ekkamai" }, { slug: "asok", name: "Asok" },
  { slug: "ratchada", name: "Ratchada" }, { slug: "chinatown", name: "Chinatown (Yaowarat)" },
  { slug: "old-town", name: "Old Town (Rattanakosin)" }, { slug: "bang-na", name: "Bang Na" },
  { slug: "chidlom-ploenchit", name: "Chidlom & Ploenchit" }, { slug: "phrom-phong", name: "Phrom Phong" }, { slug: "ari", name: "Ari" },
];

export const EXPERIENCES = [
  { slug: "grand-palace-temples", name: "Grand Palace & Temple Circuit" },
  { slug: "floating-markets", name: "Floating Markets Morning" },
  { slug: "iconsiam-riverside", name: "ICONSIAM & Riverside Evening" },
  { slug: "chatuchak-weekend", name: "Chatuchak Weekend Market" },
  { slug: "rooftop-bangkok-nights", name: "Rooftop Bangkok by Night" },
  { slug: "fine-dining-night", name: "Fine-Dining Night Out" },
  { slug: "muay-thai-night", name: "Muay Thai Fight Night" },
  { slug: "golf-day-bangkok", name: "Bangkok Golf Day" },
  { slug: "ayutthaya-heritage-day", name: "Ayutthaya Heritage Day" },
  { slug: "luxury-shopping-day", name: "Luxury Shopping Day" },
];

export const SERVICES = [
  { slug: "hourly-chauffeur", name: "Private Driver", img: "svc-chauffeur", core: true },
  { slug: "bodyguards", name: "Personal Bodyguards", img: "hero-bodyguards", core: true },
  { slug: "monthly-chauffeur", name: "Monthly Private Driver", img: "car-alphard40exec" },
  { slug: "motorcycle-escort", name: "Motorcycle Escort", img: "sec-fleet" },
  { slug: "personal-assistant", name: "Personal Assistant & Travel Companion", img: "sec-why" },
  { slug: "corporate-chauffeur", name: "Corporate Chauffeur", img: "gen-svc-corporate" },
  { slug: "nightlife-chauffeur", name: "Nightlife Chauffeur", img: "gen-svc-nightlife" },
  { slug: "shopping-chauffeur", name: "Shopping Chauffeur", img: "gen-svc-shopping" },
  { slug: "event-transport", name: "Event & VIP Transport", img: "gen-svc-event" },
  { slug: "delegation-transport", name: "Delegations & Sports Teams", img: "gen-svc-delegation" },
  { slug: "wedding-car-hire", name: "Wedding Car Hire", img: "gen-svc-wedding" },
  { slug: "golf-transfers", name: "Golf Days", img: "gen-svc-golf" },
  { slug: "medical-travel-transport", name: "Medical Travel Transport", img: "gen-svc-medical" },
  { slug: "day-trips", name: "Private Day Trips", img: "gen-svc-daytrip" },
  { slug: "airport-transfers", name: "Airport Transfers", img: "hero-airport" },
  { slug: "airport-fast-track", name: "Airport Fast-Track & VIP Buggy", img: "hero-airport" },
  { slug: "city-to-city-transfers", name: "City-to-City Transfers", img: "gen-svc-intercity" },
];

// Core offers get top-level pillar URLs; old /services/ URLs redirect here.
export const PILLARS = { "hourly-chauffeur": "/private-driver/", bodyguards: "/bodyguards/" };
export const DRIVER_PAGES = ["half-day-driver", "full-day-driver", "business-driver", "family-driver", "driver-with-bodyguard", "english-speaking-driver"];
export const GUARD_PAGES = ["executive-protection", "vip-celebrity-protection", "event-security", "nightlife-protection", "airport-protection", "family-protection"];

export const JOURNAL = [
  "suvarnabhumi-fast-track-explained", "alphard-vs-vellfire", "hiring-a-bodyguard-in-bangkok",
  "bangkok-to-pattaya-best-way", "tipping-your-chauffeur-in-thailand", "bangkok-traffic-best-times-to-travel",
  "don-mueang-vs-suvarnabhumi", "hua-hin-weekend-by-private-car", "delegation-transport-bangkok",
  "khao-yai-wine-and-nature-day", "family-travel-bangkok-with-kids", "what-to-expect-vip-airport-arrival",
  "monthly-private-driver-bangkok", "bangkok-nightlife-safely",
];

export const thb = (n) => n.toLocaleString("en-US") + " THB";
