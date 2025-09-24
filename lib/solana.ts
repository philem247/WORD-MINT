// lib/solana.ts
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, getMint, createTransferInstruction } from "@solana/spl-token";

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";
export const connection = new Connection(RPC_URL, "confirmed");

export function loadTreasury(): Keypair {
  const raw = process.env.TREASURY_SECRET_KEY;
  if (!raw) throw new Error("TREASURY_SECRET_KEY env is missing");
  const secret = Uint8Array.from(JSON.parse(raw));
  return Keypair.fromSecretKey(secret);
}

/**
 * sendWordReward(playerPubkeyStr)
 * - sends exactly 1 $WORD (in token base units using mint decimals) from treasury to player
 * - returns tx signature string
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