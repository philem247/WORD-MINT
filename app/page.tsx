'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import Game from '@/components/Game';
import Leaderboard from '@/components/Leaderboard';
import UserStats from '@/components/UserStats';

export default function Page() {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStartGame = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setIsPlaying(true);
    }
  };

  if (isPlaying) {
    return <Game onGameEnd={() => setIsPlaying(false)} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            WordMint
          </h1>
          {user ? (
            <button
              onClick={signOut}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          )}
        </header>

        <div className="text-center mb-12">
          <p className="text-xl text-gray-600 mb-8">
            Listen, spell, and compete! Test your spelling skills and climb the leaderboard.
          </p>
          <button
            onClick={handleStartGame}
            className="bg-blue-600 text-white px-12 py-4 rounded-full text-2xl font-bold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-xl"
          >
            Start Game
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Leaderboard />
          {user && <UserStats />}
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </main>
  );
}
