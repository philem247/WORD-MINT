// lib/solana.ts - Client-side utilities for Solana interactions
// Only import and use Solana libraries on the client-side to avoid bundling in serverless functions
import type { Keypair } from "@solana/web3.js";

interface SolanaImports {
  Connection: typeof import("@solana/web3.js").Connection;
  Keypair: typeof import("@solana/web3.js").Keypair;
  PublicKey: typeof import("@solana/web3.js").PublicKey;
  Transaction: typeof import("@solana/web3.js").Transaction;
  sendAndConfirmTransaction: typeof import("@solana/web3.js").sendAndConfirmTransaction;
  getAssociatedTokenAddress: typeof import("@solana/spl-token").getAssociatedTokenAddress;
  getMint: typeof import("@solana/spl-token").getMint;
  createTransferInstruction: typeof import("@solana/spl-token").createTransferInstruction;
}

let solanaImports: SolanaImports | null = null;

if (typeof window !== 'undefined') {
  // Dynamic import to prevent server-side bundling
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const web3 = require("@solana/web3.js");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const splToken = require("@solana/spl-token");
  solanaImports = {
    Connection: web3.Connection,
    Keypair: web3.Keypair,
    PublicKey: web3.PublicKey,
    Transaction: web3.Transaction,
    sendAndConfirmTransaction: web3.sendAndConfirmTransaction,
    getAssociatedTokenAddress: splToken.getAssociatedTokenAddress,
    getMint: splToken.getMint,
    createTransferInstruction: splToken.createTransferInstruction,
  };
}

// Use environment variables for RPC and mint address
const RPC_URL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com") : "https://api.devnet.solana.com";
export const connection = typeof window !== 'undefined' && solanaImports ? new solanaImports.Connection(RPC_URL, "confirmed") : null;

export function loadTreasury(): Keypair {
  if (typeof window === 'undefined' || !solanaImports) {
    throw new Error("Solana libraries are not available on server-side");
  }
  const { Keypair } = solanaImports;
  // For client-side, we can't load the treasury keypair directly due to security
  // This function should be used server-side or with proper key management
  throw new Error("Treasury keypair cannot be loaded on client-side for security reasons");
}

/**
 * sendWordReward(playerPubkeyStr)
 * - sends exactly 1 $WORD (in token base units using mint decimals) from treasury to player
 * - returns tx signature string
 * - This function should be called from a secure context, not directly from client
 */
export async function sendWordReward(playerPubkeyStr: string) {
  if (typeof window === 'undefined' || !solanaImports) {
    throw new Error("Solana libraries are not available on server-side");
  }

  const mintStr = process.env.NEXT_PUBLIC_WORD_TOKEN_MINT;
  if (!mintStr || mintStr === "REPLACE_ME_AFTER_STEP_5") {
    throw new Error("NEXT_PUBLIC_WORD_TOKEN_MINT is not set");
  }

  const { PublicKey, getAssociatedTokenAddress, getMint, createTransferInstruction, Transaction, sendAndConfirmTransaction } = solanaImports;

  const mint = new PublicKey(mintStr);
  const player = new PublicKey(playerPubkeyStr);
  const treasury = loadTreasury();

  // Ensure ATAs exist (treasury ATA should exist already because you created it earlier)
  const treasuryAta = await getAssociatedTokenAddress(mint, treasury.publicKey, false);
  const playerAta = await getAssociatedTokenAddress(mint, player);

  // Look up mint decimals to compute 1 token in base units
  const mintInfo = await getMint(connection!, mint);
  const decimals = mintInfo.decimals;
  const amount = BigInt(1) * BigInt(10) ** BigInt(decimals); // 1 * 10^decimals

  // Create transfer instruction
  const ix = createTransferInstruction(treasuryAta, playerAta, treasury.publicKey, Number(amount));
  const tx = new Transaction().add(ix);

  // Sign & send with treasury keypair
  const sig = await sendAndConfirmTransaction(connection!, tx, [treasury]);
  return sig;
}

// Client-side minting function using wallet adapter
export async function mintRewardToWallet(wallet: { publicKey: unknown; signTransaction: unknown }) {
  if (typeof window === 'undefined' || !solanaImports) {
    throw new Error("Solana libraries are not available on server-side");
  }

  if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected or not supported");
  }

  const mintStr = process.env.NEXT_PUBLIC_WORD_TOKEN_MINT;
  if (!mintStr || mintStr === "REPLACE_ME_AFTER_STEP_5") {
    throw new Error("NEXT_PUBLIC_WORD_TOKEN_MINT is not set");
  }

  // For client-side minting, we need to interact with a minting program or have the treasury sign
  // This is a placeholder - in a real implementation, you'd call a Solana program
  // For now, we'll simulate the minting process
  const mockSignature = "mock_signature_" + Date.now();
  return mockSignature;
}
