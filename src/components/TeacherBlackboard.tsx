import React, { useState, useEffect } from 'react';
import {
  BookOpen, Sparkles, Volume2, VolumeX, Printer, CheckCircle,
  AlertTriangle, Lightbulb, Play, RotateCcw, Share2, Layers,
  Pencil, Award, ChevronRight, Search, School, Download
} from 'lucide-react';
import { BlackboardLesson } from '../types';
import { INITIAL_BLACKBOARD_LESSONS } from '../data/blackboardLessons';

interface TeacherBlackboardProps {
  currentSubject?: string;
  currentGrade?: string;
  onAwardXp?: (xp: number, reason: string) => void;
  onOpenExamBank?: () => void;
}

export const TeacherBlackboard: React.FC<TeacherBlackboardProps> = ({
  currentSubject,
  currentGrade,
  onAwardXp,
  onOpenExamBank
}) => {
  // Lessons state
  const [lessons, setLessons] = useState<BlackboardLesson[]>(INITIAL_BLACKBOARD_LESSONS);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(INITIAL_BLACKBOARD_LESSONS[0].id);
  const [boardTheme, setBoardTheme] = useState<'chalkboard' | 'whiteboard'>('chalkboard');
  const [revealedStep, setRevealedStep] = useState<number>(4); // 1: Starter, 2: Core 1, 3: Core 2, 4: Sidebar / Complete
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  
  // Custom lesson AI generator state
  const [customTopic, setCustomTopic] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>(currentSubject || 'الرياضيات');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeLesson = lessons.find(l => l.id === selectedLessonId) || lessons[0];

  // Filter lessons
  const filteredLessons = lessons.filter(l => {
    const matchesSub = filterSubject === 'all' || l.subject === filterSubject;
    const matchesSearch = !searchQuery || l.title.includes(searchQuery) || l.unit.includes(searchQuery);
    return matchesSub && matchesSearch;
  });

  // Unique subjects available
  const availableSubjects = Array.from(new Set(lessons.map(l => l.subject)));

  // Auto-switch to matched lesson when subject prop changes
  useEffect(() => {
    if (currentSubject) {
      const found = lessons.find(l => l.subject.includes(currentSubject) || currentSubject.includes(l.subject));
      if (found) {
        setSelectedLessonId(found.id);
        setCustomSubject(found.subject);
      }
    }
  }, [currentSubject]);

  // Voice explanation with SpeechSynthesis
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('المتصفح لا يدعم القراءة الصوتية.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Construct lesson narration
    const narrationText = `درس اليوم: ${activeLesson.title} في مادة ${activeLesson.subject}. ` +
      `الكفاءة المستهدفة: ${activeLesson.competency}. ` +
      `أولاً: وضعية الانطلاق والإشكالية: ${activeLesson.starter.problemText}. ` +
      activeLesson.coreSections.map(s => `${s.title}: ${s.ruleBox || ''}. ${s.explanation}`).join('. ') +
      `. وأخيراً همسة الأستاذ الذهبية: ${activeLesson.sidebar.goldenTip}`;

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9; // clear, pedagogical pace
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Stop speech when changing lesson or unmounting
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedLessonId]);

  // Handle Complete lesson
  const handleMarkAsStudied = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      if (onAwardXp) {
        onAwardXp(40, `استيعاب درس السبورة: ${activeLesson.title}`);
      }
    }
  };

  // Generate lesson with AI endpoint
  const handleGenerateCustomLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-blackboard-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customTopic,
          subject: customSubject,
          grade: currentGrade || 'السنة الثالثة ثانوي (BAC)'
        })
      });

      if (!res.ok) throw new Error('فشل التوليد');
      const newLesson: BlackboardLesson = await res.json();
      
      setLessons(prev => [newLesson, ...prev]);
      setSelectedLessonId(newLesson.id);
      setCustomTopic('');
      setRevealedStep(4);
      setIsCompleted(false);

      if (onAwardXp) {
        onAwardXp(20, `طلب درس سبورة تفاعلي جديد`);
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء كتابة الدرس. تم استخدام النموذج الاحتياطي.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="teacher-blackboard-root" className="space-y-6">
      {/* Top Banner / Classroom Control Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-purple-100 text-purple-800 rounded-xl">
              <School className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              سبورة الأستاذ التفاعلية (Algerian Classroom Board)
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                منهاج وزاري جزائري
              </span>
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            شرح الدروس تماماً كما يكتبها الأستاذ المقتدر على سبورة القسم: تقسيم ثلاثي، قواعد مؤطرة، تنبيهات بكالوريا/بيام، وتطبيقات محلولة.
          </p>
        </div>

        {/* Global Board Actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          {/* Theme switcher: Chalkboard vs Whiteboard */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              onClick={() => setBoardTheme('chalkboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                boardTheme === 'chalkboard'
                  ? 'bg-purple-800 text-amber-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟢 سبورة خضراء
            </button>
            <button
              onClick={() => setBoardTheme('whiteboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                boardTheme === 'whiteboard'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚪ لوح أبيض
            </button>
          </div>

          {/* Teacher Voice Explanation Button */}
          <button
            onClick={toggleSpeech}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              isSpeaking
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>إيقاف شرح الأستاذ</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>استمع لشرح الأستاذ</span>
              </>
            )}
          </button>

          {/* Print/Save A4 button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
            title="طباعة سبورة الدرس A4"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة A4</span>
          </button>

          {/* Mark Complete & Earn XP */}
          <button
            onClick={handleMarkAsStudied}
            disabled={isCompleted}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isCompleted
                ? 'bg-purple-600 text-white cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-sm'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isCompleted ? 'تم استيعاب الدرس (+40 XP)' : 'أكملت الدرس (+40 XP)'}</span>
          </button>
        </div>
      </div>

      {/* Lesson Selector & Dynamic AI Request Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Quick Search & Subject Filter */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              مكتبة دروس السبورة الجاهزة
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {filteredLessons.length} درس
            </span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث في الدروس..."
                className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
              />
            </div>
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">كل المواد</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Quick Lesson Cards List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {filteredLessons.map(lesson => {
              const isSelected = lesson.id === activeLesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLessonId(lesson.id);
                    setIsCompleted(false);
                    setRevealedStep(4);
                  }}
                  className={`w-full text-right p-2.5 rounded-xl text-xs transition-all flex items-start justify-between gap-2 border ${
                    isSelected
                      ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600 font-medium">
                        {lesson.subject}
                      </span>
                      <span className="truncate">{lesson.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{lesson.unit}</p>
                  </div>
                  {isSelected && <ChevronRight className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Ask Teacher / AI to Write ANY Lesson on Blackboard */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-5 text-white border border-slate-700 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-amber-300">
                  اطلب من الأستاذ كتابة أي درس تريده على السبورة فوراً
                </h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                ذكاء اصطناعي تربوي
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              اكتب عنوان أي درس في الرياضيات، الفيزياء، العلوم، الفلسفة، العربية أو اللغات؛ وسيقوم الأستاذ بتنظيم سبورته الكاملة وفق المنهجية الرسمية مع حلول نموذجية.
            </p>
          </div>

          <form onSubmit={handleGenerateCustomLesson} className="flex flex-col sm:flex-row gap-2">
            <select
              value={customSubject}
              onChange={e => setCustomSubject(e.target.value)}
              className="bg-slate-800 border border-slate-600 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
            >
              <option value="الرياضيات">الرياضيات</option>
              <option value="العلوم الفيزيائية">العلوم الفيزيائية</option>
              <option value="علوم الطبيعة والحياة">علوم الطبيعة والحياة</option>
              <option value="اللغة العربية وآدابها">اللغة العربية وآدابها</option>
              <option value="الفلسفة">الفلسفة</option>
              <option value="التاريخ والجغرافيا">التاريخ والجغرافيا</option>
              <option value="العلوم الإسلامية">العلوم الإسلامية</option>
              <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
              <option value="اللغة الفرنسية">اللغة الفرنسية</option>
            </select>

            <div className="relative flex-1">
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="مثال: الاسترة وإماهة الإستر، الأعداد المركبة، المناعة، شعر المنفى..."
                className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                disabled={isGenerating}
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating || !customTopic.trim()}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>الأستاذ يكتب...</span>
                </>
              ) : (
                <>
                  <Pencil className="w-3.5 h-3.5" />
                  <span>اكتب على السبورة ✍️</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Step reveal controller bar (Teacher pacing simulation) */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Layers className="w-4 h-4 text-purple-700" />
          <span>مراحل كتابة الدرس على السبورة:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { step: 1, label: '1. وضعية الانطلاق' },
            { step: 2, label: '2. العنصر الأساسي' },
            { step: 3, label: '3. الخواص والتفصيل' },
            { step: 4, label: '4. السبورة كاملة والتطبيق' }
          ].map(item => (
            <button
              key={item.step}
              onClick={() => setRevealedStep(item.step)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                revealedStep === item.step
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* THE ACTUAL BLACKBOARD CONTAINER (Authentic Classroom Aesthetic) */}
      <div
        id="printable-blackboard"
        className={`rounded-2xl p-3 sm:p-5 transition-all shadow-xl border-8 ${
          boardTheme === 'chalkboard'
            ? 'bg-[#0e2a1b] text-[#fefbf6] border-[#382212]'
            : 'bg-[#fafafa] text-slate-900 border-slate-300'
        }`}
        style={{
          boxShadow: boardTheme === 'chalkboard' 
            ? 'inset 0 0 50px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.35)' 
            : 'inset 0 0 20px rgba(0,0,0,0.05), 0 8px 25px rgba(0,0,0,0.08)'
        }}
      >
        {/* TOP HEADER: Chalk-written School Header (ترويسة الأستاذ الرسمية) */}
        <div className={`border-b pb-4 mb-5 ${
          boardTheme === 'chalkboard' ? 'border-purple-700/50' : 'border-slate-300'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 text-center md:text-right">
            {/* Right: Date & Grade */}
            <div className="space-y-1">
              <div className={`text-xs font-semibold ${
                boardTheme === 'chalkboard' ? 'text-amber-200' : 'text-slate-600'
              }`}>
                📅 {activeLesson.dateStr}
              </div>
              <div className={`text-xs ${
                boardTheme === 'chalkboard' ? 'text-purple-300' : 'text-purple-700'
              } font-medium`}>
                🏫 المستوى: {activeLesson.grade}
              </div>
            </div>

            {/* Center: Framed Lesson Title */}
            <div className="text-center">
              <div className={`inline-block px-5 py-2 rounded-xl border-2 font-black text-base sm:text-lg tracking-wide ${
                boardTheme === 'chalkboard'
                  ? 'border-amber-300 bg-purple-950/60 text-amber-200 shadow-inner'
                  : 'border-slate-800 bg-slate-100 text-slate-950'
              }`}>
                المادة: {activeLesson.subject} | {activeLesson.title}
              </div>
              <div className={`text-xs mt-1 font-medium ${
                boardTheme === 'chalkboard' ? 'text-purple-200/90' : 'text-slate-600'
              }`}>
                {activeLesson.unit}
              </div>
            </div>

            {/* Left: Competency */}
            <div className="text-center md:text-left space-y-1">
              <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                boardTheme === 'chalkboard'
                  ? 'bg-purple-900/80 text-purple-200 border border-purple-700'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                🎯 الكفاءة المستهدفة
              </span>
              <p className={`text-xs leading-relaxed line-clamp-2 ${
                boardTheme === 'chalkboard' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {activeLesson.competency}
              </p>
            </div>
          </div>
        </div>

        {/* 3-WING BLACKBOARD LAYOUT (تقسيم السبورة الوزاري) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* 1. RIGHT WING (الجناح الأيمن - 3 أعمدة): وضعية الانطلاق / المكتسبات القبلية */}
          <div className={`lg:col-span-3 rounded-xl p-4 border space-y-4 ${
            boardTheme === 'chalkboard'
              ? 'bg-purple-950/40 border-purple-800/60 text-slate-200'
              : 'bg-white border-slate-200 text-slate-800 shadow-xs'
          }`}>
            <div className="flex items-center gap-1.5 pb-2 border-b border-current/20">
              <span className={`w-2.5 h-2.5 rounded-full ${
                boardTheme === 'chalkboard' ? 'bg-amber-300' : 'bg-purple-600'
              }`}></span>
              <h4 className={`font-black text-xs ${
                boardTheme === 'chalkboard' ? 'text-amber-200' : 'text-purple-800'
              }`}>
                {activeLesson.starter.title}
              </h4>
            </div>

            {/* Prior knowledge */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-amber-300 block">
                📌 المكتسبات القبلية:
              </span>
              <ul className="space-y-1 text-xs leading-relaxed pr-2">
                {activeLesson.starter.priorKnowledge.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Problem / Question */}
            <div className={`p-3 rounded-lg border text-xs leading-relaxed space-y-1.5 ${
              boardTheme === 'chalkboard'
                ? 'bg-purple-900/50 border-amber-300/40 text-amber-100'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div className="font-bold flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>الإشكالية المطروحة:</span>
              </div>
              <p>{activeLesson.starter.problemText}</p>
            </div>

            {/* The Hypothesis */}
            <div className="text-xs space-y-1">
              <span className="text-[11px] font-bold text-purple-300 block">
                💡 الفرضية والتوجيه:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-300 pr-2">
                {activeLesson.starter.hypothesis}
              </p>
            </div>
          </div>

          {/* 2. CENTRAL BLACKBOARD (قلب السبورة - 6 أعمدة): عناصر الدرس والقواعد المؤطرة */}
          <div className={`lg:col-span-6 rounded-xl p-4 sm:p-5 border space-y-5 ${
            boardTheme === 'chalkboard'
              ? 'bg-purple-950/60 border-purple-700/80 text-white'
              : 'bg-white border-slate-300 text-slate-900 shadow-sm'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-current/20">
              <h4 className={`font-black text-sm ${
                boardTheme === 'chalkboard' ? 'text-amber-300' : 'text-slate-900'
              }`}>
                قلب السبورة: المفاهيم والقواعد المركزية
              </h4>
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                boardTheme === 'chalkboard' ? 'bg-purple-900 text-amber-200' : 'bg-slate-100 text-slate-700'
              }`}>
                وثيقة الأستاذ المنهجية
              </span>
            </div>

            {/* Sections */}
            {activeLesson.coreSections.map((section, sIdx) => {
              // Check reveal step
              if (revealedStep < sIdx + 2 && revealedStep !== 4) return null;

              return (
                <div key={sIdx} className="space-y-3">
                  <h5 className={`font-bold text-xs sm:text-sm flex items-center gap-2 ${
                    boardTheme === 'chalkboard' ? 'text-purple-200' : 'text-purple-900'
                  }`}>
                    <span className="px-1.5 py-0.5 rounded bg-purple-800 text-amber-200 text-xs">
                      {sIdx + 1}
                    </span>
                    {section.title}
                  </h5>

                  {/* Golden Rule Framed Box (Chalk boxed highlight) */}
                  {section.ruleBox && (
                    <div className={`p-3.5 rounded-xl border-2 font-bold text-xs sm:text-sm leading-relaxed ${
                      boardTheme === 'chalkboard'
                        ? 'bg-amber-400/10 border-amber-300 text-amber-200 shadow-inner'
                        : 'bg-purple-50 border-purple-600 text-purple-950'
                    }`}>
                      {section.ruleBox}
                    </div>
                  )}

                  {/* Explanation text */}
                  <p className={`text-xs sm:text-sm leading-relaxed ${
                    boardTheme === 'chalkboard' ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    {section.explanation}
                  </p>

                  {/* Bullet Points */}
                  {section.bulletPoints && section.bulletPoints.length > 0 && (
                    <ul className="space-y-1.5 pr-2 text-xs sm:text-sm leading-relaxed">
                      {section.bulletPoints.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <span className={boardTheme === 'chalkboard' ? 'text-amber-400 font-bold' : 'text-purple-600 font-bold'}>
                            ✔
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Diagram or Formula */}
                  {section.diagramOrFormula && (
                    <div className={`p-2.5 rounded-lg border text-xs font-mono text-center my-2 ${
                      boardTheme === 'chalkboard'
                        ? 'bg-slate-900/60 border-cyan-400/40 text-cyan-200'
                        : 'bg-slate-100 border-slate-300 text-slate-900'
                    }`}>
                      {section.diagramOrFormula}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. LEFT WING (الجناح الأيسر - 3 أعمدة): التطبيقات المحلولة وتنبيهات الأستاذ */}
          <div className={`lg:col-span-3 rounded-xl p-4 border space-y-4 ${
            boardTheme === 'chalkboard'
              ? 'bg-purple-950/40 border-purple-800/60 text-slate-200'
              : 'bg-white border-slate-200 text-slate-800 shadow-xs'
          }`}>
            <div className="flex items-center gap-1.5 pb-2 border-b border-current/20">
              <span className={`w-2.5 h-2.5 rounded-full ${
                boardTheme === 'chalkboard' ? 'bg-cyan-300' : 'bg-indigo-600'
              }`}></span>
              <h4 className={`font-black text-xs ${
                boardTheme === 'chalkboard' ? 'text-cyan-200' : 'text-indigo-900'
              }`}>
                تطبيق السبورة وتنبيهات المصحح
              </h4>
            </div>

            {/* Solved Blackboard Application */}
            <div className={`p-3 rounded-xl border space-y-2 text-xs ${
              boardTheme === 'chalkboard'
                ? 'bg-slate-900/50 border-purple-700 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              <span className="font-bold text-purple-400 block">
                ✍️ {activeLesson.sidebar.applicationExercise.title}:
              </span>
              <p className="text-[11px] leading-relaxed font-medium">
                {activeLesson.sidebar.applicationExercise.question}
              </p>
              <div className="pt-2 border-t border-current/10">
                <span className="text-[10px] font-bold text-amber-300 block mb-1">
                  الحل النموذجي المنهجي:
                </span>
                <div className="text-[11px] whitespace-pre-line leading-relaxed font-mono opacity-90">
                  {activeLesson.sidebar.applicationExercise.stepByStepSolution}
                </div>
              </div>
            </div>

            {/* Teacher warnings (Exam Pitfalls) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-rose-400 block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                تنبيهات الأستاذ في البكالوريا/البيام:
              </span>
              <ul className="space-y-1.5 text-xs pr-1">
                {activeLesson.sidebar.teacherWarnings.map((warn, wIdx) => (
                  <li key={wIdx} className={`p-2 rounded border text-[11px] leading-relaxed ${
                    boardTheme === 'chalkboard'
                      ? 'bg-rose-950/40 border-rose-800/50 text-rose-200'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    {warn}
                  </li>
                ))}
              </ul>
            </div>

            {/* Golden Tip */}
            <div className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
              boardTheme === 'chalkboard'
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-200'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {activeLesson.sidebar.goldenTip}
            </div>

            {/* Homework task */}
            <div className="text-[11px] pt-2 border-t border-current/10 space-y-1">
              <span className="font-bold text-slate-400">🏠 واجب منزلي للحل الذاتي:</span>
              <p className="text-slate-300">{activeLesson.sidebar.homeworkTask}</p>
            </div>
          </div>

        </div>

        {/* BOTTOM CHALK TRAY / ACCESSORY LEDGE (واقعية السبورة المدرسية) */}
        {boardTheme === 'chalkboard' && (
          <div className="mt-5 pt-3 border-t-4 border-[#24150b] bg-[#2a180e] rounded-b-lg -mx-3 -mb-3 sm:-mx-5 sm:-mb-5 px-4 py-2 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-amber-200/60 font-mono tracking-widest">
                CHALK TRAY / رف الطباشير:
              </span>
              {/* Chalk sticks */}
              <div className="flex items-center gap-2">
                <span className="w-7 h-2 bg-[#fdfbf7] rounded-sm shadow-xs" title="طباشير أبيض"></span>
                <span className="w-7 h-2 bg-[#fef08a] rounded-sm shadow-xs" title="طباشير أصفر"></span>
                <span className="w-7 h-2 bg-[#93c5fd] rounded-sm shadow-xs" title="طباشير أزرق"></span>
                <span className="w-7 h-2 bg-[#86efac] rounded-sm shadow-xs" title="طباشير أخضر"></span>
                <span className="w-7 h-2 bg-[#fca5a5] rounded-sm shadow-xs" title="طباشير وردي"></span>
              </div>
            </div>

            {/* Chalk duster */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-0.5 rounded bg-[#452e1f] border border-[#6b472f] text-[10px] text-amber-100 font-bold shadow-xs">
                ممسحة السبورة 🧽
              </div>
              <button
                onClick={() => {
                  if (onOpenExamBank) onOpenExamBank();
                }}
                className="text-[11px] text-amber-300 hover:text-amber-100 font-bold underline transition-colors"
              >
                امتحن نفسك في هذا الدرس في بنك الامتحانات 🎯
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Footnote & Direct Navigation */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            يتم تحديث سبورة الأستاذ يومياً بدروس ومسائل موافقة للتقدم البيداغوجي لوزارة التربية الوطنية الجزائرية.
          </span>
        </div>
        {onOpenExamBank && (
          <button
            onClick={onOpenExamBank}
            className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition-all shadow-xs shrink-0"
          >
            الانتقال لبنك الامتحانات الرسمية 📚
          </button>
        )}
      </div>
    </div>
  );
};
