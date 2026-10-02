import { describe, expect, it } from "vitest";
import {
  canReduceQuality,
  isFrameTimingSample,
  nextRenderScale,
  shouldReduceQuality,
} from "../ForgeShader";

describe("ForgeShader adaptive quality", () => {
  it("reduces resolution by twenty percent", () => {
    expect(nextRenderScale(0.6, 0.35)).toBe(0.48);
  });

  it("never reduces below the configured minimum", () => {
    expect(nextRenderScale(0.6, 0.5)).toBe(0.5);
    expect(nextRenderScale(0.5, 0.5)).toBe(0.5);
  });

  it("stops after the configured number of reductions", () => {
    expect(canReduceQuality(0.6, 0.5, 0, 1)).toBe(true);
    expect(canReduceQuality(0.5, 0.5, 1, 1)).toBe(false);
    expect(canReduceQuality(0.6, 0.5, 1, 1)).toBe(false);
  });

  it("ignores timing gaps caused by hidden tabs or suspended browsers", () => {
    const targetFrameMs = 1_000 / 24;
    expect(isFrameTimingSample(80, targetFrameMs)).toBe(true);
    expect(isFrameTimingSample(5_000, targetFrameMs)).toBe(false);
  });

  it("keeps quality for frames within the performance budget", () => {
    expect(shouldReduceQuality(50, 1_000 / 24)).toBe(false);
  });

  it("reduces quality when frames exceed the budget by fifty percent", () => {
    expect(shouldReduceQuality(63, 1_000 / 24)).toBe(true);
  });
});
