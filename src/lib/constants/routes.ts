// Application routes

export const ROUTES = {
  HOME: "/",
  FORGE: "/forge",
  MINING: "/mining",
  STAKING: "/staking",
  MARKETPLACE: "/marketplace",
  INVENTORY: "/inventory",
  PROFILE: "/profile",
  TERMINOLOGY: "/terminology",
  TOKENOMICS: "/tokenomics",
  TEAM: "/team",
} as const;

export const NAV_ITEMS = [
  { label: "Forja", href: ROUTES.FORGE, icon: "🔥" },
  { label: "Minería", href: ROUTES.MINING, icon: "⛏️" },
  { label: "Staking", href: ROUTES.STAKING, icon: "💎" },
  { label: "Marketplace", href: ROUTES.MARKETPLACE, icon: "🛒" },
  { label: "Inventario", href: ROUTES.INVENTORY, icon: "🎒" },
  { label: "Perfil", href: ROUTES.PROFILE, icon: "👤" },
] as const;

export const PUBLIC_NAV_ITEMS = [
  { label: "Terminology", href: ROUTES.TERMINOLOGY, icon: "📖" },
  { label: "Tokenomics", href: ROUTES.TOKENOMICS, icon: "📊" },
  { label: "Team", href: ROUTES.TEAM, icon: "👥" },
] as const;
