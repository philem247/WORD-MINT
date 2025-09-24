import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const leaderboardPath = path.resolve(process.cwd(), "data/leaderboard.json");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'sse') {
    // Server-Sent Events endpoint
    const responseStream = new ReadableStream({
      start(controller) {
        const sendData = () => {
          try {
            const file = fs.readFileSync(leaderboardPath, "utf-8");
            const leaderboard: { wallet: string; score: number }[] = JSON.parse(file);
            const sorted = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
            controller.enqueue(`data: ${JSON.stringify(sorted)}\n\n`);
          } catch (err) {
            controller.enqueue(`data: []\n\n`);
          }
        };

        sendData();
        const interval = setInterval(sendData, 5000); // Send every 5 seconds

        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } else {
    // Regular JSON endpoint
    try {
      const file = fs.readFileSync(leaderboardPath, "utf-8");
      const leaderboard: { wallet: string; score: number }[] = JSON.parse(file);
      const sorted = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
      return NextResponse.json(sorted);
    } catch (err) {
      return NextResponse.json([], { status: 200 });
    }
  }
}

export async function POST(req: NextRequest) {
  const { wallet, score } = await req.json();
  if (!wallet || typeof score !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  let leaderboard: { wallet: string; score: number }[] = [];
  try {
    const file = fs.readFileSync(leaderboardPath, "utf-8");
    leaderboard = JSON.parse(file);
  } catch (err) {
    leaderboard = [];
  }
  const existing = leaderboard.find((e) => e.wallet === wallet);
  if (existing) {
    existing.score = score;
  } else {
    leaderboard.push({ wallet, score });
  }
  fs.writeFileSync(leaderboardPath, JSON.stringify(leaderboard, null, 2), "utf-8");
  return NextResponse.json({ success: true });
}
