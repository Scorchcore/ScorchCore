/**
 * Tipos compartidos para el módulo Waypoint
 * 
 * Interfaces para integración con Ronin Waypoint SDK
 */

/**
 * Configuración del servicio Waypoint
 */
export interface WaypointConfig {
  clientId: string;
  chainId: number;
  redirectUrl?: string;
  popupCloseDelay?: number;
}

/**
 * Resultado de conexión
 */
export interface WaypointConnectionResult {
  address: string;
  token?: string;
  success: boolean;
  error?: string;
}

/**
 * Estado de la sesión de Waypoint
 */
export interface WaypointSessionState {
  isConnected: boolean;
  address?: string;
  token?: string;
}

/**
 * Opciones de autorización
 */
export interface WaypointAuthOptions {
  scope?: string[];
  state?: string;
}
