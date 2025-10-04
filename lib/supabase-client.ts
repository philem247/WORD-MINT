'use client';

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Profile = {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
};

export type GameSession = {
  id: string;
  user_id: string;
  score: number;
  words_completed: number;
  accuracy: number;
  duration_seconds: number;
  created_at: string;
};

export type UserStats = {
  user_id: string;
  total_games: number;
  best_score: number;
  best_streak: number;
  total_words: number;
  average_accuracy: number;
  updated_at: string;
};