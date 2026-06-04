"use server";

import { z } from "zod";
import { getSupabaseClient } from "@/lib/config/supabase";

const schema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  email: z.string().email().optional().or(z.literal("")),
  twitterHandle: z.string().max(50).optional().or(z.literal("")),
});

export async function registerToWhitelist(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { walletAddress, email, twitterHandle } = parsed.data;

  const supabase = getSupabaseClient();

  const { error } = await supabase.from("whitelist").upsert(
    {
      wallet_address: walletAddress.toLowerCase(),
      email: email || null,
      twitter_handle: twitterHandle || null,
    },
    { onConflict: "wallet_address", ignoreDuplicates: false },
  );

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function isWalletWhitelisted(walletAddress: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("whitelist")
    .select("status")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (error || !data) return false;
  return data.status === "approved";
}
