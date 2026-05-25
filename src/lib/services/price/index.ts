/**
 * Barrel export para Price service
 */

export { PriceOracleService, createPriceOracleService } from './PriceOracleService';
export type { PriceHistory, PriceStats, ConversionResult } from './PriceOracleService';

// Re-export types from IEconomyContract
export type { PriceInfoUI } from '@/lib/contracts/interfaces/IEconomyContract';
