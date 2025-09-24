import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

type LeaderboardEntry = { wallet: string; score: number; username?: string };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const leaderboardPath = path.resolve(process.cwd(), "data/leaderboard.json");

  if (req.method === "GET") {
    try {
      const file = fs.readFileSync(leaderboardPath, "utf-8");
  const leaderboard: LeaderboardEntry[] = JSON.parse(file);
  const sorted = leaderboard.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score).slice(0, 10);
  res.status(200).json(sorted);
    } catch (err) {
      res.status(200).json([]);
    }
    return;
  }

  if (req.method === "POST") {
    const { wallet, score, username } = req.body;
    if (!wallet || typeof score !== "number" || !username) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }
    let leaderboard: LeaderboardEntry[] = [];
    try {
      const file = fs.readFileSync(leaderboardPath, "utf-8");
      leaderboard = JSON.parse(file);
    } catch (err) {
      leaderboard = [];
    }
    const existing = leaderboard.find((e: LeaderboardEntry) => e.wallet === wallet);
    if (existing) {
      existing.score = score;
      existing.username = username;
    } else {
      leaderboard.push({ wallet, score, username });
    }
    fs.writeFileSync(leaderboardPath, JSON.stringify(leaderboard, null, 2), "utf-8");
    res.status(200).json({ success: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
