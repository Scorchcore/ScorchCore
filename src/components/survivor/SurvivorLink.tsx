"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  readSurvivorRequest,
  SURVIVOR_ORIGIN,
  SURVIVOR_URL,
  type SurvivorSession,
} from "@/lib/survivor/session";
import { SurvivorPicker } from "./SurvivorPicker";

export function SurvivorLink() {
  const game = useRef<Window | null>(null);
  const [session, setSession] = useState<SurvivorSession | null>(null);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        game.current &&
        event.source === game.current &&
        event.origin === SURVIVOR_ORIGIN &&
        event.data?.type === "survivor.hello.v1"
      ) {
        game.current.postMessage({ type: "survivor.host.v1" }, SURVIVOR_ORIGIN);
        return;
      }
      const request = readSurvivorRequest(event, game.current);
      if (request) setSession(request);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  return (
    <>
      <a
        href={SURVIVOR_URL}
        aria-label="Play ScorchCore Survivor"
        className="mt-5 inline-block rounded-sm align-middle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
        onClick={(event) => {
          if (
            event.button ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          const opened = window.open(SURVIVOR_URL, "_blank");
          if (opened) {
            event.preventDefault();
            game.current = opened;
            setSession(null);
          }
        }}
      >
        <Image
          src="/images/scorchcore-survivor.webp"
          alt=""
          width={640}
          height={320}
          sizes="(max-width: 640px) 152px, 192px"
          className="h-auto w-38 sm:w-48"
        />
      </a>
      {session && (
        <SurvivorPicker
          key={session.nonce}
          session={session}
          onClose={() => setSession(null)}
        />
      )}
    </>
  );
}
