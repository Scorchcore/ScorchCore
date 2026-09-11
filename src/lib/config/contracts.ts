/**
 * Configuración de direcciones de contratos para ScorchCore
 * Soporta Ronin Mainnet y Ronin Testnet
 */

import type { Address } from "viem";
import { createServiceLogger } from "@/lib/utils/logging/logger";

const log = createServiceLogger("ContractConfig");

export interface ContractAddresses {
  // Tokens
  coreToken: Address;
  fCoreToken: Address; // Token de recompensas de mining
  slpToken: Address;
  axsToken: Address;
  treasury?: Address;

  // Mementos (9 tokens, uno por clase de Axie)
  mementos: {
    beast: Address;
    aqua: Address;
    bird: Address;
    reptile: Address;
    bug: Address;
    plant: Address;
    mech: Address;
    dusk: Address;
    dawn: Address;
  };

  // NFTs
  geodeNFT: Address;
  coreMinerNFT: Address;
  axieNFT: Address;
  coreMinerNFTV2?: Address;
  geodeNFTV2?: Address;
  geodeHatcherV2?: Address;

  // Core Contracts
  scorchHeartTransmuter: Address;
  axsTreasuryVault: Address;
  fCoreConverter?: Address;
  activityTracker?: Address;
  proofOfHumanityOracle?: Address;
  axsPriceOracle?: Address;

  // Mining System
  miningPool?: Address;
  rewardsCalculator?: Address;
  cycleManager?: Address;
  emissionSchedule?: Address;

  // Staking Managers
  axieStakingManager?: Address;
  geodeStakingManager?: Address;
  coreMinerStakingManager?: Address;

  // Economy & Gaming
  scholarshipManager?: Address;
  minigameManager?: Address;
  pvpArena?: Address;
  airdropManager?: Address;
  axieRarityOracle?: Address;
  scorchTreasury?: Address;
  timelockController?: Address;
  multisig?: Address;

  // Faucets (solo testnet)
  tokenFaucet?: Address;
  axieFaucet?: Address;
  mementoFaucet?: Address;
}

// Ronin Mainnet Addresses (2020)
// TODO: Actualizar con direcciones reales al hacer deploy en mainnet
const MAINNET_CONTRACTS: ContractAddresses = {
  // Tokens reales de Axie Infinity
  axsToken: "0x97a9107c1793bc407d6f527b77e7fff4d812bece",
  slpToken: "0xa8754b9fa15fc18bb59458815510e40a12cd2014",
  coreToken: "0x0000000000000000000000000000000000000000",
  fCoreToken: "0x0000000000000000000000000000000000000000",

  // Mementos (actualizar después del deploy)
  mementos: {
    beast: "0x0000000000000000000000000000000000000000",
    aqua: "0x0000000000000000000000000000000000000000",
    bird: "0x0000000000000000000000000000000000000000",
    reptile: "0x0000000000000000000000000000000000000000",
    bug: "0x0000000000000000000000000000000000000000",
    plant: "0x0000000000000000000000000000000000000000",
    mech: "0x0000000000000000000000000000000000000000",
    dusk: "0x0000000000000000000000000000000000000000",
    dawn: "0x0000000000000000000000000000000000000000",
  },

  // Axie NFT real
  axieNFT: "0x32950db2a7164aE833121501C797D79E7B79d74C",
  geodeNFT: "0x0000000000000000000000000000000000000000",
  coreMinerNFT: "0x0000000000000000000000000000000000000000",

  // ScorchCore Contracts (actualizar después del deploy)
  scorchHeartTransmuter: "0x0000000000000000000000000000000000000000",
  axsTreasuryVault: "0x0000000000000000000000000000000000000000",

  // Mining System
  miningPool: "0x0000000000000000000000000000000000000000",
  rewardsCalculator: "0x0000000000000000000000000000000000000000",
  cycleManager: "0x0000000000000000000000000000000000000000",
  emissionSchedule: "0x0000000000000000000000000000000000000000",

  // Staking Managers
  axieStakingManager: "0x0000000000000000000000000000000000000000",
  geodeStakingManager: "0x0000000000000000000000000000000000000000",
  coreMinerStakingManager: "0x0000000000000000000000000000000000000000",

  // Economy & Gaming
  scholarshipManager: "0x0000000000000000000000000000000000000000",
  minigameManager: "0x0000000000000000000000000000000000000000",
  pvpArena: "0x0000000000000000000000000000000000000000",
};

// Ronin Testnet Addresses (202601)
// DEPLOYED: 15-ene-2026 04:14 UTC - VERIFIED on Sourcify ✅
export const TESTNET_CONTRACTS: ContractAddresses = {
  // External Tokens (Ronin Testnet)
  // ⚠️ IMPORTANTE: AXS es solo para PRUEBAS en testnet. Para producción usar el contrato oficial de AXS
  axsToken: "0xa48B62457fA7D60E93239a84E0DB60748Fe92d20", // AXS Token (testnet - TEMPORAL para pruebas)
  slpToken: "0xa8754b9Fa15fc18BB59458815510E40a12cD2014", // SLP Contract (external)

  // Core Tokens (NUEVO DEPLOYMENT)
  coreToken: "0xc113Eb5aDfE5a20728E1E2279e72a93F4e72ad90", // CoreToken ✅ VERIFIED
  fCoreToken: "0xEE334EF365f2EAdc658913BbBf3bdf9554fE8819", // fCoreToken ✅ VERIFIED
  treasury: "0xaB783aF937E3cb7F93c56a225aF32091fb6ED697",

  // Memento Token (ERC-1155 Multi-Type - Token IDs 0-8)
  // ✅ NUEVO: Soporta 9 tipos diferentes por clase de Axie (0=Beast, 1=Aqua, 2=Bird, etc.)
  mementos: {
    beast: "0xfa3Ab001DA96e9D97574cec97D0e1A1eFc53CA25", // MementoToken v2 ✅ Multi-Type
    aqua: "0xfa3Ab001DA96e9D97574cec97D0e1A1eFc53CA25", // (mismo contrato, diferentes IDs)
    bird: "0xfa3Ab001DA96e9D97574cec97D0e1A1eFc53CA25",
    reptile: "0xfa3Ab001DA96e9D97574cec97D0e1A1eFc53CA25",
    bug: "0xfa3Ab001DA96e9D97574cec97D0e1A1eFc53CA25",
    plant: "0xfa3Ab001DA96e9D97574cec97D0e1A1eFc53CA25",
    mech: "0xfa3Ab001DA96e9D97574cec97D0e1A1eFc53CA25",
    dusk: "0xfa3Ab001DA96e9D97574cec97D0e1A1eFc53CA25",
    dawn: "0xfa3Ab001DA96e9D97574cec97D0e1A1eFc53CA25",
  },

  // NFTs (NUEVO DEPLOYMENT - verificados en Sourcify)
  axieNFT: "0x32950db2a7164aE833121501C797D79E7B79d74C", // Axie Contract (external)
  geodeNFT: "0xc83d7199c301C2DC750Da78c1F3AC4252F74833f", // GeodeNFT ✅ VERIFIED
  coreMinerNFT: "0xE1f95eeAa236E8C7ad95A8B0F1b82e7921cf681b", // CoreMinerNFT ✅ VERIFIED
  geodeNFTV2: "0xc83d7199c301C2DC750Da78c1F3AC4252F74833f",
  coreMinerNFTV2: "0xE1f95eeAa236E8C7ad95A8B0F1b82e7921cf681b",
  geodeHatcherV2: "0xc859dC6547F630c43eF5659f3b4c66fd775ad8Ca",

  // Core Contracts
  scorchHeartTransmuter: "0x9B0Db42bA4403Dfc8B8Ae089eaD1d4dDc552159E", // ForgeFactory ✅ VERIFIED
  axsTreasuryVault: "0x0000000000000000000000000000000000000000", // TODO: No deployed yet
  fCoreConverter: "0x7eB8e85e88375AE653BF12Ca5fA1B5E8000BAe4B",
  activityTracker: "0xBC22Ad017664F49cd1b192a474781Cf943cf8EA1",
  proofOfHumanityOracle: "0xEc2fbfA18710519C742f2F92c5Dc81C1400dfFf3",
  axsPriceOracle: "0x5006E89efFbBd7ae5250878E7371B777f0952095",

  // Mining System (RE-DEPLOYED 26-Jan-2026)
  miningPool: "0x825a395cdDF78E1BEfd1F9f36553616D12517aB3", // MiningPool v2 ✅ NEW
  rewardsCalculator: "0x78647d60B22a8BFBFF87900E8151Da80d5Eda96a", // RewardsCalculator v2 ✅ NEW
  cycleManager: "0x0f39D43F82Fc4CD83568f9c5e4B885DAD5Fe93F5", // CycleManager ✅ VERIFIED
  emissionSchedule: "0x61e99703De7af7396Aa0dFae954a9ABcfe336FD6", // EmissionSchedule ✅ VERIFIED

  // Staking Managers (DEPLOYED 26-Jan-2026)
  axieStakingManager: "0xBcE97BDc77b732CF892EE0cE20B70e6A603bD60B", // AxieStakingManager ✅ VERIFIED
  geodeStakingManager: "0x1989D526627F9eCc5F200D1FA52d3256E0B057a2", // GeodeStakingManager ✅ NEW
  coreMinerStakingManager: "0x7F3A84aEa920ECB4427A87CFb8Cae54f50B62F0F", // CoreMinerStakingManager ✅ NEW

  // Economy & Gaming (DEPLOYED 26-Jan-2026)
  scholarshipManager: "0x36814C3286923aD6645b6c24030a01a0D5D306C6", // ScholarshipManager ✅ NEW
  minigameManager: "0x69210Df31179da7418F84bf9B21B4409Df05839a", // MinigameManager ✅ NEW
  airdropManager: "0xF6E51eb7dB4Db09716F600A4d9b21601A77e498D",
  axieRarityOracle: "0x0D3b0EAba5E40dCD2C41BEb58F7638aDBE59F48a",
  scorchTreasury: "0x62B04C6ecF6a02713D495A3cce3b0Ed6308a17B1",
  timelockController: "0xbB22eF77Ba0E275D8Ac1C1bA49A9b9e49624F6c2",
  multisig: "0xD598F9CBaD6de33A37E403647e25EA52DA7c07bA",
  pvpArena: "0x2E5e9e89b4a40BAf1A0545e368fa5E8044647c93", // PvPArena ✅ NEW
  mementoFaucet: "0x5EE00970309B7f96EEff61b29B57C115EA0E9145",
};

/**
 * Obtiene las direcciones de contratos según el chainId
 * @param chainId - 2020 para mainnet, 202601 para testnet
 */
export function getContractAddresses(chainId: number): ContractAddresses {
  switch (chainId) {
    case 2020:
      return MAINNET_CONTRACTS;
    case 202601:
      return TESTNET_CONTRACTS;
    default:
      log.warn("Unknown chainId detected, defaulting to testnet", {
        chainId,
        supportedChains: [2020, 202601],
        defaulting: "testnet",
      });
      return TESTNET_CONTRACTS;
  }
}

/**
 * Verifica si una dirección es válida (no es address zero)
 */
export function isValidAddress(address: Address): boolean {
  return address !== "0x0000000000000000000000000000000000000000";
}

/**
 * Obtiene las direcciones de contratos válidos (no son address zero)
 */
export function getValidContracts(chainId: number): Partial<ContractAddresses> {
  const addresses = getContractAddresses(chainId);
  const validAddresses: Partial<ContractAddresses> = {};

  for (const [key, value] of Object.entries(addresses)) {
    // mementos es un objeto, manejarlo especialmente
    if (key === "mementos" && typeof value === "object") {
      (validAddresses as any)[key] = value;
    } else if (typeof value === "string" && isValidAddress(value as Address)) {
      (validAddresses as any)[key] = value;
    }
  }

  return validAddresses;
}

/**
 * Hook para obtener las direcciones de contratos de la red actual
 */
export { getContractAddresses as default };

// Exportar constantes
export const RONIN_MAINNET_ID = 2020;
export const RONIN_TESTNET_ID = 202601;

// Nombres legibles
export const CHAIN_NAMES: Record<number, string> = {
  [RONIN_MAINNET_ID]: "Ronin Mainnet",
  [RONIN_TESTNET_ID]: "Ronin Testnet",
};
