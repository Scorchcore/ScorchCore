import { describe, expect, it } from "vitest";
import { readSurvivorRequest, SURVIVOR_ORIGIN } from "./session";

describe("Survivor wallet request", () => {
  const game = {} as Window;
  const nonce = "1234abcd".repeat(4);
  function event(origin: string, source: Window | null, challenge: string) {
    return {
      origin,
      source,
      data: { type: "survivor.request.v1", nonce: challenge },
    } as MessageEvent;
  }
  it("accepts challenges from the game window", () => {
    expect(
      readSurvivorRequest(event(SURVIVOR_ORIGIN, game, nonce), game),
    ).toEqual({ game, nonce });
  });
  it("rejects other origins, unrelated windows and malformed challenges", () => {
    expect(
      readSurvivorRequest(event("https://other.example", game, nonce), game),
    ).toBeNull();
    expect(
      readSurvivorRequest(event(SURVIVOR_ORIGIN, {} as Window, nonce), game),
    ).toBeNull();
    expect(
      readSurvivorRequest(event(SURVIVOR_ORIGIN, game, ""), game),
    ).toBeNull();
    expect(
      readSurvivorRequest(event(SURVIVOR_ORIGIN, null, nonce), null),
    ).toBeNull();
  });
});
