// ============================================================
//  GALLERY CODEX — CONFIG & DATA MANAGER
//  Edit SHEET_CSV_URL to point to your Google Sheets CSV export
//  Format: File > Share > Publish to web > CSV
// ============================================================

const CONFIG = {
  siteName: "Gallery Codex",
  siteTagline: "Your Anime Art Universe",
  // 🔧 PASTE YOUR GOOGLE SHEET CSV URL HERE:
  SHEET_CSV_URL: "",
  // Example: "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0"

  // Google Form link for submissions
  FORM_URL: "https://forms.gle/YOUR_FORM_ID",

  // Default items per page
  itemsPerPage: 12,

  // Available categories (will be auto-detected from data too)
  categories: [
    { id: "all", label: "All", icon: "✦" },
    { id: "shounen", label: "Shounen", icon: "⚔️" },
    { id: "shoujo", label: "Shoujo", icon: "🌸" },
    { id: "isekai", label: "Isekai", icon: "🌀" },
    { id: "mecha", label: "Mecha", icon: "🤖" },
    { id: "fantasy", label: "Fantasy", icon: "🧿" },
    { id: "romance", label: "Romance", icon: "💫" },
    { id: "horror", label: "Horror", icon: "🩸" },
  ],
};

// ============================================================
//  SAMPLE DATA — Used when no Google Sheet is connected
//  Each entry = one image card in the gallery
// ============================================================
const SAMPLE_DATA = [
  {
    id: "1",
    title: "Celestial Swordsman",
    category: "fantasy",
    image: "https://picsum.photos/seed/anime1/400/560",
    tags: "sword, magic, warrior",
    description: "A lone warrior stands at the edge of the heavens, blade drawn against the storm.",
    artist: "Hikari Studio",
    featured: "true",
  },
  {
    id: "2",
    title: "Cherry Blossom Witch",
    category: "shoujo",
    image: "https://picsum.photos/seed/anime2/400/560",
    tags: "witch, spring, magic",
    description: "She weaves spells from falling petals, each bloom a whispered incantation.",
    artist: "Sakura Draws",
    featured: "true",
  },
  {
    id: "3",
    title: "Mech Rising",
    category: "mecha",
    image: "https://picsum.photos/seed/anime3/400/560",
    tags: "robot, battle, future",
    description: "Iron giants clash against a neon skyline as humanity's last hope awakens.",
    artist: "Iron Pixel",
    featured: "false",
  },
  {
    id: "4",
    title: "Rift Walker",
    category: "isekai",
    image: "https://picsum.photos/seed/anime4/400/560",
    tags: "portal, adventure, magic",
    description: "Between worlds she wanders, collecting souls and stories from every realm.",
    artist: "DreamGate",
    featured: "true",
  },
  {
    id: "5",
    title: "Thunder Fist",
    category: "shounen",
    image: "https://picsum.photos/seed/anime5/400/560",
    tags: "fighting, power, lightning",
    description: "His spirit burns brighter than the lightning that courses through his veins.",
    artist: "BlazeArt",
    featured: "false",
  },
  {
    id: "6",
    title: "Moonlit Romance",
    category: "romance",
    image: "https://picsum.photos/seed/anime6/400/560",
    tags: "love, night, moon",
    description: "Under silver moonlight, two hearts find what words could never capture.",
    artist: "Starweave",
    featured: "false",
  },
  {
    id: "7",
    title: "Phantom Choir",
    category: "horror",
    image: "https://picsum.photos/seed/anime7/400/560",
    tags: "ghost, dark, music",
    description: "They sing in frequencies only the dead can hear — and tonight, she hears them.",
    artist: "NullVoid",
    featured: "false",
  },
  {
    id: "8",
    title: "Dragon Sovereign",
    category: "fantasy",
    image: "https://picsum.photos/seed/anime8/400/560",
    tags: "dragon, royalty, fire",
    description: "Born of flame and prophecy, the Dragon Sovereign rules between sky and ruin.",
    artist: "Mythscale",
    featured: "true",
  },
  {
    id: "9",
    title: "Starfall Ninja",
    category: "shounen",
    image: "https://picsum.photos/seed/anime9/400/560",
    tags: "ninja, stars, speed",
    description: "Faster than thought, she moves between starlight — unseen until it's too late.",
    artist: "ShadowBrush",
    featured: "false",
  },
  {
    id: "10",
    title: "Ethereal Garden",
    category: "shoujo",
    image: "https://picsum.photos/seed/anime10/400/560",
    tags: "nature, dreamy, flowers",
    description: "A garden where time sleeps and flowers bloom in colors without names.",
    artist: "PastelSoul",
    featured: "false",
  },
  {
    id: "11",
    title: "Void Protocol",
    category: "mecha",
    image: "https://picsum.photos/seed/anime11/400/560",
    tags: "sci-fi, dark, machine",
    description: "When the protocol activated, it was no longer clear who was piloting whom.",
    artist: "CoreZero",
    featured: "false",
  },
  {
    id: "12",
    title: "Cursed Realm",
    category: "isekai",
    image: "https://picsum.photos/seed/anime12/400/560",
    tags: "curse, magic, dark world",
    description: "He was summoned as a hero, but the world had different plans for his power.",
    artist: "AbySSArt",
    featured: "false",
  },
];

// ============================================================
//  DATA LOADER — Tries Google Sheet first, falls back to sample
// ============================================================
async function loadGalleryData() {
  if (!CONFIG.SHEET_CSV_URL) {
    console.info("[Codex] No sheet URL set — using sample data.");
    return SAMPLE_DATA;
  }

  try {
    const res = await fetch(CONFIG.SHEET_CSV_URL);
    const csv = await res.text();
    return parseCSV(csv);
  } catch (err) {
    console.warn("[Codex] Sheet fetch failed — using sample data.", err);
    return SAMPLE_DATA;
  }
}

// Parses CSV from Google Sheets into array of objects
// Expected columns: id, title, category, image, tags, description, artist, featured
function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, "").toLowerCase());
  return lines.slice(1).map((line) => {
    // Handle commas inside quoted fields
    const values = [];
    let cur = "", inQuote = false;
    for (let ch of line) {
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === "," && !inQuote) { values.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    values.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (values[i] || "").replace(/"/g, "")));
    return obj;
  });
}
