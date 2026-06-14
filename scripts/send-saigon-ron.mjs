import "dotenv/config";
import { ethers } from "ethers";

const RPC_URL =
  process.env.SAIGON_RPC_URL ?? "https://saigon-testnet.roninchain.com/rpc";
const CHAIN_ID = 202601n;
const DEFAULT_AMOUNT_RON = "0.05";
const MIN_PRIORITY_FEE_GWEI = "25";
const MAX_FEE_GWEI = "60";

const privateKey = process.env.SAIGON_FUNDER_PRIVATE_KEY;
const recipient = process.env.SAIGON_RECIPIENT;
const amountRon = process.env.SAIGON_AMOUNT_RON ?? DEFAULT_AMOUNT_RON;

if (!privateKey || !recipient) {
  console.error(`
Missing required env vars.

Usage:
  SAIGON_FUNDER_PRIVATE_KEY=0x... \\
  SAIGON_RECIPIENT=0x... \\
  SAIGON_AMOUNT_RON=0.05 \\
  node scripts/send-saigon-ron.mjs

Optional:
  SAIGON_RPC_URL=${RPC_URL}
`);
  process.exit(1);
}

if (!ethers.isAddress(recipient)) {
  console.error(`Invalid SAIGON_RECIPIENT: ${recipient}`);
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL, Number(CHAIN_ID));
const network = await provider.getNetwork();

if (network.chainId !== CHAIN_ID) {
  throw new Error(
    `Unexpected chain id ${network.chainId.toString()}; expected ${CHAIN_ID.toString()}`,
  );
}

const wallet = new ethers.Wallet(privateKey, provider);
const value = ethers.parseEther(amountRon);
const balance = await provider.getBalance(wallet.address);
const gasLimit = 21_000n;
const maxPriorityFeePerGas = ethers.parseUnits(MIN_PRIORITY_FEE_GWEI, "gwei");
const maxFeePerGas = ethers.parseUnits(MAX_FEE_GWEI, "gwei");
const maxGasCost = gasLimit * maxFeePerGas;

if (balance < value + maxGasCost) {
  throw new Error(
    `Insufficient balance. Sender ${wallet.address} has ${ethers.formatEther(
      balance,
    )} RON, needs about ${ethers.formatEther(value + maxGasCost)} RON.`,
  );
}

console.log(`From: ${wallet.address}`);
console.log(`To:   ${recipient}`);
console.log(`Send: ${amountRon} RON`);
console.log(`Fee:  priority ${MIN_PRIORITY_FEE_GWEI} gwei, max ${MAX_FEE_GWEI} gwei`);

const tx = await wallet.sendTransaction({
  to: recipient,
  value,
  type: 2,
  chainId: Number(CHAIN_ID),
  gasLimit,
  maxPriorityFeePerGas,
  maxFeePerGas,
});

console.log(`Tx:   ${tx.hash}`);
console.log("Waiting for confirmation...");

const receipt = await tx.wait();

console.log(`Done in block ${receipt?.blockNumber}`);
console.log(`Explorer: https://saigon-app.roninchain.com/tx/${tx.hash}`);
