"use client";

import { useTantoModal } from "@sky-mavis/tanto-widget";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { useWhitelistRegistration } from "@/lib/hooks/whitelist/useWhitelistRegistration";

export default function WhitelistSection() {
  const {
    email,
    setEmail,
    twitterHandle,
    setTwitterHandle,
    submitStatus,
    errorMessage,
    validationError,
    submitRegistration,
  } = useWhitelistRegistration();
  const { address, isConnected } = useWallet();
  const { show: showConnectModal } = useTantoModal();
  const [triedSubmit, setTriedSubmit] = useState(false);

  useEffect(() => {
    if (triedSubmit && isConnected && address) {
      setTriedSubmit(false);
      submitRegistration(address);
    }
  }, [triedSubmit, isConnected, address, submitRegistration]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setTriedSubmit(true);
      showConnectModal();
      return;
    }
    if (address) {
      submitRegistration(address);
    }
  };

  return (
    <section
      id="whitelist"
      className="relative isolate overflow-hidden bg-deep-abyss py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(240,106,18,0.08),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-xl px-5 md:px-8">
        <div className="relative overflow-hidden border border-cyan-100/12 bg-black/42 p-8 backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,0.28)] md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-orange-500/6 via-transparent to-cyan-300/3" />
          <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/45 to-transparent" />

          <div className="relative">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-magma-gold/35 bg-orange-500/8">
                <Shield className="h-5 w-5 text-magma-gold" />
              </div>
              <h2 className="alchemy-heading text-2xl md:text-3xl">
                Early Access
              </h2>
            </div>
            <p className="alchemy-copy mb-8 text-sm leading-6 text-cyan-50/55">
              ScorchCore is currently in testnet. Join the whitelist to secure
              your spot for mainnet launch and get early access to new features.
            </p>

            {submitStatus === "success" ? (
              <div className="flex flex-col items-center gap-3 border border-emerald-400/25 bg-emerald-500/8 px-6 py-8 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
                <p className="text-sm text-emerald-300">
                  You're on the list, Prospector. We'll be in touch.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="relative space-y-5">
                <div>
                  <label
                    htmlFor="wl-wallet"
                    className="alchemy-eyebrow mb-2 block text-[0.65rem] font-semibold uppercase tracking-wider text-cyan-50/45"
                  >
                    Wallet Address
                  </label>
                  {isConnected && address ? (
                    <code
                      id="wl-wallet"
                      className="block w-full border border-cyan-100/10 bg-black/40 px-3 py-2.5 text-xs text-cyan-50/50"
                    >
                      {address}
                    </code>
                  ) : (
                    <div className="flex items-center gap-2 border border-cyan-100/10 bg-black/30 px-3 py-2.5 text-xs text-cyan-50/40">
                      <Wallet className="h-3.5 w-3.5" />
                      Not connected — will connect on submit
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="wl-email"
                    className="alchemy-eyebrow mb-2 block text-[0.65rem] font-semibold uppercase tracking-wider text-cyan-50/45"
                  >
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="wl-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prospector@example.com"
                    className="w-full border border-cyan-100/12 bg-black/42 px-3 py-2.5 text-sm text-white placeholder:text-cyan-50/20 outline-none transition-colors focus:border-ethereal-cyan/45"
                  />
                </div>

                <div>
                  <label
                    htmlFor="wl-twitter"
                    className="alchemy-eyebrow mb-2 block text-[0.65rem] font-semibold uppercase tracking-wider text-cyan-50/45"
                  >
                    Twitter / X{" "}
                    <span className="text-cyan-50/25">(optional)</span>
                  </label>
                  <input
                    id="wl-twitter"
                    type="text"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="@handle"
                    className="w-full border border-cyan-100/12 bg-black/42 px-3 py-2.5 text-sm text-white placeholder:text-cyan-50/20 outline-none transition-colors focus:border-ethereal-cyan/45"
                  />
                </div>

                {(validationError || errorMessage) && (
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {validationError || errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitStatus === "loading"}
                  className="w-full border border-magma-gold/55 bg-orange-500/14 py-3 text-xs font-semibold uppercase tracking-wider text-magma-gold shadow-[0_0_20px_rgba(240,106,18,0.12)] transition-all hover:border-magma-gold hover:bg-orange-500/22 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitStatus === "loading" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registering...
                    </span>
                  ) : !isConnected ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Connect Wallet & Join
                    </span>
                  ) : (
                    "Join the Whitelist"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
