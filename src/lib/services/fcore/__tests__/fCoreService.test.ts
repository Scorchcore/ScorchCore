import { describe, expect, it, vi } from "vitest";
import type { ContractManager } from "@/lib/contracts/ContractManager";
import { fCoreService } from "../fCoreService";

const USER = "0x1234567890123456789012345678901234567890" as const;

describe("fCoreService", () => {
  it("calculates convertAll output from the pre-conversion balance", async () => {
    const balance = 100n * 10n ** 18n;
    const converter = {
      canConvert: vi.fn().mockResolvedValue(true),
      getConversionRate: vi.fn().mockResolvedValue(10n ** 18n),
      conversionFeeBps: vi.fn().mockResolvedValue(100n),
      convertAll: vi.fn().mockResolvedValue({
        hash: "0xabc",
        success: true,
      }),
    };
    const token = {
      balanceOf: vi.fn().mockResolvedValue(balance),
    };
    const contractManager = {
      getfCoreConverter: () => converter,
      getfCoreToken: () => token,
    } as unknown as ContractManager;

    const result = await new fCoreService(contractManager).convertfCore({
      userAddress: USER,
    });

    expect(result).toEqual({
      success: true,
      txHash: "0xabc",
      fCoreConverted: balance,
      coreReceived: 99n * 10n ** 18n,
      feeAmount: 1n * 10n ** 18n,
    });
    expect(token.balanceOf.mock.invocationCallOrder[0]).toBeLessThan(
      converter.convertAll.mock.invocationCallOrder[0],
    );
  });
});
