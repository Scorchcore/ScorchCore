/**
 * Cycle Services - Barrel Export
 * 
 * Módulo completo para gestión de ciclos de minería
 */

// Types (values and types)
export type { CycleDuration } from '@/lib/contracts/interfaces/ICycleContract';

export type {
  ActiveCycle,
  StartCycleOptions,
  StartCycleResult,
  EndCycleResult,
  CycleBonusInfo,
  MinerCycleStatus,
  UserCyclesSummary,
} from './types';

export { CYCLE_DURATION_NAMES } from './types';

// Services
export { CycleService, createCycleService } from './CycleService';
