import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { QuizQuestion } from '../types';
import { getQuestionsForSubject, SUBJECT_QUIZZES } from '../data/subjectQuizzes';

interface InteractiveQuizProps {
  questions?: QuizQuestion[];
  selectedSubject?: string;
  initialSubject?: string;
  currentCycle?: string;
  currentGradeId?: string;
  onAddXP: (amount: number) => void;
  onFinishQuiz?: () => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  questions: propQuestions,
  selectedSubject,
  initialSubject: initialPropSubject,
  onAddXP,
  onFinishQuiz,
}) => {
  const initialSubject = initialPropSubject || selectedSubject || 'الرياضيات';
  const [activeSubject, setActiveSubject] = useState<string>(initialSubject);

  useEffect(() => {
    if (initialSubject && initialSubject !== 'الكل') {
      setActiveSubject(initialSubject);
    }
  }, [initialSubject]);

  // Build the question list based on the chosen subject
  const currentSubjectQuestions: QuizQuestion[] = React.useMemo(() => {
    if (propQuestions && propQuestions.length > 0) {
      return propQuestions;
    }
    const rawItems = getQuestionsForSubject(activeSubject);
    return rawItems.map((item, idx) => ({
      id: idx + 1,
      question: item.q,
      options: item.a,
      correctAnswer: item.correct,
      explanation: item.exp,
    }));
  }, [propQuestions, activeSubject]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOriginalIdx, setSelectedOriginalIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Current Question
  const currentQ = currentSubjectQuestions[currentIndex] || null;

  // Shuffled options for current question
  const [shuffledOptions, setShuffledOptions] = useState<{ text: string; originalIndex: number }[]>([]);

  useEffect(() => {
    if (currentQ) {
      const mapped = currentQ.options.map((text, originalIndex) => ({ text, originalIndex }));
      const shuffled = [...mapped];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledOptions(shuffled);
      setSelectedOriginalIdx(null);
      setIsAnswered(false);
    }
  }, [currentIndex, currentQ]);

  const handleSelectOption = (originalIdx: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedOriginalIdx(originalIdx);
    setIsAnswered(true);

    if (originalIdx === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
      onAddXP(20);
    }
  };

  const handleNext = () => {
    if (currentIndex < currentSubjectQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOriginalIdx(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
      onAddXP(50);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOriginalIdx(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleChangeSubject = (subj: string) => {
    setActiveSubject(subj);
    setCurrentIndex(0);
    setSelectedOriginalIdx(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (!currentQ) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8">
          <HelpCircle className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">لا توجد أسئلة متوفرة لهذه المادة</h2>
          <p className="text-slate-500 text-sm mb-6">يرجى اختيار مادة أخرى لبدء الاختبار التفاعلي المباشر.</p>
          <button
            onClick={() => handleChangeSubject('الرياضيات')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs"
          >
            اختبار الرياضيات
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4 text-right">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">أحسنت يا بطل! أنهيت اختبار {activeSubject}</h2>
          <p className="text-slate-600 text-sm mb-6">
            نتيجتك: <span className="font-bold text-purple-600 text-lg">{score}</span> من{' '}
            <span className="font-bold">{currentSubjectQuestions.length}</span>
          </p>

          <div className="flex items-center justify-center gap-3 bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 text-amber-900 text-sm font-bold">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>ربحت +{score * 20 + 50} نقطة لتعزيز مستواك ورتبتك!</span>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={restartQuiz}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة اختبار {activeSubject}
            </button>

            <button
              onClick={onFinishQuiz}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-md"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 text-right">
      {/* Subject Switcher Header - Per User Directive: Let user pick subject, questions only for that subject */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
              🎯
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                اختبر نفسك في مادة: <span className="text-purple-700">{activeSubject}</span>
              </h2>
              <span className="text-[11px] text-slate-500">
                الأسئلة مخصصة حصرياً للمادة المحددة دون خلط المواد ببعضها
              </span>
            </div>
          </div>

          <span className="text-xs font-bold bg-purple-50 text-purple-800 px-3 py-1 rounded-full border border-purple-200">
            السؤال {currentIndex + 1} من {currentSubjectQuestions.length}
          </span>
        </div>

        {/* Subject buttons */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
          {Object.keys(SUBJECT_QUIZZES).map((subj) => (
            <button
              key={subj}
              onClick={() => handleChangeSubject(subj)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                activeSubject === subj
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 sm:p-8">
        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
          <div
            className="bg-purple-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / currentSubjectQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question Title */}
        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-6 leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Shuffled Options */}
        <div className="space-y-3 mb-6">
          {shuffledOptions.map((item, displayIdx) => {
            const isCorrect = item.originalIndex === currentQ.correctAnswer;
            const isSelected = item.originalIndex === selectedOriginalIdx;

            let btnStyle = 'bg-slate-50 border-slate-200 hover:border-purple-500 text-slate-800';
            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-purple-50 border-purple-500 text-purple-900 font-bold shadow-xs';
              } else if (isSelected) {
                btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
              } else {
                btnStyle = 'bg-slate-50 opacity-60 border-slate-200 text-slate-600';
              }
            }

            return (
              <button
                key={displayIdx}
                onClick={() => handleSelectOption(item.originalIndex)}
                disabled={isAnswered}
                className={`w-full text-right p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-between text-xs sm:text-sm font-bold ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-200/80 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {displayIdx + 1}
                  </span>
                  <span>{item.text}</span>
                </div>
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 mb-6 text-xs sm:text-sm text-purple-950 animate-fadeIn">
            <p className="font-bold mb-1 text-purple-900">💡 الشرح والتصحيح النموذجي:</p>
            <p className="leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Next Question Button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md"
          >
            <span>
              {currentIndex < currentSubjectQuestions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة النهائية'}
            </span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>
    </div>
  );
};
