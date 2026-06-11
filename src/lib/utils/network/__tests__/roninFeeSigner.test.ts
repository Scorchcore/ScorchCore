import { JsonRpcSigner } from "ethers";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  RONIN_EIP1559_TX_FEES,
  RONIN_LEGACY_GAS_PRICE_WEI,
  RONIN_TX_FEES,
  RoninFeeSigner,
} from "../roninFeeSigner";

const USER = "0xa47F6f4091d7FA5299F7Fdf375E5529135BE0a2B";
const TO = "0xe1C50543735A20f7A98b383DD7848350FdfB5FBF";

function createSigner() {
  // El provider no se usa en el override; el resto queda cubierto por el spy
  // sobre JsonRpcSigner.prototype.sendTransaction.
  return new RoninFeeSigner({} as never, USER);
}

describe("RoninFeeSigner", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fuerza fees EIP-1559 de Ronin cuando faltan fees", async () => {
    const sendSpy = vi
      .spyOn(JsonRpcSigner.prototype, "sendTransaction")
      .mockResolvedValue({} as never);
    const signer = createSigner();

    await signer.sendTransaction({ to: TO });

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        ...RONIN_EIP1559_TX_FEES,
        gasPrice: undefined,
      }),
    );
  });

  it("respeta los fees EIP-1559 explícitos del caller", async () => {
    const sendSpy = vi
      .spyOn(JsonRpcSigner.prototype, "sendTransaction")
      .mockResolvedValue({} as never);
    const signer = createSigner();
    const tx = { to: TO, maxPriorityFeePerGas: 50_000_000_000n };

    await signer.sendTransaction(tx);

    expect(sendSpy).toHaveBeenCalledWith(tx);
  });

  it("convierte un gasPrice explícito en fees EIP-1559 seguros", async () => {
    const sendSpy = vi
      .spyOn(JsonRpcSigner.prototype, "sendTransaction")
      .mockResolvedValue({} as never);
    const signer = createSigner();
    const tx = { to: TO, gasPrice: 30_000_000_000n };

    await signer.sendTransaction(tx);

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: TO,
        ...RONIN_EIP1559_TX_FEES,
        gasPrice: undefined,
      }),
    );
  });

  it("RONIN_TX_FEES expone gasPrice legacy para la ruta wagmi/viem", () => {
    expect(RONIN_TX_FEES.gasPrice).toBe(RONIN_LEGACY_GAS_PRICE_WEI);
    expect(RONIN_TX_FEES.gasPrice).toBeGreaterThanOrEqual(21_000_000_000n);
  });
});
