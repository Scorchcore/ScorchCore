/**
 * Datos locales de miners - NO USA IPFS
 * Basado en estructura del contrato y assets locales
 */

// Mapeo de categorías
export const CATEGORY_NAMES: Record<number, string> = {
  0: 'PETIT',
  1: 'ALTO',
  2: 'ANIMAL',
  3: 'ULTRAMECH',
  4: 'TANK'
};

// Mapeo de tipos (axie classes)
export const TYPE_NAMES: Record<number, string> = {
  0: 'BEAST',
  1: 'AQUA',
  2: 'BIRD',
  3: 'REPTILE',
  4: 'BUG',
  5: 'PLANT',
  6: 'MECH',
  7: 'DUSK',
  8: 'DAWN'
};

// Nombres de miners por categoria/tipo/index
// Basado en los archivos de video reales en /public/images/miners/
export const MINER_NAMES: Record<string, string[]> = {
  // PETIT AQUA (CORRECTO - metadata JSON)
  'PETIT_AQUA': [
    'Gota Rápida',           // índice 0, poder 50
    'Corriente Ligera',      // índice 1, poder 60
    'Burbuja Eficiente',     // índice 2, poder 70
    'Chorro Preciso',        // índice 3, poder 80
    'Flujo Sereno',          // índice 4, poder 90
    'Gota de Rocío',         // índice 5, poder 100
    'Corriente de Tsunami'   // índice 6, poder 500 (ÉPICO)
  ],
  // PETIT AVE (BIRD) - CORRECTO
  'PETIT_BIRD': [
    'Ala Veloz',             // índice 0, poder 50
    'Corriente Ascendente',  // índice 1, poder 60
    'Pluma Ligera',          // índice 2, poder 70
    'Picotazo Preciso',      // índice 3, poder 80
    'Pequeño Raptor',        // índice 4, poder 90
    'Polluelo Vigía',        // índice 5, poder 100
    'Gorrión Sónico'         // índice 6, poder 500 (ÉPICO)
  ],
  // PETIT BICHO (BUG) - CORRECTO
  'PETIT_BUG': [
    'Obrero Zángano',        // índice 0, poder 50
    'Hormiga Exploradora',   // índice 1, poder 60
    'Pupa Eficiente',        // índice 2, poder 70
    'Zumbido Silencioso',    // índice 3, poder 80
    'Escarabajo Resistente', // índice 4, poder 90
    'Larva Protegida',       // índice 5, poder 100
    'Zángano Reina'          // índice 6, poder 500 (ÉPICO)
  ],
  // PETIT DUSK - CORRECTO
  'PETIT_DUSK': [
    'Sombra Naciente',       // índice 0, poder 50
    'Sombra Errante',        // índice 1, poder 60
    'Sombra Profunda',       // índice 2, poder 70
    'Sombra Oscura',         // índice 3, poder 80
    'Sombra Eterna',         // índice 4, poder 90
    'Sombra Absoluta',       // índice 5, poder 100
    'Sombra Primordial'      // índice 6, poder 500 (ÉPICO)
  ],
  // PETIT DAWN - CORRECTO
  'PETIT_DAWN': [
    'Destello Matutino',     // índice 0, poder 50
    'Centinela del Amanecer',// índice 1, poder 60
    'Luz Radiante',          // índice 2, poder 70
    'Resplandor Dorado',     // índice 3, poder 80
    'Guardián Solar',        // índice 4, poder 90
    'Fénix Naciente',        // índice 5, poder 100
    'Avatar del Alba'        // índice 6, poder 500 (ÉPICO)
  ],
  // PETIT MECH
  'PETIT_MECH': [
    'Nano Constructor',      // índice 0, poder 50
    'Dron de Prospección',   // índice 1, poder 60
    'Pequeño Lobo',          // índice 2, poder 70
    'Chispa Precisa',        // índice 3, poder 80
    'Circuito Estable',      // índice 4, poder 90
    'Núcleo de Titaneo',     // índice 5, poder 100
    'Nano Constructor Alfa'  // índice 6, poder 500 (ÉPICO)
  ],
  // PETIT PLANTA (PLANT) - CORRECTO
  'PETIT_PLANT': [
    'Brote Constante',       // índice 0, poder 50
    'Raíz Joven',            // índice 1, poder 60
    'Hoja Perenne',          // índice 2, poder 70
    'Espina Afilada',        // índice 3, poder 80
    'Flujo de Savia',        // índice 4, poder 90
    'Semilla Durmiente',     // índice 5, poder 100
    'Brote Milenario'        // índice 6, poder 500 (ÉPICO)
  ],
  // PETIT REPTIL (REPTILE) - CORRECTO
  'PETIT_REPTILE': [
    'Escama Venenosa',       // índice 0, poder 50
    'Gecko Astuto',          // índice 1, poder 60
    'Escudo Resbaladizo',    // índice 2, poder 70
    'Mordida Rápida',        // índice 3, poder 80
    'Sangre Fría',           // índice 4, poder 90
    'Cría de Caimán',        // índice 5, poder 100
    'Lagarto Insaciable'     // índice 6, poder 500 (ÉPICO)
  ],
  // PETIT BEAST
  'PETIT_BEAST': [
    'Cachorro Ágil',
    'Rastreador Tenaz',
    'Cazador Joven',
    'Garra Impaciente',
    'Cría Feroz',
    'Explorador Audaz',
    'Cachorro Alfa'
  ],

  // ============== ALTO (Category 1) ==============
  // ALTO AQUA
  'ALTO_AQUA': [
    'Marea Creciente',        // índice 0, poder 50
    'Marea Curativa',         // índice 1, poder 60
    'Corriente Restauradora', // índice 2, poder 70
    'Ola Vigorosa',           // índice 3, poder 80
    'Remolino Constante',     // índice 4, poder 90
    'Pulso Oceánico',         // índice 5, poder 100
    'Marea Sanadora'          // índice 6, poder 500 (ÉPICO)
  ],
  // ALTO BIRD
  'ALTO_BIRD': [
    'Ojo de Halcón',          // índice 0, poder 50
    'Explorador del Cielo',   // índice 1, poder 60
    'Cazador Solitario',      // índice 2, poder 70
    'Nido Seguro',            // índice 3, poder 80
    'Semiplumas',             // índice 4, poder 90
    'Canto del Viento',       // índice 5, poder 100
    'Harpía Real'             // índice 6, poder 500 (ÉPICO)
  ],
  // ALTO REPTILE
  'ALTO_REPTILE': [
    'Diamante Blindado',      // índice 0, poder 50
    'Guardián Silencioso',    // índice 1, poder 60
    'Depredador Sigiloso',    // índice 2, poder 70
    'Escama Pulida',          // índice 3, poder 80
    'Reptil Veterano',        // índice 4, poder 90
    'Mirada Hipnótica',       // índice 5, poder 100
    'Lagarto Insaciable'      // índice 6, poder 500 (ÉPICO)
  ],
  // ALTO BUG
  'ALTO_BUG': [
    'Avispa Soldado',         // índice 0, poder 50
    'Guardián del Nido',      // índice 1, poder 60
    'Mariquita',              // índice 2, poder 70
    'Mandíbula Afilada',      // índice 3, poder 80
    'Insecto Veterano',       // índice 4, poder 90
    'Zumbido Poderoso',       // índice 5, poder 100
    'Avispa Asesina'          // índice 6, poder 500 (ÉPICO)
  ],
  // ALTO PLANT
  'ALTO_PLANT': [
    'Hoja de Energía',        // índice 0, poder 50
    'Guardián del Bosque',    // índice 1, poder 60
    'Planta Carnívora',       // índice 2, poder 70
    'Savia Curativa',         // índice 3, poder 80
    'Árbol Veterano',         // índice 4, poder 90
    'Raíz Profunda',          // índice 5, poder 100
    'Hoja Gigante'            // índice 6, poder 500 (ÉPICO)
  ],
  // ALTO MECH
  'ALTO_MECH': [
    'Unidad de Procedimiento',       // índice 0, poder 50
    'Sintetizador de Aleación',      // índice 1, poder 60
    'Autómata de Combate',           // índice 2, poder 70
    'Chip de Ahorro',                // índice 3, poder 80
    'Mech Veterano',                 // índice 4, poder 90
    'Sobrecarga Controlada',         // índice 5, poder 100
    'Super Procesador Cuántico'      // índice 6, poder 500 (ÉPICO)
  ],
  // ALTO DUSK
  'ALTO_DUSK': [
    'Acechador Nocturno',     // índice 0, poder 50
    'Cazador Errante',        // índice 1, poder 60
    'Espectro Profundo',      // índice 2, poder 70
    'Sombra Oscura',          // índice 3, poder 80
    'Guardián Eterno',        // índice 4, poder 90
    'Señor Absoluto',         // índice 5, poder 100
    'Ente Primordial'         // índice 6, poder 500 (ÉPICO)
  ],
  // ALTO DAWN
  'ALTO_DAWN': [
    'Guardián Matutino',      // índice 0, poder 50
    'Protector del Amanecer', // índice 1, poder 60
    'Rayo Radiante',          // índice 2, poder 70
    'Fulgor Dorado',          // índice 3, poder 80
    'Paladín Solar',          // índice 4, poder 90
    'Fénix Renacido',         // índice 5, poder 100
    'Arcángel del Alba'       // índice 6, poder 500 (ÉPICO)
  ],
  // ALTO BEAST
  'ALTO_BEAST': [
    'Líder de la Manada',     // índice 0, poder 100
    'Bestia Veterana',        // índice 1, poder 110
    'Colmillo Afilado',       // índice 2, poder 120
    'Depredador Solitario',   // índice 3, poder 130
    'Guardián Leal',          // índice 4, poder 140
    'Rugido Potente',         // índice 5, poder 150
    'Líder de la Manada Alfa' // índice 6, poder 750 (ÉPICO)
  ],

  // ============== ANIMAL (Category 2) ==============
  // ANIMAL AQUA
  'ANIMAL_AQUA': [
    'Tormenta Imparable',     // índice 0, poder 120
    'Marea Veloz',            // índice 1, poder 140
    'Océano Profundo',        // índice 2, poder 160
    'Tsunami Controlado',     // índice 3, poder 180
    'Axolotl Marino',         // índice 4, poder 200
    'Corriente Salvaje',      // índice 5, poder 220
    'Señor de las Mareas'     // índice 6, poder 1000 (ÉPICO)
  ],
  // ANIMAL BIRD
  'ANIMAL_BIRD': [
    'Atalaya',                // índice 0, poder 120
    'Vuelo Rasante',          // índice 1, poder 140
    'Flujo Controlado',       // índice 2, poder 160
    'BUBO BUBO',              // índice 3, poder 180
    'Corazón de Cóndor',      // índice 4, poder 200
    'Instinto Cazador',       // índice 5, poder 220
    'Rey de los Cielos'       // índice 6, poder 1000 (ÉPICO)
  ],
  // ANIMAL REPTILE
  'ANIMAL_REPTILE': [
    'Furia Escamosa',         // índice 0, poder 120
    'Furia Venenosa',         // índice 1, poder 140
    'Furia Controlada',       // índice 2, poder 160
    'Dragón Púrpura',         // índice 3, poder 180
    'Corazón de Krok',        // índice 4, poder 200
    'Instinto Depredador',    // índice 5, poder 220
    'Basilisco Emperador'     // índice 6, poder 1000 (ÉPICO)
  ],
  // ANIMAL BUG
  'ANIMAL_BUG': [
    'Polilla Bogón',          // índice 0, poder 120
    'Pulga Electrónica',      // índice 1, poder 140
    'Pulgón Lanudo',          // índice 2, poder 160
    'Termita Bioluminiscente',// índice 3, poder 180
    'Tijereta Ninfa',         // índice 4, poder 200
    'Instinto Parasitario',   // índice 5, poder 220
    'Mantis Reina'            // índice 6, poder 1000 (ÉPICO)
  ],
  // ANIMAL PLANT
  'ANIMAL_PLANT': [
    'Sinergia Forestal',      // índice 0, poder 120
    'Gnomo del Santuario',    // índice 1, poder 140
    'Armonía Natural',        // índice 2, poder 160
    'Espíritu del Bosque',    // índice 3, poder 180
    'Corazón de Roble',       // índice 4, poder 200
    'Instinto Simbiótico',    // índice 5, poder 220
    'Avatar del Bosque'       // índice 6, poder 1000 (ÉPICO)
  ],
  // ANIMAL MECH
  'ANIMAL_MECH': [
    'Máquina de Guerra',      // índice 0, poder 120
    'Cañón de Rieles',        // índice 1, poder 140
    'Piloto Automático',      // índice 2, poder 160
    'Destructor Imparable',   // índice 3, poder 180
    'Corazón de Acero',       // índice 4, poder 200
    'Instinto de Combate',    // índice 5, poder 220
    'Centinela de Guerra'     // índice 6, poder 1000 (ÉPICO)
  ],
  // ANIMAL DUSK
  'ANIMAL_DUSK': [
    'Pesadilla Viviente',     // índice 0, poder 120
    'Terror Nocturno',        // índice 1, poder 140
    'Sombra Silenciosa',      // índice 2, poder 160
    'Cazador Furtivo',        // índice 3, poder 180
    'Ente de las Sombras',    // índice 4, poder 200
    'Vacío Profundo',         // índice 5, poder 220
    'Rey del Vacío'           // índice 6, poder 1000 (ÉPICO)
  ],
  // ANIMAL DAWN
  'ANIMAL_DAWN': [
    'Luz Radiante',           // índice 0, poder 120
    'Rayo Dorado',            // índice 1, poder 140
    'Resplandor Divino',      // índice 2, poder 160
    'Aurora Sagrada',         // índice 3, poder 180
    'Fulgor Celestial',       // índice 4, poder 200
    'Luz Primordial',         // índice 5, poder 220
    'Señor del Alba'          // índice 6, poder 1000 (ÉPICO)
  ],
  // ANIMAL BEAST
  'ANIMAL_BEAST': [
    'Furia Primigenia',       // índice 0, poder 120
    'Furia Salvaje',          // índice 1, poder 140
    'Furia Controlada',       // índice 2, poder 160
    'Berserker Indomable',    // índice 3, poder 180
    'Corazón Valiente',       // índice 4, poder 200
    'Instinto Asesino',       // índice 5, poder 220
    'Avatar de la Furia'      // índice 6, poder 1000 (ÉPICO)
  ],
};

/**
 * Obtiene el nombre de un miner basado en category, minerType, minerIndex
 */
export function getLocalMinerName(
  category: number,
  minerType: number,
  minerIndex: number
): string {
  const categoryName = CATEGORY_NAMES[category];
  const typeName = TYPE_NAMES[minerType];
  
  if (!categoryName || !typeName) {
    return `CoreMiner #${category}-${minerType}-${minerIndex}`;
  }
  
  const key = `${categoryName}_${typeName}`;
  const names = MINER_NAMES[key];
  
  if (!names || minerIndex >= names.length) {
    return `${categoryName} ${typeName} #${minerIndex}`;
  }
  
  return names[minerIndex];
}

/**
 * Normaliza un nombre para uso en rutas de archivos
 * Quita tildes, convierte a mayúsculas, mantiene espacios
 */
function normalizeForFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .replace(/-/g, ' ') // Convertir guiones a espacios
    .toUpperCase();
}

/**
 * Obtiene la ruta del video local basado en category, minerType, minerIndex
 */
export function getLocalMinerVideo(
  category: number,
  minerType: number,
  minerIndex: number
): string {
  const categoryName = CATEGORY_NAMES[category];
  const typeName = TYPE_NAMES[minerType];
  const minerName = getLocalMinerName(category, minerType, minerIndex);
  
  if (!categoryName || !typeName) {
    return '';
  }
  
  // Normalizar nombre para archivo: "Cachorro Ágil" -> "CACHORRO_AGIL"
  const normalizedName = normalizeForFilename(minerName);
  
  // Para PETIT, las carpetas usan "PETIT AQUA", "PETIT BEAST", etc.
  let folderName = `${categoryName} ${typeName}`;
  
  // El video está en: /images/miners/PETIT/PETIT AQUA/CACHORRO_AGIL.mp4
  const videoPath = `/images/miners/${categoryName}/${folderName}/${normalizedName}.mp4`;
  
  return videoPath;
}

/**
 * Obtiene el tipo de miner en formato legible
 */
export function getLocalMinerType(minerType: number): string {
  return TYPE_NAMES[minerType] || 'Unknown';
}

/**
 * Obtiene la categoría en formato legible
 */
export function getLocalMinerCategory(category: number): string {
  return CATEGORY_NAMES[category] || 'Unknown';
}
