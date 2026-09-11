import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(dirname, "..");
const artifactsRoot = path.resolve(
  webRoot,
  "..",
  "ScorchCore",
  "contracts_standard",
  "artifacts",
  "contracts",
);
const abisDir = path.join(webRoot, "src", "lib", "abis");

const targets = [
  { exportName: "CORETOKEN_ABI", artifact: "tokens/CoreToken.sol/CoreToken.json", file: "core.abis.ts" },
  { exportName: "FCORETOKEN_ABI", artifact: "tokens/fCoreToken.sol/fCoreToken.json", file: "core.abis.ts" },
  { exportName: "FCORECONVERTER_ABI", artifact: "tokens/fCoreConverter.sol/fCoreConverter.json", file: "core.abis.ts" },
  { exportName: "EMISSIONSCHEDULE_ABI", artifact: "mining/EmissionSchedule.sol/EmissionSchedule.json", file: "core.abis.ts" },
  { exportName: "MININGPOOL_ABI", artifact: "mining/MiningPool.sol/MiningPool.json", file: "mining.abis.ts" },
  { exportName: "REWARDSCALCULATOR_ABI", artifact: "mining/RewardsCalculator.sol/RewardsCalculator.json", file: "mining.abis.ts" },
  { exportName: "CYCLEMANAGER_ABI", artifact: "mining/CycleManager.sol/CycleManager.json", file: "mining.abis.ts" },
  { exportName: "MINIGAMEMANAGER_ABI", artifact: "gaming/MinigameManager.sol/MinigameManager.json", file: "gaming.abis.ts" },
  { exportName: "ACTIVITYTRACKER_ABI", artifact: "economy/ActivityTracker.sol/ActivityTracker.json", file: "economy.abis.ts" },
  { exportName: "SCHOLARSHIPMANAGER_ABI", artifact: "economy/ScholarshipManager.sol/ScholarshipManager.json", file: "economy.abis.ts" },
  { exportName: "AIRDROPMANAGER_ABI", artifact: "economy/AirdropManager.sol/AirdropManager.json", file: "economy.abis.ts" },
  { exportName: "AXIERARITYORACLE_ABI", artifact: "economy/AxieRarityOracle.sol/AxieRarityOracle.json", file: "economy.abis.ts" },
  { exportName: "AXS_PRICE_ORACLE_ABI", artifact: "economy/AxsPriceOracle.sol/AxsPriceOracle.json", file: "forge.abis.ts" },
];

function readAbi(artifactPath) {
  const fullPath = path.join(artifactsRoot, artifactPath);
  if (!fs.existsSync(fullPath)) throw new Error(`Artifact not found: ${fullPath}`);
  return JSON.parse(fs.readFileSync(fullPath, "utf8")).abi;
}

function upsertExport(source, exportName, abiLiteral) {
  const block = `export const ${exportName} = ${abiLiteral} as const;`;
  const startMarker = `export const ${exportName} = [`;
  const start = source.indexOf(startMarker);
  if (start === -1) return `${source.replace(/\s*$/, "")}\n\n${block}\n`;

  const endMarker = "] as const;";
  const end = source.indexOf(endMarker, start);
  if (end === -1) throw new Error(`Could not find end of ${exportName}`);
  return source.slice(0, start) + block + source.slice(end + endMarker.length);
}

for (const file of new Set(targets.map((target) => target.file))) {
  const filePath = path.join(abisDir, file);
  let source = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf8")
    : "/** Auto-generated contract ABIs. */\n";
  for (const target of targets.filter((entry) => entry.file === file)) {
    source = upsertExport(
      source,
      target.exportName,
      JSON.stringify(readAbi(target.artifact), null, 2),
    );
  }
  fs.writeFileSync(filePath, source, "utf8");
}

console.log(`Synchronized ${targets.length} Phase 6 ABIs.`);
