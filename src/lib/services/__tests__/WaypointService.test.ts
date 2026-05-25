/**
 * WaypointService Unit Tests
 *
 * Testing del servicio singleton para Ronin Waypoint SDK
 *
 * @see src/lib/services/WaypointService.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WaypointService, waypointService } from "../waypoint/WaypointService";
import type { WaypointConfig } from "../waypoint/types";

// Mock del SDK de Waypoint
vi.mock("@sky-mavis/waypoint", () => ({
  WaypointProvider: {
    create: vi.fn(() => ({
      connect: vi
        .fn()
        .mockResolvedValue({
          address: "0x1234567890123456789012345678901234567890",
        }),
      disconnect: vi.fn(),
      request: vi.fn(),
    })),
  },
  authorize: vi.fn().mockResolvedValue({
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    token: "mock-token",
  }),
}));

describe("WaypointService", () => {
  let service: WaypointService;

  const mockConfig: WaypointConfig = {
    clientId: "test-client-id",
    chainId: 202601,
    redirectUrl: "http://localhost:3000",
    popupCloseDelay: 4000,
  };

  beforeEach(() => {
    // Crear nueva instancia para cada test
    service = new WaypointService();
  });

  afterEach(() => {
    // Reset del servicio después de cada test
    service.reset();
    vi.clearAllMocks();
  });

  describe("initialize", () => {
    it("should initialize service with config", () => {
      service.initialize(mockConfig);

      const config = service.getConfig();
      expect(config).toEqual(mockConfig);
      expect(service.isConnected()).toBe(true);
    });

    it("should not reinitialize if already initialized", () => {
      service.initialize(mockConfig);
      service.initialize({ ...mockConfig, chainId: 9999 });

      // Config debe seguir siendo el original
      const config = service.getConfig();
      expect(config?.chainId).toBe(202601);
    });

    it("should throw error when getting provider before initialization", () => {
      expect(() => service.getProvider()).toThrow(
        "WaypointService no está inicializado",
      );
    });
  });

  describe("connect", () => {
    it("should throw error if not initialized", async () => {
      await expect(service.connect()).rejects.toThrow(
        "WaypointService no está inicializado",
      );
    });

    it("should call provider.connect and return address", async () => {
      service.initialize(mockConfig);

      const result = await service.connect();

      expect(result.success).toBe(true);
      expect(result.address).toBe("0x1234567890123456789012345678901234567890");
    });

    it("should handle connection errors", async () => {
      const { WaypointProvider } = await import("@sky-mavis/waypoint");

      // Crear un provider que falle
      (WaypointProvider.create as any).mockReturnValueOnce({
        connect: vi.fn().mockRejectedValue(new Error("Connection failed")),
        disconnect: vi.fn(),
        request: vi.fn(),
      });

      service.initialize(mockConfig);

      await expect(service.connect()).rejects.toThrow("Connection failed");
    });
  });

  describe("authorizePopup", () => {
    it("should throw error if not initialized", async () => {
      await expect(service.authorizePopup()).rejects.toThrow(
        "WaypointService no está inicializado",
      );
    });

    it("should call authorize with correct parameters and default scopes", async () => {
      const { authorize } = await import("@sky-mavis/waypoint");

      service.initialize(mockConfig);
      const result = await service.authorizePopup();

      expect(authorize).toHaveBeenCalledWith({
        mode: "popup",
        clientId: mockConfig.clientId,
        scopes: ["openid", "wallet"],
      });

      expect(result?.address).toBe(
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      );
      expect(result?.token).toBe("mock-token");
    });

    it("should call authorize with custom scopes", async () => {
      const { authorize } = await import("@sky-mavis/waypoint");

      service.initialize(mockConfig);
      await service.authorizePopup(["openid", "profile", "email"]);

      expect(authorize).toHaveBeenCalledWith({
        mode: "popup",
        clientId: mockConfig.clientId,
        scopes: ["openid", "profile", "email"],
      });
    });

    it("should handle authorization errors", async () => {
      const { authorize } = await import("@sky-mavis/waypoint");

      (authorize as any).mockRejectedValueOnce(new Error("User cancelled"));

      service.initialize(mockConfig);

      await expect(service.authorizePopup()).rejects.toThrow("User cancelled");
    });
  });

  describe("authorizeRedirect", () => {
    it("should throw error if not initialized", () => {
      expect(() => service.authorizeRedirect()).toThrow(
        "WaypointService no está inicializado",
      );
    });

    it("should call authorize with redirect mode and correct parameters", async () => {
      const { authorize } = await import("@sky-mavis/waypoint");

      service.initialize(mockConfig);
      service.authorizeRedirect(["openid", "wallet"], "test-state");

      expect(authorize).toHaveBeenCalledWith({
        mode: "redirect",
        clientId: mockConfig.clientId,
        redirectUrl: mockConfig.redirectUrl,
        scopes: ["openid", "wallet"],
        state: "test-state",
      });
    });

    it("should use default scopes if none provided", async () => {
      const { authorize } = await import("@sky-mavis/waypoint");

      service.initialize(mockConfig);
      service.authorizeRedirect();

      expect(authorize).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "redirect",
          scopes: ["openid", "wallet"],
        }),
      );
    });
  });

  describe("disconnect", () => {
    it("should not throw if provider is null", () => {
      expect(() => service.disconnect()).not.toThrow();
    });

    it("should call provider.disconnect when initialized", async () => {
      service.initialize(mockConfig);
      const provider = service.getProvider();

      // Spy en el método disconnect del provider
      const disconnectSpy = vi.spyOn(provider, "disconnect");

      service.disconnect();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe("getProvider", () => {
    it("should return provider with required methods after initialization", () => {
      service.initialize(mockConfig);
      const provider = service.getProvider();

      expect(provider).toBeDefined();
      expect(typeof provider).toBe("object");
      expect(provider).toHaveProperty("connect");
      expect(provider).toHaveProperty("disconnect");
      expect(provider).toHaveProperty("request");
      expect(typeof provider.connect).toBe("function");
      expect(typeof provider.disconnect).toBe("function");
      expect(typeof provider.request).toBe("function");
    });

    it("should throw if not initialized", () => {
      expect(() => service.getProvider()).toThrow(
        "WaypointService no está inicializado",
      );
    });

    it("should return the same provider instance on multiple calls", () => {
      service.initialize(mockConfig);

      const provider1 = service.getProvider();
      const provider2 = service.getProvider();

      expect(provider1).toBe(provider2);
    });
  });

  describe("singleton instance", () => {
    it("waypointService should be a singleton", () => {
      expect(waypointService).toBeInstanceOf(WaypointService);
    });

    it("should maintain state across imports", () => {
      waypointService.initialize(mockConfig);

      const config = waypointService.getConfig();
      expect(config?.clientId).toBe(mockConfig.clientId);

      waypointService.reset();
    });
  });

  describe("reset", () => {
    it("should reset service state", () => {
      service.initialize(mockConfig);
      expect(service.isConnected()).toBe(true);

      service.reset();

      expect(service.isConnected()).toBe(false);
      expect(service.getConfig()).toBeNull();
      expect(() => service.getProvider()).toThrow();
    });
  });
});
