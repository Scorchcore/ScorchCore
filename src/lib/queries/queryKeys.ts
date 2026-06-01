export const queryKeys = {
  inventory: {
    all: (chainId: number) => ["inventory", chainId] as const,
    geodes: (chainId: number, address: string) =>
      ["inventory", chainId, "geodes", address] as const,
    miners: (chainId: number, address: string) =>
      ["inventory", chainId, "miners", address] as const,
    axies: (chainId: number, address: string) =>
      ["inventory", chainId, "axies", address] as const,
  },

  cycles: {
    all: (chainId: number) => ["cycles", chainId] as const,
    active: (chainId: number, address: string) =>
      ["cycles", chainId, "active", address] as const,
    summary: (chainId: number, address: string) =>
      ["cycles", chainId, "summary", address] as const,
    bonusInfo: (chainId: number) => ["cycles", chainId, "bonusInfo"] as const,
  },

  fcore: {
    systemInfo: (chainId: number, address: string) =>
      ["fcore", chainId, "systemInfo", address] as const,
  },

  minerStats: {
    single: (chainId: number, minerId: string) =>
      ["minerStats", chainId, "single", minerId] as const,
    comparison: (chainId: number, minerIds: string[]) =>
      ["minerStats", chainId, "comparison", minerIds.sort().join(",")] as const,
  },

  trustScore: {
    user: (chainId: number, address: string) =>
      ["trustScore", chainId, "user", address] as const,
  },

  balances: {
    mementos: (chainId: number, address: string) =>
      ["balances", chainId, "mementos", address] as const,
  },
} as const;
