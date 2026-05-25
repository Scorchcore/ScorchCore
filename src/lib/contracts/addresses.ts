/**
 * Direcciones de contratos desplegados en Ronin
 * Actualizado: 27 Enero 2026
 */

export const RONIN_TESTNET_CHAIN_ID = 202601;
export const RONIN_MAINNET_CHAIN_ID = 2020;

// ========== NUEVOS CONTRATOS (27-Ene-2026) ==========

export const NEW_CONTRACTS = {
  // Ronin Testnet (Saigon)
  [RONIN_TESTNET_CHAIN_ID]: {
    coreMinerNFT: "0x18DeFdAA25E5032239a8ce981A5721CEe4FB0165",
    geodeNFT: "0x1D9922d7359B64d02717ea39C4E6D87E5794DB9D",
    metadataRegistry: "0xF5c48fC27cDAF512C255c0971B8ED2B7A42a669b",
  },

  // Ronin Mainnet - TODO: Deploy cuando esté listo
  [RONIN_MAINNET_CHAIN_ID]: {
    coreMinerNFT: "",
    geodeNFT: "",
    metadataRegistry: "",
  },
} as const;

// ========== CONTRATOS EXISTENTES (23-Ene-2026) ==========

export const EXISTING_CONTRACTS = {
  [RONIN_TESTNET_CHAIN_ID]: {
    // NFT System
    oldCoreMinerNFT: "0xa105F44F96A733C1eADEecDd9ade3f03Ce11B79b",
    oldGeodeNFT: "0x4581b630DC14905a2C13B21654610a547733A287",
    oldMetadataRegistry: "0x979dA45447434C1D9506c1edE4187B796A1d827D",

    // Forging
    forgeFactory: "0xe1C50543735A20f7A98b383DD7848350FdfB5FBF",
    geodeHatcher: "0xb97E8CA51236750Aa9c1A5c863B714d987cC8e70",

    // Staking (26-Ene-2026)
    coreMinerStakingManager: "0xAe5B141B160500A291b6db7cbC6Cf57CD932A4FB",
    geodeStakingManager: "0x5d863C0Ce30055EB9F9c941Ea44B2e58AE9dB0BB",
    scholarshipManager: "0x66da21090139EEC550DBa64E2dA9EAc9eECBD3c6",

    // Economy
    coreToken: "0x725d916F4f9212057A63E3BE1B4790BCe8720bf5",
    emissionSchedule: "0x0d9C4Ad5509f457959c46bC39726b2B2723D57b6",
    miningPool: "0xCe168E28AED62EcF22A09137E7bbd40c56060A3C",
    rewardsCalculator: "0x11AFc7BFfCD4B4cDe692f24777dDB4b3C312DCE8",
    cycleManager: "0x516463ceD938697B53EE46df84899f019D89a341",

    // Gaming
    minigameManager: "0x0984733Ba837CaB92d26C634FffcAe6a21A08925",
    pvpArena: "0x2E5e9e89b4a40BAf1A0545e368fa5E8044647c93",

    // Stats
    minerStatsManager: "0xCe5A06F4f2221bA8C42820F8507ADC322BD2B2E9",
  },

  [RONIN_MAINNET_CHAIN_ID]: {
    // TODO: Mainnet addresses
  },
} as const;

// ========== HELPERS ==========

export function getContractAddress(
  chainId: number,
  contractName: keyof (typeof NEW_CONTRACTS)[typeof RONIN_TESTNET_CHAIN_ID],
): string {
  const contracts = NEW_CONTRACTS[chainId as keyof typeof NEW_CONTRACTS];
  if (!contracts) {
    throw new Error(`Chain ${chainId} not supported`);
  }
  const address = contracts[contractName];
  if (!address) {
    throw new Error(
      `Contract ${contractName} not deployed on chain ${chainId}`,
    );
  }
  return address;
}

export function getExistingContractAddress(
  chainId: number,
  contractName: keyof (typeof EXISTING_CONTRACTS)[typeof RONIN_TESTNET_CHAIN_ID],
): string {
  const contracts = EXISTING_CONTRACTS[
    chainId as keyof typeof EXISTING_CONTRACTS
  ] as Record<string, string>;
  if (!contracts) {
    throw new Error(`Chain ${chainId} not supported`);
  }
  const address = contracts[contractName];
  if (!address) {
    throw new Error(
      `Contract ${contractName} not deployed on chain ${chainId}`,
    );
  }
  return address;
}

// ========== EXPORTS ==========

export { EXISTING_CONTRACTS as CONTRACTS };
