import { useCallback, useMemo, useState } from "react";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import type {
  Difficulty,
  GameType,
  MinigameConfig,
} from "@/lib/contracts/interfaces/IMinigameManager";
import { MinigameService } from "@/lib/services/MinigameService";
import { useContractManager } from "../contracts/useContractManager";

export interface StartGameInput {
  gameType: GameType;
  difficulty: Difficulty;
  entryFee?: bigint;
}

export function useMinigame() {
  const { address } = useAccount();
  const { contractManager } = useContractManager();
  const service = useMemo(
    () => new MinigameService(contractManager),
    [contractManager],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getGameConfig = useCallback(
    (gameType: GameType) => service.getGameConfig(gameType),
    [service],
  );
  const getSession = useCallback(
    (sessionId: bigint) => service.getSession(sessionId),
    [service],
  );
  const getPlayerSessions = useCallback(
    (player?: Address) => {
      const target = player ?? address;
      return target ? service.getPlayerSessions(target) : Promise.resolve([]);
    },
    [address, service],
  );

  const run = useCallback(async <T>(operation: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      return await operation();
    } catch (caught) {
      const nextError =
        caught instanceof Error ? caught : new Error(String(caught));
      setError(nextError);
      throw nextError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    startGame: (input: StartGameInput) =>
      run(() =>
        service.startGame(
          input.gameType,
          input.difficulty,
          input.entryFee ?? 0n,
        ),
      ),
    claimReward: (sessionId: bigint) =>
      run(() => service.claimReward(sessionId)),
    getGameConfig,
    getSession,
    getPlayerSessions,
    calculateReward: (
      gameType: GameType,
      difficulty: Difficulty,
      score: bigint,
    ) => service.calculateReward(gameType, difficulty, score),
    setGameConfig: (gameId: bigint, config: MinigameConfig) =>
      run(() =>
        contractManager.getMinigameManager().setGameConfig(gameId, config),
      ),
    setGameActive: (gameId: bigint, active: boolean) =>
      run(() =>
        contractManager.getMinigameManager().setGameActive(gameId, active),
      ),
    isLoading,
    error,
  };
}
