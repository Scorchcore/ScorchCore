/**
 * Ronin Waypoint Service
 *
 * Servicio para gestionar la integración con Ronin Waypoint SDK oficial.
 * Encapsula WaypointProvider y proporciona una API limpia.
 *
 * @see https://docs.skymavis.com/mavis/ronin-waypoint/reference/web-sdk/web-standard
 *
 * @pattern Service Layer
 * @category Blockchain
 */

import { WaypointProvider, authorize } from "@sky-mavis/waypoint";
import { createServiceLogger } from "@/lib/utils/logging/logger";
import type { WaypointConfig, WaypointConnectionResult } from "./types";

const logger = createServiceLogger("WaypointService");

/**
 * Servicio singleton para Ronin Waypoint
 */
class WaypointService {
  private provider: WaypointProvider | null = null;
  private config: WaypointConfig | null = null;
  private isInitialized = false;

  initialize(config: WaypointConfig): void {
    if (this.isInitialized) {
      logger.warn("WaypointService ya está inicializado");
      return;
    }

    logger.info("Inicializando WaypointService", { chainId: config.chainId });

    this.config = config;
    this.provider = WaypointProvider.create({
      clientId: config.clientId,
      chainId: config.chainId,
      redirectUrl: config.redirectUrl,
    });

    this.isInitialized = true;
    logger.info("WaypointService inicializado correctamente");
  }

  getProvider(): WaypointProvider {
    if (!this.provider) {
      throw new Error(
        "WaypointService no está inicializado. Llama a initialize() primero.",
      );
    }
    return this.provider;
  }

  async connect(): Promise<WaypointConnectionResult> {
    if (!this.provider) {
      throw new Error("WaypointService no está inicializado");
    }

    try {
      logger.info("Conectando con Ronin Waypoint...");

      const result = await this.provider.connect();

      logger.info("Conexión exitosa", { address: result.address });

      return {
        address: result.address,
        success: true,
      };
    } catch (error) {
      logger.error("Error al conectar con Waypoint", error);
      throw error;
    }
  }

  async authorizePopup(
    scopes: ("openid" | "profile" | "email" | "wallet")[] = [
      "openid",
      "wallet",
    ],
  ) {
    if (!this.config) {
      throw new Error("WaypointService no está inicializado");
    }

    try {
      logger.info("Autorizando con popup mode...", { scopes });

      const result = await authorize({
        mode: "popup",
        clientId: this.config.clientId,
        scopes: scopes as any,
      });

      if (result) {
        logger.info("Autorización exitosa", {
          address: result.address,
          hasToken: !!result.token,
        });
      }

      return result;
    } catch (error) {
      logger.error("Error en autorización popup", error);
      throw error;
    }
  }

  authorizeRedirect(
    scopes: ("openid" | "profile" | "email" | "wallet")[] = [
      "openid",
      "wallet",
    ],
    state?: string,
  ): void {
    if (!this.config) {
      throw new Error("WaypointService no está inicializado");
    }

    logger.info("Iniciando autorización redirect...", { scopes, state });

    authorize({
      mode: "redirect",
      clientId: this.config.clientId,
      redirectUrl: this.config.redirectUrl || window.location.origin,
      scopes: scopes as any,
      state,
    });
  }

  disconnect(): void {
    if (this.provider) {
      logger.info("Desconectando de Waypoint...");
      this.provider.disconnect();
    }
  }

  isConnected(): boolean {
    return this.provider !== null && this.isInitialized;
  }

  getConfig(): WaypointConfig | null {
    return this.config;
  }

  reset(): void {
    this.provider = null;
    this.config = null;
    this.isInitialized = false;
    logger.info("WaypointService reset");
  }
}

export const waypointService = new WaypointService();
export { WaypointService };
