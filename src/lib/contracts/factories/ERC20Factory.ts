/**
 * ERC20Factory - Factory para crear instancias de tokens ERC20
 *
 * @pattern Factory Method (GoF)
 * @principle Open/Closed - Extensible sin modificar código existente
 */

import { ethers } from "ethers";
import type { Address } from "viem";
import type { IERC20Contract } from "../interfaces/IERC20Contract";
import type { TransactionResult } from "../interfaces/IBlockchainContract";
import type { ContractConfig } from "./BaseContractFactory";
import type { EventUnsubscribe } from "../types/TransactionTypes";
import type { ERC20Events } from "../interfaces/IERC20Contract";

const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

/**
 * Implementación concreta de IERC20Contract
 */
class ERC20Contract implements IERC20Contract {
  constructor(
    public readonly address: Address,
    public readonly chainId: number,
    private contract: ethers.Contract,
  ) {}

  async getStatus() {
    try {
      const isDeployed = await this.isDeployed();
      const symbol = isDeployed ? await this.symbol() : "UNKNOWN";
      return {
        address: this.address,
        chainId: this.chainId,
        isDeployed,
        isConnected: true,
        symbol,
      };
    } catch (error) {
      throw new Error(`Error getting ERC20 status: ${error}`);
    }
  }

  async isDeployed(): Promise<boolean> {
    try {
      const provider = this.contract.runner?.provider;
      if (!provider) return false;
      const code = await provider.getCode(this.address);
      return code !== "0x";
    } catch {
      return false;
    }
  }

  on(
    eventName: string,
    callback: (event: ERC20Events) => void,
  ): EventUnsubscribe {
    this.contract.on(eventName, callback);
    return () => this.contract.off(eventName, callback);
  }

  async balanceOf(account: Address): Promise<bigint> {
    return await this.contract.balanceOf(account);
  }

  async allowance(owner: Address, spender: Address): Promise<bigint> {
    return await this.contract.allowance(owner, spender);
  }

  async approve(spender: Address, amount: bigint): Promise<TransactionResult> {
    const transaction = await this.contract.approve(spender, amount);
    const transactionReceipt = await transaction.wait();
    return {
      hash: transactionReceipt.hash,
      success: transactionReceipt.status === 1,
      receipt: transactionReceipt,
    };
  }

  async transfer(to: Address, amount: bigint): Promise<TransactionResult> {
    const transaction = await this.contract.transfer(to, amount);
    const transactionReceipt = await transaction.wait();
    return {
      hash: transactionReceipt.hash,
      success: transactionReceipt.status === 1,
      receipt: transactionReceipt,
    };
  }

  async transferFrom(
    from: Address,
    to: Address,
    amount: bigint,
  ): Promise<TransactionResult> {
    const transaction = await this.contract.transferFrom(from, to, amount);
    const transactionReceipt = await transaction.wait();
    return {
      hash: transactionReceipt.hash,
      success: transactionReceipt.status === 1,
      receipt: transactionReceipt,
    };
  }

  async name(): Promise<string> {
    try {
      return await this.contract.name();
    } catch {
      return "Unknown Token";
    }
  }

  async symbol(): Promise<string> {
    try {
      return await this.contract.symbol();
    } catch {
      return "UNKNOWN";
    }
  }

  async decimals(): Promise<number> {
    try {
      return await this.contract.decimals();
    } catch {
      return 18; // Default ERC20
    }
  }

  async totalSupply(): Promise<bigint> {
    return await this.contract.totalSupply();
  }
}

/**
 * Factory para crear contratos ERC20
 */
export class ERC20Factory {
  /**
   * Crea una instancia de token ERC20
   */
  createERC20(
    config: Omit<ContractConfig, "abi"> & { abi?: readonly any[] },
  ): IERC20Contract {
    const { address, signerOrProvider } = config;

    const contract = new ethers.Contract(address, ERC20_ABI, signerOrProvider);

    return new ERC20Contract(address as Address, config.chainId, contract);
  }
}

export default ERC20Factory;
