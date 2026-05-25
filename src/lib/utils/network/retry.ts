/**
 * Retry Logic Utility
 * 
 * Implementa retry con exponential backoff para operaciones blockchain
 * que pueden fallar por razones temporales (gas, network, etc.)
 * 
 * @pattern Retry with Exponential Backoff
 */

import { createServiceLogger } from '../logging/logger';
import type { BlockchainError } from '../types/ErrorTypes';

const log = createServiceLogger('RetryUtility');

export interface RetryOptions {
  /** Número máximo de intentos (default: 3) */
  maxAttempts?: number;
  /** Delay inicial en ms (default: 1000) */
  initialDelay?: number;
  /** Factor de multiplicación del delay (default: 2) */
  backoffFactor?: number;
  /** Delay máximo en ms (default: 10000) */
  maxDelay?: number;
  /** Función para determinar si se debe reintentar (default: siempre) */
  shouldRetry?: (error: unknown) => boolean;
  /** Callback ejecutado antes de cada retry */
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 10000,
  shouldRetry: () => true,
  onRetry: () => {},
};

/**
 * Ejecuta una operación con retry automático
 * 
 * @param operation - Función async a ejecutar
 * @param options - Opciones de retry
 * @returns Resultado de la operación
 * 
 * @example
 * ```typescript
 * const result = await withRetry(
 *   async () => contract.someMethod(),
 *   {
 *     maxAttempts: 3,
 *     shouldRetry: (error) => error.code !== 'USER_REJECTED'
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      log.debug(`Attempt ${attempt}/${opts.maxAttempts}`);
      return await operation();
    } catch (error) {
      lastError = error;

      // Si es el último intento, lanzar error
      if (attempt === opts.maxAttempts) {
        log.error(`All ${opts.maxAttempts} attempts failed`, error);
        throw error;
      }

      // Verificar si se debe reintentar
      if (!opts.shouldRetry(error)) {
        log.debug('Error not retryable', { error });
        throw error;
      }

      // Callback de retry
      opts.onRetry(attempt, error);

      // Log del retry
      log.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, {
        error: error instanceof Error ? error.message : String(error),
      });

      // Esperar con exponential backoff
      await sleep(delay);

      // Incrementar delay con backoff factor
      delay = Math.min(delay * opts.backoffFactor, opts.maxDelay);
    }
  }

  // Nunca debería llegar aquí, pero TypeScript lo requiere
  throw lastError;
}

/**
 * Determina si un error blockchain es retryable
 * 
 * Errores NO retryables:
 * - USER_REJECTED: Usuario canceló en wallet
 * - INSUFFICIENT_FUNDS: No tiene fondos suficientes
 * - INVALID_ARGUMENT: Parámetros inválidos
 * 
 * Errores retryables:
 * - NETWORK_ERROR: Problemas de red temporales
 * - TIMEOUT: Timeout de RPC
 * - UNPREDICTABLE_GAS_LIMIT: Estimación de gas falló
 * - NONCE_EXPIRED: Nonce desactualizado
 */
export function isRetryableBlockchainError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  const errorCode = (error as BlockchainError)?.code;

  // Errores NO retryables
  const nonRetryablePatterns = [
    'user rejected',
    'user denied',
    'user cancelled',
    'insufficient funds',
    'insufficient balance',
    'invalid argument',
    'execution reverted',
    'revert',
  ];

  for (const pattern of nonRetryablePatterns) {
    if (errorString.includes(pattern)) {
      return false;
    }
  }

  // Códigos de error NO retryables
  const nonRetryableCodes = [
    'ACTION_REJECTED',
    'INSUFFICIENT_FUNDS',
    'INVALID_ARGUMENT',
  ];

  if (errorCode && nonRetryableCodes.includes(errorCode)) {
    return false;
  }

  // Errores retryables
  const retryablePatterns = [
    'network error',
    'timeout',
    'timed out',
    'unpredictable_gas_limit',
    'nonce',
    'replacement fee too low',
    'already known',
    'connection',
  ];

  for (const pattern of retryablePatterns) {
    if (errorString.includes(pattern)) {
      return true;
    }
  }

  // Por defecto, NO reintentar errores desconocidos (seguro)
  return false;
}

/**
 * Helper para dormir/pausar ejecución
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wrapper especializado para transacciones blockchain
 * 
 * @example
 * ```typescript
 * const tx = await retryTransaction(
 *   async () => contract.transfer(to, amount)
 * );
 * ```
 */
export async function retryTransaction<T>(
  operation: () => Promise<T>,
  options: Omit<RetryOptions, 'shouldRetry'> = {}
): Promise<T> {
  return withRetry(operation, {
    ...options,
    shouldRetry: isRetryableBlockchainError,
    onRetry: (attempt, error) => {
      log.warn(`Transaction retry ${attempt}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      options.onRetry?.(attempt, error);
    },
  });
}

/**
 * Batch retry - ejecuta múltiples operaciones con retry individual
 * 
 * A diferencia de Promise.all, si una falla después de retries,
 * las demás continúan ejecutándose.
 * 
 * @returns Array de resultados (exitosos) y array de errores
 */
export async function retryBatch<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<{
  results: T[];
  errors: Array<{ index: number; error: unknown }>;
}> {
  const results: T[] = [];
  const errors: Array<{ index: number; error: unknown }> = [];

  await Promise.all(
    operations.map(async (operation, index) => {
      try {
        const result = await withRetry(operation, options);
        results.push(result);
      } catch (error) {
        errors.push({ index, error });
      }
    })
  );

  return { results, errors };
}
