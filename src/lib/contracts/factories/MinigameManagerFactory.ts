import type { Provider, Signer } from "ethers";
import { Contract } from "ethers";
import type { Address } from "viem";
import { MINIGAMEMANAGER_ABI } from "@/lib/abis/gaming.abis";
import type { TransactionResult } from "../interfaces/IBlockchainContract";
import type {
  Difficulty,
  GameType,
  IMinigameManager,
  MinigameConfig,
  MinigameSession,
} from "../interfaces/IMinigameManager";

export class MinigameManagerFactory {
  static create(
    address: Address,
    signerOrProvider: Signer | Provider,
  ): IMinigameManager {
    const contract = new Contract(
      address,
      MINIGAMEMANAGER_ABI,
      signerOrProvider,
    );
    let chainId = 0;
    const provider = contract.runner?.provider;
    provider?.getNetwork().then((network) => {
      chainId = Number(network.chainId);
    });

    const send = async (
      txPromise: Promise<any>,
    ): Promise<TransactionResult> => {
      const tx = await txPromise;
      const receipt = await tx.wait();
      return { hash: tx.hash, success: receipt.status === 1, receipt };
    };

    return {
      address,
      get chainId() {
        return chainId;
      },
      async getStatus() {
        return {
          address,
          isConnected: await this.isDeployed(),
          chainId,
        };
      },
      async isDeployed() {
        return provider ? (await provider.getCode(address)) !== "0x" : false;
      },
      on(eventName, callback) {
        contract.on(eventName, callback);
        return () => contract.off(eventName, callback);
      },
      async startGame(gameType: GameType, difficulty: Difficulty, value = 0n) {
        const tx = await contract.startGame(gameType, difficulty, { value });
        const receipt = await tx.wait();
        const event = receipt.logs
          .map((log: any) => {
            try {
              return contract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find((entry: any) => entry?.name === "GameStarted");
        return {
          hash: tx.hash,
          success: receipt.status === 1,
          receipt,
          sessionId: BigInt(event?.args?.sessionId?.toString() ?? "0"),
        };
      },
      completeGame(sessionId, score) {
        return send(contract.completeGame(sessionId, score));
      },
      async claimReward(sessionId) {
        const tx = await contract.claimReward(sessionId);
        const receipt = await tx.wait();
        const event = receipt.logs
          .map((log: any) => {
            try {
              return contract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find((entry: any) => entry?.name === "RewardClaimed");
        return {
          hash: tx.hash,
          success: receipt.status === 1,
          receipt,
          reward: BigInt(
            (event?.args?.reward ?? event?.args?.amount ?? 0n).toString(),
          ),
        };
      },
      async getSession(sessionId): Promise<MinigameSession> {
        const session = await contract.getSession(sessionId);
        return {
          player: session.player as Address,
          gameType: Number(session.gameType) as GameType,
          difficulty: Number(session.difficulty) as Difficulty,
          startTime: BigInt(session.startTime.toString()),
          endTime: BigInt(session.endTime.toString()),
          score: BigInt(session.score.toString()),
          reward: BigInt(session.reward.toString()),
          completed: session.completed,
          rewardClaimed: session.rewardClaimed,
        };
      },
      async getGameConfig(gameType): Promise<MinigameConfig> {
        const config = await contract.getGameConfig(gameType);
        return {
          gameType: Number(config.gameType) as GameType,
          duration: BigInt(config.duration.toString()),
          baseReward: BigInt(config.baseReward.toString()),
          entryFee: BigInt(config.entryFee.toString()),
          maxDailyRewards: BigInt(config.maxDailyRewards.toString()),
          maxSessionsPerUser: BigInt(config.maxSessionsPerUser.toString()),
          active: config.active,
        };
      },
      async calculateReward(gameType, difficulty, score) {
        return BigInt(
          (
            await contract.calculateReward(gameType, difficulty, score)
          ).toString(),
        );
      },
      async getLeaderboard(gameType, limit) {
        const [players, scores] = await contract.getLeaderboard(
          gameType,
          limit,
        );
        return {
          players: players as Address[],
          scores: scores.map((score: bigint) => BigInt(score.toString())),
        };
      },
      async getPlayerSessions(player) {
        const sessions = await contract.getPlayerSessions(player);
        return sessions.map((session: bigint) => BigInt(session.toString()));
      },
      importState(configs, nextSessionId) {
        return send(contract.importState(configs, nextSessionId));
      },
      setGameConfig(gameId, config) {
        return send(contract.setGameConfig(gameId, config));
      },
      setGameActive(gameId, active) {
        return send(contract.setGameActive(gameId, active));
      },
      async withdrawEntryFees(to, amount) {
        const value =
          amount ?? (provider ? await provider.getBalance(address) : 0n);
        return send(contract.withdrawEntryFees(to, value));
      },
      pause() {
        return send(contract.pause());
      },
      unpause() {
        return send(contract.unpause());
      },
    };
  }
}

export default MinigameManagerFactory;
