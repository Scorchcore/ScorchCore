"use client";

import { Gift, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { Loading } from "@/components/ui";
import { useAirdrop } from "@/lib/hooks/economy/useAirdrop";
import { useWallet } from "@/lib/hooks/user/useWallet";
import type { AirdropCampaignState } from "@/lib/services/AirdropService";

const configuredIds = (process.env.NEXT_PUBLIC_AIRDROP_CAMPAIGN_IDS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .map(BigInt);

export default function AirdropPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { getCampaign, claimAirdrop, isLoading, error } = useAirdrop();
  const [campaigns, setCampaigns] = useState<AirdropCampaignState[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [claimData, setClaimData] = useState<
    Record<string, { amount: string; proof: string }>
  >({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const results = await Promise.all(configuredIds.map(getCampaign));
      setCampaigns(
        results.filter((campaign): campaign is AirdropCampaignState =>
          Boolean(campaign),
        ),
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [getCampaign]);

  useEffect(() => {
    if (isConnected) void refresh();
  }, [isConnected, refresh]);

  if (!isConnected) return <Loading />;

  return (
    <main className="min-h-screen bg-deep-abyss text-white">
      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(125,249,255,0.1),transparent_30%),radial-gradient(circle_at_15%_45%,rgba(240,106,18,0.1),transparent_28%)]" />
        <div className="relative">
          <Link
            href="/dashboard"
            className="text-xs font-semibold uppercase tracking-wider text-cyan-50/55 hover:text-cyan-50"
          >
            Back to dashboard
          </Link>
          <header className="mt-5 flex flex-col gap-5 border-b border-cyan-100/10 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Gift className="h-8 w-8 text-magma-gold" />
                <h1 className="alchemy-heading text-3xl md:text-4xl">
                  fCORE Airdrops
                </h1>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50/55">
                Claim Merkle-based Phase 6 campaigns configured for this
                deployment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 border border-cyan-100/15 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-50/70 hover:border-ethereal-cyan/45 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </header>

          {configuredIds.length === 0 && (
            <section className="mt-8 border border-magma-gold/25 bg-orange-500/8 p-6">
              <h2 className="alchemy-heading text-lg text-magma-gold">
                No active campaign configured
              </h2>
              <p className="mt-2 text-sm leading-6 text-cyan-50/55">
                Phase 6B is deployed but inactive. Set
                NEXT_PUBLIC_AIRDROP_CAMPAIGN_IDS after a campaign is activated
                on Saigon.
              </p>
            </section>
          )}

          <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => {
              const id = campaign.campaignId.toString();
              const data = claimData[id] ?? { amount: "", proof: "" };
              const now = BigInt(Math.floor(Date.now() / 1000));
              const active =
                !campaign.paused &&
                now >= campaign.startTime &&
                now <= campaign.endTime;
              return (
                <article
                  key={id}
                  className="relative overflow-hidden border border-cyan-100/12 bg-black/42 p-5"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-magma-gold/55 to-transparent" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="alchemy-heading text-lg">Campaign {id}</h2>
                      <p className="mt-1 text-xs text-cyan-50/45">
                        {formatUnits(campaign.claimedAmount, 18)} /{" "}
                        {formatUnits(campaign.totalAllocation, 18)} fCORE
                        claimed
                      </p>
                    </div>
                    <span
                      className={`border px-2 py-1 text-[0.65rem] font-bold uppercase ${active ? "border-emerald-400/35 text-emerald-300" : "border-cyan-100/12 text-cyan-50/40"}`}
                    >
                      {active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <input
                      aria-label="Claim amount in wei"
                      placeholder="Amount in wei"
                      value={data.amount}
                      onChange={(event) =>
                        setClaimData((current) => ({
                          ...current,
                          [id]: { ...data, amount: event.target.value },
                        }))
                      }
                      className="w-full border border-cyan-100/12 bg-black/45 px-3 py-2 text-sm text-white outline-none focus:border-ethereal-cyan/45"
                    />
                    <textarea
                      aria-label="Merkle proof"
                      placeholder="Merkle proof, comma separated"
                      value={data.proof}
                      onChange={(event) =>
                        setClaimData((current) => ({
                          ...current,
                          [id]: { ...data, proof: event.target.value },
                        }))
                      }
                      className="min-h-20 w-full border border-cyan-100/12 bg-black/45 px-3 py-2 text-sm text-white outline-none focus:border-ethereal-cyan/45"
                    />
                    <button
                      type="button"
                      disabled={
                        !active ||
                        campaign.hasClaimed ||
                        !data.amount ||
                        isLoading
                      }
                      onClick={async () => {
                        await claimAirdrop({
                          campaignId: campaign.campaignId,
                          amount: BigInt(data.amount),
                          proof: data.proof
                            .split(",")
                            .map((value) => value.trim())
                            .filter(Boolean),
                        });
                        setMessage("Airdrop claimed");
                        await refresh();
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 border border-magma-gold/45 bg-orange-500/12 px-4 py-3 text-xs font-bold uppercase tracking-wider text-magma-gold disabled:opacity-30"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Gift className="h-4 w-4" />
                      )}
                      {campaign.hasClaimed ? "Already claimed" : "Claim fCORE"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          {(message || error) && (
            <div
              className={`mt-6 border p-4 text-sm ${error ? "border-red-400/35 text-red-300" : "border-emerald-400/35 text-emerald-300"}`}
            >
              {error?.message ?? message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
