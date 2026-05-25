/**
 * Services Public API
 * 
 * **REFACTORIZACIÓN ARQUITECTURAL:**
 * - Base classes para eliminar duplicación (BaseMiningService, BaseForgeService)
 * - Servicios especializados usando herencia
 * - ITokenService interface para Liskov Substitution Principle
 * 
 * Arquitectura Modular (refactorizada para SOLID):
 * - Alta cohesión: Servicios especializados
 * - SRP aplicado: Una responsabilidad por servicio
 * - Facade pattern: APIs compatibles con versión anterior
 * 
 * **NOTA IMPORTANTE:**
 * Los servicios individuales (ForgeTokenService, MiningOperationsService, etc.)
 * NO son parte de la API pública. Usa las Facades (ForgeFacade, MiningFacade)
 * que encapsulan toda la funcionalidad.
 */

// ==========================================
// FACADES - API Pública Recomendada
// ==========================================
export { createForgeService, ForgeFacade } from './forge/ForgeFacade';
export { createMiningService, MiningFacade } from './mining/MiningFacade';

// ==========================================
// Token Services
// ==========================================
export { TokenService, createTokenService } from './token/TokenService';
export { TokenServiceCache, createCachedTokenService } from './token/TokenServiceCache';
export type { 
  ITokenService,
  TokenBalance, 
  TokenBalances, 
  TokenApproval,
  TokenConfig,
  TokenInfo,
  ApprovalResult,
} from './token/types';

// ==========================================
// Cycle Module
// ==========================================
export {
  CycleService,
  createCycleService,
} from './cycle';

export type {
  CycleDuration,
  ActiveCycle,
  CycleBonusInfo,
} from './cycle';

// fCore Module (Anti-Bot)
export {
  fCoreService,
  createfCoreService,
} from './fcore';

export type {
  fCoreBalanceState,
  PohVerificationInfo,
  ConvertfCoreParams,
  ConvertfCoreResult,
  fCoreSystemInfo,
} from './fcore';

// ==========================================
// Waypoint Services
// ==========================================
export { WaypointService, waypointService } from './waypoint';
export type {
  WaypointConfig,
  WaypointConnectionResult,
  WaypointSessionState,
  WaypointAuthOptions,
} from './waypoint';

// ==========================================
// NFT Services
// ==========================================
export * from './nft';
