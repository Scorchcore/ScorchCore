/**
 * Transaction Error Classifier
 *
 * Normaliza las distintas formas en que wallets, ethers y viem reportan
 * errores de transacción en una clasificación única para la UI.
 *
 * Formas cubiertas:
 * - ethers v6: `error.code === "INSUFFICIENT_FUNDS" | "ACTION_REJECTED" | "CALL_EXCEPTION"`
 * - viem: `InsufficientFundsError` / `UserRejectedRequestError` dentro de
 *   `TransactionExecutionError`/`EstimateGasExecutionError` (cadena `cause`)
 * - JSON-RPC: `{ code: -32000, message: "insufficient funds for gas * price + value" }`,
 *   anidado en `error.error`, `error.info.error` o `error.data.message`
 * - Mensajes ya envueltos por servicios legacy (p. ej. forgeService en español)
 *
 * @pattern Strategy (clasificación pura, sin dependencias de React ni de wallet)
 */

export type TransactionErrorKind =
  | "insufficient-funds"
  | "user-rejected"
  | "wrong-network"
  | "network-error"
  | "reverted"
  | "unknown";

export interface ClassifiedTransactionError {
  kind: TransactionErrorKind;
  /** Mensaje crudo extraído del error (truncado) solo para diagnóstico interno. */
  rawMessage: string;
}

export interface TransactionErrorDescription {
  kind: TransactionErrorKind;
  /** Título sugerido para el toast (undefined = sin título). */
  title?: string;
  /** Mensaje listo para mostrar al usuario. */
  message: string;
}

const MAX_WALK_DEPTH = 8;
const MAX_RAW_MESSAGE_LENGTH = 180;

const INSUFFICIENT_FUNDS_CODES = new Set(["INSUFFICIENT_FUNDS"]);
const INSUFFICIENT_FUNDS_NAMES = new Set(["InsufficientFundsError"]);
const INSUFFICIENT_FUNDS_PATTERNS = [
  "insufficient funds",
  "insufficient balance for",
  "insufficient balance to",
  "insufficient ron",
  // Mensajes legacy producidos por wrappers de este repo
  "fondos insuficientes",
  "balance insuficiente de ron",
];

const USER_REJECTED_CODES = new Set(["ACTION_REJECTED", "4001"]);
const USER_REJECTED_NAMES = new Set(["UserRejectedRequestError"]);
const USER_REJECTED_PATTERNS = [
  "user rejected",
  "user denied",
  "user cancelled",
  "user canceled",
  "rejected by user",
  "denied transaction",
  "request rejected",
  "transacción rechazada",
  "transacción cancelada",
];

const WRONG_NETWORK_CODES = new Set(["CHAIN_MISMATCH", "UNSUPPORTED_CHAIN"]);
const WRONG_NETWORK_NAMES = new Set([
  "ChainMismatchError",
  "ChainNotConfiguredError",
  "SwitchChainError",
]);
const WRONG_NETWORK_PATTERNS = [
  "chain mismatch",
  "unsupported chain",
  "wrong network",
  "switch chain",
];

const NETWORK_ERROR_CODES = new Set([
  "NETWORK_ERROR",
  "SERVER_ERROR",
  "TIMEOUT",
]);
const NETWORK_ERROR_NAMES = new Set([
  "HttpRequestError",
  "RpcRequestError",
  "TimeoutError",
]);
const NETWORK_ERROR_PATTERNS = [
  "failed to fetch",
  "network request failed",
  "could not detect network",
  "rpc endpoint returned",
  "request timeout",
];

const REVERTED_CODES = new Set(["CALL_EXCEPTION"]);
const REVERTED_NAMES = new Set(["ExecutionRevertedError"]);
const REVERTED_PATTERNS = [
  "execution reverted",
  "transaction reverted",
  "call exception",
];

interface ErrorSignals {
  texts: string[];
  codes: string[];
  names: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pushIfString(list: string[], value: unknown): void {
  if (typeof value !== "string" || value.length === 0) return;
  // Los payloads hex (revert data) no aportan texto legible.
  if (/^0x[0-9a-fA-F]+$/.test(value)) return;
  list.push(value);
}

/**
 * Recorre el grafo del error (`cause`, `error`, `info.error`, `data`) y
 * acumula textos, códigos y nombres de cada nivel. Tolera ciclos y
 * estructuras que no son Error (strings, objetos RPC planos).
 */
function collectSignals(
  node: unknown,
  signals: ErrorSignals,
  seen: Set<unknown>,
  depth: number,
): void {
  if (depth > MAX_WALK_DEPTH || node === null || node === undefined) return;
  if (typeof node === "string") {
    pushIfString(signals.texts, node);
    return;
  }
  if (!isRecord(node)) return;
  if (seen.has(node)) return;
  seen.add(node);

  const { code, message, shortMessage, reason, details, name } = node;
  if (typeof code === "string" || typeof code === "number") {
    signals.codes.push(String(code));
  }
  if (typeof name === "string") signals.names.push(name);
  pushIfString(signals.texts, message);
  pushIfString(signals.texts, shortMessage);
  pushIfString(signals.texts, reason);
  pushIfString(signals.texts, details);

  // Ramas anidadas conocidas: viem `cause`, ethers `info.error`,
  // JSON-RPC `{ error, data }`.
  collectSignals(node.cause, signals, seen, depth + 1);
  collectSignals(node.error, signals, seen, depth + 1);
  collectSignals(node.data, signals, seen, depth + 1);
  if (isRecord(node.info)) {
    collectSignals(node.info.error, signals, seen, depth + 1);
    if (isRecord(node.info.error)) {
      collectSignals(node.info.error.data, signals, seen, depth + 1);
    }
  }
}

function matchesAny(texts: string[], patterns: string[]): boolean {
  return texts.some((text) => {
    const normalized = text.toLowerCase();
    return patterns.some((pattern) => normalized.includes(pattern));
  });
}

/**
 * Clasifica un error de transacción. La prioridad es:
 * insufficient-funds > user-rejected > wrong-network > reverted >
 * network-error > unknown, porque las señales anidadas describen la causa
 * raíz mejor que el wrapper externo.
 */
export function classifyTransactionError(
  error: unknown,
): ClassifiedTransactionError {
  const signals: ErrorSignals = { texts: [], codes: [], names: [] };
  collectSignals(error, signals, new Set(), 0);

  const rawMessage = (signals.texts[0] ?? String(error)).slice(
    0,
    MAX_RAW_MESSAGE_LENGTH,
  );

  const kind: TransactionErrorKind = (() => {
    if (
      signals.codes.some((code) => INSUFFICIENT_FUNDS_CODES.has(code)) ||
      signals.names.some((name) => INSUFFICIENT_FUNDS_NAMES.has(name)) ||
      matchesAny(signals.texts, INSUFFICIENT_FUNDS_PATTERNS)
    ) {
      return "insufficient-funds";
    }
    if (
      signals.codes.some((code) => USER_REJECTED_CODES.has(code)) ||
      signals.names.some((name) => USER_REJECTED_NAMES.has(name)) ||
      matchesAny(signals.texts, USER_REJECTED_PATTERNS)
    ) {
      return "user-rejected";
    }
    if (
      signals.codes.some((code) => WRONG_NETWORK_CODES.has(code)) ||
      signals.names.some((name) => WRONG_NETWORK_NAMES.has(name)) ||
      matchesAny(signals.texts, WRONG_NETWORK_PATTERNS)
    ) {
      return "wrong-network";
    }
    if (
      signals.codes.some((code) => REVERTED_CODES.has(code)) ||
      signals.names.some((name) => REVERTED_NAMES.has(name)) ||
      matchesAny(signals.texts, REVERTED_PATTERNS)
    ) {
      return "reverted";
    }
    if (
      signals.codes.some((code) => NETWORK_ERROR_CODES.has(code)) ||
      signals.names.some((name) => NETWORK_ERROR_NAMES.has(name)) ||
      matchesAny(signals.texts, NETWORK_ERROR_PATTERNS)
    ) {
      return "network-error";
    }
    return "unknown";
  })();

  return { kind, rawMessage };
}

export function isInsufficientFundsError(error: unknown): boolean {
  return classifyTransactionError(error).kind === "insufficient-funds";
}

export function isUserRejectedError(error: unknown): boolean {
  return classifyTransactionError(error).kind === "user-rejected";
}

/**
 * Traduce el error clasificado a contenido de toast accionable.
 * Para `reverted`/`unknown` usa el `fallback` de contexto sin exponer datos
 * técnicos; para los demás devuelve copy fijo (claro y consistente).
 */
export function describeTransactionError(
  error: unknown,
  fallback = "Transaction failed",
): TransactionErrorDescription {
  const { kind } = classifyTransactionError(error);
  const context =
    fallback.trim().replace(/[.!?]+$/, "") || "Transaction failed";

  switch (kind) {
    case "insufficient-funds":
      return {
        kind,
        title: "Insufficient testnet RON",
        message:
          "Your wallet has no RON on Ronin Saigon testnet to cover this transaction's gas fee.",
      };
    case "user-rejected":
      return {
        kind,
        title: "Transaction cancelled",
        message: "You rejected the transaction in your wallet.",
      };
    case "wrong-network":
      return {
        kind,
        title: "Wrong network",
        message:
          "Switch your wallet to Ronin Saigon testnet and try the operation again.",
      };
    case "network-error":
      return {
        kind,
        title: "Network unavailable",
        message:
          "Ronin Saigon is not responding. Check your connection and try again.",
      };
    case "reverted":
      return {
        kind,
        title: "Transaction failed",
        message: `${context}. The contract rejected the operation. Check the requirements and try again.`,
      };
    default:
      return {
        kind,
        title: "Transaction failed",
        message: `${context}. Try again. If the problem continues, refresh the page or reconnect your wallet.`,
      };
  }
}

export function getUserFacingErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return describeTransactionError(error, fallback).message;
}
