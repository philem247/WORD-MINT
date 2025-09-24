// lib/solana.ts - Client-side utilities for Solana interactions
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, getMint, createTransferInstruction } from "@solana/spl-token";

// Use environment variables for RPC and mint address
const RPC_URL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com") : "https://api.devnet.solana.com";
export const connection = new Connection(RPC_URL, "confirmed");

export function loadTreasury(): Keypair {
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
  const mintStr = process.env.NEXT_PUBLIC_WORD_TOKEN_MINT;
  if (!mintStr || mintStr === "REPLACE_ME_AFTER_STEP_5") {
    throw new Error("NEXT_PUBLIC_WORD_TOKEN_MINT is not set");
  }

  const mint = new PublicKey(mintStr);
  const player = new PublicKey(playerPubkeyStr);
  const treasury = loadTreasury();

  // Ensure ATAs exist (treasury ATA should exist already because you created it earlier)
  const treasuryAta = await getAssociatedTokenAddress(mint, treasury.publicKey, false);
  const playerAta = await getAssociatedTokenAddress(mint, player);

  // Look up mint decimals to compute 1 token in base units
  const mintInfo = await getMint(connection, mint);
  const decimals = mintInfo.decimals;
  const amount = BigInt(1) * BigInt(10) ** BigInt(decimals); // 1 * 10^decimals

  // Create transfer instruction
  const ix = createTransferInstruction(treasuryAta, playerAta, treasury.publicKey, Number(amount));
  const tx = new Transaction().add(ix);

  // Sign & send with treasury keypair
  const sig = await sendAndConfirmTransaction(connection, tx, [treasury]);
  return sig;
}

// Client-side minting function using wallet adapter
export async function mintRewardToWallet(wallet: any) {
  if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected or not supported");
  }

  const mintStr = process.env.NEXT_PUBLIC_WORD_TOKEN_MINT;
  if (!mintStr || mintStr === "REPLACE_ME_AFTER_STEP_5") {
    throw new Error("NEXT_PUBLIC_WORD_TOKEN_MINT is not set");
  }

  const mint = new PublicKey(mintStr);
  const player = wallet.publicKey;

  // For client-side minting, we need to interact with a minting program or have the treasury sign
  // This is a placeholder - in a real implementation, you'd call a Solana program
  // For now, we'll simulate the minting process
  const mockSignature = "mock_signature_" + Date.now();
  return mockSignature;
}
