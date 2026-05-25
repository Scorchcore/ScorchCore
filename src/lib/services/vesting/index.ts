/**
 * Barrel export para Vesting service
 */

export { VestingService, createVestingService } from './VestingService';
export type { VestingScheduleUI, VestingDashboard } from './VestingService';
export type { VestingSchedule } from '@/lib/contracts/interfaces/IEconomyContract';
