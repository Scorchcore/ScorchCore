"use client";

import { useEffect, useState } from "react";
import ForgeProcess from "@/components/landing/ForgeProcess";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Transmute from "@/components/landing/Transmute";
import { Footer } from "@/components/layout";
import { useWallet } from "@/lib/hooks/user/useWallet";

export default function Home() {
  const [showBanner, setShowBanner] = useState(false);
  const { isConnected } = useWallet();

  // Mostrar banner por 5 segundos cuando se conecta
  useEffect(() => {
    if (isConnected) {
      setShowBanner(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000); // 5 segundos
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  return (
    <div className="bg-black text-white">
      {/* Banner temporal para usuarios conectados */}
      {showBanner && (
        <div className="sticky top-16 z-30 bg-linear-to-r from-orange-600 to-red-600 border-b border-orange-500 animate-in slide-in-from-top duration-300">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <p className="text-white font-medium">
                  ¡Wallet conectada! Puedes acceder a tu dashboard desde el
                  botón en el header
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                className="text-white hover:text-gray-200 shrink-0"
                aria-label="Cerrar banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <Hero />
      <Problem />
      <ForgeProcess />
      <Transmute />

      {/* Hero - Sé un Prospector
      little change of test
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-orange-950/20 to-black">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)',
              transform: `scale(${1 + scrollY * 0.0005})`,
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div style={{ opacity: Math.max(0, 1 - scrollY * 0.002), transform: `translateY(${scrollY * 0.5}px)` }}>
            <h1 className="text-7xl md:text-9xl font-bold mb-6 bg-linear-to-r from-orange-500 via-red-600 to-orange-500 bg-clip-text text-transparent">
              SÉ UN PROSPECTOR
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Despierta el poder dormido de Lunacia y forja un nuevo destino
            </p>
            <Button size="lg" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
              Descubre el Núcleo Ardiente 🔥
            </Button>
          </div>
          <div className="absolute bottom-[-150px] left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-orange-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section> */}

      {/* El Eco Silencioso
      <section className="relative min-h-screen flex items-center py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-95" />
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-center bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              El Eco Silencioso de Lunacia
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card variant="glass" className="p-8">
                <div className="text-6xl mb-4">⚔️</div>
                <h3 className="text-2xl font-bold text-orange-500 mb-4">
                  Eras de Gloria
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Tras eras de batallas gloriosas y aventuras que forjaron
                  leyendas, una extraña calma se asentó sobre Lunacia. Millones
                  de Axies, héroes de incontables contiendas, se encontraron sin
                  un propósito.
                </p>
              </Card>
              <Card variant="glass" className="p-8">
                <div className="text-6xl mb-4">💤</div>
                <h3 className="text-2xl font-bold text-orange-500 mb-4">
                  La Eco-Estasis
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Sus cantos de guerra se convirtieron en susurros. Su espíritu
                  de lucha, en un eco silencioso. Yacían en las billeteras de
                  sus custodios, no como guerreros, sino como reliquias.
                </p>
              </Card>
            </div>
            <Card variant="gradient" className="p-8 text-center">
              <p className="text-xl text-gray-300 italic">
                "Una energía latente, vasta e incalculable, se estaba
                desvaneciendo lentamente en la inacción. El mundo necesitaba un
                nuevo amanecer, una nueva razón para despertar."
              </p>
            </Card>
          </div>
        </div>
      </section> */}

      {/* El Descubrimiento del ScorchCore 
      <section className="relative min-h-screen flex items-center py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-orange-950/10 to-black" />
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-12 text-center bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              El Descubrimiento del ScorchCore
            </h2>
            <div className="mb-12">
              <Card variant="glass" className="p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-6xl">🔥</div>
                  <h3 className="text-3xl font-bold text-white">
                    El Núcleo Ardiente
                  </h3>
                </div>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  En las profundidades de las Grietas Olvidadas, los
                  Prospectores del Núcleo descubrieron una gigantesca geoda de
                  cristal que pulsaba con una luz naranja y cálida. No era una
                  simple piedra; era una fuente de energía pura, primordial, un
                  corazón latente bajo la superficie del mundo.
                </p>
                <div className="border-l-4 border-orange-500 pl-6 py-4 bg-orange-950/20 rounded-r-lg">
                  <p className="text-gray-200 font-medium">
                    Lo llamaron el{" "}
                    <span className="text-orange-500 font-bold">
                      ScorchCore
                    </span>
                    , el Núcleo Ardiente.
                  </p>
                </div>
              </Card>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card variant="bordered" hover className="p-6 text-center">
                <div className="text-5xl mb-4">📜</div>
                <h4 className="text-xl font-bold text-orange-500 mb-3">
                  Glifos Antiguos
                </h4>
                <p className="text-gray-400 text-sm">
                  Recetas sagradas de una ciencia perdida: la Elemental Forge
                </p>
              </Card>
              <Card variant="bordered" hover className="p-6 text-center">
                <div className="text-5xl mb-4">⚗️</div>
                <h4 className="text-xl font-bold text-orange-500 mb-3">
                  Alquimia del Renacer
                </h4>
                <p className="text-gray-400 text-sm">
                  No destrucción, sino sublime transformación del espíritu
                </p>
              </Card>
              <Card variant="bordered" hover className="p-6 text-center">
                <div className="text-5xl mb-4">💎</div>
                <h4 className="text-xl font-bold text-orange-500 mb-3">
                  CoreMiners
                </h4>
                <p className="text-gray-400 text-sm">
                  La continuación del legado en forma más pura y energética
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
*/}
      {/* La Forja 
      <section className="relative min-h-screen flex items-center py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black" />
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-12 text-center bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              El Laboratorio del Corazón Ardiente
            </h2>
            <Card variant="gradient" className="p-10 mb-12">
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">🏛️</div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Scorch Heart-Lab
                </h3>
                <p className="text-gray-300 text-lg">
                  Un santuario de alquimia donde la tecnología arcana y la magia
                  natural se entrelazan
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-black/40 rounded-lg p-6 border border-orange-500/30">
                  <h4 className="text-xl font-bold text-orange-500 mb-4 flex items-center gap-2">
                    <span>🔨</span> Fase 1: La Forja
                  </h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>Selecciona tus Axies dormidos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>Añade SLP y recursos necesarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>Usa Mementos para garantizar el éxito</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>Crea una Geoda Cristalina NFT</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-black/40 rounded-lg p-6 border border-red-500/30">
                  <h4 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                    <span>✨</span> Fase 2: La Eclosión
                  </h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Incuba tu Geoda Cristalina</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>7 posibles CoreMiners por tipo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>1% probabilidad de Crítico</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Activa tu CoreMiner y empieza a minar</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
            <div className="grid md:grid-cols-3 gap-6">
              <Card variant="glass" className="p-6">
                <div className="text-4xl mb-3">⛏️</div>
                <h4 className="text-lg font-bold text-orange-500 mb-2">
                  Minería de $CORE
                </h4>
                <p className="text-gray-400 text-sm">
                  Tus CoreMiners generan el token $CORE pasivamente
                </p>
              </Card>
              <Card variant="glass" className="p-6">
                <div className="text-4xl mb-3">🎮</div>
                <h4 className="text-lg font-bold text-orange-500 mb-2">
                  Staking de Axies
                </h4>
                <p className="text-gray-400 text-sm">
                  Mantén tus Axies y genera Poder de Resonancia
                </p>
              </Card>
              <Card variant="glass" className="p-6">
                <div className="text-4xl mb-3">🏆</div>
                <h4 className="text-lg font-bold text-orange-500 mb-2">
                  Sinergias de Set
                </h4>
                <p className="text-gray-400 text-sm">
                  Colecciona CoreMiners para bonus permanentes
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
*/}
      {/* Acerca de ScorchCore 
      <section className="relative min-h-screen flex items-center py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-12 text-center bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              ScorchCore Protocol
            </h2>
            <Card variant="gradient" className="p-10 mb-12 text-center">
              <p className="text-2xl text-gray-200 leading-relaxed mb-6">
                Un innovador Play-to-Earn en Ronin que activa el valor dormido
                de millones de Axies y construye una{" "}
                <span className="text-orange-500 font-bold">
                  economía sostenible y justa
                </span>
                .
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="px-4 py-2 bg-orange-500/20 border border-orange-500 rounded-full text-orange-500 font-semibold">
                  🔥 Burn-to-Earn
                </span>
                <span className="px-4 py-2 bg-orange-500/20 border border-orange-500 rounded-full text-orange-500 font-semibold">
                  🤖 Anti-Bot
                </span>
                <span className="px-4 py-2 bg-orange-500/20 border border-orange-500 rounded-full text-orange-500 font-semibold">
                  ♻️ Economía Circular
                </span>
                <span className="px-4 py-2 bg-orange-500/20 border border-orange-500 rounded-full text-orange-500 font-semibold">
                  🎮 Play & Earn
                </span>
              </div>
            </Card>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card variant="glass" className="p-8">
                <h3 className="text-2xl font-bold text-orange-500 mb-4 flex items-center gap-3">
                  <span className="text-4xl">🎯</span> Nuestra Misión
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1 font-bold">→</span>
                    <span>Revalorizar NFTs infrautilizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1 font-bold">→</span>
                    <span>Construir economía deflacionaria sostenible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1 font-bold">→</span>
                    <span>Promover juego justo con sistema anti-bot</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1 font-bold">→</span>
                    <span>Fomentar gobernanza comunitaria (DAO)</span>
                  </li>
                </ul>
              </Card>
              <Card variant="glass" className="p-8">
                <h3 className="text-2xl font-bold text-orange-500 mb-4 flex items-center gap-3">
                  <span className="text-4xl">💰</span> Tokenomics
                </h3>
                <div className="space-y-4 text-gray-300">
                  <div className="bg-black/40 rounded-lg p-4 border border-orange-500/30">
                    <div className="text-orange-500 font-bold mb-1">
                      Suministro Total
                    </div>
                    <div className="text-2xl font-bold">2.1B $CORE</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4 border border-orange-500/30">
                    <div className="text-orange-500 font-bold mb-1">
                      Emisión
                    </div>
                    <div className="text-lg">Halving anual (-50%)</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4 border border-orange-500/30">
                    <div className="text-orange-500 font-bold mb-1">
                      Utilidad
                    </div>
                    <div className="text-sm">
                      Mejoras, Reparación, Gobernanza, Staking
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <Card variant="bordered" hover className="p-4 text-center">
                <div className="text-3xl mb-2">🎮</div>
                <div className="text-sm text-gray-400">Minijuegos F2P</div>
              </Card>
              <Card variant="bordered" hover className="p-4 text-center">
                <div className="text-3xl mb-2">🤝</div>
                <div className="text-sm text-gray-400">
                  Sistema de Becas 2.0
                </div>
              </Card>
              <Card variant="bordered" hover className="p-4 text-center">
                <div className="text-3xl mb-2">⚔️</div>
                <div className="text-sm text-gray-400">
                  Modo PvP Competitivo
                </div>
              </Card>
              <Card variant="bordered" hover className="p-4 text-center">
                <div className="text-3xl mb-2">🐕</div>
                <div className="text-sm text-gray-400">
                  Donaciones a Refugios
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
*/}
      {/* Final CTA 
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/30 via-black to-black" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-6xl md:text-7xl font-bold mb-8 bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              El Núcleo Ardiente Espera
            </h2>
            <p className="text-2xl text-gray-300 mb-12">
              ¿Responderás a su llamada?
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.open("#", "_blank")}
                className="text-lg px-8 py-4"
              >
                Leer Whitepaper 📄
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div>
                <div className="text-4xl font-bold text-orange-500">2.1B</div>
                <div className="text-gray-400 text-sm">$CORE Supply</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-500">50%</div>
                <div className="text-gray-400 text-sm">Minería</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-500">0%</div>
                <div className="text-gray-400 text-sm">Entrada F2P</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-500">100%</div>
                <div className="text-gray-400 text-sm">On-Chain</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}
      <Footer />
    </div>
  );
}
