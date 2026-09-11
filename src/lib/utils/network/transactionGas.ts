const GAS_BASIS_POINTS = 10_000n;
const DEFAULT_GAS_BUFFER_BPS = 12_000n;

export function addGasBuffer(
  estimate: bigint,
  bufferBps = DEFAULT_GAS_BUFFER_BPS,
): bigint {
  if (estimate <= 0n) throw new Error("Gas estimate must be positive");
  if (bufferBps < GAS_BASIS_POINTS) {
    throw new Error("Gas buffer cannot reduce the estimate");
  }
  return (estimate * bufferBps + GAS_BASIS_POINTS - 1n) / GAS_BASIS_POINTS;
}
