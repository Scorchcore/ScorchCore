"use client";

import { Gamepad2, Loader2, RefreshCw, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { Loading } from "@/components/ui";
import type {
  Difficulty,
  GameType,
  MinigameConfig,
  MinigameSession,
} from "@/lib/contracts/interfaces/IMinigameManager";
import { useMinigame } from "@/lib/hooks/user/useMinigame";
import { useWallet } from "@/lib/hooks/user/useWallet";

const GAME_NAMES: Record<GameType, string> = {
  0: "Core Stabilization",
  1: "Fragment Expedition",
  2: "Custom Challenge",
};
const GAME_TYPES: GameType[] = [0, 1, 2];
const DIFFICULTIES: Difficulty[] = [0, 1, 2, 3];

interface SessionState extends MinigameSession {
  sessionId: bigint;
}

export default function MinigamesPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const {
    startGame,
    claimReward,
    getGameConfig,
    getSession,
    getPlayerSessions,
    isLoading,
    error,
  } = useMinigame();
  const [configs, setConfigs] = useState<
    Partial<Record<GameType, MinigameConfig>>
  >({});
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const entries = await Promise.all(
        GAME_TYPES.map(
          async (gameType) =>
            [gameType, await getGameConfig(gameType)] as const,
        ),
      );
      setConfigs(Object.fromEntries(entries));
      const sessionIds = await getPlayerSessions();
      setSessions(
        await Promise.all(sessionIds.map((sessionId) => getSession(sessionId))),
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [getGameConfig, getPlayerSessions, getSession]);

  useEffect(() => {
    if (isConnected) void refresh();
  }, [isConnected, refresh]);

  if (!isConnected) return <Loading />;

  return (
    <main className="min-h-screen bg-deep-abyss text-white">
      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_8%,rgba(125,249,255,0.09),transparent_30%),radial-gradient(circle_at_16%_45%,rgba(240,106,18,0.09),transparent_28%)]" />
        <div className="relative">
          <Link
            href="/dashboard"
            className="text-xs font-semibold uppercase tracking-wider text-cyan-50/55 hover:text-cyan-50"
          >
            Back to dashboard
          </Link>
          <header className="mt-5 flex flex-col gap-5 border-b border-cyan-100/10 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Gamepad2 className="h-8 w-8 text-magma-gold" />
                <h1 className="alchemy-heading text-3xl md:text-4xl">
                  Minigames
                </h1>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50/55">
                Start on-chain sessions and claim fCORE after the game server
                verifies your score.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 border border-cyan-100/15 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-50/70 hover:border-ethereal-cyan/45 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </header>

          <section className="mt-8">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="mr-2 text-xs uppercase tracking-wider text-cyan-50/45">
                Difficulty
              </span>
              {DIFFICULTIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDifficulty(value)}
                  className={`border px-3 py-2 text-xs font-semibold ${difficulty === value ? "border-magma-gold/70 bg-orange-500/15 text-magma-gold" : "border-cyan-100/12 bg-black/35 text-cyan-50/55"}`}
                >
                  {value + 1}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {GAME_TYPES.map((gameType) => {
                const config = configs[gameType];
                return (
                  <article
                    key={gameType}
                    className="relative overflow-hidden border border-cyan-100/12 bg-black/42 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.32)]"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-magma-gold/55 to-transparent" />
                    <h2 className="alchemy-heading text-lg">
                      {GAME_NAMES[gameType]}
                    </h2>
                    <p className="mt-2 text-xs text-cyan-50/45">
                      {config
                        ? `${formatUnits(config.baseReward, 18)} fCORE base reward`
                        : "Unavailable"}
                    </p>
                    <button
                      type="button"
                      disabled={!config?.active || isLoading}
                      onClick={async () => {
                        const result = await startGame({
                          gameType,
                          difficulty,
                          entryFee: config?.entryFee,
                        });
                        setMessage(
                          `Session ${result.sessionId.toString()} started`,
                        );
                        await refresh();
                      }}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 border border-magma-gold/45 bg-orange-500/12 px-4 py-3 text-xs font-bold uppercase tracking-wider text-magma-gold disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Gamepad2 className="h-4 w-4" />
                      )}
                      Start session
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="h-5 w-5 text-magma-gold" />
              <h2 className="alchemy-heading text-xl">Your sessions</h2>
            </div>
            <div className="space-y-3">
              {sessions.length === 0 && (
                <div className="border border-cyan-100/10 bg-black/35 p-6 text-sm text-cyan-50/45">
                  No sessions found.
                </div>
              )}
              {sessions.map((session) => (
                <article
                  key={session.sessionId.toString()}
                  className="flex flex-col gap-3 border border-cyan-100/10 bg-black/35 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">
                      Session {session.sessionId.toString()} ·{" "}
                      {GAME_NAMES[session.gameType]}
                    </p>
                    <p className="mt-1 text-xs text-cyan-50/45">
                      Score {session.score.toString()} · Reward{" "}
                      {formatUnits(session.reward, 18)} fCORE
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={
                      !session.completed || session.rewardClaimed || isLoading
                    }
                    onClick={async () => {
                      await claimReward(session.sessionId);
                      setMessage("Reward claimed");
                      await refresh();
                    }}
                    className="border border-ethereal-cyan/35 px-4 py-2 text-xs font-bold uppercase tracking-wider text-ethereal-cyan disabled:opacity-30"
                  >
                    {session.rewardClaimed
                      ? "Claimed"
                      : session.completed
                        ? "Claim fCORE"
                        : "Awaiting verification"}
                  </button>
                </article>
              ))}
            </div>
          </section>

          {(message || error) && (
            <div
              className={`mt-6 border p-4 text-sm ${error ? "border-red-400/35 text-red-300" : "border-emerald-400/35 text-emerald-300"}`}
            >
              {error?.message ?? message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
