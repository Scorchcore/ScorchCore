"use client";

import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";

const RoninBadge = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute -bottom-0.5 -right-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
    aria-hidden="true"
  >
    <path
      d="M13 1H7a6 6 0 0 0-6 6v6a6 6 0 0 0 6 6h6a6 6 0 0 0 6-6V7a6 6 0 0 0-6-6"
      fill="#007FF5"
    />
    <path
      d="M13 1H7a6 6 0 0 0-6 6v6a6 6 0 0 0 6 6h6a6 6 0 0 0 6-6V7a6 6 0 0 0-6-6Z"
      stroke="#15181E"
      strokeWidth="2"
    />
    <path
      d="M13.998 8.388V6.13c0-.3-.135-.586-.375-.798A1.37 1.37 0 0 0 12.718 5H7.28c-.34 0-.665.119-.905.33-.24.213-.375.5-.375.8v6.554c0 .17.043.336.126.489s.204.286.354.392l1.98 1.404a.18.18 0 0 0 .17.018.16.16 0 0 0 .066-.053.13.13 0 0 0 .025-.076v-4.634q.001-.059.047-.1a.17.17 0 0 1 .113-.041h1.44c.254 0 .498.089.678.248a.8.8 0 0 1 .281.599v3.928a.13.13 0 0 0 .025.075q.025.035.066.053a.18.18 0 0 0 .169-.018l1.98-1.403c.15-.106.27-.24.354-.392a1 1 0 0 0 .126-.489v-2.036c0-.3-.135-.587-.375-.8a1.37 1.37 0 0 0-.905-.33c.34 0 .664-.12.904-.332.24-.211.374-.498.374-.798m-3.68.565H8.88a.17.17 0 0 1-.113-.041.13.13 0 0 1-.047-.1V6.271q.001-.059.047-.1a.17.17 0 0 1 .113-.042h2.24a.17.17 0 0 1 .113.042q.046.041.046.1v1.835a.8.8 0 0 1-.28.6c-.18.158-.425.247-.68.247"
      fill="#fff"
    />
  </svg>
);

type ConnectorIconConfig = {
  src: string;
  showRoninBadge: boolean;
  label: string;
  description: string;
};

const CONNECTOR_ICON_MAP: Record<string, ConnectorIconConfig> = {
  ronin: {
    src: "/navbar/ronin_wallet.png",
    showRoninBadge: true,
    label: "Ronin Wallet",
    description: "Ronin Wallet extension",
  },
  roninWaypoint: {
    src: "/navbar/extension_email.png",
    showRoninBadge: true,
    label: "Waypoint",
    description: "Continue with Email",
  },
};

function getConnectorConfig(id: string): ConnectorIconConfig | null {
  return CONNECTOR_ICON_MAP[id] ?? null;
}

const ConnectorIcon = ({ id, label }: { id: string; label: string }) => {
  const config = getConnectorConfig(id);

  if (!config) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-orange-300/25 bg-black/45 text-magma-gold">
        <Wallet className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="relative h-10 w-10 shrink-0">
      <Image src={config.src} alt={label} width={40} height={40} className="rounded-lg" />
      {config.showRoninBadge && <RoninBadge />}
    </div>
  );
};

export const ConnectWallet: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  const [showDropdown, setShowDropdown] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (value: bigint | undefined, decimals: number = 18) => {
    if (!value) return "0.00";
    const formatted = Number(value) / 10 ** decimals;
    return formatted.toFixed(4);
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getExplorerUrl = () => {
    if (!address || !chain) return "#";
    const baseUrl =
      chain.id === 2020
        ? "https://app.roninchain.com/address/"
        : "https://saigon-app.roninchain.com/address/";
    return `${baseUrl}${address}`;
  };

  // Not connected - show connect button
  if (!isConnected) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowConnectors(!showConnectors)}
          disabled={isPending}
          className="scorch-nav-link scorch-nav-link--wallet disabled:cursor-not-allowed disabled:opacity-50"
          aria-expanded={showConnectors}
        >
          <Wallet className="h-4 w-4" />
          <span className="scorch-nav-label">
            [ {isPending ? "Connecting" : "Connect Wallet"} ]
          </span>
        </button>

        {/* Connector Selection Modal */}
        {showConnectors && (
          <>
            <button
              type="button"
              aria-label="Close wallet connector menu"
              className="fixed inset-0 z-40"
              onClick={() => setShowConnectors(false)}
            />
            <div className="scorch-nav-panel absolute right-0 z-50 mt-3 w-72 overflow-hidden">
              <div className="border-b border-orange-500/15 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-magma-gold">
                  [ Connect Wallet ]
                </h3>
                <p className="mt-1 text-sm text-cyan-100/55">
                  Choose how you want to connect
                </p>
              </div>
              <div className="p-2">
                {connectors.map((connector) => (
                  <button
                    type="button"
                    key={connector.uid}
                    onClick={() => {
                      connect({ connector });
                      setShowConnectors(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-orange-300/35 hover:bg-orange-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                  >
                    <ConnectorIcon id={connector.id} label={connector.name} />
                    <div className="text-left">
                      <p className="font-medium text-white">{connector.name}</p>
                      <p className="text-xs text-cyan-100/55">
                        {getConnectorConfig(connector.id)?.description ?? "Connect with wallet"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {connectError && (
                <div className="border-t border-red-500/20 p-3">
                  <div className="flex items-start gap-2 rounded-md bg-red-500/10 p-2 text-xs text-red-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <span>{connectError.message || "Connection failed"}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Connected - show account info
  const shortAddress = address ? formatAddress(address) : "Unknown";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="scorch-nav-link scorch-nav-link--wallet"
        aria-expanded={showDropdown}
      >
        {/* Chain indicator */}
        <div
          className={`h-2 w-2 rounded-full ${chain?.id === 2020 ? "bg-cyan-400" : "bg-yellow-400"}`}
        />

        {/* Balance */}
        <span className="text-white font-medium hidden sm:block">
          {formatBalance(balance?.value)} {balance?.symbol || "RON"}
        </span>

        {/* Address */}
        <div className="rounded-md border border-orange-300/20 bg-black/50 px-2 py-1">
          <span className="text-sm text-cyan-50/80">{shortAddress}</span>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-magma-gold transition-transform ${showDropdown ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          <button
            type="button"
            aria-label="Close wallet menu"
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="scorch-nav-panel absolute right-0 z-50 mt-3 w-64 overflow-hidden">
            {/* Account Info */}
            <div className="border-b border-orange-500/15 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-cyan-100/55">Connected to</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs ${chain?.id === 2020
                    ? "border-cyan-300/35 bg-cyan-500/10 text-cyan-200"
                    : "border-yellow-300/35 bg-yellow-500/10 text-yellow-200"
                    }`}
                >
                  {chain?.name || "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-300/35 bg-orange-500/15 shadow-[0_0_18px_rgba(240,106,18,0.22)]">
                  <span className="text-sm font-bold text-magma-gold">
                    {address?.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{shortAddress}</p>
                  <p className="text-sm text-cyan-100/55">
                    {formatBalance(balance?.value)} {balance?.symbol || "RON"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                type="button"
                onClick={copyAddress}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-cyan-50/75 transition-colors hover:bg-orange-500/10 hover:text-magma-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {copied ? "Copied!" : "Copy Address"}
                </span>
              </button>

              <a
                href={getExplorerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-lg p-2 text-cyan-50/75 transition-colors hover:bg-orange-500/10 hover:text-magma-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">View on Explorer</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
