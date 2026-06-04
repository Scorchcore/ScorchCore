/**
 * Constantes y utilidades para el demo off-chain de la forja (Petit Aqua)
 */

export const FORGE_DEMO_ASSETS = {
  altar: "/assets/Forge-assets/ALTAR.png",
  axieAqua: "/assets/Forge-assets/AXIE_AQUA.png",
  altarEnergy: "/assets/Forge-assets/ALTAR_ENERGÍA.png",
  rayoAltar: "/assets/Forge-assets/RAYO_ALTAR.png",
} as const;

/**
 * Genera un hash de transacción mock (0x + 40 hex chars)
 */
export function generateMockTxHash(): string {
  const hex = Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
  return `0x${hex}`;
}

/**
 * Retorna un minerIndex aleatorio para Petit Aqua (0–6)
 */
export function getRandomPetitAquaMinerIndex(): number {
  return Math.floor(Math.random() * 7);
}

export interface DemoMinerData {
  rarity: string;
  rarityLabel: string;
  power: number;
  nameColor: string;
  borderClass: string;
}

export const DEMO_PETIT_MINERS: DemoMinerData[] = [
  {
    rarity: "common",
    rarityLabel: "Common",
    power: 50,
    nameColor: "text-cyan-50/72",
    borderClass: "border-cyan-100/12",
  },
  {
    rarity: "common",
    rarityLabel: "Common",
    power: 60,
    nameColor: "text-cyan-50/72",
    borderClass: "border-cyan-100/12",
  },
  {
    rarity: "rare",
    rarityLabel: "Rare",
    power: 70,
    nameColor: "text-ethereal-cyan",
    borderClass: "border-ethereal-cyan/40",
  },
  {
    rarity: "rare",
    rarityLabel: "Rare",
    power: 80,
    nameColor: "text-ethereal-cyan",
    borderClass: "border-ethereal-cyan/40",
  },
  {
    rarity: "very-rare",
    rarityLabel: "Very Rare",
    power: 90,
    nameColor: "text-sky-300",
    borderClass: "border-sky-400/40",
  },
  {
    rarity: "very-rare",
    rarityLabel: "Very Rare",
    power: 100,
    nameColor: "text-sky-300",
    borderClass: "border-sky-400/40",
  },
  {
    rarity: "epic",
    rarityLabel: "Epic",
    power: 500,
    nameColor: "text-magma-orange",
    borderClass: "border-magma-orange/45",
  },
];
