
import { NextRequest, NextResponse } from "next/server";
import { sendWordReward } from "../../../lib/solana";

export async function POST(req: NextRequest) {
  try {
    const { wallet } = await req.json();

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not connected" }, { status: 401 });
    }

    // Mint 1 $WORD token to the user's wallet
    const signature = await sendWordReward(wallet);

    return NextResponse.json({
      success: true,
      message: "1 $WORD token minted successfully!",
      signature,
      txUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    });
  } catch (error) {
    console.error("Reward minting error:", error);
    return NextResponse.json({
      error: "Failed to mint reward token",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
