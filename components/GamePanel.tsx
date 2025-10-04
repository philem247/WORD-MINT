"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import WORD_BANK from "../data/words.json";
import Confetti from "react-confetti";

type GamePanelProps = Record<string, never>;

export default function GamePanel({}: GamePanelProps) {
  const { user } = useAuth();
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [newWordAllowed, setNewWordAllowed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(30);
  const [totalWords, setTotalWords] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startNewWord = useCallback(() => {
    setUserInput("");
    setStatus("");
    setIsCorrect(false);
    setNewWordAllowed(false);
    setTimer(30);
    setGameStartTime(Date.now());
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


  const saveGameSession = async (finalScore: number) => {
    if (!user) return;

    const duration = Math.floor((Date.now() - gameStartTime) / 1000);
    const accuracy = totalWords > 0 ? (correctWords / totalWords) * 100 : 0;

    const { error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        score: finalScore,
        words_completed: totalWords,
        accuracy: accuracy,
        duration_seconds: duration
      });

    if (sessionError) {
      console.error('Error saving game session:', sessionError);
      return;
    }

    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const newBestScore = Math.max(stats?.best_score || 0, finalScore);
    const newBestStreak = Math.max(stats?.best_streak || 0, finalScore);
    const newTotalGames = (stats?.total_games || 0) + 1;
    const newTotalWords = (stats?.total_words || 0) + totalWords;
    const newAvgAccuracy = stats ?
      ((stats.average_accuracy * stats.total_games) + accuracy) / newTotalGames :
      accuracy;

    await supabase
      .from('user_stats')
      .upsert({
        user_id: user.id,
        total_games: newTotalGames,
        best_score: newBestScore,
        best_streak: newBestStreak,
        total_words: newTotalWords,
        average_accuracy: newAvgAccuracy,
        updated_at: new Date().toISOString()
      });
  };

  const checkAnswer = () => {
    stopTimer();
    const isAnswerCorrect = userInput.trim().toLowerCase() === currentWord.toLowerCase();
    const newTotal = totalWords + 1;
    setTotalWords(newTotal);

    if (isAnswerCorrect) {
      setStatus(`✅ Correct! The word was "${currentWord}".`);
      setIsCorrect(true);
      const newStreak = streak + 1;
      const newCorrect = correctWords + 1;
      setStreak(newStreak);
      setCorrectWords(newCorrect);
      playSound("correct");

      if (user) {
        saveGameSession(newStreak);
      }
    } else {
      setStatus(`❌ Wrong! The word was "${currentWord}".`);
      setIsCorrect(false);
      const finalScore = streak;
      setStreak(0);
      playSound("incorrect");

      if (user && finalScore > 0) {
        saveGameSession(finalScore);
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
        disabled={timer === 0 || !user}
        className={`w-full px-4 py-2 mb-4 rounded-lg text-cyan-300 text-glow bg-black/60 border-2 border-cyan-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400 outline-none transition-all duration-200 shadow-[0_0_12px_#00f0ff80] animate-pulse`}
      />
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={checkAnswer}
          disabled={timer === 0 || !user}
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
      {!user && (
        <div className="mt-4 text-sm text-yellow-300 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">
          ⚠️ Log in to save your progress and compete on the leaderboard!
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
