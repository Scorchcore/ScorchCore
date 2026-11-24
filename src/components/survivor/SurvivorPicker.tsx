"use client";

import { getAccount } from "wagmi/actions";
import { useEffect, useRef, useState } from "react";
import { erc721Abi, isAddressEqual } from "viem";
import { useAccount, useConfig, usePublicClient, useSwitchChain } from "wagmi";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import {
  CONTRACT_ADDRESSES,
  DEPLOYMENT_INFO,
} from "@/lib/config/deployment.config";
import type { CoreMinerNFT } from "@/lib/facades/NFTFacade";
import { useUserMiners } from "@/lib/queries/useUserMiners";
import { SURVIVOR_ORIGIN, type SurvivorSession } from "@/lib/survivor/session";

const chainId = DEPLOYMENT_INFO.chainId;
const contract = CONTRACT_ADDRESSES.CoreMinerNFTV2;

export function SurvivorPicker({
  session,
  onClose,
}: {
  session: SurvivorSession;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const alive = useRef(false);
  const busy = useRef(false);
  const { address, chainId: connectedChain } = useAccount();
  const config = useConfig();
  const client = usePublicClient({ chainId });
  const { switchChain, error: switchError } = useSwitchChain();
  const inventory = useUserMiners();
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const miners = (inventory.data ?? []).filter(
    (m) =>
      m.category === 0 &&
      Number.isInteger(m.minerType) &&
      m.minerType >= 0 &&
      m.minerType < 9 &&
      Number.isInteger(m.minerIndex) &&
      m.minerIndex >= 0 &&
      m.minerIndex < 7,
  );

  useEffect(() => {
    alive.current = true;
    const element = dialog.current;
    element?.showModal();
    return () => {
      alive.current = false;
      element?.close();
    };
  }, []);

  function cancel() {
    alive.current = false;
    session.game.postMessage(
      { type: "survivor.cancel.v1", nonce: session.nonce },
      SURVIVOR_ORIGIN,
    );
    onClose();
  }

  async function choose(miner: CoreMinerNFT) {
    if (!client || !address || busy.current) return;
    busy.current = true;
    setPending(true);
    setStatus("Checking ownership on Ronin Saigon…");
    try {
      const owner = await client.readContract({
        address: contract,
        abi: erc721Abi,
        functionName: "ownerOf",
        args: [miner.tokenId],
      });
      const current = getAccount(config);
      if (!alive.current) return;
      if (
        current.chainId !== chainId ||
        !current.address ||
        !isAddressEqual(current.address, address) ||
        !isAddressEqual(owner, address)
      ) {
        setStatus(
          "This wallet no longer holds this CoreMiner on Ronin Saigon.",
        );
        void inventory.refetch();
        return;
      }
      if (session.game.closed) {
        setStatus("The game tab was closed. Open Survivor again.");
        return;
      }
      session.game.postMessage(
        {
          type: "survivor.miner.v1",
          nonce: session.nonce,
          chainId,
          contract,
          owner: address,
          tokenId: miner.tokenId.toString(),
          category: miner.category,
          minerType: miner.minerType,
          minerIndex: miner.minerIndex,
        },
        SURVIVOR_ORIGIN,
      );
      session.game.focus();
      onClose();
    } catch {
      if (alive.current)
        setStatus("Could not verify this CoreMiner. Try again.");
    } finally {
      busy.current = false;
      if (alive.current) setPending(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="survivor-picker-title"
      onCancel={(event) => {
        event.preventDefault();
        cancel();
      }}
      className="fixed inset-0 m-auto max-h-[85svh] w-[min(92vw,30rem)] overflow-auto rounded-xl border border-cyan-300/40 bg-zinc-950 p-6 text-left text-white backdrop:bg-black/75"
    >
      <h2 id="survivor-picker-title" className="text-xl font-bold">
        Play with your CoreMiner
      </h2>
      <p className="my-3">
        Choose a Petit to share its token ID and your public wallet address with
        Survivor for this expedition.
      </p>
      <ConnectWallet />
      {address &&
        (connectedChain !== chainId ? (
          <>
            <button
              type="button"
              className="my-3 underline"
              onClick={() => switchChain({ chainId })}
            >
              Switch to Ronin Saigon
            </button>
            {switchError && <p>Could not switch networks.</p>}
          </>
        ) : (
          <section className="my-4">
            {inventory.isLoading && <p>Loading your CoreMiners…</p>}
            {inventory.isError && (
              <button type="button" onClick={() => void inventory.refetch()}>
                Could not load inventory. Retry
              </button>
            )}
            {inventory.isSuccess && !miners.length && (
              <p>No playable Petit CoreMiners in this wallet.</p>
            )}
            <ul>
              {miners.map((m) => (
                <li key={m.tokenId.toString()}>
                  <button
                    type="button"
                    disabled={pending}
                    className="my-1 w-full rounded border border-cyan-300/40 p-2 text-left disabled:opacity-60"
                    onClick={() => void choose(m)}
                  >
                    {m.name} · #{m.tokenId.toString()}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      <p role="status">{status}</p>
      <button type="button" className="mt-4 underline" onClick={cancel}>
        Cancel
      </button>
    </dialog>
  );
}
