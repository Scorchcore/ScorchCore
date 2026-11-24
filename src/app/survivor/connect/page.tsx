"use client";

import { useEffect, useState } from "react";
import { SurvivorPicker } from "@/components/survivor/SurvivorPicker";
import {
  readSurvivorRequest,
  SURVIVOR_ORIGIN,
  SURVIVOR_URL,
  type SurvivorSession,
} from "@/lib/survivor/session";

export default function ConnectSurvivor() {
  const [session, setSession] = useState<SurvivorSession | null>(null);
  useEffect(() => {
    const game = window.opener;
    if (!game) return;
    const receive = (event: MessageEvent) => {
      const request = readSurvivorRequest(event, game);
      if (request) setSession(request);
    };
    window.addEventListener("message", receive);
    game.postMessage({ type: "survivor.ready.v1" }, SURVIVOR_ORIGIN);
    return () => window.removeEventListener("message", receive);
  }, []);
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-white">
      <h1 className="mb-4 text-2xl">ScorchCore Survivor</h1>
      <p>
        Open the game and choose “Play with my CoreMiner” to use your wallet.
      </p>
      <a href={SURVIVOR_URL} className="mt-4 inline-block underline">
        Open Survivor
      </a>
      {session && (
        <SurvivorPicker
          key={session.nonce}
          session={session}
          onClose={() => {
            setSession(null);
            window.close();
          }}
        />
      )}
    </main>
  );
}
