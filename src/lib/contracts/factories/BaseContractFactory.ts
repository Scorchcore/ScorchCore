/**
 * Abstract Factory Pattern (GoF Creacional)
 * Base abstracta para todas las factories de contratos
 *
 * Proporciona una interfaz para crear familias de objetos relacionados
 * sin especificar sus clases concretas
 */

import type { Address } from "viem";
import type { Contract } from "ethers";
import { ethers, type Provider, type Signer } from "ethers";
import type { IBlockchainContract } from "../interfaces/IBlockchainContract";

/**
 * Configuración base para crear un contrato
 */
export interface ContractConfig {
  address: Address;
  abi: readonly unknown[];
  chainId: number;
  signerOrProvider?: Signer | Provider;
}

/**
 * Abstract Factory base
 * Define la interfaz para crear contratos
 *
 * Patrón: Abstract Factory (GoF)
 */
export abstract class BaseContractFactory<
  T extends IBlockchainContract = IBlockchainContract,
> {
  /**
   * Factory Method abstracto
   * Cada factory concreta debe implementar este método
   *
   * Patrón: Factory Method (GoF)
   */
  abstract createContract(config: ContractConfig): T;

  /**
   * Hook method - Puede ser sobrescrito por subclases
   * Permite validación adicional antes de crear el contrato
   *
   * Patrón: Template Method (GoF)
   */
  protected validateConfig(config: ContractConfig): void {
    if (
      !config.address ||
      config.address === "0x0000000000000000000000000000000000000000"
    ) {
      throw new Error("Invalid contract address");
    }

    if (!config.abi || config.abi.length === 0) {
      throw new Error("Invalid contract ABI");
    }

    if (!config.chainId) {
      throw new Error("Chain ID is required");
    }
  }

  /**
   * Crea una instancia de contrato Ethers.js
   * Método helper común para todas las factories
   */
  protected createEthersContract(config: ContractConfig): Contract {
    this.validateConfig(config);

    if (config.signerOrProvider) {
      return new ethers.Contract(
        config.address,
        config.abi as ethers.InterfaceAbi,
        config.signerOrProvider,
      );
    }

    // Si no hay provider, crear un contrato de solo lectura
    // En producción, esto debería obtener el provider del contexto
    throw new Error("Signer or Provider required to create contract instance");
  }

  /**
   * Método helper para batch creation
   * Permite crear múltiples contratos de una vez
   */
  createBatch(configs: ContractConfig[]): T[] {
    return configs.map((config) => this.createContract(config));
  }
}

/**
 * Registry de factories (Singleton Pattern)
 * Mantiene un registro de todas las factories disponibles
 */
export class ContractFactoryRegistry {
  private static instance: ContractFactoryRegistry;
  private factories: Map<string, BaseContractFactory<IBlockchainContract>> =
    new Map();

  private constructor() {}

  /**
   * Obtiene la instancia única del registry (Singleton)
   */
  static getInstance(): ContractFactoryRegistry {
    if (!ContractFactoryRegistry.instance) {
      ContractFactoryRegistry.instance = new ContractFactoryRegistry();
    }
    return ContractFactoryRegistry.instance;
  }

  /**
   * Registra una factory
   */
  register<T extends IBlockchainContract>(
    name: string,
    factory: BaseContractFactory<T>,
  ): void {
    this.factories.set(name, factory);
  }

  /**
   * Obtiene una factory por nombre
   */
  get<T extends IBlockchainContract>(
    name: string,
  ): BaseContractFactory<T> | undefined {
    return this.factories.get(name) as BaseContractFactory<T> | undefined;
  }

  /**
   * Verifica si una factory está registrada
   */
  has(name: string): boolean {
    return this.factories.has(name);
  }

  /**
   * Limpia el registry (útil para testing)
   */
  clear(): void {
    this.factories.clear();
  }
}
