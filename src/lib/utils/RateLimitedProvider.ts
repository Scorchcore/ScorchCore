/**
 * Rate Limited JSON-RPC Provider
 * 
 * Wrapper de ethers JsonRpcProvider que aplica rate limiting
 * automático a todas las requests RPC
 * 
 * @pattern Decorator Pattern
 */

import { ethers } from 'ethers';
import { getRpcRateLimiter } from './rpcRateLimiter';
import { createServiceLogger } from './logger';

const log = createServiceLogger('RateLimitedProvider');

/**
 * Provider que aplica rate limiting a todas las requests
 */
export class RateLimitedProvider extends ethers.JsonRpcProvider {
  private rateLimiter = getRpcRateLimiter();

  constructor(url?: string | ethers.FetchRequest, network?: ethers.Networkish) {
    // Usar staticNetwork para evitar auto-detección de red que causa errores
    const options = network ? { staticNetwork: network as any } : undefined;
    super(url, undefined, options);
    log.info('Rate Limited Provider initialized', { 
      url: typeof url === 'string' ? url : 'custom',
      network: network ? (typeof network === 'number' ? network : (network as any).chainId) : 'default'
    });
  }

  /**
   * Override del método send para aplicar rate limiting
   */
  override async send(method: string, params: Array<any>): Promise<any> {
    return this.rateLimiter.execute(
      () => super.send(method, params),
      `${method}`
    );
  }

  /**
   * Override del método _send para aplicar rate limiting a nivel más bajo
   */
  override async _send(payload: ethers.JsonRpcPayload | Array<ethers.JsonRpcPayload>): Promise<Array<ethers.JsonRpcResult>> {
    return this.rateLimiter.execute(
      () => super._send(payload),
      'batch-request'
    );
  }

  /**
   * Obtiene estadísticas del rate limiter
   */
  getRateLimiterStats() {
    return this.rateLimiter.getStats();
  }
}

/**
 * Factory function para crear un provider con rate limiting
 */
export function createRateLimitedProvider(
  url?: string | ethers.FetchRequest,
  network?: ethers.Networkish
): RateLimitedProvider {
  return new RateLimitedProvider(url, network);
}
