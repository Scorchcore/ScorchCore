"use client";

import { useCallback, useState } from "react";
import { registerToWhitelist } from "@/app/actions/whitelist";

export type SubmitStatus = "idle" | "loading" | "success" | "error";

export interface UseWhitelistRegistrationReturn {
  email: string;
  setEmail: (value: string) => void;
  twitterHandle: string;
  setTwitterHandle: (value: string) => void;
  submitStatus: SubmitStatus;
  errorMessage: string;
  validationError: string;
  submitRegistration: (address: string) => Promise<void>;
  handleSubmit: (e: React.FormEvent, address?: string) => Promise<void>;
}

export function useWhitelistRegistration(): UseWhitelistRegistrationReturn {
  const [email, setEmail] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  const submitRegistration = useCallback(
    async (address: string) => {
      if (!email.trim()) {
        setValidationError("Email is required");
        setSubmitStatus("error");
        return;
      }

      setSubmitStatus("loading");
      setErrorMessage("");
      setValidationError("");

      const result = await registerToWhitelist({
        walletAddress: address as `0x${string}`,
        email: email.trim(),
        twitterHandle: twitterHandle.trim(),
      });

      if (result.success) {
        setSubmitStatus("success");
        setEmail("");
        setTwitterHandle("");
      } else {
        setSubmitStatus("error");
        setErrorMessage(result.error || "Something went wrong. Try again.");
      }
    },
    [email, twitterHandle],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent, address?: string) => {
      e.preventDefault();
      if (!address) return;
      await submitRegistration(address);
    },
    [submitRegistration],
  );

  return {
    email,
    setEmail,
    twitterHandle,
    setTwitterHandle,
    submitStatus,
    errorMessage,
    validationError,
    submitRegistration,
    handleSubmit,
  };
}
