import React, { useState, useMemo } from 'react';
import { FiAward, FiX, FiCheck, FiAlertCircle, FiRotateCcw, FiHelpCircle } from 'react-icons/fi';
import { generateSnippetQuiz } from '../utils/quizGenerator';

const StudentQuizModal = ({ isOpen, onClose, snippet }) => {
  const questions = useMemo(() => generateSnippetQuiz(snippet), [snippet]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen || !questions.length) return null;

  const currentQ = questions[currentIdx];
  const selected = selectedAnswers[currentIdx];
  const isAnswered = selected !== undefined;
  const isCorrect = selected === currentQ.correctAnswer;

  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: opt }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setCompleted(false);
  };

  const totalScore = Object.entries(selectedAnswers).filter(
    ([idx, ans]) => ans === questions[idx]?.correctAnswer
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-custom-dark-border bg-slate-50/50 dark:bg-custom-dark-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-custom-orangered flex items-center justify-center border border-orange-500/20">
              <FiAward className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Student Practice & Quiz Mode
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Active-recall conceptual testing on "{snippet?.title || 'Snippet'}"
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-custom-dark-surface text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!completed ? (
            <>
              {/* Progress & Category */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-custom-dark-surface text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-custom-dark-border">
                  {currentQ.category}
                </span>
                <span>
                  Question {currentIdx + 1} of {questions.length}
                </span>
              </div>

              {/* Question Statement */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, i) => {
                  let optStyle = 'border-slate-200/80 dark:border-custom-dark-border bg-white dark:bg-custom-dark-surface/40 hover:bg-slate-50 dark:hover:bg-custom-dark-surface text-slate-800 dark:text-slate-200';
                  
                  if (isAnswered) {
                    if (opt === currentQ.correctAnswer) {
                      optStyle = 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs';
                    } else if (opt === selected) {
                      optStyle = 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 line-through opacity-80';
                    } else {
                      optStyle = 'border-slate-200/50 dark:border-custom-dark-border/40 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all duration-150 flex items-center justify-between gap-3 ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && opt === currentQ.correctAnswer && (
                        <FiCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      {isAnswered && opt === selected && opt !== currentQ.correctAnswer && (
                        <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card */}
              {showExplanation && (
                <div className={`p-4 rounded-2xl border animate-fade-in ${
                  isCorrect
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <FiHelpCircle className="w-3.5 h-3.5" />
                    {isCorrect ? 'Correct Analysis!' : 'Answer Insight & Explanation:'}
                  </div>
                  <p className="text-xs leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}
            </>
          ) : (
            /* Quiz Completed Summary */
            <div className="text-center py-8 space-y-4 animate-scale-up">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-500/10 text-custom-orangered flex items-center justify-center border border-orange-500/20">
                <FiAward className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Quiz Complete!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                You scored <span className="font-extrabold text-custom-orangered font-mono text-base">{totalScore}</span> out of <span className="font-mono">{questions.length}</span> questions correct.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-custom-dark-surface/60 border border-slate-200/80 dark:border-custom-dark-border max-w-sm mx-auto text-xs text-slate-600 dark:text-slate-300 text-left space-y-1.5">
                <div className="font-semibold text-slate-900 dark:text-white mb-2">Key Learning Highlights:</div>
                <div>• Time complexity verified and mapped.</div>
                <div>• Critical runtime edge-cases identified.</div>
                <div>• Paradigm mechanics explored for deeper mastery.</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-custom-dark-border bg-slate-50/50 dark:bg-custom-dark-surface/50 flex items-center justify-between">
          {!completed ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs py-2 px-4 rounded-xl"
              >
                Exit
              </button>
              {isAnswered && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary text-xs py-2 px-5 rounded-xl animate-fade-in"
                >
                  {currentIdx + 1 < questions.length ? 'Next Question →' : 'View Results'}
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={handleRestart}
                className="btn-secondary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
              >
                <FiRotateCcw className="w-3.5 h-3.5" /> Retake Quiz
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary text-xs py-2 px-5 rounded-xl"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentQuizModal;
