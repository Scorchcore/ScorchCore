"use client";

import { GraduationCap, Handshake, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loading } from "@/components/ui";
import type { ActiveLoan, LoanOffer } from "@/lib/contracts/interfaces";
import { useScholarship } from "@/lib/hooks/user/useScholarship";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { useUserMiners } from "@/lib/queries";

export default function ScholarshipPage() {
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const { data: miners = [] } = useUserMiners();
  const scholarship = useScholarship();
  const {
    getAvailableLoans,
    getLenderLoans,
    getScholarLoans,
    getLoanOffer,
    getActiveLoan,
  } = scholarship;
  const [availableIds, setAvailableIds] = useState<bigint[]>([]);
  const [lenderIds, setLenderIds] = useState<bigint[]>([]);
  const [scholarIds, setScholarIds] = useState<bigint[]>([]);
  const [offers, setOffers] = useState<Record<string, LoanOffer>>({});
  const [loans, setLoans] = useState<Record<string, ActiveLoan>>({});
  const [selectedMiner, setSelectedMiner] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [lenderShare, setLenderShare] = useState(50);
  const [tab, setTab] = useState<"market" | "lender" | "scholar">("market");
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  const refresh = useCallback(async () => {
    if (!address) return;
    setIsRefreshing(true);
    try {
      const [available, lender, scholar] = await Promise.all([
        getAvailableLoans(),
        getLenderLoans(),
        getScholarLoans(),
      ]);
      setAvailableIds(available);
      setLenderIds(lender);
      setScholarIds(scholar);
      const ids = [
        ...new Set([...available, ...lender, ...scholar].map(String)),
      ].map(BigInt);
      const [nextOffers, nextLoans] = await Promise.all([
        Promise.all(
          ids.map(async (id) => [String(id), await getLoanOffer(id)] as const),
        ),
        Promise.all(
          ids.map(async (id) => [String(id), await getActiveLoan(id)] as const),
        ),
      ]);
      setOffers(Object.fromEntries(nextOffers));
      setLoans(Object.fromEntries(nextLoans));
    } finally {
      setIsRefreshing(false);
    }
  }, [
    address,
    getActiveLoan,
    getAvailableLoans,
    getLenderLoans,
    getLoanOffer,
    getScholarLoans,
  ]);

  useEffect(() => {
    if (isConnected) void refresh();
  }, [isConnected, refresh]);

  if (!isConnected) return <Loading />;

  const ids =
    tab === "market" ? availableIds : tab === "lender" ? lenderIds : scholarIds;

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
                <GraduationCap className="h-8 w-8 text-magma-gold" />
                <h1 className="alchemy-heading text-3xl md:text-4xl">
                  Scholarships
                </h1>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50/55">
                Lend CoreMiners, borrow available miners, and split mining
                rewards directly in fCORE.
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
              />{" "}
              Refresh
            </button>
          </header>

          <section className="mt-8 border border-cyan-100/12 bg-black/42 p-5">
            <h2 className="alchemy-heading text-lg">List a CoreMiner</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <select
                value={selectedMiner}
                onChange={(event) => setSelectedMiner(event.target.value)}
                className="border border-cyan-100/12 bg-black/45 px-3 py-2 text-sm text-white"
              >
                <option value="">Select miner</option>
                {miners.map((miner) => (
                  <option
                    key={miner.tokenId.toString()}
                    value={miner.tokenId.toString()}
                  >
                    CoreMiner {miner.tokenId.toString()}
                  </option>
                ))}
              </select>
              <input
                aria-label="Loan duration in days"
                type="number"
                min={7}
                max={90}
                value={durationDays}
                onChange={(event) =>
                  setDurationDays(Number(event.target.value))
                }
                className="border border-cyan-100/12 bg-black/45 px-3 py-2 text-sm text-white"
              />
              <input
                aria-label="Lender reward share"
                type="number"
                min={30}
                max={70}
                value={lenderShare}
                onChange={(event) => setLenderShare(Number(event.target.value))}
                className="border border-cyan-100/12 bg-black/45 px-3 py-2 text-sm text-white"
              />
              <button
                type="button"
                disabled={!selectedMiner || scholarship.isLoading}
                onClick={async () => {
                  await scholarship.listForLending(
                    BigInt(selectedMiner),
                    BigInt(durationDays * 86400),
                    lenderShare * 100,
                  );
                  setMessage("CoreMiner listed");
                  setSelectedMiner("");
                  await refresh();
                }}
                className="inline-flex items-center justify-center gap-2 border border-magma-gold/45 bg-orange-500/12 px-4 py-2 text-xs font-bold uppercase tracking-wider text-magma-gold disabled:opacity-30"
              >
                {scholarship.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Handshake className="h-4 w-4" />
                )}{" "}
                List
              </button>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-2">
            {(["market", "lender", "scholar"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`border px-4 py-2 text-xs font-bold uppercase tracking-wider ${tab === value ? "border-magma-gold/65 bg-orange-500/12 text-magma-gold" : "border-cyan-100/12 text-cyan-50/50"}`}
              >
                {value}
              </button>
            ))}
          </div>

          <section className="mt-4 grid gap-4 md:grid-cols-2">
            {ids.length === 0 && (
              <div className="border border-cyan-100/10 bg-black/35 p-6 text-sm text-cyan-50/45">
                No scholarships found.
              </div>
            )}
            {ids.map((minerId) => {
              const id = minerId.toString();
              const offer = offers[id];
              const loan = loans[id];
              return (
                <article
                  key={id}
                  className="relative overflow-hidden border border-cyan-100/12 bg-black/42 p-5"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-magma-gold/55 to-transparent" />
                  <h2 className="alchemy-heading text-lg">CoreMiner {id}</h2>
                  <p className="mt-2 text-xs text-cyan-50/45">
                    {loan?.active
                      ? `Active with ${loan.scholar.slice(0, 8)}…`
                      : offer
                        ? `${offer.lenderShareBps / 100}% lender share`
                        : "Loan data unavailable"}
                  </p>
                  <div className="mt-5 flex gap-2">
                    {tab === "market" && (
                      <button
                        type="button"
                        disabled={scholarship.isLoading}
                        onClick={async () => {
                          await scholarship.acceptLoan(minerId);
                          setMessage("Loan accepted");
                          await refresh();
                        }}
                        className="border border-ethereal-cyan/35 px-4 py-2 text-xs font-bold uppercase text-ethereal-cyan"
                      >
                        Accept
                      </button>
                    )}
                    {tab === "lender" && !loan?.active && (
                      <button
                        type="button"
                        onClick={async () => {
                          await scholarship.cancelListing(minerId);
                          setMessage("Listing cancelled");
                          await refresh();
                        }}
                        className="border border-red-400/35 px-4 py-2 text-xs font-bold uppercase text-red-300"
                      >
                        Cancel
                      </button>
                    )}
                    {loan?.active && (
                      <button
                        type="button"
                        onClick={async () => {
                          await scholarship.endLoan(loan);
                          setMessage("Loan ended");
                          await refresh();
                        }}
                        className="border border-magma-gold/35 px-4 py-2 text-xs font-bold uppercase text-magma-gold"
                      >
                        End loan
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          {(message || scholarship.error) && (
            <div
              className={`mt-6 border p-4 text-sm ${scholarship.error ? "border-red-400/35 text-red-300" : "border-emerald-400/35 text-emerald-300"}`}
            >
              {scholarship.error?.message ?? message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
