export const SURVIVOR_ORIGIN = "https://survivor.scorchcore.xyz";
export const SURVIVOR_URL = SURVIVOR_ORIGIN + "/?profile=1";

export interface SurvivorSession {
  game: Window;
  nonce: string;
}

export function readSurvivorRequest(event: MessageEvent, game: Window | null) {
  if (
    !game ||
    event.source !== game ||
    event.origin !== SURVIVOR_ORIGIN ||
    event.data?.type !== "survivor.request.v1" ||
    typeof event.data.nonce !== "string" ||
    !/^[a-f0-9]{32}$/.test(event.data.nonce)
  )
    return null;
  return { game, nonce: event.data.nonce } satisfies SurvivorSession;
}
