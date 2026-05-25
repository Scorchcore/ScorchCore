/**
 * RecipeRegistryFactory
 * 
 * Factory para crear instancias del contrato RecipeRegistry
 * 
 * @pattern Factory Pattern
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { RECIPEREGISTRY_ABI } from '@/lib/abis/forge.abis';
import type { 
  IRecipeRegistry, 
  TransactionResult,
} from '../interfaces/IRecipeRegistry';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('RecipeRegistryFactory');

/**
 * Implementación del contrato RecipeRegistry
 */
class RecipeRegistryContract implements IRecipeRegistry {
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
   * Obtiene el rol de admin por defecto
   */
  async DEFAULT_ADMIN_ROLE(): Promise<string> {
    try {
      const role = await this.contract.DEFAULT_ADMIN_ROLE();
      return role as string;
    } catch (error) {
      logger.error('Error getting DEFAULT_ADMIN_ROLE', { error });
      throw error;
    }
  }

  /**
   * Verifica si una cuenta tiene rol de admin
   */
  async hasAdminRole(account: Address): Promise<boolean> {
    try {
      const adminRole = await this.DEFAULT_ADMIN_ROLE();
      return await this.hasRole(adminRole, account);
    } catch (error) {
      logger.error('Error checking admin role', { error, account });
      throw error;
    }
  }

  /**
   * Establece el supply máximo de una receta
   */
  async setRecipeMaxSupply(
    category: number,
    minerType: number,
    minerIndex: number,
    maxSupply: bigint
  ): Promise<TransactionResult> {
    try {
      logger.info('Setting recipe max supply', { 
        category, 
        minerType, 
        minerIndex, 
        maxSupply: maxSupply.toString() 
      });

      const tx = await this.contract.setRecipeMaxSupply(
        category,
        minerType,
        minerIndex,
        maxSupply
      );

      const receipt = await tx.wait();

      logger.info('Recipe max supply set', { 
        txHash: receipt.hash,
        category,
        minerType,
        minerIndex
      });

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (error) {
      logger.error('Error setting recipe max supply', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Establece el supply máximo de múltiples recetas en batch
   */
  async batchSetRecipeMaxSupply(
    categories: number[],
    minerTypes: number[],
    minerIndexes: number[],
    maxSupplies: bigint[]
  ): Promise<TransactionResult> {
    try {
      logger.info('Batch setting recipe max supplies', { 
        count: categories.length 
      });

      const tx = await this.contract.batchSetRecipeMaxSupply(
        categories,
        minerTypes,
        minerIndexes,
        maxSupplies
      );

      const receipt = await tx.wait();

      logger.info('Batch recipe max supplies set', { 
        txHash: receipt.hash,
        count: categories.length
      });

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (error) {
      logger.error('Error batch setting recipe max supplies', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Obtiene el supply máximo de una receta
   */
  async getRecipeMaxSupply(
    category: number,
    minerType: number,
    minerIndex: number
  ): Promise<bigint> {
    try {
      const maxSupply = await this.contract.getRecipeMaxSupply(
        category,
        minerType,
        minerIndex
      );
      return BigInt(maxSupply.toString());
    } catch (error) {
      logger.error('Error getting recipe max supply', { 
        error, 
        category, 
        minerType, 
        minerIndex 
      });
      throw error;
    }
  }

  /**
   * Verifica si una receta está activa
   */
  async isRecipeActive(
    category: number,
    minerType: number,
    minerIndex: number
  ): Promise<boolean> {
    try {
      const isActive = await this.contract.isRecipeActive(
        category,
        minerType,
        minerIndex
      );
      return isActive as boolean;
    } catch (error) {
      logger.error('Error checking if recipe is active', { 
        error, 
        category, 
        minerType, 
        minerIndex 
      });
      throw error;
    }
  }

  /**
   * Establece el estado activo/inactivo de una receta
   */
  async setRecipeStatus(
    category: number,
    minerType: number,
    minerIndex: number,
    isActive: boolean
  ): Promise<TransactionResult> {
    try {
      logger.info('Setting recipe status', { 
        category, 
        minerType, 
        minerIndex, 
        isActive 
      });

      const tx = await this.contract.setRecipeStatus(
        category,
        minerType,
        minerIndex,
        isActive
      );

      const receipt = await tx.wait();

      logger.info('Recipe status set', { 
        txHash: receipt.hash,
        category,
        minerType,
        minerIndex,
        isActive
      });

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (error) {
      logger.error('Error setting recipe status', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Obtiene el admin role de un rol
   */
  async getRoleAdmin(role: string): Promise<string> {
    try {
      const adminRole = await this.contract.getRoleAdmin(role);
      return adminRole as string;
    } catch (error) {
      logger.error('Error getting role admin', { error, role });
      throw error;
    }
  }

  /**
   * Otorga un rol a una cuenta
   */
  async grantRole(role: string, account: Address): Promise<TransactionResult> {
    try {
      logger.info('Granting role', { role, account });

      const tx = await this.contract.grantRole(role, account);
      const receipt = await tx.wait();

      logger.info('Role granted', { 
        txHash: receipt.hash,
        role,
        account
      });

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (error) {
      logger.error('Error granting role', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Revoca un rol de una cuenta
   */
  async revokeRole(role: string, account: Address): Promise<TransactionResult> {
    try {
      logger.info('Revoking role', { role, account });

      const tx = await this.contract.revokeRole(role, account);
      const receipt = await tx.wait();

      logger.info('Role revoked', { 
        txHash: receipt.hash,
        role,
        account
      });

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (error) {
      logger.error('Error revoking role', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verifica si una cuenta tiene un rol
   */
  async hasRole(role: string, account: Address): Promise<boolean> {
    try {
      const hasRole = await this.contract.hasRole(role, account);
      return hasRole as boolean;
    } catch (error) {
      logger.error('Error checking role', { error, role, account });
      throw error;
    }
  }
}

/**
 * Factory para crear instancias de RecipeRegistry
 */
export class RecipeRegistryFactory {
  /**
   * Crea una instancia del contrato RecipeRegistry
   */
  create(
    address: Address,
    chainId: number,
    providerOrSigner: ethers.Provider | ethers.Signer
  ): IRecipeRegistry {
    logger.info('Creating RecipeRegistry instance', { 
      address, 
      chainId 
    });

    const contract = new ethers.Contract(
      address,
      RECIPEREGISTRY_ABI,
      providerOrSigner
    );

    return new RecipeRegistryContract(address, chainId, contract);
  }
}
