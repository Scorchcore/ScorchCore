"use client";

import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  KeyRound,
  LogOut,
  Wallet,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";

export const ConnectWallet: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-orange-300/25 bg-black/45 text-magma-gold">
                      {connector.name === "Waypoint" ? (
                        <KeyRound className="h-5 w-5" />
                      ) : (
                        <Wallet className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-white">{connector.name}</p>
                      <p className="text-xs text-cyan-100/55">
                        {connector.name === "Ronin Wallet"
                          ? "Browser extension or mobile app"
                          : connector.name === "Waypoint"
                            ? "Email or social login"
                            : "Connect with wallet"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
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
                  className={`rounded-full border px-2 py-0.5 text-xs ${
                    chain?.id === 2020
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
