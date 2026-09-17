import React from 'react';
import { BookmarkCheck, BookOpen, Trash2, HelpCircle, Sparkles, Calendar } from 'lucide-react';
import { SavedLesson, QuizQuestion, FlashcardItem } from '../types';

interface SavedLessonsProps {
  lessons: SavedLesson[];
  onDeleteLesson: (id: string) => void;
  onOpenQuiz: (quiz: QuizQuestion[]) => void;
  onOpenFlashcards: (flashcards: FlashcardItem[]) => void;
}

export const SavedLessons: React.FC<SavedLessonsProps> = ({
  lessons,
  onDeleteLesson,
  onOpenQuiz,
  onOpenFlashcards
}) => {
  if (!lessons || lessons.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <BookmarkCheck className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">لا توجد دروس محفوظة حالياً</h2>
          <p className="text-slate-500 text-sm mb-6">قم بتصوير وتلخيص دروسك وحفظها لتظهر هنا لمراجعتها في أي وقت.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-purple-600" />
            دروسي المحفوظة ({lessons.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">مكتبتك الخاصة لمراجعة الملخصات والاختبارات المحفوظة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full">
                  {lesson.subject}
                </span>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{lesson.date}</span>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-lg mb-2">{lesson.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed font-medium">
                {lesson.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenQuiz(lesson.quiz)}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>اختبار ({lesson.quiz.length})</span>
                </button>

                <button
                  onClick={() => onOpenFlashcards(lesson.flashcards)}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>بطاقات ({lesson.flashcards.length})</span>
                </button>
              </div>

              <button
                onClick={() => onDeleteLesson(lesson.id)}
                className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-all"
                title="حذف الدرس"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
