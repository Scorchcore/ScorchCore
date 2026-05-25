'use client';

import { useState, useEffect, useRef } from 'react';
import { GeodeCategory, AxieClass } from '@/lib/constants/geodes';
import { gsap } from 'gsap';
import { thumbnailNames } from './thumbnailMappings';
import type { HatchResult as ComponentHatchResult } from './types/HatchTypes';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('HatchRoulette');

interface HatchRouletteProps {
  category: GeodeCategory;
  axieClass: AxieClass;
  isVisible: boolean;
  onComplete: (result: ComponentHatchResult) => void;
  loopUntilConfirm?: boolean;
  isConfirmed?: boolean;
  selectedMinerIndex?: number; // Índice REAL del contrato
}

// Obtener nombres de thumbnails según tipo de geoda
const getThumbnails = (category: GeodeCategory, axieClass: AxieClass): string[] => {
  const categoryMap: Record<number, string> = {
    [GeodeCategory.PETIT]: 'PETIT',
    [GeodeCategory.ALTO]: 'ALTO',
    [GeodeCategory.ANIMAL]: 'ANIMAL',
    [GeodeCategory.ULTRAMECH]: 'ULTRAMECH',
    [GeodeCategory.TANQUE]: 'TANK'
  };

  const classMap: Record<number, string> = {
    [AxieClass.AQUA]: 'AQUA',
    [AxieClass.BIRD]: 'BIRD',
    [AxieClass.BUG]: 'BUG',
    [AxieClass.DUSK]: 'DUSK',
    [AxieClass.MECH]: 'MECH',
    [AxieClass.PLANT]: 'PLANT',
    [AxieClass.REPTILE]: 'REPTILE',
    [AxieClass.BEAST]: 'BEAST',
    [AxieClass.DAWN]: 'DAWN'
  };

  const categoryFolder = categoryMap[category];
  // Para ULTRAMECH, las subcarpetas usan "ULTRA" en lugar de "ULTRAMECH"
  const subfolder = category === GeodeCategory.ULTRAMECH ? 'ULTRA' : categoryFolder;
  
  // NORMALIZADO: Todas las carpetas usan snake_case (guión bajo)
  const className = classMap[axieClass];
  const classFolder = `${subfolder}_${className}`;
  
  const basePath = `/assets/miners-thumbnails/${categoryFolder}/${classFolder}`;

  // Usar el mapping importado desde thumbnailMappings.ts
  // El mapping contiene todos los thumbnails para PETIT, ALTO, ANIMAL, ULTRAMECH y TANK
  // Para ULTRAMECH, las claves en el mapping usan "ULTRA" no "ULTRAMECH"
  const key = `${subfolder}_${className}`;
  
  // Si no hay thumbnails mapeados, retornar array vacío
  const files = thumbnailNames[key];
  
  if (!files) {
    logger.warn('No hay thumbnails mapeados', { key });
    return [];
  }

  return files.map(f => `${basePath}/${f}`);
};

// Datos de mineros según manual de forja
interface MinerData {
  name: string;
  rarity: 'common' | 'rare' | 'very-rare' | 'epic' | 'legendary';
  probability: number;
  power: number;
}

// Mapeo de probabilidades por categoría (patrón genérico)
// Los nombres vienen de los thumbnails (metadata)
const getMinerData = (category: GeodeCategory): MinerData[] => {
  switch (category) {
    case GeodeCategory.PETIT:
      return [
        { name: '', rarity: 'common', probability: 20, power: 50 },      // Índice 0: Común (gris)
        { name: '', rarity: 'common', probability: 20, power: 60 },      // Índice 1: Común (gris)
        { name: '', rarity: 'rare', probability: 18, power: 70 },        // Índice 2: Raro (azul claro)
        { name: '', rarity: 'rare', probability: 16, power: 80 },        // Índice 3: Raro (azul claro)
        { name: '', rarity: 'very-rare', probability: 13, power: 90 },   // Índice 4: Muy Raro (verde)
        { name: '', rarity: 'very-rare', probability: 12, power: 100 },  // Índice 5: Muy Raro (verde)
        { name: '', rarity: 'epic', probability: 1, power: 500 }         // Índice 6: Épico (rojo)
      ];
    case GeodeCategory.ALTO:
      return [
        { name: '', rarity: 'common', probability: 20, power: 100 },
        { name: '', rarity: 'common', probability: 20, power: 110 },
        { name: '', rarity: 'common', probability: 18, power: 120 },
        { name: '', rarity: 'common', probability: 16, power: 130 },
        { name: '', rarity: 'rare', probability: 13, power: 140 },
        { name: '', rarity: 'rare', probability: 12, power: 150 },
        { name: '', rarity: 'epic', probability: 1, power: 750 }
      ];
    case GeodeCategory.ANIMAL:
    case GeodeCategory.ULTRAMECH:
      return [
        { name: '', rarity: 'common', probability: 20, power: 120 },
        { name: '', rarity: 'common', probability: 20, power: 140 },
        { name: '', rarity: 'rare', probability: 18, power: 160 },
        { name: '', rarity: 'rare', probability: 16, power: 180 },
        { name: '', rarity: 'rare', probability: 13, power: 200 },
        { name: '', rarity: 'rare', probability: 12, power: 220 },
        { name: '', rarity: 'epic', probability: 1, power: 1000 }
      ];
    case GeodeCategory.TANQUE:
      return [
        { name: '', rarity: 'rare', probability: 20, power: 150 },
        { name: '', rarity: 'rare', probability: 20, power: 170 },
        { name: '', rarity: 'rare', probability: 18, power: 190 },
        { name: '', rarity: 'rare', probability: 16, power: 210 },
        { name: '', rarity: 'rare', probability: 13, power: 230 },
        { name: '', rarity: 'rare', probability: 12, power: 250 },
        { name: '', rarity: 'legendary', probability: 1, power: 1500 }
      ];
    default:
      return [
        { name: '', rarity: 'common', probability: 20, power: 50 },
        { name: '', rarity: 'common', probability: 20, power: 60 },
        { name: '', rarity: 'common', probability: 18, power: 70 },
        { name: '', rarity: 'common', probability: 16, power: 80 },
        { name: '', rarity: 'rare', probability: 13, power: 90 },
        { name: '', rarity: 'rare', probability: 12, power: 100 },
        { name: '', rarity: 'epic', probability: 1, power: 500 }
      ];
  }
};

// Colores por rareza (solo visual para ruleta)
const getRarityColor = (rarity: string): string => {
  const colors: Record<string, string> = {
    common: 'bg-gray-500',           // Gris para común
    rare: 'bg-blue-400',             // Azul claro para raro
    'very-rare': 'bg-green-500',     // Verde para muy raro
    epic: 'bg-red-500',              // Rojo para épico
    legendary: 'bg-yellow-500'       // Amarillo para legendario
  };
  
  return colors[rarity] || 'bg-gray-500';
};


export function HatchRoulette({ category, axieClass, isVisible, onComplete, loopUntilConfirm = false, isConfirmed = false, selectedMinerIndex }: HatchRouletteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const hasAppliedRNG = useRef<boolean>(false); // Para evitar doble ejecución del RNG
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // Thumbnail seleccionado
  const thumbnails = getThumbnails(category, axieClass);
  const minerData = getMinerData(category);
  
  // Extraer nombres reales de los thumbnails (sin -thumbnail.webp o .png)
  const realMinerNames = thumbnails.map(path => {
    const fileName = path.split('/').pop() || '';
    // Quitar -thumbnail.webp, .png, .webp (case insensitive)
    // MANTENER guiones bajos (snake_case)
    return fileName
      .replace(/-thumbnail\.webp$/i, '') // Case insensitive -thumbnail.webp
      .replace(/\.png$/i, '') // Quitar .png
      .replace(/\.webp$/i, ''); // Quitar .webp
  });

  useEffect(() => {
    logger.debug('Componente montado');
    
    if (isVisible) {
      hasAppliedRNG.current = false;
      setSelectedIndex(null);
    }
    
    return () => {
      logger.debug('Componente desmontando - limpiando animación GSAP');
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
      hasAppliedRNG.current = false;
      setSelectedIndex(null);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) {
      logger.debug('No visible o sin ref - omitiendo inicio de animación');
      return;
    }
    if (animationRef.current) {
      logger.debug('Animación ya existe - evitando duplicación');
      return;
    }

    logger.info('Iniciando animación placeholder infinita', { thumbnailCount: thumbnails.length });
    
    // Animar continuamente hacia la izquierda
    // Con 7 thumbnails de 208px cada uno = 1456px por ciclo completo
    const cycleDistance = thumbnails.length * 208;
    
    animationRef.current = gsap.to(containerRef.current, {
      x: -cycleDistance, // mover 1 ciclo completo
      duration: 2.5, // 2.5 segundos por ciclo 
      ease: 'none', // velocidad constante
      repeat: -1, // repetir infinitamente
      modifiers: {
        x: (x: string) => {
          // Wrap seamless: resetear a 0 cuando completa un ciclo
          const numX = parseFloat(x);
          return `${numX % -cycleDistance}px`;
        }
      },
      onRepeat: () => {
        logger.debug('Ciclo de animación completado');
      }
    });
    
    logger.debug('Animación GSAP creada exitosamente');

  }, [isVisible, thumbnails.length]);

  useEffect(() => {
    if (!isConfirmed || !loopUntilConfirm) return;
    if (!animationRef.current || !containerRef.current) return;
    if (hasAppliedRNG.current) return;

    logger.info('Contrato confirmado - determinando miner seleccionado');
    hasAppliedRNG.current = true;
    
    // Detener animación placeholder
    animationRef.current.kill();
    animationRef.current = null;

    // ✅ Usar índice REAL del contrato si está disponible
    let selectedIndex: number;
    
    if (selectedMinerIndex !== undefined && selectedMinerIndex !== null) {
      // Usar el índice que vino del contrato (convertir a number por si viene como BigInt)
      selectedIndex = Number(selectedMinerIndex);
      logger.info('Usando minerIndex REAL del contrato', { selectedIndex });
    } else {
      // Fallback: RNG frontend (solo para testing sin contrato)
      const random = Math.random() * 100;
      let cumulative = 0;
      selectedIndex = 0;
      
      for (let i = 0; i < minerData.length; i++) {
        cumulative += minerData[i].probability;
        if (random < cumulative) {
          selectedIndex = i;
          break;
        }
      }
      logger.warn('Usando RNG frontend (fallback) - no hay selectedMinerIndex del contrato', { selectedIndex });
    }
    
    const selectedMiner = minerData[selectedIndex];
    const realMinerName = realMinerNames[selectedIndex] || selectedMiner.name;
    logger.info('Miner seleccionado para animación', {
      name: realMinerName,
      rarity: selectedMiner.rarity,
      power: selectedMiner.power,
      index: selectedIndex,
      source: selectedMinerIndex !== undefined ? 'contract' : 'frontend-rng'
    });

    // Calcular posición final centrada
    const thumbnailWidth = 192; // w-48
    const gap = 16; // space-x-4
    const containerPadding = 16; // p-4
    const thumbnailTotalWidth = thumbnailWidth + gap; // 208px
    const cycleDistance = minerData.length * thumbnailTotalWidth;
    
    // Obtener el centro del contenedor
    const rouletteContainer = containerRef.current.parentElement;
    if (!rouletteContainer) return;
    const containerCenter = rouletteContainer.getBoundingClientRect().width / 2;
    
    // Calcular la posición absoluta del thumbnail seleccionado en el ciclo 20
    // Ciclo 20: 20 vueltas completas + el índice seleccionado
    const targetCycle = 20;
    const thumbnailAbsoluteIndex = (targetCycle * minerData.length) + selectedIndex;
    
    // Posición del borde izquierdo del thumbnail
    const thumbnailLeftPosition = containerPadding + (thumbnailAbsoluteIndex * thumbnailTotalWidth);
    
    // Posición del centro del thumbnail
    const thumbnailCenterPosition = thumbnailLeftPosition + (thumbnailWidth / 2);
    
    // Para centrar: mover el contenedor de forma que el centro del thumbnail esté en el centro del viewport
    const finalPosition = thumbnailCenterPosition - containerCenter;
    
    logger.debug('Cálculo de posición final', {
      selectedIndex,
      targetCycle,
      thumbnailAbsoluteIndex,
      finalPosition
    });
    
    // ✅ Actualizar estado React ANTES de animación para sincronizar resaltado visual
    setSelectedIndex(selectedIndex);
    
    // Animación de desaceleración: empieza rápido (1s) y desacelera gradualmente
    animationRef.current = gsap.to(containerRef.current, {
      x: -finalPosition,
      duration: 5, // 5 segundos total de desaceleración
      ease: 'power4.out',
      onComplete: () => {
        logger.info('Animación de desaceleración completada');
        setSelectedIndex(selectedIndex);
        
        setTimeout(() => {
          onComplete({
            id: BigInt(selectedIndex),
            minerId: BigInt(selectedIndex),
            name: realMinerName,
            rarity: selectedMiner.rarity,
            power: selectedMiner.power,
            efficiency: 100,
            category,
            minerType: axieClass, // AxieClass es el minerType
            minerIndex: selectedIndex,
            axieClass,
            videoPath: '',
          });
        }, 1500);
      }
    });

  }, [isConfirmed, loopUntilConfirm, onComplete, minerData, realMinerNames]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 max-w-4xl w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          🐣 Eclosionando Geoda...
        </h2>
        
        {/* Ruleta - Placeholder infinito */}
        <div className="relative overflow-hidden rounded-lg bg-gray-800 p-4 h-80">
          <div
            ref={containerRef}
            className="flex space-x-4"
            style={{
              willChange: 'transform'
            }}
          >
            {/* Repetir thumbnails 100 veces = suficiente para placeholder */}
            {Array.from({ length: 100 }).map((_, copyIndex) => (
              thumbnails.map((thumbPath, thumbIndex) => {
                const isSelected = selectedIndex === thumbIndex && copyIndex === 20; // Solo resaltar en ciclo 20 (donde cae)
                return (
                  <div
                    key={`${copyIndex}-${thumbIndex}`}
                    className={`shrink-0 w-48 flex flex-col transition-all duration-500 ${
                      isSelected ? 'scale-110 z-30' : ''
                    }`}
                  >
                    <div className={`h-64 rounded-t-lg overflow-hidden bg-gray-700 ${
                      isSelected ? 'ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-pulse' : ''
                    }`}>
                      <img
                        src={thumbPath}
                        alt={`Miner ${thumbIndex}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {/* Barra de rareza */}
                    <div className={`h-2 rounded-b-lg ${getRarityColor(minerData[thumbIndex % minerData.length]?.rarity || 'common')}`}></div>
                  </div>
                );
              })
            ))}
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-gray-400">Esperando confirmación...</p>
        </div>
      </div>
    </div>
  );
}
