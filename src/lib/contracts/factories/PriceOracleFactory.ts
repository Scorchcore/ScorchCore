/**
 * PriceOracleFactory
 * 
 * Factory para crear instancias del contrato PriceOracle
 * 
 * @pattern Factory Pattern
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { PRICEORACLE_ABI } from '@/lib/abis/economy.abis';
import type { IPriceOracle } from '../interfaces/IEconomyContract';
import type { TransactionResult } from '../interfaces/IBlockchainContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('PriceOracleFactory');

/**
 * Implementación del contrato PriceOracle
 */
class PriceOracleContract implements IPriceOracle {
  constructor(
    public readonly address: Address,
    public readonly chainId: number,
    private contract: ethers.Contract
  ) {}

  /**
   * Obtiene el estado del contrato
   */
  async getStatus(): Promise<{ address: Address; isConnected: boolean; chainId: number; }> {
    try {
      const isDeployed = await this.isDeployed();
      return {
        address: this.address,
        isConnected: isDeployed,
        chainId: this.chainId,
      };
    } catch (error) {
      return {
        address: this.address,
        isConnected: false,
        chainId: this.chainId,
      };
    }
  }

  /**
   * Verifica si el contrato está desplegado
   */
  async isDeployed(): Promise<boolean> {
    try {
      if (!this.contract.runner?.provider) return false;
      const code = await this.contract.runner.provider.getCode(this.address);
      return code !== undefined && code !== '0x';
    } catch (error) {
      return false;
    }
  }

  /**
   * Suscribe a eventos del contrato
   */
  on(eventName: string, callback: (event: unknown) => void): () => void {
    this.contract.on(eventName, callback);
    return () => {
      this.contract.off(eventName, callback);
    };
  }

  /**
   * Obtiene el precio actual de CORE
   */
  async getCurrentPrice(): Promise<bigint> {
    try {
      const price = await this.contract.getCurrentPrice();
      return BigInt(price.toString());
    } catch (error) {
      logger.error('Error getting current price', { error });
      throw error;
    }
  }

  /**
   * Obtiene el timestamp de la última actualización
   */
  async getLastUpdateTime(): Promise<bigint> {
    try {
      const timestamp = await this.contract.getLastUpdateTime();
      return BigInt(timestamp.toString());
    } catch (error) {
      logger.error('Error getting last update time', { error });
      throw error;
    }
  }

  /**
   * Verifica si el precio es reciente (no stale)
   */
  async isPriceFresh(): Promise<boolean> {
    try {
      const isFresh = await this.contract.isPriceFresh();
      return isFresh as boolean;
    } catch (error) {
      logger.error('Error checking if price is fresh', { error });
      throw error;
    }
  }

  /**
   * Actualiza el precio (solo ORACLE_ROLE)
   */
  async updatePrice(price: bigint): Promise<TransactionResult> {
    try {
      logger.info('Updating price', { price: price.toString() });

      const tx = await this.contract.updatePrice(price);
      const receipt = await tx.wait();

      logger.info('Price updated', { 
        txHash: receipt.hash,
        price: price.toString()
      });

      return {
        hash: receipt.hash,
        success: true,
        receipt,
      };
    } catch (error) {
      logger.error('Error updating price', { error });
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Obtiene el rol de Oracle
   */
  async ORACLE_ROLE(): Promise<string> {
    try {
      const role = await this.contract.ORACLE_ROLE();
      return role as string;
    } catch (error) {
      logger.error('Error getting ORACLE_ROLE', { error });
      throw error;
    }
  }

  /**
   * Obtiene la edad máxima del precio
   */
  async maxPriceAge(): Promise<bigint> {
    try {
      const age = await this.contract.maxPriceAge();
      return BigInt(age.toString());
    } catch (error) {
      logger.error('Error getting maxPriceAge', { error });
      throw error;
    }
  }
}

/**
 * Factory para crear instancias de PriceOracle
 */
export class PriceOracleFactory {
  /**
   * Crea una instancia del contrato PriceOracle
   */
  create(
    address: Address,
    chainId: number,
    providerOrSigner: ethers.Provider | ethers.Signer
  ): IPriceOracle {
    logger.info('Creating PriceOracle instance', { 
      address, 
      chainId 
    });

    const contract = new ethers.Contract(
      address,
      PRICEORACLE_ABI,
      providerOrSigner
    );

    return new PriceOracleContract(address, chainId, contract);
  }
}
