"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";

type LeaderboardEntry = {
  user_id: string;
  username: string;
  best_score: number;
  best_streak: number;
  total_games: number;
  average_accuracy: number;
};

const LeaderboardPanel = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('user_stats')
          .select(`
            user_id,
            best_score,
            best_streak,
            total_games,
            average_accuracy,
            profiles!inner(username)
          `)
          .order('best_score', { ascending: false })
          .limit(10);

        if (fetchError) {
          throw fetchError;
        }

        const formattedData: LeaderboardEntry[] = (data || []).map((entry) => {
          const profiles = entry.profiles as unknown as { username: string };
          return {
            user_id: entry.user_id,
            username: profiles.username,
            best_score: entry.best_score,
            best_streak: entry.best_streak,
            total_games: entry.total_games,
            average_accuracy: entry.average_accuracy
          };
        });

        setLeaderboard(formattedData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/70 backdrop-blur-lg rounded-2xl border-2 border-cyan-400 shadow-[0_0_24px_#00f0ff80] p-6 w-full max-w-xl mx-auto animate__animated animate__fadeIn">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-glow flex items-center gap-2">
        <span>🏆</span> Leaderboard
      </h2>
      {loading && <div className="text-cyan-300 mb-2">Loading...</div>}
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {!loading && leaderboard.length === 0 && (
        <div className="text-cyan-300 text-center py-8">
          No scores yet. Be the first to play!
        </div>
      )}
      <ul className="space-y-3">
        {leaderboard.map((entry, idx) => {
          const icons = [
            <span key="gold" className="text-yellow-400 animate-pulse">🥇</span>,
            <span key="silver" className="text-gray-300 animate-pulse">🥈</span>,
            <span key="bronze" className="text-orange-400 animate-pulse">🥉</span>
          ];
          const isCurrentUser = user?.id === entry.user_id;

          return (
            <li
              key={entry.user_id}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-cyan-900/30 border ${
                isCurrentUser
                  ? "bg-green-700/40 border-green-400 text-white text-glow"
                  : "border-transparent hover:border-cyan-400"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2 min-w-[100px]">
                  {idx < 3 && icons[idx]}
                  <span className="font-bold text-cyan-200">#{idx + 1}</span>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base md:text-lg font-semibold">
                      {entry.username}
                    </span>
                    {isCurrentUser && (
                      <span className="px-2 py-0.5 bg-green-400 text-black rounded text-xs font-bold">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-cyan-400 mt-0.5">
                    {entry.total_games} games • {entry.average_accuracy.toFixed(1)}% accuracy
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-xl md:text-2xl text-cyan-300 drop-shadow">
                  {entry.best_score}
                </div>
                <div className="text-xs text-cyan-500">
                  best streak
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LeaderboardPanel;
