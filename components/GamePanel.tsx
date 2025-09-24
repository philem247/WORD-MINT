"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import WORD_BANK from "../data/words.json";
import Confetti from "react-confetti";

type GamePanelProps = Record<string, never>;

export default function GamePanel({}: GamePanelProps) {
  const { publicKey } = useWallet();
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [newWordAllowed, setNewWordAllowed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startNewWord = useCallback(() => {
    setUserInput("");
    setStatus("");
    setIsCorrect(false);
    setNewWordAllowed(false);
    setTimer(30);
    const randomWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    setCurrentWord(randomWord);
    // TTS
    const utterance = new SpeechSynthesisUtterance(randomWord);
    utterance.lang = "en-US";
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    startTimer();
  }, []);

  useEffect(() => {
    startNewWord();
    // Cleanup timer on unmount
    return () => stopTimer();
  }, [startNewWord]);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          stopTimer();
          setStatus(`⏰ Time's up! The word was "${currentWord}".`);
          setNewWordAllowed(true);
          setIsCorrect(false);
          setStreak(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const replayAudio = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.lang = "en-US";
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const playSound = (type: "correct" | "incorrect") => {
    const audio = new Audio(`/${type}.mp3`);
    audio.play();
  };

  const claimReward = async () => {
    if (!publicKey) {
      setRewardMessage("❌ Wallet not connected!");
      return;
    }

    setIsClaimingReward(true);
    setRewardMessage("⏳ Claiming reward...");

    try {
      const response = await fetch("/api/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey.toBase58() })
      });

      const data = await response.json();

      if (response.ok) {
        setRewardMessage(`✅ ${data.message} View transaction: ${data.txUrl}`);
      } else {
        setRewardMessage(`❌ ${data.error}: ${data.details || ""}`);
      }
    } catch (error) {
      setRewardMessage(`❌ Failed to claim reward: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsClaimingReward(false);
    }
  };

  const checkAnswer = () => {
    stopTimer();
    if (userInput.trim().toLowerCase() === currentWord.toLowerCase()) {
      setStatus(`✅ Correct! The word was "${currentWord}".`);
      setIsCorrect(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      playSound("correct");
      // Update leaderboard via API
      if (publicKey) {
        fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: publicKey.toBase58(), score: newStreak })
        });
      }
    } else {
      setStatus(`❌ Wrong! The word was "${currentWord}".`);
      setIsCorrect(false);
      setStreak(0);
      playSound("incorrect");
      // Optionally, update leaderboard with zero score
      if (publicKey) {
        fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: publicKey.toBase58(), score: 0 })
        });
      }
    }
    setNewWordAllowed(true);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-8 w-full max-w-3xl z-10">
      {streak > 0 && streak % 5 === 0 && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <p className="mb-4 text-base md:text-lg">🎧 Listen carefully and type the word you hear:</p>
  {/* Removed duplicate Time Left label. Only progress bar section remains. */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-yellow-300 font-semibold text-base md:text-lg">⏱ Time Left: {timer}s</span>
          </div>
          <div className="w-full h-3 bg-cyan-900/40 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-green-400 neon-bar transition-all duration-100"
              style={{ width: `${(timer / 30) * 100}%` }}
            />
          </div>
        </div>
      <div className="flex justify-center gap-3 mb-4 flex-wrap">
        <button
          onClick={startNewWord}
          disabled={!newWordAllowed}
          className={`btn-glow ${newWordAllowed ? "" : "opacity-50 cursor-not-allowed"}`}
        >
          {newWordAllowed ? "🔊 New Word" : "⏳ Submit first"}
        </button>
        <button
          onClick={replayAudio}
          className="btn-glow bg-yellow-500 hover:bg-yellow-600"
        >
          🔁 Replay
        </button>
      </div>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Type the word"
        disabled={timer === 0 || !publicKey}
        className={`w-full px-4 py-2 mb-4 rounded-lg text-cyan-300 text-glow bg-black/60 border-2 border-cyan-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400 outline-none transition-all duration-200 shadow-[0_0_12px_#00f0ff80] animate-pulse`}
      />
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={checkAnswer}
          disabled={timer === 0 || !publicKey}
          className="btn-glow px-6 py-2 text-lg"
        >
          ✅ Submit
        </button>
        <button
          onClick={() => {
            setUserInput("");
            setStatus("");
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
        >
          🧹 Clear
        </button>
      </div>
      <div className="mt-2 text-lg md:text-xl transition-transform duration-300">
        <span className={isCorrect ? "scale-125 text-green-400" : "scale-100 text-white"}>
          🔥 Streak: {streak}
        </span>
      </div>
      <div className="mt-4 text-lg md:text-xl">{status}</div>
      {!publicKey && (
        <div className="mt-4 text-sm text-yellow-300 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">
          ⚠️ Connect your wallet to claim $WORD rewards and compete on the leaderboard!
        </div>
      )}
      {isCorrect && (
        <div className="mt-6 space-y-3">
          <button
            onClick={claimReward}
            disabled={isClaimingReward}
            className={`btn-glow px-6 py-2 text-lg ${isClaimingReward ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isClaimingReward ? "⏳ Claiming..." : "🎁 Claim 1 $WORD"}
          </button>
          {rewardMessage && (
            <div className="text-sm text-cyan-300 bg-black/40 p-3 rounded-lg">
              {rewardMessage}
            </div>
          )}
        </div>
      )}
        <style jsx>{`
          .neon-bar {
            box-shadow: 0 0 8px #00f0ff, 0 0 16px #00ff85, 0 0 24px #00ff85;
          }
        `}</style>
    </div>
  );
}
