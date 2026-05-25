/**
 * Interface para PvPArena
 * "Asalto al Núcleo" - Sistema PvP con steal temporal de poder
 */

import type { TransactionResponse } from "ethers";
import type { Address } from "viem";
import type { IBlockchainContract } from "./IBlockchainContract";

export interface RaidInfo {
  attacker: Address;
  defender: Address;
  attackerMinerId: bigint;
  defenderMinerId: bigint;
  powerStolen: bigint;
  duration: bigint;
  startTime: bigint;
  active: boolean;
}

export interface DefenseStats {
  totalRaids: bigint;
  successfulDefenses: bigint;
  powerLost: bigint;
  lastRaidTime: bigint;
}

export interface AttackStats {
  totalAttacks: bigint;
  successfulAttacks: bigint;
  powerGained: bigint;
  lastAttackTime: bigint;
}

export interface IPvPArena extends IBlockchainContract {
  // ============================================
  // PvP Functions
  // ============================================

  /**
   * Inicia un raid contra otro jugador
   * @param attackerMinerId - ID del CoreMiner atacante
   * @param defenderAddress - Address del defensor
   * @param defenderMinerId - ID del CoreMiner defensor (opcional, usa el mejor si es 0)
   */
  initiateRaid(
    attackerMinerId: bigint,
    defenderAddress: Address,
    defenderMinerId: bigint,
  ): Promise<TransactionResponse>;

  /**
   * Defiende contra un raid activo
   * @param raidId - ID del raid
   * @param defenderMinerId - ID del CoreMiner para defender
   */
  defend(raidId: bigint, defenderMinerId: bigint): Promise<TransactionResponse>;

  /**
   * Finaliza un raid (cuando expira el tiempo)
   * @param raidId - ID del raid
   */
  concludeRaid(raidId: bigint): Promise<TransactionResponse>;

  /**
   * Retira poder robado (después de que expire el raid)
   * @param raidId - ID del raid
   */
  withdrawStolenPower(raidId: bigint): Promise<TransactionResponse>;

  // ============================================
  // View Functions
  // ============================================

  /**
   * Obtiene información de un raid
   * @param raidId - ID del raid
   */
  getRaidInfo(raidId: bigint): Promise<RaidInfo>;

  /**
   * Obtiene raids activos contra un usuario
   * @param defender - Address del defensor
   */
  getActiveRaidsAgainst(defender: Address): Promise<bigint[]>;

  /**
   * Obtiene raids activos de un usuario
   * @param attacker - Address del atacante
   */
  getActiveRaidsBy(attacker: Address): Promise<bigint[]>;

  /**
   * Verifica si un CoreMiner puede atacar (cooldown)
   * @param minerId - ID del CoreMiner
   */
  canAttack(minerId: bigint): Promise<boolean>;

  /**
   * Verifica si un usuario puede ser atacado (shield/cooldown)
   * @param defender - Address del defensor
   */
  canBeAttacked(defender: Address): Promise<boolean>;

  /**
   * Obtiene el cooldown restante de ataque
   * @param minerId - ID del CoreMiner
   */
  getAttackCooldown(minerId: bigint): Promise<bigint>;

  /**
   * Obtiene el shield restante de un usuario
   * @param defender - Address del defensor
   */
  getShieldRemaining(defender: Address): Promise<bigint>;

  /**
   * Calcula el resultado probable de un raid
   * @param attackerMinerId - ID del CoreMiner atacante
   * @param defenderMinerId - ID del CoreMiner defensor
   */
  simulateRaid(
    attackerMinerId: bigint,
    defenderMinerId: bigint,
  ): Promise<{
    attackerWinChance: bigint; // Base 10000
    potentialPowerSteal: bigint;
  }>;

  /**
   * Obtiene estadísticas de defensa de un usuario
   * @param defender - Address del defensor
   */
  getDefenseStats(defender: Address): Promise<DefenseStats>;

  /**
   * Obtiene estadísticas de ataque de un usuario
   * @param attacker - Address del atacante
   */
  getAttackStats(attacker: Address): Promise<AttackStats>;

  /**
   * Obtiene el leaderboard PvP
   * @param limit - Número de resultados
   */
  getLeaderboard(limit: bigint): Promise<{
    players: Address[];
    scores: bigint[];
  }>;

  /**
   * Obtiene poder temporal robado de un usuario
   * @param user - Address del usuario
   */
  getStolenPower(user: Address): Promise<bigint>;

  /**
   * Obtiene historial de raids de un usuario
   * @param user - Address del usuario
   * @param asAttacker - true para raids como atacante, false para raids como defensor
   */
  getRaidHistory(user: Address, asAttacker: boolean): Promise<bigint[]>;

  // ============================================
  // Admin Functions
  // ============================================

  /**
   * Configura parámetros de raid
   * @param raidDuration - Duración del raid en segundos
   * @param attackCooldown - Cooldown entre ataques
   * @param defenseShield - Duración del shield post-defensa
   * @param powerStealPercent - % de poder que se puede robar
   */
  setRaidConfig(
    raidDuration: bigint,
    attackCooldown: bigint,
    defenseShield: bigint,
    powerStealPercent: bigint,
  ): Promise<TransactionResponse>;

  /**
   * Actualiza el costo de entrada (en CORE)
   * @param newCost - Nuevo costo en CORE tokens
   */
  setRaidCost(newCost: bigint): Promise<TransactionResponse>;

  /**
   * Activa/desactiva el sistema PvP
   * @param active - Estado activo
   */
  setPvPActive(active: boolean): Promise<TransactionResponse>;

  /**
   * Pausa/despausa el contrato
   */
  pause(): Promise<TransactionResponse>;
  unpause(): Promise<TransactionResponse>;
}

export default IPvPArena;
