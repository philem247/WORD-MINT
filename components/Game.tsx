'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Confetti from 'react-confetti';
import words from '@/data/words.json';

type GameProps = {
  onGameEnd: () => void;
};

export default function Game({ onGameEnd }: GameProps) {
  const { user } = useAuth();
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const correctAudioRef = useRef<HTMLAudioElement>(null);
  const incorrectAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadNewWord();
  }, []);

  const loadNewWord = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setUserInput('');
    setFeedback(null);

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(randomWord);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isCorrect = userInput.toLowerCase().trim() === currentWord.toLowerCase();
    setWordsCompleted(prev => prev + 1);

    if (isCorrect) {
      const newStreak = streak + 1;
      const points = 10 + (newStreak * 2);
      setScore(prev => prev + points);
      setStreak(newStreak);
      setCorrectWords(prev => prev + 1);
      setFeedback('correct');
      correctAudioRef.current?.play();

      if (newStreak % 5 === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      setTimeout(() => loadNewWord(), 1000);
    } else {
      setStreak(0);
      setFeedback('incorrect');
      incorrectAudioRef.current?.play();
      setTimeout(() => loadNewWord(), 1500);
    }
  };

  const handleEndGame = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = wordsCompleted > 0 ? (correctWords / wordsCompleted) * 100 : 0;

    if (user) {
      await supabase.from('game_sessions').insert({
        user_id: user.id,
        score,
        words_completed: wordsCompleted,
        accuracy: accuracy.toFixed(2),
        duration_seconds: duration,
      });
    }

    onGameEnd();
  };

  const repeatWord = () => {
    if ('speechSynthesis' in window && currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      {showConfetti && <Confetti />}

      <audio ref={correctAudioRef} src="/static/correct.mp3" preload="auto" />
      <audio ref={incorrectAudioRef} src="/static/incorrect.mp3" preload="auto" />

      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="text-3xl font-bold text-gray-800">Score: {score}</div>
            <div className="text-sm text-gray-600">Streak: {streak}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Words: {wordsCompleted}</div>
            <div className="text-sm text-gray-600">
              Accuracy: {wordsCompleted > 0 ? ((correctWords / wordsCompleted) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <button
            onClick={repeatWord}
            className="bg-blue-600 text-white px-8 py-4 rounded-full text-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            🔊 Listen
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full px-6 py-4 text-2xl border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 text-center text-gray-800"
            placeholder="Type the word here..."
            autoFocus
          />
        </form>

        {feedback && (
          <div
            className={`text-center text-xl font-bold mb-4 ${
              feedback === 'correct' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {feedback === 'correct' ? '✓ Correct!' : `✗ Wrong! The word was: ${currentWord}`}
          </div>
        )}

        <button
          onClick={handleEndGame}
          className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          End Game
        </button>
      </div>
    </div>
  );
}
