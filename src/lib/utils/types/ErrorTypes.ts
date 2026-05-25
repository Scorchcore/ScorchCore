/**
 * Error types for blockchain operations
 * Elimina any types en error handling
 */

/**
 * Blockchain error structure
 */
export interface BlockchainError extends Error {
  code?: string;
  reason?: string;
  transaction?: {
    to?: string;
    from?: string;
    data?: string;
  };
}

/**
 * Type guard para BlockchainError
 */
export function isBlockchainError(error: unknown): error is BlockchainError {
  return (
    error instanceof Error &&
    ('code' in error || 'reason' in error || 'transaction' in error)
  );
}
