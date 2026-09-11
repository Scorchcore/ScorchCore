import { afterEach, describe, expect, it, vi } from "vitest";
import { getDefaultToastDuration, replaceToastTimer } from "../Toast";

afterEach(() => {
  vi.useRealTimers();
});

describe("toast dismissal policy", () => {
  it("keeps errors visible until the user closes them", () => {
    expect(getDefaultToastDuration("error")).toBe(0);
  });

  it("cancels an older info timeout when a persistent error replaces it", () => {
    vi.useFakeTimers();
    const dismiss = vi.fn();
    const infoTimer = replaceToastTimer(null, 5_000, dismiss);

    const errorTimer = replaceToastTimer(infoTimer, 0, dismiss);
    vi.advanceTimersByTime(5_000);

    expect(errorTimer).toBeNull();
    expect(dismiss).not.toHaveBeenCalled();
  });
});
