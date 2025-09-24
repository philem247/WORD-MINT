"use client";

import { useEffect, useState } from "react";

type LeaderboardEntry = {
  wallet: string;
  score: number;
  username?: string;
};

import { useWallet } from "@solana/wallet-adapter-react";

const LeaderboardPanel = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { publicKey } = useWallet();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data: LeaderboardEntry[] = await res.json();
        setLeaderboard(data.sort((a, b) => b.score - a.score));
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000); // Update every 1 minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/70 backdrop-blur-lg rounded-2xl border-2 border-cyan-400 shadow-[0_0_24px_#00f0ff80] p-6 w-full max-w-xl mx-auto animate__animated animate__fadeIn">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-glow flex items-center gap-2">
        <span>🏆</span> Leaderboard
      </h2>
      {loading && <div className="text-cyan-300 mb-2">Loading...</div>}
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <ul className="space-y-3">
        {leaderboard.map((entry, idx) => {
          const displayName = entry.username ? entry.username : (entry.wallet.length > 10 ? `${entry.wallet.slice(0, 4)}...${entry.wallet.slice(-4)}` : entry.wallet);
          const icons = [
            <span key="gold" className="text-yellow-400 animate-pulse">🥇</span>,
            <span key="silver" className="text-gray-300 animate-pulse">🥈</span>,
            <span key="bronze" className="text-orange-400 animate-pulse">🥉</span>
          ];
          const isCurrent = publicKey?.toBase58() === entry.wallet;
          const isConnected = publicKey?.toBase58() === entry.wallet; // Assuming single connected wallet
          return (
            <li
              key={entry.wallet}
              className={`flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer hover:bg-cyan-900/30 border border-transparent hover:border-cyan-400 ${isConnected ? "bg-green-700/40 border-green-400 text-white text-glow" : ""}`}
              title={entry.wallet}
            >
              <div className="flex items-center gap-2">
                {idx < 3 && icons[idx]}
                <span className="font-mono text-base md:text-lg">{displayName}</span>
                {isConnected && <span className="ml-2 px-2 py-1 bg-green-400 text-black rounded text-xs font-bold animate__animated animate__pulse">Connected</span>}
              </div>
              <span className="font-bold text-lg md:text-xl text-cyan-300 drop-shadow">{entry.score}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LeaderboardPanel;
