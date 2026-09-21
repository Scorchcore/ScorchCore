/**
 * useTransactionErrorToast
 *
 * Especialización de useToast para errores de transacciones on-chain.
 * Clasifica el error (insufficient-funds / user-rejected / reverted /
 * unknown) y, cuando la causa es falta de RON en Saigon, adjunta una
 * acción que copia la address y abre el faucet oficial.
 *
 * @pattern Decorator sobre useToast: el retorno es un superset, por lo
 * que puede sustituir a useToast en cualquier pantalla con transacciones.
 */

import { useAccount } from "wagmi";
import { describeTransactionError } from "@/lib/utils/errors/transactionError";
import { openRoninFaucet } from "@/lib/utils/network/faucet";
import { useToast } from "./Toast";

export function useTransactionErrorToast() {
  const { address } = useAccount();
  const toastApi = useToast();

  const showTransactionError = (
    error: unknown,
    fallback = "Transaction failed",
    title?: string,
  ) => {
    const described = describeTransactionError(error, fallback);
    toastApi.showError(
      described.message,
      title ?? described.title,
      described.kind === "insufficient-funds"
        ? {
            label: "Get testnet RON",
            onClick: () => openRoninFaucet(address),
          }
        : undefined,
    );
  };

  return { ...toastApi, showTransactionError };
}
