"use client";

import GamePanel from "../components/GamePanel";
import LeaderboardPanel from "../components/LeaderboardPanel";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import { useState, useRef, useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "../lib/auth";

export default function Page() {
  const { publicKey, disconnect } = useWallet();
  const { user, profile, loading, signOut } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [bubbles, setBubbles] = useState<Array<{id: number, width: string, height: string, top: string, left: string, animationDuration: string}>>([]);
  const [letters, setLetters] = useState<Array<{id: number, letter: string, left: string, top: string, animationDuration: string, animationDelay: string}>>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Generate bubbles with random styles
    const newBubbles = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      width: `${30 + Math.random() * 60}px`,
      height: `${30 + Math.random() * 60}px`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDuration: `${6 + Math.random() * 8}s`,
    }));
    setBubbles(newBubbles);

    // Generate letters with random properties
    const letterSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const newLetters = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      letter: letterSet[Math.floor(Math.random() * letterSet.length)],
      left: `${Math.random() * 100}%`,
      top: `-${Math.random() * 20 + 5}%`,
      animationDuration: `${3 + Math.random() * 4}s`,
      animationDelay: `${Math.random() * 4}s`,
    }));
    setLetters(newLetters);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = musicMuted;
      audioRef.current.volume = musicVolume;
    }
  }, [musicMuted, musicVolume]);

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log("Audio play failed:", error);
      });
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
      {/* Background Music */}
      <audio
        ref={audioRef}
        src="/ANTHEM.mp3"
        loop
        hidden
        onError={(e) => {
          console.error("Audio loading error:", e);
        }}
        onLoadedData={() => {
          console.log("Audio loaded successfully");
        }}
      />
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        <button
          className="bg-black/60 text-cyan-200 px-3 py-2 rounded-lg shadow-lg text-xs font-mono hover:bg-cyan-900 transition"
          onClick={() => setMusicMuted((m) => !m)}
          aria-label={musicMuted ? "Unmute music" : "Mute music"}
        >
          {musicMuted ? "🔇 Music Off" : "🔊 Music On"}
        </button>
        <button
          className="bg-black/60 text-cyan-200 px-3 py-2 rounded-lg shadow-lg text-xs font-mono hover:bg-cyan-900 transition"
          onClick={playMusic}
          aria-label="Play background music"
        >
          🎵 Play Music
        </button>
        <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded-lg shadow">
          <span className="text-cyan-200 text-xs">Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={musicVolume}
            onChange={e => setMusicVolume(Number(e.target.value))}
            className="accent-cyan-400 h-2 w-24"
          />
        </div>
      </div>
      {/* Animated Futuristic Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-900 via-black to-indigo-900 animate-gradient-move" />

      {/* Floating Neon Bubbles & Falling Letters */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {bubbles.map((bubble) => (
          <div
            key={"bubble-" + bubble.id}
            className="absolute rounded-full bg-cyan-400/20 blur-xl animate-bubble"
            style={{
              width: bubble.width,
              height: bubble.height,
              top: bubble.top,
              left: bubble.left,
              animationDuration: bubble.animationDuration,
            }}
          />
        ))}
        {letters.map((letterData) => (
          <span
            key={"letter-" + letterData.id}
            className="absolute text-3xl font-mono text-cyan-300 text-glow animate-fall-letter select-none pointer-events-none"
            style={{
              left: letterData.left,
              top: letterData.top,
              animationDuration: letterData.animationDuration,
              animationDelay: letterData.animationDelay,
            }}
          >
            {letterData.letter}
          </span>
        ))}
      </div>

      {/* Main Game Container */}
      <div className="w-full max-w-5xl mx-auto px-4 py-10 flex flex-col gap-10 items-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-glow mb-4 text-center tracking-tight drop-shadow-lg">WordMint</h1>
        <p className="text-lg md:text-xl text-cyan-200 mb-8 text-center font-mono">Spell-to-Earn on Solana 🚀</p>

        {loading ? (
          <div className="text-cyan-200 text-lg">Loading...</div>
        ) : !user ? (
          <>
            {showSignup ? (
              <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
            ) : (
              <LoginForm onSwitchToSignup={() => setShowSignup(true)} />
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="bg-black/60 px-6 py-3 rounded-lg text-cyan-200">
                Welcome, <span className="font-bold text-cyan-400">{profile?.username || 'Player'}</span>!
              </div>
              <div className="flex flex-col items-center gap-2">
                <WalletMultiButton />
                {publicKey && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xs text-cyan-300 bg-black/40 px-3 py-1 rounded-lg">
                      Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                    </div>
                    <button
                      className="text-xs text-cyan-300 underline hover:text-cyan-400 transition"
                      onClick={() => disconnect()}
                    >Disconnect Wallet</button>
                  </div>
                )}
              </div>
              <button
                onClick={signOut}
                className="text-sm text-cyan-300 underline hover:text-cyan-400 transition"
              >
                Sign Out
              </button>
            </div>

            {publicKey ? (
              <>
                <GamePanel />
                <LeaderboardPanel />
              </>
            ) : (
              <div className="bg-black/60 rounded-xl p-8 text-center text-cyan-200 text-lg shadow-lg">
                Please connect your wallet to play the game.
              </div>
            )}
          </>
        )}
      </div>

      {/* Bubble & Falling Letter Animation Keyframes */}
      <style jsx>{`
        @keyframes bubble {
          0% { transform: translateY(0); opacity: 0.7; }
          100% { transform: translateY(-120vh); opacity: 0.2; }
        }
        .animate-bubble {
          animation-name: bubble;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-move {
          background-size: 200% 200%;
          animation: gradient-move 12s ease-in-out infinite;
        }
        @keyframes fall-letter {
          0% { transform: translateY(0); opacity: 0.8; }
          80% { opacity: 0.7; }
          100% { transform: translateY(110vh); opacity: 0.1; }
        }
        .animate-fall-letter {
          animation-name: fall-letter;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </main>
  );
}
