import { describe, expect, it } from "vitest";
import {
  FORGE_SHADER_PROFILES,
  FORGE_SHADER_QUALITY_CACHE_KEY,
  FORGE_SHADER_QUALITY_TTL_MS,
  isFrameTimingSample,
  readCachedShaderQuality,
  selectShaderQuality,
  shouldReduceQuality,
  writeCachedShaderQuality,
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

  it("persists and restores a measured quality", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    expect(writeCachedShaderQuality(storage, "compatible", 1_000)).toBe(true);
    expect(values.has(FORGE_SHADER_QUALITY_CACHE_KEY)).toBe(true);
    expect(readCachedShaderQuality(storage, 1_001)).toBe("compatible");
  });

  it("expires a measured quality after thirty days", () => {
    const storage = {
      getItem: () => JSON.stringify({ quality: "high", measuredAt: 1_000 }),
      setItem: () => undefined,
    };
    expect(
      readCachedShaderQuality(storage, 1_000 + FORGE_SHADER_QUALITY_TTL_MS + 1),
    ).toBeNull();
  });

  it("ignores malformed, future, or blocked storage", () => {
    expect(
      readCachedShaderQuality(
        { getItem: () => "not-json", setItem: () => undefined },
        1_000,
      ),
    ).toBeNull();
    expect(
      readCachedShaderQuality(
        {
          getItem: () => JSON.stringify({ quality: "high", measuredAt: 2_000 }),
          setItem: () => undefined,
        },
        1_000,
      ),
    ).toBeNull();
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readCachedShaderQuality(blocked, 1_000)).toBeNull();
    expect(writeCachedShaderQuality(blocked, "high", 1_000)).toBe(false);
  });
});
