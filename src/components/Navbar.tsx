import React from 'react';
import { Bot, ScanLine, HelpCircle, BookOpen, BookmarkCheck, Flame, Award, Sparkles } from 'lucide-react';
import { UserStats } from '../types';

interface NavbarProps {
  activeTab: 'chat' | 'scanner' | 'quiz' | 'flashcards' | 'saved';
  setActiveTab: (tab: 'chat' | 'scanner' | 'quiz' | 'flashcards' | 'saved') => void;
  stats: UserStats;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, stats }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                نجاحي <span className="text-purple-600 font-extrabold bg-purple-50 px-2 py-0.5 rounded-full text-xs sm:text-sm">AI المتحدث</span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">منصة الأستاذ الذكي للتلخيص، التحفيظ، والمراجعة</p>
            </div>
          </div>

          {/* Gamification Stats */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-full text-amber-800 text-xs sm:text-sm font-bold shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{stats.xp} XP</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 bg-orange-50 border border-orange-200/60 px-3 py-1.5 rounded-full text-orange-800 text-xs sm:text-sm font-bold">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>يوم {stats.streak} متتالية</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 bg-teal-50 border border-teal-200/60 px-3 py-1.5 rounded-full text-teal-800 text-xs sm:text-sm font-bold">
              <Award className="w-4 h-4 text-teal-600" />
              <span>المستوى {stats.level}</span>
            </div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 space-x-reverse overflow-x-auto pb-2 pt-1 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4" />
            الأستاذ الذكي
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'scanner'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            تصوير وتلخيص الدرس
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'quiz'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            اختبر فهمك (Quiz)
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'flashcards'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            بطاقات الحفظ (Flashcards)
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'saved'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            دروسي المحفوظة
          </button>
        </div>

      </div>
    </header>
  );
};
