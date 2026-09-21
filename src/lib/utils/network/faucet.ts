/**
 * Ronin Saigon testnet RON faucet.
 *
 * Ronin no expone un friendbot ni una API pública de faucet: la única vía
 * es la web oficial (5 RON por request, límite diario por IP). Por eso el
 * flujo es: copiar la address al portapapeles (best-effort) y abrir el
 * faucet en una pestaña nueva para que el usuario solo tenga que pegarla.
 */

import { SAIGON_FAUCET_URL } from "@/lib/config/deployment.config";

export function openRoninFaucet(address?: string): void {
  if (address && typeof navigator !== "undefined") {
    void navigator.clipboard?.writeText(address).catch(() => {
      // Clipboard puede fallar (permisos, HTTP no-seguro); el faucet igual abre.
    });
  }
  if (typeof window !== "undefined") {
    window.open(SAIGON_FAUCET_URL, "_blank", "noopener,noreferrer");
  }
}
