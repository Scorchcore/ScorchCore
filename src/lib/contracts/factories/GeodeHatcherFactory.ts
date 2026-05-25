/**
 * GeodeHatcherFactory - Factory para el contrato GeodeHatcher
 * 
 * @pattern Factory (GoF)
 * @principle Single Responsibility - Solo crea instancias de GeodeHatcher
 */

import { Contract, Provider, Signer } from 'ethers';
import { GEODE_HATCHER_ABI } from '@/lib/abis/GeodeHatcher';
import { createRateLimitedContract } from '@/lib/utils/network/RateLimitedContract';
import type { IGeodeHatcher, HatchResult } from '../interfaces/IGeodeHatcher';

/**
 * Implementación del contrato GeodeHatcher
 */
class GeodeHatcherContract implements IGeodeHatcher {
  constructor(private contract: Contract) {}

  async openGeode(geodeId: bigint): Promise<HatchResult> {
    console.log('🟢 [GeodeHatcherContract] MÉTODO REAL openGeode llamado - ANTES del proxy');
    console.log('🐣 [GeodeHatcher] Iniciando openGeode para geoda:', geodeId.toString());
    
    // ✅ Enviar transacción
    console.log('📝 [GeodeHatcher] Enviando transacción openGeode...');
    const tx = await this.contract.openGeode(geodeId);
    
    console.log('✅ [GeodeHatcher] Transacción enviada:', {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      nonce: tx.nonce
    });
    
    // ✅ Esperar confirmación con timeout
    console.log('⏳ [GeodeHatcher] Esperando confirmación de transacción...');
    const receipt = await Promise.race([
      tx.wait(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout after 60s')), 60000)
      )
    ]) as any;
    
    console.log('✅ [GeodeHatcher] Transacción confirmada:', {
      blockNumber: receipt.blockNumber,
      status: receipt.status,
      gasUsed: receipt.gasUsed?.toString()
    });
    
    // Buscar evento GeodeOpened
    const event = receipt.logs
      .map((log: any) => {
        try {
          return this.contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e?.name === 'GeodeOpened');

    return {
      success: receipt.status === 1,
      minerId: event?.args?.minerId || BigInt(0),
      // ✅ Convertir explícitamente a Number para evitar que vengan como strings
      category: Number(event?.args?.category || 0),
      minerType: Number(event?.args?.minerType || 0),
      minerIndex: Number(event?.args?.minerIndex || 0),
      isCritical: event?.args?.isCritical || false,
      finalPower: Number(event?.args?.finalPower || 0),
      transaction: {
        hash: tx.hash,
        success: receipt.status === 1,
        receipt,
      }
    };
  }

  async simulateHatching(geodeId: bigint): Promise<{
    minerIndex: number;
    isCritical: boolean;
    finalPower: number;
  }> {
    const result = await this.contract.simulateHatching(geodeId);
    return {
      minerIndex: Number(result[0]),
      isCritical: result[1],
      finalPower: Number(result[2]),
    };
  }

  async canOpenGeode(userAddress: string, geodeId: bigint): Promise<boolean> {
    return await this.contract.canOpenGeode(userAddress, geodeId);
  }

  async isPaused(): Promise<boolean> {
    return await this.contract.paused();
  }

  async getBasePower(category: number): Promise<number> {
    return Number(await this.contract.categoryBasePower(category));
  }
}

/**
 * Factory para crear instancias del contrato GeodeHatcher
 */
export class GeodeHatcherFactory {
  static create(
    address: string,
    providerOrSigner: Provider | Signer
  ): IGeodeHatcher {
    console.log('🏭 [GeodeHatcherFactory] Creando instancia...');
    const contract = new Contract(address, GEODE_HATCHER_ABI, providerOrSigner);
    const instance = new GeodeHatcherContract(contract);
    
    console.log('🏭 [GeodeHatcherFactory] Instancia creada, aplicando rate limiting...');
    // Aplicar rate limiting
    const rateLimitedInstance = createRateLimitedContract(
      instance as any,
      'GeodeHatcher'
    ) as IGeodeHatcher;
    
    console.log('🏭 [GeodeHatcherFactory] Rate limiting aplicado, retornando instancia');
    return rateLimitedInstance;
  }
}
