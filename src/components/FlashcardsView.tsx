import React, { useState } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, Sparkles, RotateCw, CheckCircle2 } from 'lucide-react';
import { FlashcardItem } from '../types';

interface FlashcardsViewProps {
  flashcards: FlashcardItem[];
  onAddXP: (amount: number) => void;
  onBrowseLessons: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ flashcards, onAddXP, onBrowseLessons }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <BookOpen className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">لا توجد بطاقات حفظ حالياً</h2>
          <p className="text-slate-500 text-sm mb-6">قم بتصوير درسك في قسم "تصوير وتلخيص الدرس" لتوليد بطاقات حفظ ذكية مخصصة.</p>
          <button
            onClick={onBrowseLessons}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-md"
          >
            تصوير درس جديد
          </button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
      onAddXP(15);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-slate-900 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          بطاقات الحفظ السريعة (Flashcards)
        </h2>
        <p className="text-xs text-slate-500 mt-1">اضغط على البطاقة لقلبها ومعرفة الإجابة الصحيحة</p>
      </div>

      {/* Flashcard item */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="bg-gradient-to-br from-purple-600 to-teal-700 text-white rounded-3xl shadow-xl p-8 sm:p-12 min-h-[280px] flex flex-col items-center justify-center text-center cursor-pointer transition-all transform hover:scale-[1.01] relative select-none"
      >
        <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
          {currentIndex + 1} / {flashcards.length}
        </div>

        <div className="absolute top-4 left-4 text-xs font-medium text-purple-100 flex items-center gap-1">
          <RotateCw className="w-3.5 h-3.5" />
          <span>اضغط للقلب</span>
        </div>

        <div className="mt-4">
          <span className="text-xs uppercase tracking-wider text-purple-200 font-bold mb-2 block">
            {isFlipped ? 'الإجابة النموذجية 💡' : 'السؤال ❓'}
          </span>
          <h3 className="text-lg sm:text-2xl font-black leading-relaxed">
            {isFlipped ? currentCard.answer : currentCard.question}
          </h3>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-800 px-5 py-3 rounded-2xl font-bold text-sm border border-slate-200 shadow-xs flex items-center gap-2 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
          <span>السابق</span>
        </button>

        <span className="text-xs font-bold text-slate-500">
          بطاقة {currentIndex + 1} من {flashcards.length}
        </span>

        <button
          onClick={handleNext}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all"
        >
          <span>{currentIndex < flashcards.length - 1 ? 'التالي' : 'إعادة البداية (+15 XP)'}</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
