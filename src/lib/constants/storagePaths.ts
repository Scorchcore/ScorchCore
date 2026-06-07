import { GeodeCategory, AxieClass } from "./geodes";

export const STORAGE_BUCKET = "Scorchcore-storage";

// Supabase folder names per category
export const SUPABASE_CATEGORY_MAP: Record<GeodeCategory, string> = {
  [GeodeCategory.PETIT]: "PETIT",
  [GeodeCategory.ALTO]: "HIGH",
  [GeodeCategory.ANIMAL]: "ANIMAL",
  [GeodeCategory.ULTRAMECH]: "ULTRAMECH",
  [GeodeCategory.TANQUE]: "TANK",
};

// Supabase folder names per class
export const SUPABASE_CLASS_MAP: Record<AxieClass, string> = {
  [AxieClass.BEAST]: "BEAST",
  [AxieClass.AQUA]: "AQUA",
  [AxieClass.BIRD]: "BIRD",
  [AxieClass.REPTILE]: "REPTILE",
  [AxieClass.BUG]: "BUG",
  [AxieClass.PLANT]: "PLANT",
  [AxieClass.MECH]: "MECH",
  [AxieClass.DUSK]: "DUSK",
  [AxieClass.DAWN]: "DAWN",
};

// ---------------------------------------------------------------------------
// CoreMiner video filenames per category+class (ordered by minerIndex 0→6).
// Same structure as thumbnailMappings.ts — fill each array with the .mp4
// filenames exactly as they appear in Supabase.
// Key format: '{SUPABASE_CATEGORY}_{SUPABASE_CLASS}'
// ---------------------------------------------------------------------------
export const MINER_VIDEO_NAMES: Record<string, string[]> = {
  // --- PETIT ---
  PETIT_BEAST: [
    "AGILE_CUB.mp4", // minerIndex 0
    "ALPHA_CUB.mp4", // minerIndex 1
    "BOLD_EXPLORER.mp4", // minerIndex 2
    "FIERCE_HATCHLING.mp4", // minerIndex 3
    "IMPATIENT_CLAW.mp4", // minerIndex 4
    "TENACIOUS_TRACKER.mp4", // minerIndex 5
    "YOUNG_HUNTER.mp4", // minerIndex 6
  ],
  PETIT_AQUA: [
    "DEW_DROP.mp4", // minerIndex 0
    "LIGHT_CURRENT.mp4", // minerIndex 1
    "SERENE_FLOW.mp4", // minerIndex 2
    "PRECISE_JET.mp4", // minerIndex 3
    "QUICK_DROP.mp4", // minerIndex 4
    "EFFICIENT_BUBBLE.mp4", // minerIndex 5
    "TSUNAMI_CURRENT.mp4", // minerIndex 6 (placeholder — verify name in Supabase)
  ],
  PETIT_BIRD: [
    "LIGHT_FEATHER.mp4", // minerIndex 0
    "LOOKOUT_CHICK.mp4", // minerIndex 1
    "PRECISE_PECK.mp4", // minerIndex 2
    "RISING_CURRENT.mp4", // minerIndex 3
    "SMALL_RAPTOR.mp4", // minerIndex 4
    "SONIC_SPARROW.mp4", // minerIndex 5
    "SWIFT_WING.mp4", // minerIndex 6
  ],
  PETIT_REPTILE: [
    "CAIMAN_HATCHLING.mp4", // minerIndex 0
    "COLD_BLOOD.mp4", // minerIndex 1
    "CUNNING_GECKO.mp4", // minerIndex 2
    "POISSONOUS_SCALE.mp4", // minerIndex 3
    "QUICK_BITE.mp4", // minerIndex 4
    "SLIPPERY_SHIELD.mp4", // minerIndex 5
    "SOVEREIGN_CAIMAN.mp4", // minerIndex 6
  ],
  PETIT_BUG: [
    "EFFICIENT_PUPA.mp4",
    "PROTECTED_LARVA.mp4",
    "QUEEN_DRONE.mp4",
    "RESILIENT_BEETLE.mp4",
    "SCOUT_ANT.mp4",
    "SILENT_BUZZ.mp4",
    "WORKER_DRONE.mp4",
  ],
  PETIT_MECH: [
    "NANO_BUILDER.mp4",
    "NANO_BUILDER-ALPHA.mp4",
    "PRECISE_SPARK.mp4",
    "PROSPECTING_DRONE.mp4",
    "SMALL_WOLF.mp4",
    "STABLE_CIRCUIT.mp4",
    "TITANIUM_SCREW.mp4",
  ],

  PETIT_PLANT: [
    "CONSTANT_SPROUT.mp4",
    "DORMANT_SEED.mp4",
    "EVERGREEN_LEAF.mp4",
    "MILLENNIAL_SPROUT.mp4",
    "SAP_FLOW.mp4",
    "SHARP_THORN.mp4",
    "YOUNG_ROOT.mp4",
  ],

  // DAWN & DUSK (only PETIT thumbnails exist in bucket)
  PETIT_DAWN: [
    "SUN_RAY.mp4",
    "DAWN_WATCHER.mp4",
    "PURE_LIGHT.mp4",
    "PRECISE_FLASH.mp4",
    "CONSTANT_CLARITY.mp4",
    "DEW DROP.mp4",
    "SUN_SPARK.mp4",
  ],
  PETIT_DUSK: [
    "TWILIGHT_SPY.mp4",
    "NIGHT_WHISPER.mp4",
    "EPHEMERAL_GLOW.mp4",
    "SHADOW_DAGGER.mp4",
    "DUSK_HATCHLING.mp4",
    "CONSTANT_GLOOM.mp4",
    "STAKING SHADOW.mp4",
  ],

  // Fallback: higher categories reuse PETIT thumbnails (bucket only has PETIT)
  ALTO_BEAST: [
    "AGILE_CUB.mp4",
    "ALPHA_CUB.mp4",
    "BOLD_EXPLORER.mp4",
    "FIERCE_HATCHLING.mp4",
    "IMPATIENT_CLAW.mp4",
    "TENACIOUS_TRACKER.mp4",
    "YOUNG_HUNTER.mp4",
  ],
  ALTO_AQUA: [
    "DEW_DROP.mp4",
    "LIGHT_CURRENT.mp4",
    "SERENE_FLOW.mp4",
    "PRECISE_JET.mp4",
    "QUICK_DROP.mp4",
    "EFFICIENT_BUBBLE.mp4",
    "TSUNAMI_CURRENT.mp4",
  ],
  ALTO_BIRD: [
    "LIGHT_FEATHER.mp4",
    "LOOKOUT_CHICK.mp4",
    "PRECISE_PECK.mp4",
    "RISING_CURRENT.mp4",
    "SMALL_RAPTOR.mp4",
    "SONIC_SPARROW.mp4",
    "SWIFT_WING.mp4",
  ],
  ALTO_REPTILE: [
    "CAIMAN_HATCHLING.mp4",
    "COLD_BLOOD.mp4",
    "CUNNING_GECKO.mp4",
    "POISSONOUS_SCALE.mp4",
    "QUICK_BITE.mp4",
    "SLIPPERY_SHIELD.mp4",
    "SOVEREIGN_CAIMAN.mp4",
  ],
  ALTO_BUG: [
    "EFFICIENT_PUPA.mp4",
    "PROTECTED_LARVA.mp4",
    "QUEEN_DRONE.mp4",
    "RESILIENT_BEETLE.mp4",
    "SCOUT_ANT.mp4",
    "SILENT_BUZZ.mp4",
    "WORKER_DRONE.mp4",
  ],
  ALTO_MECH: [
    "NANO_BUILDER.mp4",
    "NANO_BUILDER-ALPHA.mp4",
    "PRECISE_SPARK.mp4",
    "PROSPECTING_DRONE.mp4",
    "SMALL_WOLF.mp4",
    "STABLE_CIRCUIT.mp4",
    "TITANIUM_SCREW.mp4",
  ],
  ALTO_PLANT: [
    "CONSTANT_SPROUT.mp4",
    "DORMANT_SEED.mp4",
    "EVERGREEN_LEAF.mp4",
    "MILLENNIAL_SPROUT.mp4",
    "SAP_FLOW.mp4",
    "SHARP_THORN.mp4",
    "YOUNG_ROOT.mp4",
  ],
  ALTO_DAWN: [
    "SUN_RAY.mp4",
    "DAWN_WATCHER.mp4",
    "PURE_LIGHT.mp4",
    "PRECISE_FLASH.mp4",
    "CONSTANT_CLARITY.mp4",
    "DEW DROP.mp4",
    "SUN_SPARK.mp4",
  ],
  ALTO_DUSK: [
    "TWILIGHT_SPY.mp4",
    "NIGHT_WHISPER.mp4",
    "EPHEMERAL_GLOW.mp4",
    "SHADOW_DAGGER.mp4",
    "DUSK_HATCHLING.mp4",
    "CONSTANT_GLOOM.mp4",
    "STAKING SHADOW.mp4",
  ],
};

// --- Path builders ---

export function getCoreMinerVideoPath(
  category: GeodeCategory,
  axieClass: AxieClass,
  filename: string,
): string {
  return `CoreMiners/${SUPABASE_CATEGORY_MAP[category]}/${SUPABASE_CLASS_MAP[axieClass]}/${filename}`;
}

// Resolves the video filename for a specific miner from the static mapping.
// Returns empty string if not mapped.
export function getCoreMinerVideoFilename(
  category: GeodeCategory,
  axieClass: AxieClass,
  minerIndex: number,
): string {
  const key = `${SUPABASE_CATEGORY_MAP[category]}_${SUPABASE_CLASS_MAP[axieClass]}`;
  const files = MINER_VIDEO_NAMES[key];
  if (!files || minerIndex < 0 || minerIndex >= files.length) return "";
  return files[minerIndex];
}

// Geodes: Geodes/{CATEGORY}/GEODA_{CATEGORY}_{CLASS}.mp4
export function getGeodeStoragePath(
  category: GeodeCategory,
  axieClass: AxieClass,
): string {
  const cat = SUPABASE_CATEGORY_MAP[category];
  const cls = SUPABASE_CLASS_MAP[axieClass];
  return `Geodes/${cat}/GEODA_${cat}_${cls}.mp4`;
}

export function getThumbnailPath(
  _category: GeodeCategory,
  axieClass: AxieClass,
  filename: string,
): string {
  // Bucket CoreMiners-thumbnails is organized by class only (e.g. AQUA/, BEAST/)
  return `CoreMiners-thumbnails/${SUPABASE_CLASS_MAP[axieClass]}/${filename}`;
}

// Resolves the thumbnail filename from MINER_VIDEO_NAMES (English names matching Supabase bucket).
// Replaces .mp4 with .webp per bucket structure.
export function getThumbnailFilename(
  category: GeodeCategory,
  axieClass: AxieClass,
  minerIndex: number,
): string {
  const key = `${SUPABASE_CATEGORY_MAP[category]}_${SUPABASE_CLASS_MAP[axieClass]}`;
  const files = MINER_VIDEO_NAMES[key];
  if (!files || minerIndex < 0 || minerIndex >= files.length) return "";
  return files[minerIndex].replace(/\.mp4$/i, ".webp");
}

// --- URL builder ---

export function getStorageUrl(objectPath: string): string {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "";
  supabaseUrl = supabaseUrl.replace(/\/$/, ""); // strip trailing slash to avoid //
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${objectPath}`;
}
