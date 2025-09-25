
import { NextRequest, NextResponse } from "next/server";

// This API route is no longer needed as Solana interactions are handled on the client-side.
// If you need to keep it for other purposes, you can add logic here without heavy dependencies.
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "This endpoint is deprecated. Use client-side wallet integration." }, { status: 410 });
}
