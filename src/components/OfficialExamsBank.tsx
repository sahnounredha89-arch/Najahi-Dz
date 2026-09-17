import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  CheckCircle2,
  BookOpen,
  Printer,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Search,
  Filter,
  Check,
  Eye,
  Play,
  Pause,
  PlusCircle,
  ShieldCheck,
  GraduationCap,
  Sparkle
} from 'lucide-react';
import {
  ExamModel,
  generateExamsForSubject,
  generateSingleAdditionalExam,
  saveSolvedExamId,
  getSolvedExamIds
} from '../data/examsBankData';
import { GRADES, getCurriculumSubjects, getGradeLabel } from '../data/curriculum';

interface OfficialExamsBankProps {
  currentCycle: 'primary' | 'middle' | 'secondary' | 'university';
  currentGradeId: string;
  currentStream?: string;
  onAddXP: (amount: number) => void;
  onSelectSubjectForTutor?: (subjectName: string) => void;
}

export const OfficialExamsBank: React.FC<OfficialExamsBankProps> = ({
  currentCycle,
  currentGradeId,
  currentStream,
  onAddXP,
  onSelectSubjectForTutor,
}) => {
  // 1. Academic level selection (Cycle & Grade)
  const [selectedCycle, setSelectedCycle] = useState<'primary' | 'middle' | 'secondary' | 'university'>(currentCycle || 'secondary');
  const [selectedGradeId, setSelectedGradeId] = useState<string>(currentGradeId || '3AS');

  // Synchronize when parent props change
  useEffect(() => {
    if (currentCycle) setSelectedCycle(currentCycle);
    if (currentGradeId) setSelectedGradeId(currentGradeId);
  }, [currentCycle, currentGradeId]);

  // Available subjects for chosen cycle and grade
  const availableSubjects = useMemo(() => {
    return getCurriculumSubjects(selectedCycle, selectedGradeId, currentStream);
  }, [selectedCycle, selectedGradeId, currentStream]);

  // 2. Subject Selection (Default to first subject or Math)
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    const math = availableSubjects.find(s => s.name.includes('رياضيات'));
    return math ? math.name : (availableSubjects[0]?.name || 'الرياضيات');
  });

  // Ensure selectedSubject is in available subjects when grade changes
  useEffect(() => {
    if (availableSubjects.length > 0) {
      const exists = availableSubjects.some(s => s.name === selectedSubject);
      if (!exists) {
        setSelectedSubject(availableSubjects[0].name);
      }
    }
  }, [availableSubjects, selectedSubject]);

  // 3. Term / Trimester Selection
  const [termFilter, setTermFilter] = useState<'all' | 't1' | 't2' | 't3' | 'official'>('all');

  // 4. Exams List state (Starts with 20 exams for the chosen subject)
  const [examsList, setExamsList] = useState<ExamModel[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize or re-generate 20 exams when subject/grade/cycle/term changes
  useEffect(() => {
    const gradeLabel = getGradeLabel(selectedCycle, selectedGradeId);
    const generated = generateExamsForSubject(
      selectedSubject,
      selectedGradeId,
      selectedCycle,
      gradeLabel,
      termFilter,
      20 // Initial 20 comprehensive exams
    );
    setExamsList(generated);
  }, [selectedSubject, selectedGradeId, selectedCycle, termFilter]);

  // Active exam being taken/viewed (Modal Hall)
  const [activeExam, setActiveExam] = useState<ExamModel | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [studentNotes, setStudentNotes] = useState<string>('');

  // Infinite Exam Auto-Advance states (كلما أحل واحد يجيء واحد والمستطيل أخضر)
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState<boolean>(true);
  const [solvedSuccessData, setSolvedSuccessData] = useState<{ exam: ExamModel; nextExam: ExamModel } | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(4);

  // Countdown effect for auto-triggering the next exam
  useEffect(() => {
    if (!solvedSuccessData || !autoAdvanceEnabled) return;

    if (countdownSeconds > 0) {
      const timer = setTimeout(() => {
        setCountdownSeconds(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto-advance to the next exam
      const next = solvedSuccessData.nextExam;
      setSolvedSuccessData(null);
      handleOpenExam(next);
      setToastMessage(`🚀 تم الانتقال تلقائياً للامتحان التالي: ${next.title}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  }, [solvedSuccessData, countdownSeconds, autoAdvanceEnabled]);

  // Exam Timer state (ساعتان افتراضيتان 120 دقيقة)
  const [timerSeconds, setTimerSeconds] = useState<number>(120 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Reset timer when entering a new exam
  const handleOpenExam = (exam: ExamModel) => {
    setActiveExam(exam);
    setShowSolution(false);
    setStudentNotes('');
    setTimerSeconds(120 * 60);
    setIsTimerRunning(false);
  };

  const handleCloseExam = () => {
    setActiveExam(null);
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Format timer HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Mark as solved handler (كلما تحل واحد، يجيء واحد والمستطيل يصبح أخضر)
  const handleConfirmSolve = (exam: ExamModel) => {
    // 1. Mark in storage
    saveSolvedExamId(exam.id);

    // 2. Update local state so card turns green immediately
    setExamsList(prev =>
      prev.map(e => (e.id === exam.id ? { ...e, isSolved: true, solvedAt: new Date().toLocaleDateString('ar-DZ') } : e))
    );

    // Also update active exam
    setActiveExam(prev => (prev ? { ...prev, isSolved: true } : null));

    // 3. Award XP
    onAddXP(50);

    // 4. "كلما أحل واحد يجيء واحد" -> Append a brand new exam to make it infinite!
    const gradeLabel = getGradeLabel(selectedCycle, selectedGradeId);
    const nextNum = examsList.length + 1;
    const newExam = generateSingleAdditionalExam(
      selectedSubject,
      selectedGradeId,
      selectedCycle,
      gradeLabel,
      nextNum,
      termFilter
    );

    setExamsList(prev => [...prev, newExam]);

    // 5. Find next exam to auto-trigger (next unsolved or the newly generated one)
    const currentIndex = examsList.findIndex(e => e.id === exam.id);
    let next = examsList.find((e, idx) => idx > currentIndex && !e.isSolved) || newExam;

    // Trigger celebratory auto-advance modal
    setSolvedSuccessData({ exam, nextExam: next });
    setCountdownSeconds(4);

    // Show toast
    setToastMessage(`🎉 ممتاز! تم تأكيد حل الامتحان ووضع علامة تم الحل (+50 XP). تحول المستطيل للأخضر وسينطلق الامتحان التالي!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Manually generate additional exam (Infinite button)
  const handleAddAdditionalExam = () => {
    const gradeLabel = getGradeLabel(selectedCycle, selectedGradeId);
    const nextNum = examsList.length + 1;
    const newExam = generateSingleAdditionalExam(
      selectedSubject,
      selectedGradeId,
      selectedCycle,
      gradeLabel,
      nextNum,
      termFilter
    );
    setExamsList(prev => [...prev, newExam]);
    setToastMessage(`✨ تم إضافة نموذج امتحان رسمي جديد (نموذج رقم ${nextNum}) بنجاح!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Generate with AI (Gemini)
  const handleGenerateAiExam = async () => {
    setIsGeneratingAi(true);
    try {
      const gradeLabel = getGradeLabel(selectedCycle, selectedGradeId);
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          grade: gradeLabel,
          term: termFilter === 'all' ? 'الفصل الأول' : termFilter === 't1' ? 'الفصل الأول' : termFilter === 't2' ? 'الفصل الثاني' : termFilter === 't3' ? 'الفصل الثالث' : 'امتحان تجريبي',
          examNumber: examsList.length + 1,
        }),
      });
      const data = await res.json();
      if (data && data.exercises) {
        const aiExam: ExamModel = {
          id: data.id || `ai_exam_${Date.now()}`,
          subject: selectedSubject,
          cycle: selectedCycle,
          gradeId: selectedGradeId,
          gradeLabel,
          term: 't1',
          termLabel: data.termLabel || 'نموذج وزاري جديد',
          examNumber: examsList.length + 1,
          title: data.title || `امتحان ${selectedSubject} - نموذج رقم (${examsList.length + 1})`,
          institution: data.institution || 'وزارة التربية الوطنية - توليد ذكي',
          year: data.year || '2023/2024',
          duration: data.duration || '02 سا 00 د',
          coefficient: data.coefficient || 5,
          totalScore: 20,
          exercises: data.exercises,
          integratedSituation: data.integratedSituation,
          isSolved: false,
          duaText: '﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾',
          duaRef: 'سورة طه - الآية 114',
        };
        setExamsList(prev => [aiExam, ...prev]);
        setToastMessage('🤖 تم توليد امتحان رسمي جديد بالذكاء الاصطناعي بنجاح وإضافته إلى الصدارة!');
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch (e) {
      console.warn('AI Exam Generation fallback:', e);
      handleAddAdditionalExam();
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Solved Count statistics
  const solvedCount = useMemo(() => {
    return examsList.filter(e => e.isSolved).length;
  }, [examsList]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center gap-3 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header & Controller Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-300 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b-2 border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950">
                بنك الامتحانات الرسمية اللانهائي (20+ موضوعاً لكل مادة)
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
              حدد المادة والسنة والفصل، واحصل على 20 امتحاناً كاملاً مع الحلول النموذجية وسلالم التنقيط. كلما حللت امتحاناً يتحول مستطيله إلى الأخضر ويأتيك نموذج جديد فوراً!
            </p>
          </div>

          {/* Quick Stats & Infinite Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-purple-50 border-2 border-purple-600 px-3.5 py-1.5 rounded-2xl flex items-center gap-2">
              <span className="text-purple-700 font-black text-xs sm:text-sm">
                تم حل: {solvedCount} من {examsList.length} 🏆
              </span>
            </div>

            <button
              onClick={handleAddAdditionalExam}
              className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>إضافة موضوع جديد (لا نهائي)</span>
            </button>

            <button
              onClick={handleGenerateAiExam}
              disabled={isGeneratingAi}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{isGeneratingAi ? 'جارٍ التوليد الذكي...' : 'توليد بالذكاء الاصطناعي'}</span>
            </button>
          </div>
        </div>

        {/* STEP 1: Academic Year & Cycle Filter */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-slate-900" />
            <span>1. اختر السنة والطور الدراسي (متاح لجميع السنوات):</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Grades */}
            <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">الابتدائي:</span>
            {GRADES.primary.map(g => (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedCycle('primary');
                  setSelectedGradeId(g.id);
                }}
                className={`text-xs font-black px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                  selectedCycle === 'primary' && selectedGradeId === g.id
                    ? 'bg-amber-300 border-slate-950 text-slate-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-950 hover:border-slate-400'
                }`}
              >
                {g.id} ({g.name.split(' ')[1]})
              </button>
            ))}

            {/* Middle Grades */}
            <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg mr-2">المتوسط:</span>
            {GRADES.middle.map(g => (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedCycle('middle');
                  setSelectedGradeId(g.id);
                }}
                className={`text-xs font-black px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                  selectedCycle === 'middle' && selectedGradeId === g.id
                    ? 'bg-amber-300 border-slate-950 text-slate-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-950 hover:border-slate-400'
                }`}
              >
                {g.id} {g.id === '4AM' ? '(BEM)' : ''}
              </button>
            ))}

            {/* Secondary Grades */}
            <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg mr-2">الثانوي:</span>
            {GRADES.secondary.map(g => (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedCycle('secondary');
                  setSelectedGradeId(g.id);
                }}
                className={`text-xs font-black px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                  selectedCycle === 'secondary' && selectedGradeId === g.id
                    ? 'bg-amber-300 border-slate-950 text-slate-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-950 hover:border-slate-400'
                }`}
              >
                {g.id} {g.id === '3AS' ? '(BAC)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: Subject Selector (The 20 exams will be purely for this subject) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-slate-900" />
            <span>2. حدد المادة التي تريد أن تمتحن فيها (ستظهر لك 20 امتحاناً لهذه المادة فوراً):</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {availableSubjects.map(sub => {
              const isSelected = selectedSubject === sub.name;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.name)}
                  className={`p-2.5 rounded-2xl border-2 text-right transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-950 border-slate-950 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-950 hover:border-slate-400 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-black">{sub.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                  </div>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    20+ موضوعاً محلولاً
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 3: Term / Trimester Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-900" />
            <span>3. اختر الفصل الدراسي:</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', label: 'الكل (جميع الفصول)' },
              { id: 't1', label: 'الفصل الأول' },
              { id: 't2', label: 'الفصل الثاني' },
              { id: 't3', label: 'الفصل الثالث' },
              { id: 'official', label: selectedCycle === 'secondary' ? 'امتحانات البكالوريا التجريبية (BAC Blanc)' : 'الامتحانات الرسمية والتجريبية' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTermFilter(t.id as any)}
                className={`text-xs font-black px-3.5 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                  termFilter === t.id
                    ? 'bg-slate-950 text-amber-300 border-slate-950 shadow-xs'
                    : 'bg-white text-slate-950 border-slate-200 hover:border-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* THE 20+ EXAMS RECTANGLES GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-950 text-base sm:text-lg">
              قائمة امتحانات {selectedSubject} ({examsList.length} نموذجاً متاحاً)
            </span>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {getGradeLabel(selectedCycle, selectedGradeId)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAutoAdvanceEnabled(!autoAdvanceEnabled)}
              className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                autoAdvanceEnabled
                  ? 'bg-purple-100 border-purple-400 text-purple-950 font-black'
                  : 'bg-slate-100 border-slate-300 text-slate-700 font-bold'
              }`}
            >
              <span>⚡ التتابع اللانهائي:</span>
              <span>{autoAdvanceEnabled ? 'مفعل (ينطلق الامتحان التالي تلقائياً)' : 'يدوي'}</span>
            </button>
            <span className="text-xs font-bold text-slate-500">
              {solvedCount > 0 ? `تم حل ${solvedCount} من ${examsList.length}` : 'اضغط على الامتحان للدخول والحل'}
            </span>
          </div>
        </div>

        {/* 20 Cards Grid: When solved, turns VIBRANT GREEN as requested! */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examsList.map(exam => {
            const isSolved = exam.isSolved;
            return (
              <div
                key={exam.id}
                className={`rounded-3xl p-5 transition flex flex-col justify-between relative ${
                  isSolved
                    ? 'bg-emerald-50 border-2 border-emerald-600 shadow-md ring-2 ring-emerald-500/20 text-slate-950'
                    : 'bg-white border-2 border-slate-300 hover:border-slate-900 shadow-xs text-slate-950'
                }`}
              >
                {/* Visual Green Rectangle Highlight when solved */}
                {isSolved ? (
                  <div className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1.5 rounded-xl mb-3 flex items-center justify-between shadow-xs">
                    <span className="flex items-center gap-1.5">
                      <span>🟩</span>
                      <span>مستطيل أخضر: تم حل هذا النموذج بنجاح</span>
                    </span>
                    <span className="bg-emerald-700 text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-black">20 / 20</span>
                  </div>
                ) : (
                  <div className="bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-xl mb-3 flex items-center justify-between">
                    <span>مستطيل الامتحان (جاهز للحل)</span>
                    <span className="text-[10px] text-slate-500">يتحول لأخضر عند الحل</span>
                  </div>
                )}
                {/* Status Ribbon / Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[11px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      isSolved
                        ? 'bg-purple-600 text-white border-purple-700 shadow-2xs'
                        : 'bg-amber-100 text-slate-950 border-amber-300'
                    }`}
                  >
                    {isSolved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✅ تم الحل والتحصيل (20/20)</span>
                      </>
                    ) : (
                      <>
                        <span>📝</span>
                        <span>نموذج رسمي متاح للحل</span>
                      </>
                    )}
                  </span>

                  <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {exam.termLabel}
                  </span>
                </div>

                {/* Exam Title & Meta */}
                <div className="space-y-2 mb-4">
                  <h3 className="text-base font-black text-slate-950 leading-snug">
                    {exam.title}
                  </h3>

                  <div className="text-xs font-bold text-slate-700">
                    🏛️ {exam.institution}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600 flex-wrap">
                    <span>⏱️ المدة: {exam.duration}</span>
                    <span>⭐ المعامل: {exam.coefficient}</span>
                    <span>📑 {exam.exercises.length} تمارين + مسألة</span>
                  </div>
                </div>

                {/* Bottom Actions: Enter exam button is large & prominent! */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => handleOpenExam(exam)}
                    className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      isSolved
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-slate-950 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-amber-300" />
                    <span>{isSolved ? 'مراجعة الحل والنموذج المحلول' : '✍️ الدخول إلى الامتحان والحل الآن'}</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold px-1">
                    <span>{exam.year}</span>
                    <button
                      onClick={() => handleOpenExam(exam)}
                      className="text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة الأسئلة</span>
                    </button>
                  </div>
                </div>

                {/* Respectful closing verse */}
                <div className="mt-3 pt-2 border-t border-slate-200 text-center">
                  <div className="text-xs font-black text-slate-900 font-serif">
                    {exam.duaText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXAM HALL MODAL: الدخول إلى الامتحان والحل التفاعلي وسلالم التنقيط */}
      {/* ========================================================================= */}
      {activeExam && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          dir="rtl"
        >
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border-2 border-slate-950 shadow-2xl overflow-hidden my-auto relative">
            {/* Infinite Exam Auto-Advance Celebration Banner */}
            {solvedSuccessData && (
              <div className="bg-emerald-600 text-white p-4 border-b-2 border-emerald-700 shadow-md flex items-center justify-between flex-wrap gap-3 animate-fadeIn z-30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white text-emerald-700 flex items-center justify-center text-xl font-black shrink-0">
                    🟩
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-100 flex items-center gap-1.5">
                      <span>أحسنت! تحول مستطيل الامتحان إلى الأخضر</span>
                      <span className="bg-emerald-800 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black">+50 XP</span>
                    </div>
                    <div className="text-sm font-black text-white mt-0.5">
                      الامتحان التالي في السلسلة: «{solvedSuccessData.nextExam.title}»
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {autoAdvanceEnabled ? (
                    <span className="text-xs font-bold text-emerald-100 bg-emerald-800/80 px-3 py-1.5 rounded-xl border border-emerald-500">
                      الانتقال التلقائي خلال <span className="text-amber-300 font-black text-sm">{countdownSeconds}</span> ثوانٍ...
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-100 bg-emerald-800/80 px-3 py-1.5 rounded-xl border border-emerald-500">
                      التتابع التلقائي معطل (يدوي)
                    </span>
                  )}
                  <button
                    onClick={() => {
                      const next = solvedSuccessData.nextExam;
                      setSolvedSuccessData(null);
                      handleOpenExam(next);
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>الانتقال فوراً 🚀</span>
                  </button>
                  <button
                    onClick={() => setSolvedSuccessData(null)}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                    title="إلغاء التتابع التلقائي والبقاء لمراجعة هذا الحل"
                  >
                    البقاء للمراجعة
                  </button>
                </div>
              </div>
            )}

            {/* Modal Header: Algerian Ministry Official Exam Header */}
            <div className="bg-slate-950 text-white p-4 sm:p-5 border-b-2 border-amber-400 flex items-center justify-between flex-wrap gap-3">
              <div className="space-y-1">
                <div className="text-[11px] font-black text-amber-300">
                  الجمهورية الجزائرية الديمقراطية الشعبية - وزارة التربية الوطنية
                </div>
                <h2 className="text-base sm:text-xl font-black text-white">
                  {activeExam.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-300 font-bold flex-wrap">
                  <span>المستوى: {activeExam.gradeLabel}</span>
                  <span>المادة: {activeExam.subject}</span>
                  <span>المعامل: {activeExam.coefficient}</span>
                  <span>النقطة الإجمالية: 20/20</span>
                </div>
              </div>

              {/* Timer & Close button */}
              <div className="flex items-center gap-2">
                {/* Exam Stopwatch / Countdown */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl px-3 py-1.5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span className="font-mono font-black text-amber-300 text-sm">
                    {formatTime(timerSeconds)}
                  </span>
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="text-white hover:text-amber-300 text-xs font-bold px-1 cursor-pointer"
                    title={isTimerRunning ? 'إيقاف مؤقت' : 'تشغيل المؤقت'}
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-black p-2 rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                  title="طباعة الامتحان A4"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span className="hidden sm:inline">طباعة</span>
                </button>

                <button
                  onClick={handleCloseExam}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-3 py-2 rounded-xl transition cursor-pointer"
                >
                  ✕ إغلاق
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable Exam Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-950 print:p-0">
              {/* Exam Solved Banner if already completed */}
              {activeExam.isSolved && (
                <div className="bg-purple-50 border-2 border-purple-600 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-purple-800 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    <span>هذا الامتحان محلول ومكتمل بنجاح! مستطيل هذا الموضوع معلّم بالأخضر.</span>
                  </div>
                  <span className="text-xs font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-xl">
                    علامة الإنجاز: 20/20 🏆
                  </span>
                </div>
              )}

              {/* PART ONE: Exercises (الجزء الأول) */}
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-950">
                    الجزء الأول: التمارين المستهدفة (12 نقطة)
                  </h3>
                  <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    سلم التنقيط: 12/20
                  </span>
                </div>

                {activeExam.exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-black text-sm sm:text-base text-slate-950">
                        {ex.title}
                      </h4>
                      <span className="text-xs font-black text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-md border border-purple-300">
                        {ex.points} نقاط
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm font-bold text-slate-900 whitespace-pre-line leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                      {ex.text}
                    </div>

                    {/* Revealable Model Solution */}
                    {showSolution && (
                      <div className="bg-purple-50 border-2 border-purple-600 rounded-xl p-4 space-y-3 mt-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs sm:text-sm text-purple-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-purple-700" />
                            الحل النموذجي المنهجي لـ {ex.title}:
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-slate-950 whitespace-pre-line leading-relaxed">
                          {ex.solution}
                        </div>

                        {/* Grading rubric breakdown */}
                        <div className="pt-2 border-t border-purple-200">
                          <span className="text-xs font-black text-purple-900">
                            سلم التنقيط وتوزيع النقاط الوزاري:
                          </span>
                          <ul className="list-disc list-inside text-xs font-bold text-slate-900 mt-1 space-y-0.5">
                            {ex.gradingRubric.map((r, rIdx) => (
                              <li key={rIdx}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* PART TWO: Integrated Situation (الجزء الثاني - الوضعية الإدماجية) */}
              {activeExam.integratedSituation && (
                <div className="space-y-4 pt-4 border-t-2 border-slate-900">
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-950">
                      {activeExam.integratedSituation.title}
                    </h3>
                    <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      سلم التنقيط: 08/20
                    </span>
                  </div>

                  <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="text-xs sm:text-sm font-bold text-slate-950 leading-relaxed bg-white p-3.5 rounded-xl border border-amber-200">
                      <p className="font-black mb-1">السياق والسندات:</p>
                      <p>{activeExam.integratedSituation.context}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
                      <p className="text-xs sm:text-sm font-black text-slate-950">التعليمات المنهجية:</p>
                      <ul className="list-decimal list-inside text-xs sm:text-sm font-bold text-slate-900 space-y-1">
                        {activeExam.integratedSituation.instructions.map((inst, iIdx) => (
                          <li key={iIdx}>{inst}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Revealable Situation Solution */}
                    {showSolution && (
                      <div className="bg-purple-50 border-2 border-purple-600 rounded-xl p-4 space-y-3 mt-3 animate-fadeIn">
                        <span className="font-black text-xs sm:text-sm text-purple-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-purple-700" />
                          الحل النموذجي للوضعية الإدماجية وفق شبكة المعايير الوزارية:
                        </span>
                        <div className="text-xs sm:text-sm font-bold text-slate-950 whitespace-pre-line leading-relaxed">
                          {activeExam.integratedSituation.solution}
                        </div>

                        <div className="pt-2 border-t border-purple-200">
                          <span className="text-xs font-black text-purple-900">
                            شبكة التقويم وتوزيع العلامات (معايير الوجاهة، الانسجام، والاستعمال السليم للأدوات):
                          </span>
                          <ul className="list-disc list-inside text-xs font-bold text-slate-900 mt-1 space-y-0.5">
                            {activeExam.integratedSituation.gradingRubric.map((r, rIdx) => (
                              <li key={rIdx}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Student Scratchpad & Answer Draft (مسودة الطالب) */}
              <div className="space-y-2 pt-4 border-t-2 border-slate-200">
                <label className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-1.5">
                  <span>📝 مسودة الإجابة والمحاولة السريعة (اكتب حلك وملاحظاتك هنا قبل كشف الحل):</span>
                </label>
                <textarea
                  value={studentNotes}
                  onChange={e => setStudentNotes(e.target.value)}
                  placeholder="اكتب هنا عناصر إجابتك أو خطوات الحل للتأكد منها ومقارنتها بالحل النموذجي..."
                  className="w-full h-28 p-3 rounded-2xl border-2 border-slate-300 text-xs sm:text-sm font-bold text-slate-950 focus:border-slate-950 focus:outline-none"
                />
              </div>

              {/* Respectful closing text */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-1">
                <div className="text-sm font-black text-slate-950 font-serif">
                  {activeExam.duaText}
                </div>
                <div className="text-[11px] font-bold text-slate-600">
                  {activeExam.duaRef}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-100 p-4 border-t-2 border-slate-300 flex items-center justify-between flex-wrap gap-3">
              {/* Toggle Solution Button */}
              <button
                onClick={() => setShowSolution(!showSolution)}
                className={`py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
                  showSolution
                    ? 'bg-amber-400 text-slate-950 border-2 border-slate-950'
                    : 'bg-white text-slate-950 border-2 border-slate-300 hover:border-slate-900'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{showSolution ? 'إخفاء الحل النموذجي' : '📖 عرض الحل النموذجي وسلم التنقيط بالتفصيل'}</span>
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Ask Tutor About this Exam */}
                {onSelectSubjectForTutor && (
                  <button
                    onClick={() => {
                      onSelectSubjectForTutor(activeExam.subject);
                      handleCloseExam();
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-950 border-2 border-slate-300 text-xs font-black px-3.5 py-2.5 rounded-xl cursor-pointer"
                  >
                    <span>👨‍🏫 اسأل الأستاذ عن هذا الموضوع</span>
                  </button>
                )}

                {/* Confirm Solve Button (Turns rectangle GREEN and adds new exam) */}
                <button
                  onClick={() => handleConfirmSolve(activeExam)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{activeExam.isSolved ? '✅ تم الحل مسبقاً (إضافة موضوع جديد)' : '✅ تأكيد حل هذا الامتحان (يصبح المستطيل بالأخضر)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
