"use client";



import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { HalvingCountdown } from "@/components/emission/HalvingCountdown";
import { BuyBackDashboard } from "@/components/buyback/BuyBackDashboard";
import { TokenPriceCard, TokenConverterWidget } from "@/components/price";
import { useEmissionSchedule } from "@/lib/hooks/economy/useEmissionSchedule";
import { Loading } from "@/components/ui";
import { EmissionScheduleCard } from "@/components/emission";

export default function EconomyPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { info: emissionInfo, isLoading: emissionLoading } =
    useEmissionSchedule();

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
          <h1 className="text-4xl font-bold mb-2">📈 Economía del Proyecto</h1>
          <p className="text-gray-400">
            Transparencia y métricas del ecosistema ScorchCore
          </p>
        </div>

        {/* Price and Converter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TokenPriceCard showStats={true} />
          <TokenConverterWidget />
        </div>

        {/* Emission Schedule */}
        <div className="mb-8">
          {emissionLoading ? (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
              <Loading />
            </div>
          ) : emissionInfo ? (
            <EmissionScheduleCard info={emissionInfo} />
          ) : (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center text-gray-400">
              No se pudo cargar la información de emisión
            </div>
          )}
        </div>

        {/* BuyBack Fund Dashboard */}
        <BuyBackDashboard />

        {/* TODO: Futuras secciones */}
        {/* <TokenomicsOverview /> */}
        {/* <TreasuryInfo /> */}
      </div>
    </div>
  );
}
