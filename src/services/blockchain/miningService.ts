/**
 * Servicio para interactuar con el contrato MiningScheduler
 * Gestiona el inicio, claim y fin de sesiones de mining con CoreMiners
 */

import { ethers } from 'ethers';
import { MINING_SCHEDULER_ABI, FCORE_TOKEN_ABI } from '@/lib/abis';

export interface MiningSession {
  owner: string;
  startTime: bigint;
  lastClaim: bigint;
  power: bigint;
  efficiency: bigint;
  isActive: boolean;
  pendingRewards: bigint;
}

export class MiningService {
  private miningSchedulerContract: ethers.Contract;
  private fCoreContract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(
    miningSchedulerAddress: string,
    fCoreAddress: string,
    signer: ethers.Signer
  ) {
    this.signer = signer;
    this.miningSchedulerContract = new ethers.Contract(
      miningSchedulerAddress,
      MINING_SCHEDULER_ABI,
      signer
    );
    this.fCoreContract = new ethers.Contract(
      fCoreAddress,
      FCORE_TOKEN_ABI,
      signer
    );
  }

  /**
   * Inicia una sesión de mining con un CoreMiner
   */
  async startMining(
    minerId: bigint,
    power: bigint,
    efficiency: bigint
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      console.log('⛏️ [MINING] Iniciando mining:', {
        minerId: minerId.toString(),
        power: power.toString(),
        efficiency: efficiency.toString()
      });

      const tx = await this.miningSchedulerContract.startMining(
        minerId,
        power,
        efficiency
      );
      
      console.log('⛏️ [MINING] TX enviada:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ [MINING] Mining iniciado exitosamente');
      
      return tx;
    } catch (error) {
      console.error('❌ [MINING] Error iniciando mining:', error);
      throw new Error('Failed to start mining: ' + (error as Error).message);
    }
  }

  /**
   * Reclama las recompensas acumuladas de un CoreMiner
   */
  async claimRewards(minerId: bigint): Promise<{
    tx: ethers.ContractTransactionResponse;
    amount: bigint;
  }> {
    try {
      console.log('💰 [MINING] Reclamando recompensas para miner:', minerId.toString());

      // Obtener recompensas pendientes antes de reclamar
      const pending = await this.calculatePendingRewards(minerId);
      console.log('💰 [MINING] Recompensas pendientes:', ethers.formatEther(pending), 'fCORE');

      if (pending === 0n) {
        throw new Error('No hay recompensas para reclamar');
      }

      const tx = await this.miningSchedulerContract.claimRewards(minerId);
      console.log('💰 [MINING] TX enviada:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ [MINING] Recompensas reclamadas exitosamente');

      return {
        tx,
        amount: pending
      };
    } catch (error) {
      console.error('❌ [MINING] Error reclamando recompensas:', error);
      throw new Error('Failed to claim rewards: ' + (error as Error).message);
    }
  }

  /**
   * Detiene la sesión de mining de un CoreMiner
   */
  async stopMining(minerId: bigint): Promise<ethers.ContractTransactionResponse> {
    try {
      console.log('🛑 [MINING] Deteniendo mining para miner:', minerId.toString());

      const tx = await this.miningSchedulerContract.stopMining(minerId);
      console.log('🛑 [MINING] TX enviada:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ [MINING] Mining detenido exitosamente');

      return tx;
    } catch (error) {
      console.error('❌ [MINING] Error deteniendo mining:', error);
      throw new Error('Failed to stop mining: ' + (error as Error).message);
    }
  }

  /**
   * Calcula las recompensas pendientes de un CoreMiner
   */
  async calculatePendingRewards(minerId: bigint): Promise<bigint> {
    try {
      const pending = await this.miningSchedulerContract.calculatePendingRewards(minerId);
      return pending;
    } catch (error) {
      console.error('❌ [MINING] Error calculando recompensas:', error);
      return 0n;
    }
  }

  /**
   * Obtiene la información completa de una sesión de mining
   */
  async getMiningSession(minerId: bigint): Promise<MiningSession> {
    try {
      const session = await this.miningSchedulerContract.getMiningSession(minerId);
      
      return {
        owner: session[0],
        startTime: session[1],
        lastClaim: session[2],
        power: session[3],
        efficiency: session[4],
        isActive: session[5],
        pendingRewards: session[6]
      };
    } catch (error) {
      console.error('❌ [MINING] Error obteniendo sesión:', error);
      throw new Error('Failed to get mining session: ' + (error as Error).message);
    }
  }

  /**
   * Obtiene el balance de fCORE de una dirección
   */
  async getFCoreBalance(address: string): Promise<bigint> {
    try {
      const balance = await this.fCoreContract.balanceOf(address);
      return balance;
    } catch (error) {
      console.error('❌ [MINING] Error obteniendo balance fCORE:', error);
      return 0n;
    }
  }

  /**
   * Obtiene la tasa de recompensa base por hora
   */
  async getBaseRewardPerHour(): Promise<bigint> {
    try {
      const rate = await this.miningSchedulerContract.baseRewardPerHour();
      return rate;
    } catch (error) {
      console.error('❌ [MINING] Error obteniendo tasa base:', error);
      return 0n;
    }
  }

  /**
   * Calcula las recompensas estimadas por hora para un miner
   */
  calculateRewardsPerHour(power: bigint, efficiency: bigint, baseRate: bigint): bigint {
    // Fórmula: baseReward * (power/10) * (efficiency/100)
    const rewardPerHour = (baseRate * power * efficiency) / 1000n;
    return rewardPerHour;
  }

  /**
   * Formatea una cantidad de fCORE a string legible
   */
  formatFCore(amount: bigint): string {
    return ethers.formatEther(amount);
  }

  /**
   * Parsea una cantidad de fCORE desde string
   */
  parseFCore(amount: string): bigint {
    return ethers.parseEther(amount);
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createMiningService(
  miningSchedulerAddress: string,
  fCoreAddress: string,
  signer: ethers.Signer
): MiningService {
  return new MiningService(miningSchedulerAddress, fCoreAddress, signer);
}
