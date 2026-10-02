import { describe, expect, it } from "vitest";
import { nextRenderScale, shouldReduceQuality } from "../ForgeShader";

describe("ForgeShader adaptive quality", () => {
  it("reduces resolution by twenty percent", () => {
    expect(nextRenderScale(0.6, 0.35)).toBe(0.48);
  });

  it("never reduces below the configured minimum", () => {
    expect(nextRenderScale(0.4, 0.35)).toBe(0.35);
    expect(nextRenderScale(0.35, 0.35)).toBe(0.35);
  });

  it("keeps quality for frames within the performance budget", () => {
    expect(shouldReduceQuality(50, 1_000 / 24)).toBe(false);
  });

  it("reduces quality when frames exceed the budget by fifty percent", () => {
    expect(shouldReduceQuality(63, 1_000 / 24)).toBe(true);
  });
});
