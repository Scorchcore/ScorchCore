"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { Loading } from "@/components/ui";
import { VestingDashboard } from "@/components/vesting";

export default function VestingPage() {
  const router = useRouter();
  const { isConnected } = useWallet();

  // Redirect si no está conectado (con delay)
  React.useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => {
        if (!isConnected) {
          router.push("/");
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4"
          >
            ← Volver al Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">🔒 Vesting Manager</h1>
          <p className="text-gray-400">
            Administra tus tokens bloqueados con liberación gradual
          </p>
        </div>

        {/* Vesting Dashboard */}
        <VestingDashboard />
      </div>
    </div>
  );
}
