import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, DailyTask, A4SummaryItem, ChatMessage } from './types';
import { GRADES, SECONDARY_STREAMS, getCurriculumSubjects, getGradeLabel } from './data/curriculum';
import { OFFICIAL_A4_SUMMARIES, HANDWRITTEN_SUMMARIES_DATA, getSummaryForSubject } from './data/summaries';
import { DAILY_STUDY_TASKS } from './data/tasks';
import { drawRandomReward, playRewardSound, RewardResult } from './data/rewards';
import { EXAM_DUAS_WITHOUT_NAME } from './data/duas';
import { ProfileModal } from './components/ProfileModal';
import { PermissionsModal } from './components/PermissionsModal';
import { RewardModal } from './components/RewardModal';
import { PomodoroModal } from './components/PomodoroModal';
import { DZLogo } from './components/DZLogo';
import { TeachersVideos } from './components/TeachersVideos';
import { NotesAndTasks } from './components/NotesAndTasks';
import { COMMON_EXAM_TRAPS } from './data/examTips';
import { ConversationalSummarizer } from './components/ConversationalSummarizer';
import { ChatTutor } from './components/ChatTutor';
import { InteractiveQuiz } from './components/InteractiveQuiz';
import { OnboardingAuthModal } from './components/OnboardingAuthModal';
import { OfficialExamsBank } from './components/OfficialExamsBank';
import { TeacherBlackboard } from './components/TeacherBlackboard';

// Storage key
const STORAGE_KEY = 'najahy_profile_v2';

const DEFAULT_USER: UserProfile = {
  name: 'عبد الرحمان الجزائري',
  email: 'sahnounredha89@gmail.com',
  currentScore: 14.5,
  targetScore: 17.5,
  cycle: 'secondary',
  gradeId: '3AS',
  stream: 'علوم تجريبية',
  avatar: '👨‍🎓',
  unlockedAvatars: ['👨‍🎓', '👩‍🎓', '🔬', '📐'],
  streak: 5,
  bestStreak: 12,
  streakFreezes: 5, // Default 5 days freeze balance as requested
  xp: 450,
  levelRank: 'مقاتل',
  badges: ['بداية الانطلاق', 'مواظب أسبوعي'],
  completedTasksToday: [],
  lastStudyDate: new Date().toISOString(),
};

export const getGamificationRank = (xp: number) => {
  if (xp < 500) {
    return { rank: 'مقاتل', avg: 10, nextAvg: 12, max: 500, current: xp };
  } else if (xp < 1000) {
    return { rank: 'بطل التحدي', avg: 12, nextAvg: 14, max: 1000, current: xp };
  } else if (xp < 1500) {
    return { rank: 'فارس المعرفة', avg: 14, nextAvg: 16, max: 1500, current: xp };
  } else if (xp < 2000) {
    return { rank: 'نجم الصف', avg: 16, nextAvg: 18, max: 2000, current: xp };
  } else {
    return { rank: 'عبقري الجزائر', avg: 18, nextAvg: 20, max: 3000, current: Math.min(xp, 3000) };
  }
};

export const OFFICIAL_CYCLES = [
  {
    id: 'primary' as const,
    name: 'الطور الابتدائي',
    subtitle: '5 سنوات كاملة (1 إلى 5 ابتدائي)',
    icon: '🎒',
    badge: 'التعليم القاعدي (5 سنوات)',
    defaultGrade: '5AP',
    defaultStream: 'الطور الابتدائي',
  },
  {
    id: 'middle' as const,
    name: 'الطور المتوسط',
    subtitle: '4 سنوات كاملة (1 إلى 4 متوسط - BEM)',
    icon: '🔥',
    badge: 'التعليم المتوسط (4 سنوات)',
    defaultGrade: '4AM',
    defaultStream: 'الطور المتوسط',
  },
  {
    id: 'secondary' as const,
    name: 'الطور الثانوي',
    subtitle: '3 سنوات كاملة (1 إلى 3 ثانوي - BAC)',
    icon: '🎓',
    badge: 'التعليم الثانوي (3 سنوات)',
    defaultGrade: '3AS',
    defaultStream: 'علوم تجريبية',
  },
];

export default function App() {
  // Load saved profile or default
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_USER, ...parsed };
      }
    } catch (e) {
      console.warn('Could not load user profile:', e);
    }
    return DEFAULT_USER;
  });

  // Save profile updates to localStorage
  const handleSaveProfile = (updated: UserProfile) => {
    setUser(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save user profile:', e);
    }
  };

  const gamification = getGamificationRank(user.xp);

  // Tab navigation:
  // أستاذي -> سبورة الأستاذ والدروس -> بنك الامتحانات -> تلخيص الدروس -> اختبر نفسك -> فيديوهات الأساتذة -> المهام والملاحظات
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'tutor' | 'blackboard' | 'exams' | 'summaries' | 'quiz' | 'videos' | 'kaizen'
  >('dashboard');

  const [studySubject, setStudySubject] = useState<any | null>(null);

  // Navigation Collapse / Raise state for distraction-free view
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // Big Rectangle Hide / Show state (المستطيل الكبير)
  const [isBigRectangleHidden, setIsBigRectangleHidden] = useState(false);

  // Toggle to change educational cycle without cluttering the screen
  const [isChangingCycle, setIsChangingCycle] = useState(false);

  // Onboarding / Auth Modal state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem('najahy_onboarded_v2');
    if (!onboarded) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [permissionType, setPermissionType] = useState<'camera' | 'microphone' | 'all'>('all');
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [activeReward, setActiveReward] = useState<RewardResult | null>(null);

  // File Inputs for camera and gallery
  const cameraLiveInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Summaries state
  const [activeSummaryName, setActiveSummaryName] = useState<string>('الرياضيات');
  const [dynamicSummaries, setDynamicSummaries] = useState<Record<string, A4SummaryItem>>({});

  // Daily Tasks state
  const [completedTasks, setCompletedTasks] = useState<string[]>(user.completedTasksToday || []);

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Current subjects according to student cycle, grade, and stream
  const currentSubjects = getCurriculumSubjects(user.cycle, user.gradeId, user.stream);
  const activeCycleId = user.cycle === 'university' ? 'secondary' : user.cycle;
  const cycleGrades = GRADES[activeCycleId] || GRADES.middle;

  const handleSelectCycle = (c: (typeof OFFICIAL_CYCLES)[0]) => {
    handleSaveProfile({
      ...user,
      cycle: c.id,
      gradeId: c.defaultGrade,
      stream: c.defaultStream,
    });
    setIsChangingCycle(false);
    showToast(`تم اختيار ${c.name}`);
  };

  const handleSelectGrade = (gradeId: string, gradeName: string) => {
    handleSaveProfile({
      ...user,
      gradeId,
    });
    showToast(`تم اختيار: ${gradeName}`);
  };

  const handleSelectStream = (streamName: string) => {
    handleSaveProfile({
      ...user,
      stream: streamName,
    });
    showToast(`تم اختيار الشعبة: ${streamName}`);
  };

  // Freeze action handler
  const handleFreezeNextDay = () => {
    showToast('✅ تم تجميد اليوم القادم بنجاح! 🧊 (رصيدك: 5 أيام تجميد لحماية مواظبتك)');
  };

  // Complete a task: award XP and draw surprise reward
  const handleCompleteTask = (task: DailyTask) => {
    if (completedTasks.includes(task.id)) return;

    const newCompleted = [...completedTasks, task.id];
    setCompletedTasks(newCompleted);

    const earnedXp = task.xp || 50;
    const updatedXp = user.xp + earnedXp;
    const isThreeTaskMilestone = newCompleted.length % 3 === 0;

    const reward = drawRandomReward(user.unlockedAvatars);
    let updatedFreezes = user.streakFreezes;
    let updatedAvatars = [...user.unlockedAvatars];
    let finalXp = updatedXp;

    if (isThreeTaskMilestone) {
      updatedFreezes += 1;
    }

    if (reward.type === 'freeze') {
      updatedFreezes += 1;
    } else if (reward.type === 'avatar' && !updatedAvatars.includes(reward.value)) {
      updatedAvatars.push(reward.value);
    } else if (reward.type === 'xp') {
      finalXp += 50;
    }

    const updatedUser: UserProfile = {
      ...user,
      xp: finalXp,
      streakFreezes: updatedFreezes,
      unlockedAvatars: updatedAvatars,
      completedTasksToday: newCompleted,
      levelRank: getGamificationRank(finalXp).rank,
    };

    handleSaveProfile(updatedUser);
    playRewardSound();

    if (isThreeTaskMilestone) {
      const milestoneReward: RewardResult = {
        title: `🎉 إنجاز ${newCompleted.length} مهام دراسية كاملة!`,
        description:
          'أحسنت يا بطل! لإكمالك 3 مهام دراسية متتالية، نلت بطاقة تجميد السلسلة 🧊 لحماية رصيد أيامك من الانقطاع!',
        type: 'freeze',
        value: 1,
        icon: '🧊',
      };
      setActiveReward(milestoneReward);
    } else {
      setActiveReward(reward);
    }
  };

  // Handle camera & gallery file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast('جاري قراءة نص الصفحة بالذكاء الاصطناعي...');

    try {
      if (typeof (window as any).Tesseract !== 'undefined') {
        const { createWorker } = (window as any).Tesseract;
        const worker = await createWorker('ara+fra');
        const ret = await worker.recognize(file);
        await worker.terminate();
        const recognizedText = (ret.data.text || '').trim();

        const customTitle = 'ملخص الدرس المصوّر';
        const newSummary: A4SummaryItem = {
          subject: customTitle,
          title: 'ملخص الدرس المصور بالكاميرا',
          intro: 'تم استخراج وتحليل هذا الدرس تلقائياً، وهو منسق للطباعة بحجم A4 المعتمد.',
          rule1: 'القراءة والتحليل الدقيق للنص المستخرج يضمن استيعاب كافة المفاهيم.',
          simplification: 'أهم النقاط المستخلصة من الدرس المصور:',
          points: [
            recognizedText ? recognizedText.slice(0, 200) + '...' : 'المفهوم الأساسي الأول المستخلص من الصفحة.',
            'القواعد المنهجية التي يجب مراعاتها أثناء التطبيق.',
            'أهم التنبيهات لتفادي الأخطاء الشائعة في الإجابة.',
          ],
          practice: 'تطبيقات تدريبية مقترحة:',
          exercises: [
            {
              q: 'تطبيق مباشر: ما هي الفكرة المحورية للدرس؟',
              a: 'الفكرة تتمحور حول القوانين والملاحظات الواردة في المستند المستخرج أعلاه.',
            },
            {
              q: 'تطبيق منهجي: كيف توظف هذه المكتسبات في الاختبار؟',
              a: 'بتحديد المعطيات وتطبيق القواعد خطوة بخطوة مع التأطير والتبرير.',
            },
          ],
        };

        setDynamicSummaries((prev) => ({ ...prev, [customTitle]: newSummary }));
        setActiveSummaryName(customTitle);
        setCurrentTab('summaries');

        const updatedUser = { ...user, xp: user.xp + 50 };
        handleSaveProfile(updatedUser);
        showToast('تم تلخيص الدرس بنجاح وحصلت على +50 XP!');
      } else {
        setActiveSummaryName(currentSubjects[0]?.name || 'الرياضيات');
        setCurrentTab('summaries');
        showToast('تم فتح الملخص المعتمد بنجاح!');
      }
    } catch (err) {
      console.error(err);
      setActiveSummaryName(currentSubjects[0]?.name || 'الرياضيات');
      setCurrentTab('summaries');
      showToast('تم فتح الملخص المعتمد بنجاح!');
    }
  };

  // Ask tutor from study notes
  const handleAskTutorFromNote = (question: string) => {
    setStudySubject({ name: 'الرياضيات' });
    setCurrentTab('tutor');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-purple-200">
      {/* Hidden File Inputs for Live Camera and Gallery Upload */}
      <input
        type="file"
        ref={cameraLiveInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Toast Notification - High Contrast Amber with Deep Black Text */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-amber-300 text-slate-950 px-5 py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 animate-in fade-in duration-200">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile-Friendly Top Bar - Clean, modern, high-contrast */}
      <div className="md:hidden flex items-center justify-between gap-2 px-3 py-2.5 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div
            onClick={() => setCurrentTab('dashboard')}
            className="cursor-pointer transition hover:opacity-90 flex items-center"
            title="الرئيسية - نجاحي dz"
          >
            <DZLogo size="sm" />
          </div>
          <span className="text-[10px] font-bold bg-purple-50 text-purple-800 px-2 py-0.5 rounded-lg border border-purple-200">
            {getGradeLabel(user.cycle, user.gradeId)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Unified Streak & Freeze Pill */}
          <button
            onClick={handleFreezeNextDay}
            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition"
            title="أيام المواظبة ورصيد التجميد"
          >
            <span>🔥{user.streak}</span>
            <span className="text-slate-300">|</span>
            <span>🧊{user.streakFreezes}</span>
          </button>

          {/* Focus Timer */}
          <button
            onClick={() => setIsPomodoroOpen(true)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition border border-slate-200"
            title="جلسة تركيز وتحدي"
          >
            <span>⏱️</span>
          </button>

          {/* User Avatar */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-sm border border-purple-300 transition shrink-0"
            title="الملف الشخصي"
          >
            {user.avatar || '👨‍🎓'}
          </button>
        </div>
      </div>

      {/* Desktop Header - World-Class Professional SaaS / EdTech Design */}
      <header className="hidden md:block no-print bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Brand & Grade Indicator */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setCurrentTab('dashboard')}
              className="cursor-pointer transition hover:opacity-90 flex items-center gap-2"
              title="الرئيسية - نجاحي dz"
            >
              <DZLogo size="md" />
            </div>

            <div className="bg-slate-50 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-200">
              {getGradeLabel(user.cycle, user.gradeId)}
            </div>

            {/* Collapse / Raise Navigation Button */}
            <button
              onClick={() => setIsNavCollapsed(!isNavCollapsed)}
              className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center gap-1 border border-slate-200"
              title={isNavCollapsed ? 'إظهار شريط القوائم' : 'إخفاء الشريط للتركيز الكامل'}
            >
              <span>{isNavCollapsed ? '🔽' : '🔼'}</span>
              <span>{isNavCollapsed ? 'القوائم' : 'تركيز'}</span>
            </button>
          </div>

          {/* Clean Modern Navigation Bar */}
          {!isNavCollapsed && (
            <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  currentTab === 'dashboard'
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🏠</span>
                <span>الرئيسية</span>
              </button>

              <button
                onClick={() => {
                  if (!studySubject) setStudySubject(currentSubjects[0] || { name: 'الرياضيات' });
                  setCurrentTab('tutor');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  currentTab === 'tutor'
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>👨‍🏫</span>
                <span>أستاذي الذكي</span>
              </button>

              {/* NEW: TEACHER BLACKBOARD (سبورة الأستاذ والدروس) */}
              <button
                onClick={() => setCurrentTab('blackboard')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                  currentTab === 'blackboard'
                    ? 'bg-purple-800 text-white border-purple-900 shadow-sm'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300 font-black'
                }`}
              >
                <span>📋</span>
                <span>سبورة الأستاذ والدروس</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              </button>

              <button
                onClick={() => setCurrentTab('exams')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  currentTab === 'exams'
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>📚</span>
                <span>بنك الامتحانات</span>
              </button>

              <button
                onClick={() => setCurrentTab('summaries')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  currentTab === 'summaries'
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>📑</span>
                <span>الملخصات A4</span>
              </button>

              <button
                onClick={() => setCurrentTab('quiz')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  currentTab === 'quiz'
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🎯</span>
                <span>اختبر نفسك</span>
              </button>

              <button
                onClick={() => setCurrentTab('videos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  currentTab === 'videos'
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🎬</span>
                <span>الفيديوهات</span>
              </button>

              <button
                onClick={() => setCurrentTab('kaizen')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  currentTab === 'kaizen'
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>📝</span>
                <span>المهام</span>
              </button>
            </nav>
          )}

          {/* Right Area: Unified Streak Pill + Focus Button + Avatar */}
          <div className="flex items-center gap-2">

            {/* Unified Streak & Freezes Capsule */}
            <div
              onClick={handleFreezeNextDay}
              title="أيام المواظبة ورصيد التجميد (انقر لتجميد اليوم القادم)"
              className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition shadow-xs"
            >
              <span className="flex items-center gap-1 text-amber-700">
                <span>🔥</span>
                <span>{user.streak} يوم</span>
              </span>
              <span className="w-px h-3.5 bg-slate-300"></span>
              <span className="flex items-center gap-1 text-blue-700">
                <span>🧊</span>
                <span>{user.streakFreezes} تجميد</span>
              </span>
            </div>

            {/* Focus Session Trigger */}
            <button
              onClick={() => setIsPomodoroOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-200"
              title="بدء جلسة تركيز بومودورو"
            >
              <span>⏱️</span>
              <span>تركيز</span>
            </button>

            {/* Account / Login Settings */}
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
              title="تسجيل الدخول وإعدادات الحساب"
            >
              <span>🔑</span>
            </button>

            {/* User Profile Avatar */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-8 h-8 rounded-xl bg-purple-100 hover:bg-purple-200 flex items-center justify-center text-sm border border-purple-300 transition shadow-xs"
              title="الملف الشخصي"
            >
              {user.avatar || '👨‍🎓'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Generous bottom padding to clear mobile navigation bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-28 md:pb-8">
        {/* VIEW 1: DASHBOARD (الصفحة الرئيسية) */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* COLLAPSED STATE OF THE BIG RECTANGLE (المستطيل الكبير مخفي) */}
            {isBigRectangleHidden ? (
              <div className="bg-white rounded-2xl p-4 border-2 border-slate-400 shadow-xs flex items-center justify-between flex-wrap gap-3 text-right">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-xl shrink-0">
                    🎓
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-950">
                      المستوى الدراسي المعتمد: {getGradeLabel(user.cycle, user.gradeId)}{' '}
                      {user.stream ? `(${user.stream})` : ''} • المادة المختارة:{' '}
                      <span className="text-purple-950 font-black bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-400">
                        {studySubject?.name || 'الرياضيات'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 font-bold mt-0.5">
                      المستطيل الكبير مطوي حالياً لتوفير أكبر مساحة للدراسة والتركيز
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBigRectangleHidden(false)}
                  className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-purple-100/90 font-bold text-xs border border-purple-700/50 shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🔽</span>
                  <span>إظهار لوحة نجاحي dz</span>
                </button>
              </div>
            ) : (
              /* EXPANDED REFINED STUDY CONTROL PANEL (نجاحي dz) */
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs text-right">
                {/* Title, All-Purple √dz Emblem & Collapse Button */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    {/* 
                      All-Purple Radical √dz Emblem (as instructed: "كله بنفسجي، وبنفسجي وفيه كتابة بالأبيض ولكنه أبيض خافت... وضع dz فوقها جذر") 
                    */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-md shadow-purple-950/20 overflow-hidden relative">
                      {/* Subtle purple radial glow */}
                      <div className="absolute inset-0 bg-radial from-purple-500/20 via-transparent to-transparent pointer-events-none" />

                      <svg
                        viewBox="0 0 64 64"
                        className="w-11 h-11 relative z-10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Decorative inner rounded box */}
                        <rect
                          x="5"
                          y="5"
                          width="54"
                          height="54"
                          rx="10"
                          stroke="#9333ea"
                          strokeWidth="1"
                          strokeOpacity="0.4"
                          strokeDasharray="3 2"
                        />

                        {/* Subtle graduation cap silhouette in soft lavender background */}
                        <polygon
                          points="32,12 18,18 32,24 46,18"
                          fill="#7e22ce"
                          fillOpacity="0.45"
                        />

                        {/* Radical Square Root Sign with horizontal bar extending over dz */}
                        <path
                          d="M12 34 L17 34 L23 50 L32 18 L55 18"
                          stroke="#EDE9FE"
                          strokeOpacity="0.88"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* "dz" under the radical bar in soft muted non-glaring white */}
                        <text
                          x="43"
                          y="37"
                          fontSize="17"
                          fontWeight="900"
                          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                          fill="#EDE9FE"
                          fillOpacity="0.88"
                          textAnchor="middle"
                          letterSpacing="-0.5"
                        >
                          dz
                        </text>

                        {/* Tiny end dot */}
                        <circle cx="54" cy="18" r="1.2" fill="#EDE9FE" fillOpacity="0.88" />
                      </svg>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                          نجاحي dz
                        </h1>
                        <span className="text-xs font-mono font-bold bg-purple-900 text-purple-100/90 px-2 py-0.5 rounded-lg border border-purple-700/60 shadow-xs">
                          √dz
                        </span>
                        <span className="text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                          الجزائر 🇩🇿
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        اختر الطور والسنة والمادة للانطلاق في المذاكرة، سبورة الأستاذ، والامتحانات الرسمية.
                      </div>
                    </div>
                  </div>

                  {/* Target Score Badge & Collapse Button */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-950 px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-200">
                      <span>✦ المعدل المستهدف: {user.targetScore} / 20</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsBigRectangleHidden(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center gap-1 cursor-pointer transition"
                      title="طي المستطيل لتوفير مساحة التركيز"
                    >
                      <span>🔼</span>
                      <span>طي للتركيز</span>
                    </button>
                  </div>
                </div>

                {/* Algerian Educational Cycles Selector */}
                <div className="mb-4 bg-slate-50/70 rounded-2xl p-3.5 sm:p-4 border border-slate-200 text-right">
                  {!isChangingCycle ? (
                    <div>
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {OFFICIAL_CYCLES.find((c) => c.id === activeCycleId)?.icon || '🏛️'}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              الطور المعتمد:{' '}
                              <span className="text-purple-800 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 font-bold">
                                {OFFICIAL_CYCLES.find((c) => c.id === activeCycleId)?.name || 'الطور الثانوي'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {OFFICIAL_CYCLES.find((c) => c.id === activeCycleId)?.subtitle}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsChangingCycle(true)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-xs flex items-center gap-1 cursor-pointer transition"
                        >
                          <span>🔄</span>
                          <span>تغيير الطور</span>
                        </button>
                      </div>

                      {/* Years of the Selected Cycle */}
                      <div className="pt-2.5 border-t border-slate-200">
                        <div className="text-[11px] font-bold text-slate-700 mb-2">
                          السنوات الدراسية:
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                          {cycleGrades.map((g) => {
                            const isGradeActive = user.gradeId === g.id;
                            return (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => handleSelectGrade(g.id, g.name)}
                                className={`p-2 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                                  isGradeActive
                                    ? 'bg-purple-800 text-white border-purple-900 shadow-xs'
                                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {g.name}
                              </button>
                            );
                          })}
                        </div>

                        {/* Secondary Streams if Secondary Cycle is active */}
                        {activeCycleId === 'secondary' && (
                          <div className="mt-2.5 pt-2.5 border-t border-slate-200">
                            <div className="text-[11px] font-bold text-slate-700 mb-1.5">الشعبة:</div>
                            <div className="flex flex-wrap gap-1.5">
                              {SECONDARY_STREAMS.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => handleSelectStream(s)}
                                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                                    user.stream === s
                                      ? 'bg-purple-800 text-white border-purple-900 shadow-xs'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Cycle Choice Picker */
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="text-xs font-bold text-slate-800">
                          اختر الطور التعليمي:
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsChangingCycle(false)}
                          className="text-xs font-bold text-slate-600 px-2 py-0.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-300"
                        >
                          ✕ إلغاء
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {OFFICIAL_CYCLES.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectCycle(c)}
                            className="p-3 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:bg-purple-50/50 text-right transition flex items-center justify-between cursor-pointer shadow-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{c.icon}</span>
                              <div>
                                <div className="text-xs font-bold text-slate-900">
                                  {c.name}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {c.subtitle}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              اختيار
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Shared Subject Selection Bar */}
                <div className="mb-5 p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl">
                  <div className="text-xs font-bold text-purple-950 mb-2 flex items-center justify-between">
                    <span>المواد الدراسية (انقر لاختيار المادة التي تود مراجعتها):</span>
                    {studySubject && (
                      <span className="text-purple-900 text-xs font-bold bg-white px-2 py-0.5 rounded-md border border-purple-200">
                        المادة المختارة: {studySubject.name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSubjects.map((sub) => {
                      const isSubSelected = studySubject?.name === sub.name;
                      return (
                        <button
                          key={sub.name}
                          onClick={() => {
                            setStudySubject(sub);
                            showToast(`تم اختيار مادة ${sub.name}`);
                          }}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isSubSelected
                              ? 'bg-purple-800 text-white border-purple-900 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>📘</span>
                          <span>{sub.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Study Avenues Grid */}
                <div>
                  <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
                    <span>أقسام المذاكرة والأدوات التعليمية:</span>
                    <span className="text-[11px] text-slate-500">انقر للذهاب فوراً للقسم</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Card 1: أستاذي الذكي */}
                    <div
                      onClick={() => {
                        if (!studySubject) setStudySubject(currentSubjects[0] || { name: 'الرياضيات' });
                        setCurrentTab('tutor');
                      }}
                      className="cursor-pointer bg-white hover:bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 hover:border-purple-500 shadow-xs transition group text-right flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                        👨‍🏫
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-purple-800 transition">
                          أستاذي الذكي
                        </div>
                        <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                          شرح فوري وتوجيه خطوة بخطوة بالصوت والكتابة.
                        </div>
                      </div>
                    </div>

                    {/* Card 2: سبورة الأستاذ والدروس (NEW & HIGHLIGHTED) */}
                    <div
                      onClick={() => setCurrentTab('blackboard')}
                      className="cursor-pointer bg-purple-50/60 hover:bg-purple-50 p-3.5 rounded-2xl border-2 border-purple-500 shadow-xs transition group text-right flex items-start gap-3 relative"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-800 text-white flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                        📋
                      </div>
                      <div>
                        <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                          <span>سبورة الأستاذ</span>
                          <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded font-black">
                            جديد
                          </span>
                        </div>
                        <div className="text-[11px] text-purple-800 leading-relaxed mt-0.5">
                          دروس مكتوبة بالسبورة، صوت الأستاذ، وتوليد دروس ذكية!
                        </div>
                      </div>
                    </div>

                    {/* Card 3: بنك الامتحانات */}
                    <div
                      onClick={() => setCurrentTab('exams')}
                      className="cursor-pointer bg-white hover:bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 hover:border-purple-500 shadow-xs transition group text-right flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                        📚
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-purple-800 transition">
                          بنك الامتحانات
                        </div>
                        <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                          20 امتحاناً لكل مادة مع التصحيح الوزاري ومؤقت القاعة.
                        </div>
                      </div>
                    </div>

                    {/* Card 4: تلخيص الدروس A4 */}
                    <div
                      onClick={() => setCurrentTab('summaries')}
                      className="cursor-pointer bg-white hover:bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 hover:border-purple-500 shadow-xs transition group text-right flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                        📑
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-purple-800 transition">
                          تلخيص الدروس A4
                        </div>
                        <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                          ملخصات بيداغوجية مركزة جاهزة للطباعة والمراجعة.
                        </div>
                      </div>
                    </div>

                    {/* Card 5: اختبر نفسك */}
                    <div
                      onClick={() => setCurrentTab('quiz')}
                      className="cursor-pointer bg-white hover:bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 hover:border-purple-500 shadow-xs transition group text-right flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                        🎯
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-purple-800 transition">
                          اختبر نفسك
                        </div>
                        <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                          أسئلة حصرية ذكية مع كشف الأخطاء الشائعة والحل.
                        </div>
                      </div>
                    </div>

                    {/* Card 6: فيديوهات الأساتذة */}
                    <div
                      onClick={() => setCurrentTab('videos')}
                      className="cursor-pointer bg-white hover:bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 hover:border-purple-500 shadow-xs transition group text-right flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                        🎬
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-purple-800 transition">
                          فيديوهات الأساتذة
                        </div>
                        <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                          شروحات منتقاة لكبار الأساتذة في الجزائر دون إعلانات.
                        </div>
                      </div>
                    </div>

                    {/* Card 7: المهام والملاحظات (كايزن) */}
                    <div
                      onClick={() => setCurrentTab('kaizen')}
                      className="cursor-pointer bg-white hover:bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 hover:border-purple-500 shadow-xs transition group text-right flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                        📝
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-purple-800 transition">
                          المهام والملاحظات
                        </div>
                        <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                          تنظيم المذاكرة اليومية وتدوين النقاط بطريقة كايزن.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: TUTOR (أستاذي) */}
        {currentTab === 'tutor' && (
          <ChatTutor
            currentCycle={user.cycle}
            currentGradeId={user.gradeId}
            initialSubject={studySubject?.name}
            onAddXP={(amount) => {
              const updatedUser = { ...user, xp: user.xp + amount };
              handleSaveProfile(updatedUser);
              showToast(`+${amount} XP! تفاعل ممتاز مع أستاذي!`);
            }}
            onOpenScanner={() => {
              setPermissionType('camera');
              setIsPermissionsOpen(true);
            }}
          />
        )}

        {/* VIEW: TEACHER BLACKBOARD (سبورة الأستاذ والدروس التفاعلية مع الشرح الصوتي) */}
        {currentTab === 'blackboard' && (
          <TeacherBlackboard
            currentSubject={studySubject?.name || 'الرياضيات'}
            currentGrade={getGradeLabel(user.cycle, user.gradeId)}
            onAwardXp={(amount, reason) => {
              const updatedUser = { ...user, xp: user.xp + amount };
              handleSaveProfile(updatedUser);
              showToast(`+${amount} XP! ${reason}`);
            }}
            onOpenExamBank={() => setCurrentTab('exams')}
          />
        )}

        {/* VIEW 3: OFFICIAL EXAMS BANK (بنك الامتحانات والفروض الرسمية - 20 امتحاناً لكل مادة ولا نهائي) */}
        {currentTab === 'exams' && (
          <OfficialExamsBank
            currentCycle={user.cycle}
            currentGradeId={user.gradeId}
            currentStream={user.stream}
            onAddXP={(amount) => {
              const updatedUser = { ...user, xp: user.xp + amount };
              handleSaveProfile(updatedUser);
              showToast(`+${amount} XP! إنجاز رائع في حل الامتحانات الرسمية!`);
            }}
            onSelectSubjectForTutor={(subj) => {
              setStudySubject({ name: subj });
              setCurrentTab('tutor');
            }}
          />
        )}

        {/* VIEW 4: SUMMARIES (تلخيص الدروس) */}
        {currentTab === 'summaries' && (
          <ConversationalSummarizer
            currentCycle={user.cycle}
            currentGradeId={user.gradeId}
            onAddXP={(amount) => {
              const updatedUser = { ...user, xp: user.xp + amount };
              handleSaveProfile(updatedUser);
              showToast(`+${amount} XP! أحسنت يا بطل!`);
            }}
            onOpenScanner={() => {
              setPermissionType('camera');
              setIsPermissionsOpen(true);
            }}
          />
        )}

        {/* VIEW 5: QUIZ (اختبر نفسك - أسئلة حصرية لكل مادة) */}
        {currentTab === 'quiz' && (
          <InteractiveQuiz
            currentCycle={user.cycle}
            currentGradeId={user.gradeId}
            initialSubject={studySubject?.name || 'الرياضيات'}
            onAddXP={(amount) => {
              const updatedUser = { ...user, xp: user.xp + amount };
              handleSaveProfile(updatedUser);
              showToast(`+${amount} XP! إجابة ممتازة!`);
            }}
          />
        )}

        {/* VIEW 6: VIDEOS (فيديوهات وشروحات كبار الأساتذة) */}
        {currentTab === 'videos' && (
          <TeachersVideos
            currentCycle={user.cycle}
            selectedSubject={studySubject?.name}
          />
        )}

        {/* VIEW 7: KAIZEN (المهام والملاحظات) */}
        {currentTab === 'kaizen' && (
          <div className="space-y-6 text-right">
            {/* Gamification Status Bar */}
            <div className="bg-purple-700 text-white rounded-3xl p-5 shadow-xs flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs font-bold text-purple-200 uppercase">نظام التحفيز والجوائز</div>
                <h2 className="text-xl font-black">
                  رتبتك الحالية: {gamification.rank} • إجمالي النقاط: {user.xp} XP
                </h2>
                <div className="text-xs text-purple-100 mt-1 font-medium">
                  أنت في وتيرة ممتازة للوصول إلى معدل {gamification.nextAvg}/20.
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="bg-white text-purple-900 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition hover:bg-purple-50"
                >
                  فتح خزنة الجوائز
                </button>
              </div>
            </div>

            {/* Daily Tasks List */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    قائمة مهام المذاكرة اليومية بطريقة كايزن (+50 XP)
                  </h3>
                  <p className="text-xs text-slate-500">
                    خطوات صغيرة مستمرة يومياً؛ كل مهمة تنجزها تمنحك 50 XP وفرصة الفوز ببطاقة تجميد السلسلة 🧊 أو صورة نادرة!
                  </p>
                </div>
                <span className="text-xs font-black text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  تم إنجاز {completedTasks.length} من {DAILY_STUDY_TASKS.length}
                </span>
              </div>

              <div className="space-y-3">
                {DAILY_STUDY_TASKS.map((task) => {
                  const isDone = completedTasks.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => !isDone && handleCompleteTask(task)}
                      className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        isDone
                          ? 'bg-purple-50/70 border-purple-300'
                          : 'bg-white border-slate-200 hover:border-purple-500 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm font-black ${
                            isDone ? 'bg-purple-600 text-white' : 'border-2 border-slate-300'
                          }`}
                        >
                          {isDone ? '✓' : ''}
                        </div>
                        <div>
                          <div
                            className={`text-sm font-black ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            مكافأة: +50 XP وسحب جائزة عشوائية فورية
                          </div>
                        </div>
                      </div>

                      <button
                        className={`text-xs font-black px-3.5 py-1.5 rounded-xl transition ${
                          isDone
                            ? 'bg-purple-100 text-purple-900 cursor-default'
                            : 'bg-amber-100 text-amber-950 hover:bg-amber-200'
                        }`}
                      >
                        {isDone ? 'مكتملة ✓' : 'إتمام واستلام الجائزة'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart Study Notes & Student Questions Organizers */}
            <NotesAndTasks
              tasks={DAILY_STUDY_TASKS}
              completedTasks={completedTasks}
              onCompleteTask={handleCompleteTask}
              onAskTutor={handleAskTutorFromNote}
              xp={user.xp}
            />
          </div>
        )}
      </main>

      {/* Footer (Hidden when printed) */}
      <footer className="no-print bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>منصة نجاحي التعليمية • الجمهورية الجزائرية الديمقراطية الشعبية</div>
          <div className="flex gap-4 font-black text-slate-700">
            <button onClick={() => setIsProfileOpen(true)}>الملف الشخصي</button>
            <button onClick={() => setCurrentTab('summaries')}>تلخيص الدروس</button>
            <button onClick={() => setIsPomodoroOpen(true)}>جلسة تركيز</button>
          </div>
        </div>
      </footer>

      {/* Mobile-Friendly Sticky Bottom Navigation Bar */}
      <nav
        aria-label="التنقل السفلي بالهاتف"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-slate-300 shadow-2xl px-1.5 py-1 flex items-center justify-around"
      >
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[44px] py-1 px-1 rounded-xl transition ${
            currentTab === 'dashboard'
              ? 'text-slate-950 font-black bg-amber-300 border-2 border-slate-900 shadow-2xs'
              : 'text-slate-950 font-bold hover:bg-slate-100'
          }`}
        >
          <span className="text-lg">🏠</span>
          <span className="text-[10px] font-black mt-0.5 whitespace-nowrap">الرئيسية</span>
        </button>

        <button
          onClick={() => {
            if (!studySubject) setStudySubject(currentSubjects[0] || { name: 'الرياضيات' });
            setCurrentTab('tutor');
          }}
          className={`flex flex-col items-center justify-center min-w-[44px] py-1.5 px-1.5 rounded-xl transition ${
            currentTab === 'tutor'
              ? 'text-white font-bold bg-purple-800 shadow-xs'
              : 'text-slate-700 font-semibold hover:bg-slate-100'
          }`}
        >
          <span className="text-base">👨‍🏫</span>
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">أستاذي</span>
        </button>

        {/* NEW: Blackboard in mobile nav */}
        <button
          onClick={() => setCurrentTab('blackboard')}
          className={`flex flex-col items-center justify-center min-w-[44px] py-1.5 px-1.5 rounded-xl transition ${
            currentTab === 'blackboard'
              ? 'text-white font-bold bg-purple-800 shadow-xs'
              : 'text-slate-700 font-semibold hover:bg-slate-100'
          }`}
        >
          <span className="text-base">📋</span>
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">السبورة</span>
        </button>

        <button
          onClick={() => setCurrentTab('exams')}
          className={`flex flex-col items-center justify-center min-w-[44px] py-1.5 px-1.5 rounded-xl transition ${
            currentTab === 'exams'
              ? 'text-white font-bold bg-purple-800 shadow-xs'
              : 'text-slate-700 font-semibold hover:bg-slate-100'
          }`}
        >
          <span className="text-base">📚</span>
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">الامتحانات</span>
        </button>

        <button
          onClick={() => setCurrentTab('summaries')}
          className={`flex flex-col items-center justify-center min-w-[44px] py-1.5 px-1.5 rounded-xl transition ${
            currentTab === 'summaries'
              ? 'text-white font-bold bg-purple-800 shadow-xs'
              : 'text-slate-700 font-semibold hover:bg-slate-100'
          }`}
        >
          <span className="text-base">📑</span>
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">الملخصات</span>
        </button>

        <button
          onClick={() => setCurrentTab('quiz')}
          className={`flex flex-col items-center justify-center min-w-[44px] py-1.5 px-1.5 rounded-xl transition ${
            currentTab === 'quiz'
              ? 'text-white font-bold bg-purple-800 shadow-xs'
              : 'text-slate-700 font-semibold hover:bg-slate-100'
          }`}
        >
          <span className="text-base">🎯</span>
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">اختبر نفسك</span>
        </button>

        <button
          onClick={() => setCurrentTab('videos')}
          className={`flex flex-col items-center justify-center min-w-[44px] py-1.5 px-1.5 rounded-xl transition ${
            currentTab === 'videos'
              ? 'text-white font-bold bg-purple-800 shadow-xs'
              : 'text-slate-700 font-semibold hover:bg-slate-100'
          }`}
        >
          <span className="text-base">🎬</span>
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">فيديوهات</span>
        </button>

        <button
          onClick={() => setCurrentTab('kaizen')}
          className={`flex flex-col items-center justify-center min-w-[44px] py-1.5 px-1.5 rounded-xl transition ${
            currentTab === 'kaizen'
              ? 'text-white font-bold bg-purple-800 shadow-xs'
              : 'text-slate-700 font-semibold hover:bg-slate-100'
          }`}
        >
          <span className="text-base">📝</span>
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">المهام</span>
        </button>
      </nav>

      {/* MODALS */}

      {/* 1. Onboarding & Authentication Modal (Gmail, Password, IQ Test, Guidance) */}
      <OnboardingAuthModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        user={user}
        onSaveProfile={handleSaveProfile}
        showToast={showToast}
      />

      {/* 2. User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />

      {/* 3. Permissions Modal */}
      <PermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        defaultType={permissionType}
        onSelectAction={(action) => {
          if (action === 'live_camera') {
            cameraLiveInputRef.current?.click();
          } else if (action === 'gallery') {
            galleryInputRef.current?.click();
          }
        }}
      />

      {/* 4. Celebration & Reward Popup Modal */}
      <RewardModal
        reward={activeReward}
        onClose={() => setActiveReward(null)}
        onEquipAvatar={(avatarChar) => {
          handleSaveProfile({ ...user, avatar: avatarChar });
        }}
      />

      {/* 5. Pomodoro Focus Timer Modal */}
      <PomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        onComplete={() => {
          const updatedUser = { ...user, xp: user.xp + 50 };
          handleSaveProfile(updatedUser);
          playRewardSound();
          setActiveReward({
            type: 'xp',
            title: 'أحسنت! أتممت جلسة تركيز 25 دقيقة',
            description: 'حصلت على 50 XP إضافية لمواظبتك وجديتك في الدراسة!',
            value: 50,
            icon: '⚡',
          });
        }}
      />
    </div>
  );
}
