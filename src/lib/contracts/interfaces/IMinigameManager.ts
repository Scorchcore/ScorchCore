import type { Address } from "viem";
import type {
  IBlockchainContract,
  TransactionResult,
} from "./IBlockchainContract";

export type GameType = 0 | 1 | 2;
export type Difficulty = 0 | 1 | 2 | 3;

export interface MinigameSession {
  player: Address;
  gameType: GameType;
  difficulty: Difficulty;
  startTime: bigint;
  endTime: bigint;
  score: bigint;
  reward: bigint;
  completed: boolean;
  rewardClaimed: boolean;
}

export interface MinigameConfig {
  gameType: GameType;
  duration: bigint;
  baseReward: bigint;
  entryFee: bigint;
  maxDailyRewards: bigint;
  maxSessionsPerUser: bigint;
  active: boolean;
}

export interface MinigameResult {
  player: Address;
  gameId: bigint;
  score: bigint;
  reward: bigint;
  timestamp: bigint;
}

export interface IMinigameManager extends IBlockchainContract {
  startGame(
    gameType: GameType,
    difficulty: Difficulty,
    value?: bigint,
  ): Promise<TransactionResult & { sessionId: bigint }>;
  completeGame(sessionId: bigint, score: bigint): Promise<TransactionResult>;
  claimReward(
    sessionId: bigint,
  ): Promise<TransactionResult & { reward: bigint }>;
  getSession(sessionId: bigint): Promise<MinigameSession>;
  getGameConfig(gameType: GameType): Promise<MinigameConfig>;
  calculateReward(
    gameType: GameType,
    difficulty: Difficulty,
    score: bigint,
  ): Promise<bigint>;
  getLeaderboard(
    gameType: GameType,
    limit: bigint,
  ): Promise<{ players: Address[]; scores: bigint[] }>;
  getPlayerSessions(player: Address): Promise<bigint[]>;
  importState(
    configs: MinigameConfig[],
    nextSessionId: bigint,
  ): Promise<TransactionResult>;
  setGameConfig(
    gameId: bigint,
    config: MinigameConfig,
  ): Promise<TransactionResult>;
  setGameActive(gameId: bigint, active: boolean): Promise<TransactionResult>;
  withdrawEntryFees(to: Address, amount?: bigint): Promise<TransactionResult>;
  pause(): Promise<TransactionResult>;
  unpause(): Promise<TransactionResult>;
}

export default IMinigameManager;
