/**
 * Configuración centralizada del deployment actual
 * Auto-generado desde deployment-forge-saigon-1768450493298.json
 */

export const DEPLOYMENT_INFO = {
  network: "saigon",
  chainId: 202601,
  deployer: "0xD598F9CBaD6de33A37E403647e25EA52DA7c07bA",
  timestamp: "2026-07-01T03:00:00.000Z",
  verified: true,
} as const;

/**
 * Todas las direcciones de contratos desplegados
 * ✅ Verificados en Sourcify
 */
export const CONTRACT_ADDRESSES = {
  // Core System
  CoreToken: "0xc113Eb5aDfE5a20728E1E2279e72a93F4e72ad90",
  EmissionSchedule: "0x61e99703De7af7396Aa0dFae954a9ABcfe336FD6",
  MetadataRegistry: "0x979dA45447434C1D9506c1edE4187B796A1d827D",

  // NFTs
  CoreMinerNFT: "0xE1f95eeAa236E8C7ad95A8B0F1b82e7921cf681b",
  GeodeNFT: "0xc83d7199c301C2DC750Da78c1F3AC4252F74833f",
  CoreMinerNFTV2: "0xE1f95eeAa236E8C7ad95A8B0F1b82e7921cf681b",
  GeodeNFTV2: "0xc83d7199c301C2DC750Da78c1F3AC4252F74833f",
  GeodeHatcherV2: "0xc859dC6547F630c43eF5659f3b4c66fd775ad8Ca",
  axieNFT: "0x32950db2a7164aE833121501C797D79E7B79d74C", // Axie Contract (external NFT)
  //TOKENS
  axsToken: "0xa48B62457fA7D60E93239a84E0DB60748Fe92d20", // Mock AXS de Saigon L2 (el que referencia el MaterialValidator desplegado)
  slpToken: "0xa8754b9Fa15fc18BB59458815510E40a12cD2014",
  // Mining System
  MinerStatsManager: "0xCe5A06F4f2221bA8C42820F8507ADC322BD2B2E9",
  SetRegistry: "0x63685c0948274114d391c409483aE3F228B25a53",
  UserCollectionTracker: "0x42FC08E6bAba091A11D379258C2B257FE91C4434",
  BonusCalculator: "0x0a517d72D97d7FcB217a4738Ff8E558137f97bD9",
  RewardsCalculator: "0x78647d60B22a8BFBFF87900E8151Da80d5Eda96a", // ✅ RE-DEPLOYED 26-Jan-2026
  CycleManager: "0x0f39D43F82Fc4CD83568f9c5e4B885DAD5Fe93F5",
  MiningPool: "0x825a395cdDF78E1BEfd1F9f36553616D12517aB3", // ✅ RE-DEPLOYED 26-Jan-2026

  // Integrations & Staking
  AxieIntegration: "0xf177F589c95162841C9FBFA342Ec6212fAdB1887",
  AxieStakingManager: "0xBcE97BDc77b732CF892EE0cE20B70e6A603bD60B",
  GeodeStakingManager: "0x1989D526627F9eCc5F200D1FA52d3256E0B057a2", // ✅ NEW 26-Jan-2026
  CoreMinerStakingManager: "0x7F3A84aEa920ECB4427A87CFb8Cae54f50B62F0F", // ✅ NEW 26-Jan-2026

  // Economy & Gaming (Phase 3 - 26-Jan-2026)
  ActivityTracker: "0xBC22Ad017664F49cd1b192a474781Cf943cf8EA1",
  ScholarshipManager: "0x36814C3286923aD6645b6c24030a01a0D5D306C6", // ✅ NEW
  MinigameManager: "0x69210Df31179da7418F84bf9B21B4409Df05839a", // ✅ NEW
  AirdropManager: "0xF6E51eb7dB4Db09716F600A4d9b21601A77e498D",
  AxieRarityOracle: "0x0D3b0EAba5E40dCD2C41BEb58F7638aDBE59F48a",
  ScorchTreasury: "0x62B04C6ecF6a02713D495A3cce3b0Ed6308a17B1",
  TimelockController: "0xbB22eF77Ba0E275D8Ac1C1bA49A9b9e49624F6c2",
  Multisig: "0xD598F9CBaD6de33A37E403647e25EA52DA7c07bA",
  PvPArena: "0x2E5e9e89b4a40BAf1A0545e368fa5E8044647c93", // ✅ NEW

  // Memento System
  MementoToken: "0xfa3Ab001DA96e9D97574cec97D0e1A1eFc53CA25", // v2 Multi-Type (IDs 0-8)
  MementoValidator: "0x49a39C10fE707Fb78541fc17635b8492d093C6BC",
  MementoFaucet: "0x5EE00970309B7f96EEff61b29B57C115EA0E9145",

  // Randomness
  ChainlinkVRFProvider: "0x763BE951d2464063b0D6752C543956b48bA205B9",
  HatchingRandomness: "0x7f6D7e784bf580F220e1B93fDd5B3d269b67f3d7",

  // Phase 2A - Anti-Bot & Economy
  ProofOfHumanityOracle: "0xEc2fbfA18710519C742f2F92c5Dc81C1400dfFf3",
  IdNFT: "0x2dC6CB947bB666Ca997C8ae18219058FF793488d",
  fCoreToken: "0xEE334EF365f2EAdc658913BbBf3bdf9554fE8819",
  fCoreConverter: "0x7eB8e85e88375AE653BF12Ca5fA1B5E8000BAe4B",
  VestingManager: "0xeB80aac037B0e47aB097CC4845b088815d66751C",
  PriceOracle: "0xd2952D4B4aeF2316f87F45814f3B73eE70fc3acd",
  BuyBackFund: "0xA5911Bd91eEc413299e942a73C875Df7b75c92F1",
  RoyaltyManager: "0x1b360dCa7E14E3bb9d42d74cE3A923a4c6FC4C2E",
  TrustScoreManager: "0xc91cf64e7405730483C2EB38AaeBE353aC8dF041",

  // Forge System (Phase 2C - 2026-01-23)
  RecipeRegistry: "0x0F429C4eaD95c7c5b09235b30986f0cD763199F4",
  SupplyTracker: "0x5007539245C4041A2f05F9519aFBFe448262E1A8",
  MaterialValidatorTestnet: "0xC6ad27d4254331F8e9A4FDC8d5d067AFf1ce251f", // Phase 2C: Material validation (AXS + SLP)
  ForgeFactory: "0x9B0Db42bA4403Dfc8B8Ae089eaD1d4dDc552159E", // Phase 2C: Material validation system
  AxsPriceOracle: "0x5006E89efFbBd7ae5250878E7371B777f0952095",
  ProtocolFeeManager: "0xA6D13070aD2E74a497A4C0A59F222E03909cD040",
  GeodeHatcher: "0xc859dC6547F630c43eF5659f3b4c66fd775ad8Ca", // FIXED: mintMiner() con poder calculado
} as const;

/**
 * Contratos externos de Ronin
 */
export const EXTERNAL_CONTRACTS = {
  AxieContract: "0x32950db2a7164aE833121501C797D79E7B79d74C",
  SLPContract: "0xa8754b9Fa15fc18BB59458815510E40a12cD2014",
} as const;

/**
 * Configuración del sistema
 */
export const SYSTEM_CONFIG = {
  ipfsCID: "bafybeigzh52gns3x2bmtkh2uxepnbtd5ryrzwu6sogsl7apsnz4qncjjge",
  mementoBaseURI: "ipfs://mementos/",
  vrfCoordinator: "0x0000000000000000000000000000000000000000",
  keyHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  subscriptionId: "1",
} as const;

/**
 * Estado de emisión de tokens
 */
export const EMISSION_STATUS = {
  started: true,
  currentRate: "16.647640791476407914", // CORE/second
  yearlyRate: "524999999.999999999975904", // CORE/year
} as const;

/**
 * Type-safe contract address getter
 */
export type ContractName = keyof typeof CONTRACT_ADDRESSES;
export type ExternalContractName = keyof typeof EXTERNAL_CONTRACTS;

export function getContractAddress(name: ContractName): string {
  return CONTRACT_ADDRESSES[name];
}

export function getExternalContractAddress(name: ExternalContractName): string {
  return EXTERNAL_CONTRACTS[name];
}

const RONIN_AVG_BLOCK_TIME_S = 3;
const SAFETY_BUFFER = 1.1;

/**
 * Returns the block number from which to start scanning events.
 * Uses NEXT_PUBLIC_DEPLOYMENT_BLOCK env var if set (fast path),
 * otherwise estimates from the deployment timestamp (slow — scans millions of blocks).
 */
export function getDeploymentBlock(currentBlock: number): number {
  const envBlock = process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK;
  if (envBlock) {
    const parsedBlock = Number(envBlock);
    if (Number.isFinite(parsedBlock) && parsedBlock >= 0) {
      console.log(`Using deployment block from env: ${envBlock}`);
      return parsedBlock;
    }
    console.warn(`Invalid NEXT_PUBLIC_DEPLOYMENT_BLOCK ignored: ${envBlock}`);
  }
  const deployTimestamp = new Date(DEPLOYMENT_INFO.timestamp).getTime();
  const nowTimestamp = Date.now();
  const secondsSinceDeploy = Math.floor(
    (nowTimestamp - deployTimestamp) / 1000,
  );
  const estimatedBlocksSinceDeploy = Math.ceil(
    (secondsSinceDeploy * SAFETY_BUFFER) / RONIN_AVG_BLOCK_TIME_S,
  );
  return Math.max(0, currentBlock - estimatedBlocksSinceDeploy);
}

/**
 * Explorer links para debugging
 */
export function getExplorerLink(address: string): string {
  return `https://saigon-app.roninchain.com/address/${address}`;
}

export function getExplorerTxLink(txHash: string): string {
  return `https://saigon-app.roninchain.com/tx/${txHash}`;
}
