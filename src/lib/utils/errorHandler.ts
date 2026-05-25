/**
 * Error Handler Utility - Manejo centralizado de errores
 * 
 * Elimina código repetitivo try-catch en servicios.
 * Proporciona wrapper genérico con logging automático.
 * 
 * **Elimina ~60+ bloques try-catch duplicados**
 * 
 * @pattern Template Method (GoF)
 * @principle DRY - Don't Repeat Yourself
 */

import { createServiceLogger } from './logger';

const log = createServiceLogger('ErrorHandler');

/**
 * Opciones para manejo de errores
 */
export interface ErrorHandlerOptions<T = unknown> {
  /** Mensaje descriptivo de la operación */
  operation: string;
  /** Contexto adicional para logging */
  context?: Record<string, unknown>;
  /** Valor por defecto si falla (para operaciones de lectura) */
  defaultValue?: T;
  /** Si debe re-lanzar el error después de loggear */
  rethrow?: boolean;
}

/**
 * Wrapper genérico para operaciones con manejo automático de errores
 * 
 * Proporciona:
 * - Logging automático de errores con contexto
 * - Opción de valor por defecto para operaciones de lectura
 * - Opción de re-lanzar error para operaciones críticas
 * 
 * @example
 * ```typescript
 * // Para operaciones que deben fallar si hay error
 * async startMining(minerId: bigint): Promise<Result> {
 *   return withErrorHandler(
 *     () => this.miningContract.startMining(minerId),
 *     {
 *       operation: 'Failed to start mining',
 *       context: { minerId: minerId.toString() },
 *       rethrow: true // Lanzar error si falla
 *     }
 *   );
 * }
 * 
 * // Para operaciones de lectura con fallback
 * async isMining(minerId: bigint): Promise<boolean> {
 *   return withErrorHandler(
 *     () => this.miningContract.isMining(minerId),
 *     {
 *       operation: 'Failed to check mining status',
 *       context: { minerId: minerId.toString() },
 *       defaultValue: false // Retornar false si falla
 *     }
 *   );
 * }
 * ```
 */
export async function withErrorHandler<T>(
  fn: () => Promise<T>,
  options: ErrorHandlerOptions<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Log del error con contexto
    log.error(options.operation, error, options.context);

    // Si hay valor por defecto, retornarlo
    if (options.defaultValue !== undefined) {
      return options.defaultValue;
    }

    // Si debe re-lanzar el error
    if (options.rethrow !== false) {
      throw error;
    }

    // Nunca debería llegar aquí
    throw error;
  }
}

/**
 * Alias para operaciones que DEBEN fallar si hay error
 * (transacciones, writes, operaciones críticas)
 */
export async function withCriticalError<T>(
  fn: () => Promise<T>,
  operation: string,
  context?: Record<string, unknown>
): Promise<T> {
  return withErrorHandler(fn, {
    operation,
    context,
    rethrow: true,
  });
}

/**
 * Alias para operaciones de lectura con fallback seguro
 * (verificaciones, queries, operaciones no críticas)
 */
export async function withSafeRead<T>(
  fn: () => Promise<T>,
  operation: string,
  defaultValue: T,
  context?: Record<string, unknown>
): Promise<T> {
  return withErrorHandler(fn, {
    operation,
    context,
    defaultValue,
    rethrow: false,
  });
}

/**
 * Decorator para métodos de clase
 * Aplica manejo de errores automáticamente
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @withErrorLogging('Failed to fetch data')
 *   async fetchData(): Promise<Data> {
 *     return await this.contract.getData();
 *   }
 * }
 * ```
 */
export function withErrorLogging(operation: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        log.error(`${operation} (${propertyKey})`, error);
        throw error;
      }
    };

    return descriptor;
  };
}
