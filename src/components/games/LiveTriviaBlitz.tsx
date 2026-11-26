import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { pickRandomTriviaSet } from '../../data/triviaQuestions';
import type { GameOutcome } from './types';

interface LiveTriviaBlitzProps {
  yourTableNumber: number;
  opponentTableNumber: number;
  onComplete: (outcome: GameOutcome) => void;
  onExit: () => void;
}

const QUESTION_SECONDS = 10;

export function LiveTriviaBlitz({
  yourTableNumber,
  opponentTableNumber,
  onComplete,
  onExit,
}: LiveTriviaBlitzProps) {
  const questions = useMemo(() => pickRandomTriviaSet(5), []);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [yourScore, setYourScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [oppStatusNote, setOppStatusNote] = useState<string>('Answering live…');

  const currentQuestion = questions[qIndex];

  // Countdown timer per question
  useEffect(() => {
    if (selectedIdx !== null) return;

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
  }, [qIndex, selectedIdx]);

  // Simulate opponent table answering live partway through each question
  useEffect(() => {
    setOppStatusNote(`Table ${opponentTableNumber} is answering…`);
    const answerDelayMs = 2200 + Math.floor(Math.random() * 2800);
    const oppTimer = window.setTimeout(() => {
      const oppGotItRight = Math.random() < 0.62;
      if (oppGotItRight) {
        setOppScore((s) => s + 1);
        setOppStatusNote(`Table ${opponentTableNumber} locked in (+1)`);
      } else {
        setOppStatusNote(`Table ${opponentTableNumber} locked in`);
      }
    }, answerDelayMs);

    return () => window.clearTimeout(oppTimer);
  }, [qIndex, opponentTableNumber]);

  // Auto-advance if timer hits 0
  useEffect(() => {
    if (selectedIdx !== null || timeLeft > 0) return;

    const advance = window.setTimeout(() => {
      moveToNextQuestion(yourScore, oppScore);
    }, 550);

    return () => window.clearTimeout(advance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, selectedIdx]);

  const moveToNextQuestion = (latestYours: number, latestOpp: number) => {
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
      setSelectedIdx(null);
      setTimeLeft(QUESTION_SECONDS);
      return;
    }

    const yourLabel = `Table ${yourTableNumber}`;
    const oppLabel = `Table ${opponentTableNumber}`;

    if (latestYours === latestOpp) {
      onComplete({
        winnerName: 'Draw',
        isDraw: true,
        summaryLine: `Both tables finished tied at ${latestYours} out of ${questions.length}.`,
        scoreDetail: `${yourLabel}: ${latestYours}/5 · ${oppLabel}: ${latestOpp}/5`,
      });
    } else {
      const winnerName = latestYours > latestOpp ? yourLabel : oppLabel;
      onComplete({
        winnerName,
        summaryLine: `${winnerName} won the 5-question Live Trivia Blitz!`,
        scoreDetail: `${yourLabel}: ${latestYours}/5 · ${oppLabel}: ${latestOpp}/5`,
      });
    }
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(optionIdx);

    const isCorrect = optionIdx === currentQuestion.correctIndex;
    const nextYours = isCorrect ? yourScore + 1 : yourScore;
    if (isCorrect) setYourScore(nextYours);

    window.setTimeout(() => {
      moveToNextQuestion(nextYours, oppScore);
    }, 850);
  };

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

        <span className="text-xs font-semibold font-mono-num text-[#71717A]">
          Q{qIndex + 1}/{questions.length} · Live Blitz
        </span>
      </div>

      {/* Live Scoreboard Bar */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-[#4A5D4E] text-white p-3.5">
          <div className="text-[11px] text-white/80">
            Table {yourTableNumber} (You)
          </div>
          <div className="font-display text-2xl font-bold font-mono-num mt-0.5">
            {yourScore}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#E7E5E0] p-3.5">
          <div className="text-[11px] text-[#71717A] truncate">
            Table {opponentTableNumber}
          </div>
          <div className="font-display text-2xl font-bold font-mono-num text-[#C26D4A] mt-0.5">
            {oppScore}
          </div>
          <div className="text-[10px] text-[#71717A] truncate mt-0.5">
            {oppStatusNote}
          </div>
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

        <div className="h-1.5 w-full rounded-full bg-[#E7E5E0] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              timeLeft <= 3 ? 'bg-[#C26D4A]' : 'bg-[#4A5D4E]'
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
