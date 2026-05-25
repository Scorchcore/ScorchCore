/**
 * Barrel export para Collection service
 */

export { CollectionService, createCollectionService } from './CollectionService';

// Re-export types from ICollectionContract
export type { 
  CollectionSet, 
  SetProgress, 
  UserBonusSummary 
} from '@/lib/contracts/interfaces/ICollectionContract';
