/**
 * Configuración centralizada del deployment actual
 * Auto-generado desde deployment-forge-saigon-1768450493298.json
 */

export const DEPLOYMENT_INFO = {
  network: "saigon",
  chainId: 202601,
  deployer: "0xD598F9CBaD6de33A37E403647e25EA52DA7c07bA",
  timestamp: "2026-01-15T04:14:53.293Z",
  verified: true,
} as const;

/**
 * Todas las direcciones de contratos desplegados
 * ✅ Verificados en Sourcify
 */
export const CONTRACT_ADDRESSES = {
  // Core System
  CoreToken: "0x725d916F4f9212057A63E3BE1B4790BCe8720bf5",
  EmissionSchedule: "0x0d9C4Ad5509f457959c46bC39726b2B2723D57b6",
  MetadataRegistry: "0x979dA45447434C1D9506c1edE4187B796A1d827D",

  // NFTs
  CoreMinerNFT: "0xa105F44F96A733C1eADEecDd9ade3f03Ce11B79b",
  GeodeNFT: "0x4581b630DC14905a2C13B21654610a547733A287",
  axieNFT: "0x32950db2a7164aE833121501C797D79E7B79d74C", // Axie Contract (external NFT)
  //TOKENS
  axsToken: "0x32950db2a7164aE833121501C797D79E7B79d74C", // Same as axieNFT (legacy compatibility)
  slpToken: "0xa8754b9Fa15fc18BB59458815510E40a12cD2014",
  // Mining System
  MinerStatsManager: "0xCe5A06F4f2221bA8C42820F8507ADC322BD2B2E9",
  SetRegistry: "0x63685c0948274114d391c409483aE3F228B25a53",
  UserCollectionTracker: "0x42FC08E6bAba091A11D379258C2B257FE91C4434",
  BonusCalculator: "0x0a517d72D97d7FcB217a4738Ff8E558137f97bD9",
  RewardsCalculator: "0x11AFc7BFfCD4B4cDe692f24777dDB4b3C312DCE8", // ✅ RE-DEPLOYED 26-Jan-2026
  CycleManager: "0x516463ceD938697B53EE46df84899f019D89a341",
  MiningPool: "0xCe168E28AED62EcF22A09137E7bbd40c56060A3C", // ✅ RE-DEPLOYED 26-Jan-2026

  // Integrations & Staking
  AxieIntegration: "0xf177F589c95162841C9FBFA342Ec6212fAdB1887",
  AxieStakingManager: "0x0f00cce40b8aA690926daCDbDA5663b2bd39c2FB",
  GeodeStakingManager: "0x5d863C0Ce30055EB9F9c941Ea44B2e58AE9dB0BB", // ✅ NEW 26-Jan-2026
  CoreMinerStakingManager: "0xAe5B141B160500A291b6db7cbC6Cf57CD932A4FB", // ✅ NEW 26-Jan-2026

  // Economy & Gaming (Phase 3 - 26-Jan-2026)
  ScholarshipManager: "0x66da21090139EEC550DBa64E2dA9EAc9eECBD3c6", // ✅ NEW
  MinigameManager: "0x0984733Ba837CaB92d26C634FffcAe6a21A08925", // ✅ NEW
  PvPArena: "0x2E5e9e89b4a40BAf1A0545e368fa5E8044647c93", // ✅ NEW

  // Memento System
  MementoToken: "0xfa3Ab001DA96e9D97574cec97D0e1A1eFc53CA25", // v2 Multi-Type (IDs 0-8)
  MementoValidator: "0x49a39C10fE707Fb78541fc17635b8492d093C6BC",

  // Randomness
  ChainlinkVRFProvider: "0x09103DfbF9f8C2D73f85BD945DF910643F5c416c",
  HatchingRandomness: "0x03126e3234da9b88Bd481fe4c30DFd4953337f86",

  // Phase 2A - Anti-Bot & Economy
  ProofOfHumanityOracle: "0xf410C594165CB753e11F77D8EefC5021c654Fd56",
  IdNFT: "0x2dC6CB947bB666Ca997C8ae18219058FF793488d",
  fCoreToken: "0xF525F3C43888da15d18cbE4006e0c173FC84f363",
  fCoreConverter: "0xbDb650d371cE75aD2cab4bb36814d9d2A9523754",
  VestingManager: "0xeB80aac037B0e47aB097CC4845b088815d66751C",
  PriceOracle: "0xd2952D4B4aeF2316f87F45814f3B73eE70fc3acd",
  BuyBackFund: "0xA5911Bd91eEc413299e942a73C875Df7b75c92F1",
  RoyaltyManager: "0x1b360dCa7E14E3bb9d42d74cE3A923a4c6FC4C2E",
  TrustScoreManager: "0xc91cf64e7405730483C2EB38AaeBE353aC8dF041",

  // Forge System (Phase 2C - 2026-01-23)
  RecipeRegistry: "0x0F429C4eaD95c7c5b09235b30986f0cD763199F4",
  SupplyTracker: "0x5007539245C4041A2f05F9519aFBFe448262E1A8",
  MaterialValidatorTestnet: "0xC6ad27d4254331F8e9A4FDC8d5d067AFf1ce251f", // Phase 2C: Material validation (AXS + SLP)
  ForgeFactory: "0xe1C50543735A20f7A98b383DD7848350FdfB5FBF", // Phase 2C: Material validation system
  GeodeHatcher: "0x7834bF804Bd7cCd4191e95250F8E6ffB3BC0c1a2", // FIXED: mintMiner() con poder calculado
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

/**
 * Explorer links para debugging
 */
export function getExplorerLink(address: string): string {
  return `https://saigon-app.roninchain.com/address/${address}`;
}

export function getExplorerTxLink(txHash: string): string {
  return `https://saigon-app.roninchain.com/tx/${txHash}`;
}
