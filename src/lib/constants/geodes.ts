/**
 * Constantes para el sistema de Geodas
 * Según whitepaper: 5 categorías × 9 clases de Axie = 45 variantes
 */

// Categorías de Geodas (rareza/nivel)
export enum GeodeCategory {
  PETIT = 0,
  ALTO = 1,
  ANIMAL = 2,
  ULTRAMECH = 3,
  TANQUE = 4,
}

// Clases de Axie (subtipo)
export enum AxieClass {
  BEAST = 0,
  AQUA = 1,
  BIRD = 2,
  REPTILE = 3,
  BUG = 4,
  PLANT = 5,
  MECH = 6,
  DUSK = 7,
  DAWN = 8,
}

// Constantes del sistema de forja según manual
export const FORGING_CONSTANTS = {
  CRITICAL_CHANCE: 1, // 1% probabilidad crítica en eclosión
  MEMENTOS_PER_PERCENT: 10, // Cada 10 mementos reducen 1% la probabilidad de fallo
} as const;

// Información de categorías
// Requisitos de Axies según manual:
// - Petit: 1 Axie (2 cruzas min, Purity min 3/6)
// - Alto: 2 Axies (1 con parte evolucionada)
// - Animal: 2 Axies (ambos con parte evolucionada)
// - Ultramech: 2 Axies (ambos con parte evolucionada)
// - Tanque: 3 Axies (2 del tipo principal + 1 Planta, ambos principales con parte evolucionada)
export const CATEGORY_INFO = {
  [GeodeCategory.PETIT]: {
    id: GeodeCategory.PETIT,
    name: "Petit",
    displayName: "Petit (Común)",
    rarity: "Común",
    maxSupply: 90000, // 90,000 total (10,000 por cada clase)
    miningPower: 75,
    collectionBonus: 2.0, // 2%
    repairCost: 3, // 3% de producción mensual
    color: "#94a3b8", // slate-400
    icon: "/images/types-geodes/petit.png",
    defaultCost: {
      axs: "1", // 1 AXS = 1 Axie NFT (testnet)
      slp: "350", // 350 SLP según Manual de Forja
      memento: "5", // 5 mementos (para testear mecánica)
    },
    failureRate: 10, // 10% (90% éxito)
  },
  [GeodeCategory.ALTO]: {
    id: GeodeCategory.ALTO,
    name: "Alto",
    displayName: "Alto (Poco Común)",
    rarity: "Poco Común",
    maxSupply: 67500, // 67,500 total (7,500 por cada clase)
    miningPower: 125,
    collectionBonus: 2.0, // 2%
    repairCost: 3, // 3% de producción mensual
    color: "#22c55e", // green-500
    icon: "/images/types-geodes/alto.png",
    defaultCost: {
      axs: "2", // 2 AXS = 2 Axies NFT (testnet)
      slp: "500", // 500 SLP según Manual de Forja
      memento: "10", // 10 mementos
    },
    failureRate: 20, // 20% (80% éxito)
  },
  [GeodeCategory.ANIMAL]: {
    id: GeodeCategory.ANIMAL,
    name: "Animal",
    displayName: "Animal (Raro)",
    rarity: "Raro",
    maxSupply: 45000, // 45,000 total (5,000 por cada clase)
    miningPower: 165,
    collectionBonus: 2.0, // 2%
    repairCost: 3, // 3% de producción mensual
    color: "#3b82f6", // blue-500
    icon: "/images/types-geodes/animal.png",
    defaultCost: {
      axs: "2", // 2 AXS = 2 Axies NFT (testnet)
      slp: "500", // 500 SLP según Manual de Forja
      memento: "15", // 15 mementos
    },
    failureRate: 25, // 25% (75% éxito)
  },
  [GeodeCategory.ULTRAMECH]: {
    id: GeodeCategory.ULTRAMECH,
    name: "Ultramech",
    displayName: "Ultramech (Ultra Raro)",
    rarity: "Ultra Raro",
    maxSupply: 45000, // 45,000 total (5,000 por cada clase)
    miningPower: 165,
    collectionBonus: 2.0, // 2%
    repairCost: 3, // 3% de producción mensual
    color: "#a855f7", // purple-500
    icon: "/images/types-geodes/ultra-mecanico.png",
    defaultCost: {
      axs: "2", // 2 AXS = 2 Axies NFT (testnet)
      slp: "500", // 500 SLP según Manual de Forja
      memento: "20", // 20 mementos
    },
    failureRate: 25, // 25% (75% éxito)
  },
  [GeodeCategory.TANQUE]: {
    id: GeodeCategory.TANQUE,
    name: "Tanque",
    displayName: "Tanque (Épico)",
    rarity: "Épico",
    maxSupply: 45000, // 45,000 total (5,000 por cada clase)
    miningPower: 200,
    collectionBonus: 2.0, // 2%
    repairCost: 3, // 3% de producción mensual
    color: "#f59e0b", // amber-500
    icon: "/images/types-geodes/tanque.png",
    defaultCost: {
      axs: "3", // 3 AXS = 3 Axies (2 + 1 Planta) (testnet)
      slp: "500", // 500 SLP según Manual de Forja
      memento: "30", // 30 mementos
    },
    failureRate: 25, // 25% (75% éxito)
  },
} as const;

// Información de clases de Axie
export const AXIE_CLASS_INFO = {
  [AxieClass.BEAST]: {
    id: AxieClass.BEAST,
    name: "Beast",
    displayName: "Bestia",
    icon: "/images/mementos/memento-beast.webp",
    color: "#f59e0b", // amber-500
  },
  [AxieClass.AQUA]: {
    id: AxieClass.AQUA,
    name: "Aqua",
    displayName: "Aqua",
    icon: "/images/mementos/memento-aqua.webp",
    color: "#3b82f6", // blue-500
  },
  [AxieClass.BIRD]: {
    id: AxieClass.BIRD,
    name: "Bird",
    displayName: "Ave",
    icon: "/images/mementos/memento-bird.webp",
    color: "#ec4899", // pink-500
  },
  [AxieClass.REPTILE]: {
    id: AxieClass.REPTILE,
    name: "Reptile",
    displayName: "Reptil",
    icon: "/images/mementos/memento-reptile.webp",
    color: "#a855f7", // purple-500
  },
  [AxieClass.BUG]: {
    id: AxieClass.BUG,
    name: "Bug",
    displayName: "Bicho",
    icon: "/images/mementos/memento-bug.webp",
    color: "#ef4444", // red-500
  },
  [AxieClass.PLANT]: {
    id: AxieClass.PLANT,
    name: "Plant",
    displayName: "Planta",
    icon: "/images/mementos/memento-plant.webp",
    color: "#22c55e", // green-500
  },
  [AxieClass.MECH]: {
    id: AxieClass.MECH,
    name: "Mech",
    displayName: "Mech",
    icon: "/images/mementos/memento-mech.webp",
    color: "#64748b", // slate-500
  },
  [AxieClass.DUSK]: {
    id: AxieClass.DUSK,
    name: "Dusk",
    displayName: "Dusk",
    icon: "/images/mementos/memento-dusk.webp",
    color: "#6366f1", // indigo-500
  },
  [AxieClass.DAWN]: {
    id: AxieClass.DAWN,
    name: "Dawn",
    displayName: "Dawn",
    icon: "/images/mementos/memento-dawn.webp",
    color: "#eab308", // yellow-500
  },
} as const;

// Helper: obtener nombre completo de geoda
export function getGeodeName(
  category: GeodeCategory,
  axieClass: AxieClass,
): string {
  const categoryName = CATEGORY_INFO[category].name;
  const className = AXIE_CLASS_INFO[axieClass].displayName;
  return `${categoryName} ${className}`;
}

// Helper: obtener ruta de video de geoda
export function getGeodeVideoPath(
  category: GeodeCategory,
  axieClass: AxieClass,
): string {
  const categoryName = CATEGORY_INFO[category].name.toLowerCase();
  const categoryNameUpper = CATEGORY_INFO[category].name.toUpperCase();

  // Mapeo de clases según los nombres de archivos reales
  // Diferentes categorías usan diferentes nombres para las clases
  const getClassName = (cat: GeodeCategory, axie: AxieClass): string => {
    const baseNames = {
      [AxieClass.BEAST]: "BESTIA",
      [AxieClass.AQUA]: "AQUA",
      [AxieClass.BIRD]: "AVE",
      [AxieClass.REPTILE]: "REPTIL",
      [AxieClass.BUG]: "BICHO",
      [AxieClass.PLANT]: "PLANTA",
      [AxieClass.MECH]: "MECH",
      [AxieClass.DUSK]: "DUSK",
      [AxieClass.DAWN]: "DAWN",
    };

    // Casos especiales por categoría
    if (cat === GeodeCategory.ALTO) {
      if (axie === AxieClass.DUSK) return "OSCURIDAD";
      if (axie === AxieClass.DAWN) return "AMANECER";
    }

    if (cat === GeodeCategory.TANQUE) {
      if (axie === AxieClass.AQUA) return "AGUA"; // TANQUE usa AGUA en lugar de AQUA
    }

    return baseNames[axie];
  };

  const className = getClassName(category, axieClass);

  // Formato: "GEODA [CATEGORY] [CLASS].mp4"
  return `/images/geodes/${categoryName}/GEODA ${categoryNameUpper} ${className}.mp4`;
}

// Helper: obtener icono de memento por clase
export function getMementoIcon(axieClass: AxieClass): string {
  return AXIE_CLASS_INFO[axieClass].icon;
}

// Helper: verificar si una categoría está disponible (tiene assets)
export function isCategoryAvailable(category: GeodeCategory): boolean {
  // Todas las categorías están disponibles ahora que tenemos iconos y videos
  return true;
}

// Helper: verificar si una categoría tiene videos disponibles
export function hasGeodeVideos(category: GeodeCategory): boolean {
  // Categorías con videos disponibles
  return (
    category === GeodeCategory.PETIT ||
    category === GeodeCategory.ALTO ||
    category === GeodeCategory.ANIMAL ||
    category === GeodeCategory.TANQUE ||
    category === GeodeCategory.ULTRAMECH
  );
}

// Listas para selectores
export const AVAILABLE_CATEGORIES = Object.values(CATEGORY_INFO).filter((cat) =>
  isCategoryAvailable(cat.id),
);

export const ALL_AXIE_CLASSES = Object.values(AXIE_CLASS_INFO);
