/**
 * RoninFeeSigner — JsonRpcSigner con fees mínimos de Ronin
 *
 * Ronin (Saigon L2 y mainnet) rechaza transacciones con tip efectivo menor a
 * 20 gwei ("transaction priority fee below minimum required priority fee
 * 20000000000").
 *
 * El Ronin Wallet (extensión) puede convertir una transacción legacy a
 * EIP-1559 antes de firmarla. Si no enviamos EIP-1559 explícito, su fallback
 * usa 1 gwei de priority fee y Ronin rechaza la tx. Por eso este signer fuerza
 * `maxPriorityFeePerGas` >= 20 gwei en cada escritura que no especifique fees.
 *
 * Todas las escrituras de ethers (ContractManager → factories) pasan por aquí.
 */

import type {
  JsonRpcApiProvider,
  TransactionRequest,
  TransactionResponse,
} from "ethers";
import { JsonRpcSigner } from "ethers";

/** Priority fee mínimo exigido por los nodos de Ronin (20 gwei) */
export const RONIN_MIN_PRIORITY_FEE_WEI = 20_000_000_000n;

/**
 * Gas price legacy: 20 gwei de tip mínimo + margen para el baseFee
 * (~1 gwei en Ronin). Mismo orden que el precedente de ERC20Factory (25 gwei).
 */
export const RONIN_LEGACY_GAS_PRICE_WEI = 25_000_000_000n;
export const RONIN_MAX_FEE_PER_GAS_WEI = 50_000_000_000n;

/**
 * Fees para escrituras vía wagmi/viem (cuentas JSON-RPC no rellenan fees y el
 * Ronin Wallet usa 1 gwei de priority por defecto, bajo el mínimo de la red).
 * `gasPrice` fuerza una tx legacy que el wallet respeta sin recalcular.
 */
export const RONIN_TX_FEES = {
  gasPrice: RONIN_LEGACY_GAS_PRICE_WEI,
} as const;

export const RONIN_EIP1559_TX_FEES = {
  type: 2,
  maxPriorityFeePerGas: RONIN_LEGACY_GAS_PRICE_WEI,
  maxFeePerGas: RONIN_MAX_FEE_PER_GAS_WEI,
} as const;

export class RoninFeeSigner extends JsonRpcSigner {
  constructor(provider: JsonRpcApiProvider, address: string) {
    super(provider, address);
  }

  override async sendTransaction(
    tx: TransactionRequest,
  ): Promise<TransactionResponse> {
    // Respetar fees EIP-1559 explícitos si el caller los definió.
    if (tx.maxPriorityFeePerGas != null || tx.maxFeePerGas != null) {
      return super.sendTransaction(tx);
    }

    return super.sendTransaction({
      ...tx,
      ...RONIN_EIP1559_TX_FEES,
      gasPrice: undefined,
    });
  }
}
