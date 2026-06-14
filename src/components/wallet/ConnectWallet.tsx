"use client";

import { TantoConnectButton } from "@sky-mavis/tanto-widget";
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  Wallet,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";

export const ConnectWallet: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  const [showDropdown, setShowDropdown] = useState(false);
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

  // Not connected - Tanto Widget modal (Ronin Wallet + Waypoint)
  if (!isConnected) {
    return (
      <TantoConnectButton>
        {({ showModal, modalOpen }) => (
          <button
            type="button"
            onClick={showModal}
            disabled={modalOpen}
            className="scorch-nav-link scorch-nav-link--wallet disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wallet className="h-4 w-4" />
            <span className="scorch-nav-label">
              [ {modalOpen ? "Connecting" : "Connect Wallet"} ]
            </span>
          </button>
        )}
      </TantoConnectButton>
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
