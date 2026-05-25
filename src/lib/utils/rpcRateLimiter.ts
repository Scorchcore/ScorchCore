/**
 * RPC Rate Limiter
 * 
 * Controla la concurrencia de requests RPC a Ronin Chain
 * para evitar errores "Too many requests"
 * 
 * @pattern Singleton
 */

import pLimit from 'p-limit';
import { createServiceLogger } from './logger';

const log = createServiceLogger('RpcRateLimiter');

/**
 * Configuración del rate limiter
 */
interface RateLimiterConfig {
  /** Número máximo de requests concurrentes */
  concurrency: number;
  /** Delay mínimo entre requests (ms) */
  minDelay: number;
  /** Tiempo de espera máximo para una request (ms) */
  timeout: number;
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  concurrency: 1, // Solo 1 request a la vez para evitar rate limiting
  minDelay: 200, // 200ms entre requests para ser más conservador
  timeout: 120000, // 120s timeout - necesario para transacciones que requieren firma del usuario
};

/**
 * Rate Limiter para requests RPC
 */
class RpcRateLimiter {
  private limiter: ReturnType<typeof pLimit>;
  private config: RateLimiterConfig;
  private lastRequestTime: number = 0;
  private requestCount: number = 0;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.limiter = pLimit(this.config.concurrency);
    
    log.info('RPC Rate Limiter initialized', {
      concurrency: this.config.concurrency,
      minDelay: this.config.minDelay,
    });
  }

  /**
   * Ejecuta una función async respetando el rate limit
   */
  async execute<T>(fn: () => Promise<T>, context?: string): Promise<T> {
    return this.limiter(async () => {
      // Aplicar delay mínimo entre requests
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.config.minDelay) {
        const delayNeeded = this.config.minDelay - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, delayNeeded));
      }

      this.lastRequestTime = Date.now();
      this.requestCount++;

      try {
        const result = await Promise.race([
          fn(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('RPC request timeout')), this.config.timeout)
          ),
        ]);

        if (this.requestCount % 10 === 0) {
          log.debug('Rate limiter stats', {
            totalRequests: this.requestCount,
            context,
          });
        }

        return result;
      } catch (error) {
        // Detectar errores de contratos que no existen (esperado en testnet)
        const isContractNotFound = 
          error instanceof Error && 
          (error.message.includes('missing revert data') || 
           error.message.includes('CALL_EXCEPTION'));
        
        if (isContractNotFound) {
          log.warn('Contract call failed (likely contract does not exist on this network)', { 
            context,
            error: error instanceof Error ? error.message : String(error)
          });
        } else {
          log.error('Rate limited request failed', error, { context });
        }
        
        throw error;
      }
    });
  }

  /**
   * Obtiene estadísticas del rate limiter
   */
  getStats() {
    return {
      totalRequests: this.requestCount,
      activeCount: this.limiter.activeCount,
      pendingCount: this.limiter.pendingCount,
      config: this.config,
    };
  }

  /**
   * Resetea las estadísticas
   */
  reset() {
    this.requestCount = 0;
    this.lastRequestTime = 0;
    log.info('Rate limiter stats reset');
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(config: Partial<RateLimiterConfig>) {
    this.config = { ...this.config, ...config };
    this.limiter = pLimit(this.config.concurrency);
    log.info('Rate limiter config updated', {
      concurrency: this.config.concurrency,
      minDelay: this.config.minDelay,
      timeout: this.config.timeout,
    });
  }
}

/**
 * Instancia singleton del rate limiter
 */
let instance: RpcRateLimiter | null = null;

/**
 * Obtiene la instancia singleton del rate limiter
 */
export function getRpcRateLimiter(): RpcRateLimiter {
  if (!instance) {
    instance = new RpcRateLimiter();
  }
  return instance;
}

/**
 * Inicializa el rate limiter con configuración custom
 */
export function initRpcRateLimiter(config: Partial<RateLimiterConfig>): RpcRateLimiter {
  instance = new RpcRateLimiter(config);
  return instance;
}

/**
 * Helper para ejecutar una función con rate limiting
 */
export async function withRateLimit<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  return getRpcRateLimiter().execute(fn, context);
}
