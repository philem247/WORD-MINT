"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";

type UserStats = {
  total_games: number;
  best_score: number;
  best_streak: number;
  total_words: number;
  average_accuracy: number;
};

const UserStatsPanel = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        setStats(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const channel = supabase
      .channel('user_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-black/70 to-cyan-900/30 backdrop-blur-lg rounded-2xl border-2 border-cyan-400 shadow-[0_0_24px_#00f0ff80] p-6 w-full max-w-md mx-auto">
        <div className="text-cyan-300">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-black/70 to-red-900/30 backdrop-blur-lg rounded-2xl border-2 border-red-400 shadow-[0_0_24px_#ff000080] p-6 w-full max-w-md mx-auto">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gradient-to-br from-black/70 to-cyan-900/30 backdrop-blur-lg rounded-2xl border-2 border-cyan-400 shadow-[0_0_24px_#00f0ff80] p-6 w-full max-w-md mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-glow flex items-center gap-2">
          <span>📊</span> Your Stats
        </h2>
        <p className="text-cyan-300 text-center py-4">
          Play your first game to see your stats!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-black/70 to-cyan-900/30 backdrop-blur-lg rounded-2xl border-2 border-cyan-400 shadow-[0_0_24px_#00f0ff80] p-6 w-full max-w-md mx-auto animate__animated animate__fadeIn">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-glow flex items-center gap-2">
        <span>📊</span> Your Stats
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-200 hover:scale-105">
          <div className="text-cyan-400 text-sm font-semibold mb-1">Best Score</div>
          <div className="text-3xl font-bold text-cyan-300 text-glow">
            {stats.best_score}
          </div>
        </div>

        <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-200 hover:scale-105">
          <div className="text-cyan-400 text-sm font-semibold mb-1">Best Streak</div>
          <div className="text-3xl font-bold text-cyan-300 text-glow">
            {stats.best_streak}
          </div>
        </div>

        <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-200 hover:scale-105">
          <div className="text-cyan-400 text-sm font-semibold mb-1">Total Games</div>
          <div className="text-3xl font-bold text-cyan-300 text-glow">
            {stats.total_games}
          </div>
        </div>

        <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-200 hover:scale-105">
          <div className="text-cyan-400 text-sm font-semibold mb-1">Total Words</div>
          <div className="text-3xl font-bold text-cyan-300 text-glow">
            {stats.total_words}
          </div>
        </div>

        <div className="col-span-2 bg-black/40 rounded-xl p-4 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-200 hover:scale-105">
          <div className="text-cyan-400 text-sm font-semibold mb-1">Average Accuracy</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-cyan-300 text-glow">
              {stats.average_accuracy.toFixed(1)}%
            </div>
            <div className="flex-1 bg-black/40 rounded-full h-3 overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-green-400 transition-all duration-500 ease-out shadow-[0_0_8px_#00f0ff]"
                style={{ width: `${Math.min(stats.average_accuracy, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-cyan-500/30">
        <div className="flex justify-between text-sm text-cyan-400">
          <span>Words per game:</span>
          <span className="font-bold text-cyan-300">
            {stats.total_games > 0 ? (stats.total_words / stats.total_games).toFixed(1) : '0.0'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserStatsPanel;
