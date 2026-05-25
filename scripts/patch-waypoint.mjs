/**
 * Postinstall script para corregir el chainId de Saigon en @sky-mavis/waypoint.
 * El SDK bundlea viem 2.9.2 que aún tiene saigon.id = 2021.
 * Actualizamos los archivos bundleados a 202601 para que coincida con la red actual.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const waypointDir = join(process.cwd(), 'node_modules', '@sky-mavis', 'waypoint');

const files = [
  join(waypointDir, 'dist', 'module', 'saigon-BY87pDOW.js'),
  join(waypointDir, 'dist', 'commonjs', 'saigon-DYBomzZQ.js'),
];

let patched = 0;
for (const file of files) {
  try {
    const content = readFileSync(file, 'utf8');
    if (content.includes('id: 2021')) {
      const updated = content.replace('id: 2021,', 'id: 202601,');
      writeFileSync(file, updated, 'utf8');
      patched++;
      console.log(`[patch-waypoint] Patched ${file}`);
    } else if (content.includes('id: 202601')) {
      console.log(`[patch-waypoint] Already patched ${file}`);
    } else {
      console.warn(`[patch-waypoint] Could not find chainId in ${file}`);
    }
  } catch (err) {
    console.error(`[patch-waypoint] Error patching ${file}:`, err.message);
  }
}

if (patched > 0) {
  console.log(`[patch-waypoint] Applied ${patched} patch(es) to @sky-mavis/waypoint`);
} else {
  console.log('[patch-waypoint] No patches needed');
}
