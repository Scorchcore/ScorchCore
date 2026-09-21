import { describe, expect, it } from "vitest";
import {
  classifyTransactionError,
  describeTransactionError,
  isInsufficientFundsError,
  isUserRejectedError,
} from "../transactionError";

describe("classifyTransactionError · insufficient-funds", () => {
  it("detecta el código INSUFFICIENT_FUNDS de ethers v6", () => {
    const error = Object.assign(
      new Error("insufficient funds for intrinsic transaction cost"),
      { code: "INSUFFICIENT_FUNDS" },
    );

    expect(classifyTransactionError(error).kind).toBe("insufficient-funds");
    expect(isInsufficientFundsError(error)).toBe(true);
  });

  it("detecta InsufficientFundsError de viem dentro de la cadena cause", () => {
    const cause = Object.assign(
      new Error(
        "The total cost (gas * gasFee + value) of executing this transaction exceeds the balance of the account.",
      ),
      { name: "InsufficientFundsError" },
    );
    const error = Object.assign(new Error("Transaction execution failed."), {
      name: "TransactionExecutionError",
      cause,
    });

    expect(classifyTransactionError(error).kind).toBe("insufficient-funds");
  });

  it("detecta el -32000 de RPC anidado en info.error (ethers estimateGas)", () => {
    const error = Object.assign(
      new Error("cannot estimate gas; transaction may fail"),
      {
        code: "UNPREDICTABLE_GAS_LIMIT",
        info: {
          error: {
            code: -32000,
            message:
              "insufficient funds for gas * price + value: balance 0, gas 21000, gasPrice 20000000000",
          },
        },
      },
    );

    expect(classifyTransactionError(error).kind).toBe("insufficient-funds");
  });

  it("detecta objetos RPC planos con mensaje de fondos insuficientes", () => {
    const error = {
      code: -32000,
      message: "insufficient balance for transfer",
    };

    expect(classifyTransactionError(error).kind).toBe("insufficient-funds");
  });

  it("detecta el mensaje en data.message (Ronin Wallet)", () => {
    const error = {
      code: -32603,
      message: "Internal JSON-RPC error.",
      data: { message: "insufficient funds for gas * price + value" },
    };

    expect(classifyTransactionError(error).kind).toBe("insufficient-funds");
  });

  it("detecta mensajes legacy envueltos por servicios del repo", () => {
    const error = new Error(
      "Failed to forge geode: Balance insuficiente de RON para pagar el gas",
    );

    expect(classifyTransactionError(error).kind).toBe("insufficient-funds");
  });

  it("detecta strings planos (result.error de hooks)", () => {
    expect(classifyTransactionError("Fondos insuficientes para gas").kind).toBe(
      "insufficient-funds",
    );
  });
});

describe("classifyTransactionError · user-rejected", () => {
  it.each([
    Object.assign(new Error("user rejected transaction"), {
      code: "ACTION_REJECTED",
    }),
    Object.assign(new Error("User denied transaction signature."), {
      code: 4001,
    }),
    Object.assign(new Error("The user rejected the request."), {
      name: "UserRejectedRequestError",
    }),
    new Error("Transacción cancelada por el usuario"),
  ])("detecta rechazo del usuario %#", (error) => {
    expect(classifyTransactionError(error).kind).toBe("user-rejected");
    expect(isUserRejectedError(error)).toBe(true);
  });
});

describe("classifyTransactionError · reverted / unknown", () => {
  it("detecta CALL_EXCEPTION de ethers", () => {
    const error = Object.assign(
      new Error("execution reverted: Geode is not ready"),
      { code: "CALL_EXCEPTION" },
    );

    expect(classifyTransactionError(error).kind).toBe("reverted");
  });

  it("no confunde 'balance insuficiente de tokens' con falta de RON", () => {
    // Texto real que produce forgeService al envolver un CALL_EXCEPTION:
    // es una lista de posibles causas, no un insufficient-funds confirmado.
    const error = new Error(
      "Failed to forge geode: La transacción fue rechazada por el contrato. Posibles causas:\n" +
        "- Balance insuficiente de tokens (AXS, SLP, Memento)\n" +
        "- Allowance insuficiente (verifica aprobaciones)",
    );

    expect(classifyTransactionError(error).kind).not.toBe("insufficient-funds");
  });

  it("no confunde un revert ERC20 con falta de RON", () => {
    const error = Object.assign(
      new Error("execution reverted: ERC20: transfer amount exceeds balance"),
      { code: "CALL_EXCEPTION" },
    );

    expect(classifyTransactionError(error).kind).toBe("reverted");
  });

  it.each([null, undefined, 42, {}, new Error("something odd happened")])(
    "clasifica como unknown lo irreconocible %#",
    (error) => {
      expect(classifyTransactionError(error).kind).toBe("unknown");
    },
  );

  it("tolera grafos de error circulares", () => {
    const error: Record<string, unknown> = { message: "boom" };
    error.cause = error;

    expect(classifyTransactionError(error).kind).toBe("unknown");
  });
});

describe("describeTransactionError", () => {
  it("expone copy y título fijos para insufficient-funds", () => {
    const described = describeTransactionError(
      new Error("insufficient funds for gas * price + value"),
    );

    expect(described.kind).toBe("insufficient-funds");
    expect(described.title).toBe("Insufficient testnet RON");
    expect(described.message).toContain("Ronin Saigon");
  });

  it("expone copy de cancelación para user-rejected", () => {
    const described = describeTransactionError(
      Object.assign(new Error("user rejected"), { code: 4001 }),
    );

    expect(described.kind).toBe("user-rejected");
    expect(described.title).toBe("Transaction cancelled");
  });

  it("antepone el fallback al mensaje crudo para errores desconocidos", () => {
    const described = describeTransactionError(
      new Error("weird rpc blob"),
      "Error al eclosionar geoda",
    );

    expect(described.kind).toBe("unknown");
    expect(described.message).toBe("Error al eclosionar geoda: weird rpc blob");
    expect(described.title).toBeUndefined();
  });
});
