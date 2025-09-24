"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

type GameState = "idle" | "listening" | "countdown" | "result";

interface LeaderboardEntry {
  player: string;
  score: number;
}

const WEB3_KEYWORDS = [
  "blockchain",
  "wallet",
  "crypto",
  "solana",
  "token",
  "mint",
  "staking",
  "dao",
  "airdrop",
];

export default function Home() {
  const { publicKey } = useWallet();
  const [words, setWords] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [input, setInput] = useState("");
  const [state, setState] = useState<GameState>("idle");
  const [seconds, setSeconds] = useState(30);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch words
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://random-word-api.herokuapp.com/word?number=8");
        const apiWords: string[] = await res.json();
        const clean = apiWords
          .concat(WEB3_KEYWORDS)
          .map((w) => String(w).toLowerCase())
          .filter((w) => /^[a-z]+$/.test(w) && w.length >= 4 && w.length <= 12);
        setWords(Array.from(new Set(clean)));
      } catch {
        setWords(["elephant", "bicycle", "mystery", "galaxy", ...WEB3_KEYWORDS]);
      }
    })();
  }, []);

  // Poll leaderboard every 3 seconds
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data: LeaderboardEntry[] = await res.json();
        setLeaderboard(data);
      } catch (e) {
        console.log("Leaderboard fetch failed:", e);
      }
    };
    fetchLeaderboard();
    pollRef.current = setInterval(fetchLeaderboard, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const canPlay = useMemo(() => words.length > 0 && state !== "countdown", [words, state]);

  function pickWord() {
    const rnd = words[Math.floor(Math.random() * words.length)];
    setCurrent(rnd);
  }

  function speakWord() {
    if (!("speechSynthesis" in window)) {
      setFeedback("Speech not supported in this browser.");
      return;
    }
    const u = new SpeechSynthesisUtterance(current);
    u.rate = 0.9;
    u.onstart = () => {
      setState("listening");
      setFeedback(null);
    };
    u.onend = () => startCountdown();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function startRound() {
    setInput("");
    setFeedback(null);
    pickWord();
    setTimeout(speakWord, 150);
  }

  function startCountdown() {
    setState("countdown");
    setSeconds(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setState("result");
          setFeedback(`⛔ Time's up! The word was "${current}".`);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function submitAnswer() {
    if (state !== "countdown") return;
    if (timerRef.current) clearInterval(timerRef.current);
    const correct = input.trim().toLowerCase() === current.toLowerCase();
    setState("result");
    setFeedback(
      correct
        ? "✅ Correct! You can claim your reward."
        : `❌ Not quite. The word was "${current}".`
    );

    // Update leaderboard on server
    if (correct && publicKey) {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: publicKey.toBase58(), score: 1 }),
      });
    }
  }

  async function claimReward() {
    if (!publicKey) {
      setFeedback("Connect your wallet first.");
      return;
    }
    try {
      const resp = await fetch("/api/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: publicKey.toBase58() }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Reward failed");
      setFeedback(`🎉 Reward sent! Tx: ${data.signature}`);
    } catch (e: unknown) {
      setFeedback(`Reward error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <>
      <Head>
        <title>WordMint MVP</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-blue-900 to-purple-900 text-white flex flex-col items-center animate-bg-fade">
        <header className="w-full max-w-3xl flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">WordMint (Devnet)</h1>
          <WalletMultiButton />
        </header>

        <main className="w-full max-w-3xl mt-10 p-8 bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-xl border border-blue-500 flex flex-col md:flex-row gap-8">
          {/* Game Panel */}
          <div className="flex-1 space-y-4">
            <p className="text-sm text-gray-300 mb-4">
              Hear the word → you have 30 seconds to type it correctly.
            </p>

            <button
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition"
              onClick={startRound}
              disabled={!canPlay}
            >
              ▶️ Play Word
            </button>

            <div className="flex items-center gap-3">
              <input
                style={{
                  boxShadow:
                    state === "countdown"
                      ? "0 0 10px #00ffff, 0 0 20px #00ffff77, 0 0 30px #00ffffaa"
                      : undefined,
                  transition: "box-shadow 0.3s ease-in-out",
                }}
                className="flex-1 p-3 rounded-xl border-2 border-blue-400 bg-gray-800/80 text-white placeholder-gray-400 focus:outline-none"
                placeholder="Type the word here"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={state !== "countdown"}
              />
              <button
                className="px-5 py-3 rounded-xl border border-blue-400 text-white hover:bg-blue-600 transition"
                onClick={submitAnswer}
                disabled={state !== "countdown"}
              >
                Submit
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                {state === "countdown"
                  ? `⏳ Time left: ${seconds}s`
                  : state === "listening"
                  ? "🔊 Listening…"
                  : " "}
              </div>
              <div className="text-sm text-gray-400">
                Devnet mint: {process.env.NEXT_PUBLIC_WORD_TOKEN_MINT?.slice(0, 6)}…
              </div>
            </div>

            {feedback && (
              <div className="p-3 rounded-lg bg-gray-800/80 text-white border border-blue-400">
                {feedback}
              </div>
            )}

            {state === "result" && feedback?.startsWith("✅") && (
              <button
                onClick={claimReward}
                className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                disabled={!publicKey}
              >
                🎁 Claim 1 $WORD
              </button>
            )}

            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-400">
                Debug (show current word)
              </summary>
              <div className="mt-2 text-sm font-mono">{current || "-"}</div>
            </details>
          </div>

          {/* Leaderboard Panel */}
          <div className="flex-1 p-4 bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-purple-500 shadow-xl">
            <h2 className="text-lg font-bold text-purple-400 mb-4">🏆 Leaderboard</h2>
            {leaderboard.length === 0 ? (
              <p className="text-gray-400">No scores yet. Be the first!</p>
            ) : (
              <ul className="space-y-2">
                {leaderboard
                  .sort((a, b) => b.score - a.score)
                  .map((entry, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between px-3 py-2 rounded-lg bg-gray-900/50 border border-purple-400"
                    >
                      <span>{entry.player}</span>
                      <span>{entry.score}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </main>

        <footer className="py-6 text-xs text-gray-400">Built on Solana Devnet</footer>
      </div>

      <style jsx>{`
        @keyframes bg-fade {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-bg-fade {
          background-size: 200% 200%;
          animation: bg-fade 10s ease infinite;
        }
      `}</style>
    </>
  );
}
