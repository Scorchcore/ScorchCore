import type { Address } from "viem";
import type { ContractManager } from "@/lib/contracts/ContractManager";
import type {
  Difficulty,
  GameType,
  MinigameConfig,
  MinigameSession,
} from "@/lib/contracts/interfaces/IMinigameManager";

export interface MinigameSessionState extends MinigameSession {
  sessionId: bigint;
}

export class MinigameService {
  constructor(private contractManager: ContractManager) {}

  private get manager() {
    return this.contractManager.getMinigameManager();
  }

  startGame(gameType: GameType, difficulty: Difficulty, entryFee = 0n) {
    return this.manager.startGame(gameType, difficulty, entryFee);
  }

  claimReward(sessionId: bigint) {
    return this.manager.claimReward(sessionId);
  }

  getGameConfig(gameType: GameType): Promise<MinigameConfig> {
    return this.manager.getGameConfig(gameType);
  }

  async getSession(sessionId: bigint): Promise<MinigameSessionState> {
    return { sessionId, ...(await this.manager.getSession(sessionId)) };
  }

  getPlayerSessions(player: Address) {
    return this.manager.getPlayerSessions(player);
  }

  calculateReward(gameType: GameType, difficulty: Difficulty, score: bigint) {
    return this.manager.calculateReward(gameType, difficulty, score);
  }
}
