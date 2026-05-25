/**
 * Rate Limited Contract Wrapper
 * 
 * Usa Proxy Pattern para interceptar TODAS las llamadas a métodos
 * de contratos y aplicar rate limiting automáticamente
 * 
 * @pattern Proxy Pattern (GoF)
 */

import { getRpcRateLimiter } from './rpcRateLimiter';
import { createServiceLogger } from './logger';

const log = createServiceLogger('RateLimitedContract');

/**
 * Envuelve cualquier contrato con rate limiting usando Proxy
 */
export function createRateLimitedContract<T extends object>(
  contract: T,
  contractName: string
): T {
  const rateLimiter = getRpcRateLimiter();

  return new Proxy(contract, {
    get(target: any, prop: string | symbol, receiver: any) {
      const originalValue = Reflect.get(target, prop, receiver);

      // Si es una función, envolver con rate limiting
      if (typeof originalValue === 'function') {
        return async function (this: any, ...args: any[]) {
          console.log(`🔷 [RateLimitedProxy] Interceptando ${contractName}.${String(prop)}`);
          
          // Identificar si es una llamada RPC (read) o transacción (write)
          // Métodos que claramente son transacciones (WRITE)
          const writeMethodPatterns = [
            'estimateGas', 'populateTransaction', 'send',
            'open', 'mint', 'burn', 'transfer', 'approve', 
            'forge', 'claim', 'stake', 'unstake', 'withdraw'
          ];
          
          const propStr = String(prop).toLowerCase();
          const isWriteMethod = writeMethodPatterns.some(pattern => propStr.includes(pattern));
          
          console.log(`🔷 [RateLimitedProxy] ${String(prop)} es ${isWriteMethod ? 'WRITE' : 'READ'}`);
          
          if (!isWriteMethod) {
            console.log(`🔷 [RateLimitedProxy] Aplicando rate limiting a ${String(prop)}`);
            // Aplicar rate limiting solo a lecturas (eth_call)
            return rateLimiter.execute(
              () => originalValue.apply(this === receiver ? target : this, args),
              `${contractName}.${String(prop)}`
            );
          }

          console.log(`🔷 [RateLimitedProxy] Ejecutando ${String(prop)} SIN rate limiting (WRITE)`);
          // Transacciones no necesitan rate limiting (son secuenciales por naturaleza)
          return originalValue.apply(this === receiver ? target : this, args);
        };
      }

      return originalValue;
    },
  });
}
