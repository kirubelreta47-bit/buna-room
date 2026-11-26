import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock, EyeOff, ArrowRight } from 'lucide-react';
import { pickRandomTriviaSet } from '../../data/triviaQuestions';
import type { GameOutcome } from './types';

interface TriviaGameProps {
  onComplete: (outcome: GameOutcome) => void;
  onExit: () => void;
}

type TriviaPhase = 'p1-play' | 'handoff' | 'p2-play';

const QUESTION_SECONDS = 10;

export function TriviaGame({ onComplete, onExit }: TriviaGameProps) {
  const questions = useMemo(() => pickRandomTriviaSet(5), []);
  const [phase, setPhase] = useState<TriviaPhase>('p1-play');
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  const currentQuestion = questions[qIndex];

  useEffect(() => {
    if (phase === 'handoff' || selectedIdx !== null) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase, qIndex, selectedIdx]);

  // Auto-advance when timer hits 0
  useEffect(() => {
    if (phase === 'handoff' || selectedIdx !== null || timeLeft > 0) return;

    const advance = window.setTimeout(() => {
      moveToNextQuestion(p1Score, p2Score);
    }, 450);

    return () => window.clearTimeout(advance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, selectedIdx]);

  const moveToNextQuestion = (latestP1: number, latestP2: number) => {
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
      setSelectedIdx(null);
      setTimeLeft(QUESTION_SECONDS);
      return;
    }

    if (phase === 'p1-play') {
      setPhase('handoff');
      setQIndex(0);
      setSelectedIdx(null);
      setTimeLeft(QUESTION_SECONDS);
      return;
    }

    // Both players finished -> declare outcome
    if (latestP1 === latestP2) {
      onComplete({
        winnerName: 'Draw',
        isDraw: true,
        summaryLine: `Both players scored ${latestP1} out of ${questions.length}.`,
        scoreDetail: `Player 1: ${latestP1}/5 · Player 2: ${latestP2}/5`,
      });
    } else {
      const winnerName = latestP1 > latestP2 ? 'Player 1' : 'Player 2';
      onComplete({
        winnerName,
        summaryLine: `${winnerName} took the trivia duel.`,
        scoreDetail: `Player 1: ${latestP1}/5 · Player 2: ${latestP2}/5`,
      });
    }
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (selectedIdx !== null || phase === 'handoff') return;
    setSelectedIdx(optionIdx);

    const isCorrect = optionIdx === currentQuestion.correctIndex;
    const nextP1 = phase === 'p1-play' && isCorrect ? p1Score + 1 : p1Score;
    const nextP2 = phase === 'p2-play' && isCorrect ? p2Score + 1 : p2Score;

    if (phase === 'p1-play' && isCorrect) setP1Score(nextP1);
    if (phase === 'p2-play' && isCorrect) setP2Score(nextP2);

    window.setTimeout(() => {
      moveToNextQuestion(nextP1, nextP2);
    }, 750);
  };

  if (phase === 'handoff') {
    return (
      <div className="px-4 pt-3 pb-24 space-y-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="min-h-[40px] px-2 -ml-2 rounded-xl text-sm font-medium text-[#18181B] hover:bg-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quit</span>
          </button>
          <span className="text-xs font-medium text-[#71717A]">
            Privacy Handoff
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-[#E7E5E0] p-6 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#4A5D4E]/10 text-[#4A5D4E] mx-auto flex items-center justify-center">
            <EyeOff className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#18181B]">
              Pass the Phone to Player 2
            </h2>
            <p className="text-sm text-[#71717A] mt-1.5">
              Player 1’s score is hidden until both rounds finish. Player 2 gets
              the exact same 5 questions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPhase('p2-play');
              setQIndex(0);
              setSelectedIdx(null);
              setTimeLeft(QUESTION_SECONDS);
            }}
            className="w-full min-h-[50px] rounded-xl bg-[#C26D4A] hover:bg-[#A65A3B] text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.985] transition"
          >
            <span>I’m Player 2 — Start My Round</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const isP1 = phase === 'p1-play';

  return (
    <div className="px-4 pt-3 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="min-h-[40px] px-2 -ml-2 rounded-xl text-sm font-medium text-[#18181B] hover:bg-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quit</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={isP1 ? 'text-[#4A5D4E]' : 'text-[#C26D4A]'}>
            {isP1 ? 'Player 1' : 'Player 2'}
          </span>
          <span className="text-[#A1A1AA]">·</span>
          <span className="font-mono-num text-[#71717A]">
            Q{qIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl border border-[#E7E5E0] p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-[#71717A]">
            {currentQuestion.category}
          </span>
          <div
            className={`flex items-center gap-1.5 font-mono-num text-sm font-semibold ${
              timeLeft <= 3 ? 'text-[#C26D4A]' : 'text-[#18181B]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Countdown Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-[#E7E5E0] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              timeLeft <= 3
                ? 'bg-[#C26D4A]'
                : isP1
                  ? 'bg-[#4A5D4E]'
                  : 'bg-[#C26D4A]'
            }`}
            style={{ width: `${(timeLeft / QUESTION_SECONDS) * 100}%` }}
          />
        </div>

        <h2 className="font-display text-xl font-semibold text-[#18181B] leading-snug pt-1">
          {currentQuestion.question}
        </h2>

        <div className="space-y-2.5 pt-1">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedIdx === idx;
            const isCorrect = idx === currentQuestion.correctIndex;
            const reveal = selectedIdx !== null;

            let btnStyle =
              'bg-[#FAF8F5] border-[#E7E5E0] text-[#18181B] hover:border-[#4A5D4E]';
            if (reveal) {
              if (isCorrect) {
                btnStyle = 'bg-[#4A5D4E] border-[#4A5D4E] text-white';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'bg-[#C26D4A] border-[#C26D4A] text-white';
              } else {
                btnStyle = 'bg-[#FAF8F5] border-[#E7E5E0] text-[#A1A1AA]';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={selectedIdx !== null}
                onClick={() => handleSelectAnswer(idx)}
                className={`w-full min-h-[48px] px-4 py-3 rounded-xl border text-left text-sm font-medium transition active:scale-[0.985] ${btnStyle}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
