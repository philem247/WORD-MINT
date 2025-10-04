'use client';

import GamePanel from "../components/GamePanel";
import LeaderboardPanel from "../components/LeaderboardPanel";
import UserStatsPanel from "../components/UserStatsPanel";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import PasswordResetForm from "../components/PasswordResetForm";
import { useState, useRef, useEffect } from "react";
import { useAuth, AuthProvider } from "../lib/auth";

export default function Page() {
  return (
    <AuthProvider>
      <MainPageContent />
    </AuthProvider>
  );
}

function MainPageContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup" | "reset">("login");
  const [musicMuted, setMusicMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [bubbles, setBubbles] = useState<
    Array<{
      id: number;
      width: string;
      height: string;
      top: string;
      left: string;
      animationDuration: string;
    }>
  >([]);
  const [letters, setLetters] = useState<
    Array<{
      id: number;
      letter: string;
      left: string;
      top: string;
      animationDuration: string;
      animationDelay: string;
    }>
  >([]);
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
        onError={(e) => console.error("Audio loading error:", e)}
        onLoadedData={() => console.log("Audio loaded successfully")}
      />

      {/* Music Controls */}
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

        {/* ✅ Volume Control (Fixed Section) */}
        <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded-lg shadow">
          <span className="text-cyan-200 text-xs">Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={musicVolume}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
            className="accent-cyan-400 h-2 w-24"
          />
        </div>
      </div>
    </main>
  );
}