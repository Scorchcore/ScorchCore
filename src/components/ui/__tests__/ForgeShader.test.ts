import { describe, expect, it } from "vitest";
import {
  FORGE_SHADER_PROFILES,
  isFrameTimingSample,
  selectShaderQuality,
  shouldReduceQuality,
} from "../ForgeShader";

describe("ForgeShader quality selection", () => {
  it("keeps the original iteration budget in high quality", () => {
    expect(FORGE_SHADER_PROFILES.high).toEqual({
      outerSteps: 80,
      innerSteps: 8,
      normalization: 5_000,
    });
  });

  it("cuts nested fragment work by more than half in compatible quality", () => {
    const highWork =
      FORGE_SHADER_PROFILES.high.outerSteps *
      FORGE_SHADER_PROFILES.high.innerSteps;
    const compatibleWork =
      FORGE_SHADER_PROFILES.compatible.outerSteps *
      FORGE_SHADER_PROFILES.compatible.innerSteps;
    expect(compatibleWork / highWork).toBeLessThan(0.5);
  });

  it("ignores timing gaps caused by hidden tabs or suspended browsers", () => {
    const targetFrameMs = 1_000 / 24;
    expect(isFrameTimingSample(80, targetFrameMs)).toBe(true);
    expect(isFrameTimingSample(5_000, targetFrameMs)).toBe(false);
  });

  it("selects high quality for frames within the performance budget", () => {
    const targetFrameMs = 1_000 / 24;
    expect(shouldReduceQuality(50, targetFrameMs)).toBe(false);
    expect(selectShaderQuality(50, targetFrameMs)).toBe("high");
  });

  it("selects compatible quality for sustained slow frames", () => {
    const targetFrameMs = 1_000 / 24;
    expect(shouldReduceQuality(63, targetFrameMs)).toBe(true);
    expect(selectShaderQuality(63, targetFrameMs)).toBe("compatible");
  });
});
