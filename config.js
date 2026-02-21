// ============================================================
//  GALLERY CODEX — CONFIG & DATA
//  Paste your Google Sheets CSV URL in SHEET_CSV_URL
//  Format: Google Sheets → File → Share → Publish to web → CSV
// ============================================================

const CONFIG = {
  siteName: "Gallery Codex",
  siteTagline: "Your Anime Art Universe",

  // 🔧 PASTE GOOGLE SHEET CSV URL HERE:
  SHEET_CSV_URL: "",
  // Example: "https://docs.google.com/spreadsheets/d/YOUR_ID/export?format=csv&gid=0"

  // 🔧 LINK GOOGLE FORM SUBMISSION:
  FORM_URL: "https://forms.gle/YOUR_FORM_ID",

  itemsPerPage: 12,

  categories: [
    { id: "all",     label: "All",     icon: "✦" },
    { id: "shounen", label: "Shounen", icon: "⚔️" },
    { id: "shoujo",  label: "Shoujo",  icon: "🌸" },
    { id: "isekai",  label: "Isekai",  icon: "🌀" },
    { id: "mecha",   label: "Mecha",   icon: "🤖" },
    { id: "fantasy", label: "Fantasy", icon: "🧿" },
    { id: "romance", label: "Romance", icon: "💫" },
    { id: "horror",  label: "Horror",  icon: "🩸" },
  ],
};

const SAMPLE_DATA = [
  { id:"1",  title:"Celestial Swordsman", category:"fantasy",  image:"https://picsum.photos/seed/cs1/400/560",  tags:"sword, magic, warrior",   description:"A lone warrior stands at the edge of the heavens, blade drawn against the storm.",                       artist:"Hikari Studio",  featured:"true"  },
  { id:"2",  title:"Cherry Blossom Witch",category:"shoujo",   image:"https://picsum.photos/seed/cs2/400/560",  tags:"witch, spring, magic",    description:"She weaves spells from falling petals, each bloom a whispered incantation.",                              artist:"Sakura Draws",   featured:"true"  },
  { id:"3",  title:"Mech Rising",          category:"mecha",    image:"https://picsum.photos/seed/cs3/400/560",  tags:"robot, battle, future",   description:"Iron giants clash against a neon skyline as humanity's last hope awakens.",                               artist:"Iron Pixel",     featured:"false" },
  { id:"4",  title:"Rift Walker",          category:"isekai",   image:"https://picsum.photos/seed/cs4/400/560",  tags:"portal, adventure, magic",description:"Between worlds she wanders, collecting souls and stories from every realm.",                                artist:"DreamGate",      featured:"true"  },
  { id:"5",  title:"Thunder Fist",         category:"shounen",  image:"https://picsum.photos/seed/cs5/400/560",  tags:"fighting, power, lightning",description:"His spirit burns brighter than the lightning that courses through his veins.",                           artist:"BlazeArt",       featured:"false" },
  { id:"6",  title:"Moonlit Romance",      category:"romance",  image:"https://picsum.photos/seed/cs6/400/560",  tags:"love, night, moon",       description:"Under silver moonlight, two hearts find what words could never capture.",                                  artist:"Starweave",      featured:"false" },
  { id:"7",  title:"Phantom Choir",        category:"horror",   image:"https://picsum.photos/seed/cs7/400/560",  tags:"ghost, dark, music",      description:"They sing in frequencies only the dead can hear — and tonight, she hears them.",                           artist:"NullVoid",       featured:"false" },
  { id:"8",  title:"Dragon Sovereign",     category:"fantasy",  image:"https://picsum.photos/seed/cs8/400/560",  tags:"dragon, royalty, fire",   description:"Born of flame and prophecy, the Dragon Sovereign rules between sky and ruin.",                             artist:"Mythscale",      featured:"true"  },
  { id:"9",  title:"Starfall Ninja",       category:"shounen",  image:"https://picsum.photos/seed/cs9/400/560",  tags:"ninja, stars, speed",     description:"Faster than thought, she moves between starlight — unseen until it's too late.",                           artist:"ShadowBrush",    featured:"false" },
  { id:"10", title:"Ethereal Garden",      category:"shoujo",   image:"https://picsum.photos/seed/cs10/400/560", tags:"nature, dreamy, flowers", description:"A garden where time sleeps and flowers bloom in colors without names.",                                    artist:"PastelSoul",     featured:"false" },
  { id:"11", title:"Void Protocol",        category:"mecha",    image:"https://picsum.photos/seed/cs11/400/560", tags:"sci-fi, dark, machine",   description:"When the protocol activated, it was no longer clear who was piloting whom.",                               artist:"CoreZero",       featured:"false" },
  { id:"12", title:"Cursed Realm",         category:"isekai",   image:"https://picsum.photos/seed/cs12/400/560", tags:"curse, magic, dark world",description:"He was summoned as a hero, but the world had different plans for his power.",                              artist:"AbySSArt",       featured:"false" },
  { id:"13", title:"Sakura Ronin",         category:"shounen",  image:"https://picsum.photos/seed/cs13/400/560", tags:"samurai, sakura, battle", description:"A masterless blade wandering a world of cherry blossoms and broken honor.",                                 artist:"KenjiDraw",      featured:"true"  },
  { id:"14", title:"Dimensional Rift",     category:"isekai",   image:"https://picsum.photos/seed/cs14/400/560", tags:"dimension, space, gate",  description:"The rift opened not to another world, but to every version of herself.",                                    artist:"VoidBrush",      featured:"false" },
  { id:"15", title:"Crimson Mech",         category:"mecha",    image:"https://picsum.photos/seed/cs15/400/560", tags:"red, war, steel",         description:"The crimson machine was built for war, but she chose to paint sunsets instead.",                            artist:"IronCanvas",     featured:"false" },
  { id:"16", title:"Starbound Love",       category:"romance",  image:"https://picsum.photos/seed/cs16/400/560", tags:"space, love, stars",      description:"Two souls from different galaxies, drawn together by a thread of fate.",                                    artist:"CosmicHeart",    featured:"false" },
];

async function loadGalleryData() {
  if (!CONFIG.SHEET_CSV_URL) {
    console.info("[Codex] No sheet URL — using sample data.");
    return SAMPLE_DATA;
  }
  try {
    const res = await fetch(CONFIG.SHEET_CSV_URL);
    const csv = await res.text();
    const parsed = parseCSV(csv);
    return parsed.length > 0 ? parsed : SAMPLE_DATA;
  } catch (e) {
    console.warn("[Codex] Sheet fetch failed — using sample data.", e);
    return SAMPLE_DATA;
  }
}

function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g,"").toLowerCase());
  return lines.slice(1).map(line => {
    const values = []; let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { values.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    values.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = (values[i] || "").replace(/"/g,""));
    return obj;
  }).filter(o => o.id || o.title);
}
