/**
 * Interface para MinigameManager
 * Sistema de minijuegos F2P con recompensas en fCORE
 */

import type { TransactionResponse } from "ethers";
import type { Address } from "viem";
import type { IBlockchainContract } from "./IBlockchainContract";

export interface MinigameResult {
  player: Address;
  gameId: bigint;
  score: bigint;
  reward: bigint;
  timestamp: bigint;
}

export interface MinigameConfig {
  active: boolean;
  rewardPool: bigint;
  maxRewardPerPlay: bigint;
  cooldown: bigint;
  minScore: bigint;
}

export interface IMinigameManager extends IBlockchainContract {
  // ============================================
  // Gameplay Functions
  // ============================================

  /**
   * Inicia una sesión de minijuego
   * @param gameId - ID del minijuego
   */
  startGame(gameId: bigint): Promise<TransactionResponse>;

  /**
   * Registra el resultado de un minijuego
   * @param gameId - ID del minijuego
   * @param score - Puntaje obtenido
   * @param proof - Proof de validación (anti-cheat)
   */
  submitScore(
    gameId: bigint,
    score: bigint,
    proof: string,
  ): Promise<TransactionResponse>;

  /**
   * Reclama recompensas acumuladas
   * @param gameId - ID del minijuego
   */
  claimRewards(gameId: bigint): Promise<TransactionResponse>;

  // ============================================
  // View Functions
  // ============================================

  /**
   * Verifica si un jugador puede jugar (cooldown)
   * @param player - Address del jugador
   * @param gameId - ID del minijuego
   */
  canPlay(player: Address, gameId: bigint): Promise<boolean>;

  /**
   * Obtiene el tiempo restante de cooldown
   * @param player - Address del jugador
   * @param gameId - ID del minijuego
   */
  getCooldownRemaining(player: Address, gameId: bigint): Promise<bigint>;

  /**
   * Obtiene recompensas pendientes de un jugador
   * @param player - Address del jugador
   * @param gameId - ID del minijuego
   */
  getPendingRewards(player: Address, gameId: bigint): Promise<bigint>;

  /**
   * Obtiene el mejor puntaje de un jugador
   * @param player - Address del jugador
   * @param gameId - ID del minijuego
   */
  getHighScore(player: Address, gameId: bigint): Promise<bigint>;

  /**
   * Obtiene el leaderboard de un minijuego
   * @param gameId - ID del minijuego
   * @param limit - Número de resultados (default: 10)
   */
  getLeaderboard(
    gameId: bigint,
    limit: bigint,
  ): Promise<{
    players: Address[];
    scores: bigint[];
  }>;

  /**
   * Obtiene configuración de un minijuego
   * @param gameId - ID del minijuego
   */
  getGameConfig(gameId: bigint): Promise<MinigameConfig>;

  /**
   * Obtiene todos los minijuegos activos
   */
  getActiveGames(): Promise<bigint[]>;

  /**
   * Obtiene historial de juegos de un jugador
   * @param player - Address del jugador
   * @param gameId - ID del minijuego
   */
  getPlayerHistory(player: Address, gameId: bigint): Promise<MinigameResult[]>;

  // ============================================
  // Admin Functions
  // ============================================

  /**
   * Crea un nuevo minijuego
   * @param rewardPool - Pool inicial de rewards
   * @param maxRewardPerPlay - Reward máximo por partida
   * @param cooldown - Tiempo de cooldown en segundos
   * @param minScore - Puntaje mínimo para rewards
   */
  createGame(
    rewardPool: bigint,
    maxRewardPerPlay: bigint,
    cooldown: bigint,
    minScore: bigint,
  ): Promise<TransactionResponse>;

  /**
   * Actualiza configuración de un minijuego
   * @param gameId - ID del minijuego
   * @param config - Nueva configuración
   */
  updateGameConfig(
    gameId: bigint,
    config: Partial<MinigameConfig>,
  ): Promise<TransactionResponse>;

  /**
   * Añade fondos al reward pool
   * @param gameId - ID del minijuego
   * @param amount - Cantidad de fCORE
   */
  fundRewardPool(gameId: bigint, amount: bigint): Promise<TransactionResponse>;

  /**
   * Activa/desactiva un minijuego
   * @param gameId - ID del minijuego
   * @param active - Estado activo
   */
  setGameActive(gameId: bigint, active: boolean): Promise<TransactionResponse>;

  /**
   * Pausa/despausa el contrato
   */
  pause(): Promise<TransactionResponse>;
  unpause(): Promise<TransactionResponse>;
}

export default IMinigameManager;
