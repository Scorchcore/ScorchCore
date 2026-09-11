import { useCallback, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import type { ActiveLoan, LoanOffer } from "@/lib/contracts/interfaces";
import { ScholarshipService } from "@/lib/services/ScholarshipService";
import { useContractManager } from "../contracts/useContractManager";

export type { ActiveLoan, LoanOffer };

export function useScholarship() {
  const { address } = useAccount();
  const { contractManager } = useContractManager();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const service = useMemo(
    () => new ScholarshipService(contractManager),
    [contractManager],
  );
  const manager = useCallback(
    () => contractManager.getScholarshipManager(),
    [contractManager],
  );

  const getLoanOffer = useCallback(
    (minerId: bigint): Promise<LoanOffer> => manager().getLoanOffer(minerId),
    [manager],
  );
  const getActiveLoan = useCallback(
    (minerId: bigint): Promise<ActiveLoan> => manager().getActiveLoan(minerId),
    [manager],
  );
  const getAvailableLoans = useCallback(
    () => manager().getAvailableLoans(),
    [manager],
  );
  const getLenderLoans = useCallback(
    () => (address ? manager().getLenderLoans(address) : Promise.resolve([])),
    [address, manager],
  );
  const getScholarLoans = useCallback(
    () => (address ? manager().getScholarLoans(address) : Promise.resolve([])),
    [address, manager],
  );

  const run = useCallback(async <T>(operation: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      return await operation();
    } catch (caught) {
      const nextError =
        caught instanceof Error ? caught : new Error(String(caught));
      setError(nextError);
      throw nextError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    listForLending: (
      minerId: bigint,
      duration: bigint,
      lenderShareBps: number,
    ) => {
      if (!address) return Promise.reject(new Error("Wallet not connected"));
      return run(() =>
        service.listForLending(address, minerId, duration, lenderShareBps),
      );
    },
    cancelListing: (minerId: bigint) =>
      run(() => manager().cancelListing(minerId)),
    acceptLoan: (minerId: bigint) => run(() => manager().acceptLoan(minerId)),
    endLoan: (loan: ActiveLoan) => {
      if (!address) return Promise.reject(new Error("Wallet not connected"));
      return run(() => service.endLoan(address, loan));
    },
    isInLoan: (minerId: bigint) => manager().isInLoan(minerId),
    getLoanOffer,
    getActiveLoan,
    getAvailableLoans,
    getLenderLoans,
    getScholarLoans,
    setDurationLimits: (min: bigint, max: bigint) =>
      run(() => manager().setDurationLimits(min, max)),
    setShareLimits: (min: bigint, max: bigint) =>
      run(() => manager().setShareLimits(min, max)),
    isLoading,
    error,
  };
}

export default useScholarship;
