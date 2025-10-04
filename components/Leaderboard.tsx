'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type LeaderboardEntry = {
  user_id: string;
  username: string;
  best_score: number;
  total_games: number;
  average_accuracy: number;
};

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        user_id,
        best_score,
        total_games,
        average_accuracy,
        profiles!inner(username)
      `)
      .order('best_score', { ascending: false })
      .limit(10);

    if (!error && data) {
      const formatted = data.map((entry: any) => ({
        user_id: entry.user_id,
        username: entry.profiles.username,
        best_score: entry.best_score,
        total_games: entry.total_games,
        average_accuracy: entry.average_accuracy,
      }));
      setEntries(formatted);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading leaderboard...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Top Players
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-3 px-4 text-left text-gray-700">Rank</th>
              <th className="py-3 px-4 text-left text-gray-700">Player</th>
              <th className="py-3 px-4 text-right text-gray-700">Best Score</th>
              <th className="py-3 px-4 text-right text-gray-700">Games</th>
              <th className="py-3 px-4 text-right text-gray-700">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.user_id}
                className={`border-b border-gray-100 ${
                  index < 3 ? 'bg-yellow-50' : ''
                }`}
              >
                <td className="py-3 px-4 font-semibold text-gray-800">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && index + 1}
                </td>
                <td className="py-3 px-4 text-gray-800">{entry.username}</td>
                <td className="py-3 px-4 text-right font-bold text-blue-600">
                  {entry.best_score}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">
                  {entry.total_games}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">
                  {entry.average_accuracy.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
