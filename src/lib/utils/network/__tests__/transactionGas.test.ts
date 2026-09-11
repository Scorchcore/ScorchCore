import { describe, expect, it } from "vitest";
import { addGasBuffer } from "../transactionGas";

describe("addGasBuffer", () => {
  it("adds a twenty percent buffer to the live faucet estimate", () => {
    expect(addGasBuffer(1_286_564n)).toBe(1_543_877n);
  });

  it("rejects estimates that cannot produce a valid transaction", () => {
    expect(() => addGasBuffer(0n)).toThrow("Gas estimate must be positive");
  });
});
