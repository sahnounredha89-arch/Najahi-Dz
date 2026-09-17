import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getGradeLabel } from '../data/curriculum';

interface OnboardingAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  showToast: (msg: string) => void;
}

const DEFAULT_SUBJECTS_LIST = [
  'الرياضيات',
  'العلوم الطبيعية',
  'العلوم الفيزيائية',
  'اللغة العربية',
  'اللغة الفرنسية',
  'اللغة الإنجليزية',
  'التاريخ والجغرافيا',
  'العلوم الإسلامية',
  'الفلسفة',
];

export const OnboardingAuthModal: React.FC<OnboardingAuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
  showToast,
}) => {
  if (!isOpen) return null;

  // If the user already has an email or is logged in, show the 'account' view directly!
  const hasExistingAccount = Boolean(user.email && user.email.trim().length > 0);

  const [step, setStep] = useState<'account' | 'auth' | 'mode' | 'iq_test' | 'guide'>(
    hasExistingAccount ? 'account' : 'auth'
  );

  const [accountType, setAccountType] = useState<'new' | 'existing'>('existing');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [referralSource, setReferralSource] = useState('فيسبوك');
  const [studentName, setStudentName] = useState(user.name || '');

  // Marks / Scores State
  const [currentScore, setCurrentScore] = useState(user.currentScore || 14.5);
  const [targetScore, setTargetScore] = useState(user.targetScore || 17.5);
  const [subjectScores, setSubjectScores] = useState<Record<string, number>>(
    user.subjectScores || {
      الرياضيات: 15,
      'العلوم الطبيعية': 14.5,
      'العلوم الفيزيائية': 14,
      'اللغة العربية': 15.5,
      'اللغة الفرنسية': 13,
      'اللغة الإنجليزية': 16,
      'التاريخ والجغرافيا': 14,
      'العلوم الإسلامية': 16.5,
      الفلسفة: 14,
    }
  );

  // New custom subject to add to marks
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectScore, setNewSubjectScore] = useState<number>(15);

  // Quick IQ test state
  const [iqAnswers, setIqAnswers] = useState<number[]>([]);
  const [iqResult, setIqResult] = useState<string | null>(null);

  useEffect(() => {
    if (user.email && user.email.trim().length > 0) {
      setStep('account');
      setEmail(user.email);
      setStudentName(user.name);
      setCurrentScore(user.currentScore || 14.5);
      setTargetScore(user.targetScore || 17.5);
      if (user.subjectScores) {
        setSubjectScores(user.subjectScores);
      }
    }
  }, [user]);

  const IQ_QUESTIONS = [
    {
      q: 'إذا كان ثمن 3 كراريس هو 150 دج، فكم ثمن 5 كراريس من نفس النوع؟',
      options: ['200 دج', '250 دج', '300 دج', '180 دج'],
      correct: 1, // 150 / 3 * 5 = 250
    },
    {
      q: 'أكمل المتتالية المنطقية: 2 ، 4 ، 8 ، 16 ، ... ؟',
      options: ['24', '30', '32', '64'],
      correct: 2, // 32
    },
    {
      q: 'أي العبارات الآتية تمثل القاعدة الذهبية لحل أي مسألة دراسية؟',
      options: [
        'البدء بالحساب فوراً دون قراءة المسألة',
        'قراءة المسألة مرتين وتحديد المعطيات والمطلوب بدقة',
        'حفظ الحلول السابقة وتطبيقها عشوائياً',
        'تخمين النتيجة النهائية أولاً',
      ],
      correct: 1,
    },
  ];

  const handleSaveMarksAndAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: studentName.trim() || user.name,
      email: email.trim() || user.email,
      currentScore: Number(currentScore) || 14.5,
      targetScore: Number(targetScore) || 17.5,
      subjectScores: { ...subjectScores },
      isLoggedIn: true,
    };
    onSaveProfile(updated);
    showToast('✅ تم حفظ بيانات الحساب وعلاماتك الدراسية بنجاح!');
    onClose();
  };

  const handleUpdateSubjectScore = (subj: string, val: number) => {
    setSubjectScores((prev) => ({
      ...prev,
      [subj]: Math.min(20, Math.max(0, val)),
    }));
  };

  const handleAddCustomSubject = () => {
    if (!newSubjectName.trim()) return;
    setSubjectScores((prev) => ({
      ...prev,
      [newSubjectName.trim()]: Math.min(20, Math.max(0, Number(newSubjectScore) || 15)),
    }));
    setNewSubjectName('');
    showToast(`تمت إضافة علامة مادة ${newSubjectName.trim()}`);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('يرجى إدخال البريد الإلكتروني وكلمة المرور للمتابعة.');
      return;
    }
    const updated: UserProfile = {
      ...user,
      email: email.trim(),
      name: studentName.trim() || email.split('@')[0] || user.name,
      isLoggedIn: true,
    };
    onSaveProfile(updated);
    showToast('تم تسجيل الدخول بنجاح!');
    setStep('mode');
  };

  const handleSelectMode = (mode: 'zero' | 'iq') => {
    if (mode === 'zero') {
      setStep('guide');
    } else {
      setIqAnswers([]);
      setIqResult(null);
      setStep('iq_test');
    }
  };

  const handleAnswerIq = (questionIndex: number, optionIndex: number) => {
    const updatedAnswers = [...iqAnswers];
    updatedAnswers[questionIndex] = optionIndex;
    setIqAnswers(updatedAnswers);

    if (updatedAnswers.length === IQ_QUESTIONS.length && !updatedAnswers.includes(undefined as any)) {
      let correctCount = 0;
      updatedAnswers.forEach((ans, idx) => {
        if (ans === IQ_QUESTIONS[idx].correct) correctCount++;
      });

      let evaluation = '';
      if (correctCount === 3) {
        evaluation = 'مستوى متقدم وذكي جداً (جاهز للامتياز والتفوق)';
      } else if (correctCount === 2) {
        evaluation = 'مستوى جيد جداً ولديك قدرات ممتازة تحتاج لصقل منهجي';
      } else {
        evaluation = 'مستوى يحتاج إلى تأسيس خطوة بخطوة وسنرافقك من الصفر';
      }

      setIqResult(evaluation);
      const bonusXP = (correctCount + 1) * 30;
      onSaveProfile({
        ...user,
        xp: user.xp + bonusXP,
      });
      showToast(`تم تقييم مستواك: ${evaluation} (+${bonusXP} نقطة ترحيبية!)`);
    }
  };

  const handleFinishOnboarding = () => {
    try {
      localStorage.setItem('najahy_onboarded_v2', 'true');
    } catch (e) {
      // ignore
    }
    onClose();
    showToast('مرحباً بك في منصة نجاحي dz! جاهز للتفوق.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border-2 border-slate-300 text-right animate-in fade-in zoom-in duration-200 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* VIEW A: ALREADY LOGGED IN -> ACCOUNT & MARKS DASHBOARD (لا يطلب كلمة المرور مراراً ويعرض العلامات) */}
        {step === 'account' && (
          <form onSubmit={handleSaveMarksAndAccount} className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-950">
                    ملف حسابي وعلاماتي الدراسية
                  </h2>
                  <p className="text-xs font-bold text-purple-800">
                    منصة نجاحي dz • الحساب نشط
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-950 font-black flex items-center justify-center border border-slate-300 transition"
              >
                ✕
              </button>
            </div>

            {/* Login Status Banner */}
            <div className="bg-purple-100 border-2 border-purple-400 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <div>
                  <div className="text-xs font-black text-purple-950">
                    أنت مسجل الدخول بحسابك:
                  </div>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    {user.email || email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPassword('');
                  setStep('auth');
                  setAccountType('existing');
                }}
                className="text-[11px] font-black bg-amber-200 hover:bg-amber-300 text-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-700 transition"
                title="تسجيل الدخول بحساب آخر أو تغيير كلمة المرور"
              >
                🔄 تبديل الحساب
              </button>
            </div>

            {/* Basic Info Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-950 mb-1">
                  اسم التلميذ:
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-950 focus:border-purple-600 focus:outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-950 mb-1">
                  المستوى الدراسي الحالي:
                </label>
                <div className="px-3 py-2 rounded-xl border-2 border-slate-200 bg-slate-100 text-xs font-black text-slate-900">
                  {getGradeLabel(user.cycle, user.gradeId)} {user.stream ? `(${user.stream})` : ''}
                </div>
              </div>
            </div>

            {/* SECTION: MARKS (ما هي علاماتك؟ احتفظ بالقديمة مع إضافة وتعديل) */}
            <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">📊</span>
                  <span className="text-xs sm:text-sm font-black text-slate-950">
                    كشف علاماتك الدراسية (المحفوظة والجديدة):
                  </span>
                </div>
                <span className="text-[11px] font-black bg-amber-200 text-slate-950 px-2 py-0.5 rounded-lg border border-amber-500">
                  محفوظة دائماً
                </span>
              </div>

              {/* Main Averages */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white p-3 rounded-xl border-2 border-slate-200">
                  <label className="block text-[11px] font-black text-slate-900 mb-1">
                    المعدل الفصلي السابق / الحالي (من 20):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={currentScore}
                    onChange={(e) => setCurrentScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border-2 border-slate-300 text-sm font-black text-slate-950 focus:border-purple-600 focus:outline-none bg-white"
                  />
                </div>

                <div className="bg-white p-3 rounded-xl border-2 border-slate-200">
                  <label className="block text-[11px] font-black text-slate-900 mb-1">
                    المعدل المستهدف للتفوق (من 20):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border-2 border-slate-300 text-sm font-black text-slate-950 focus:border-purple-600 focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Individual Subject Marks */}
              <div className="text-xs font-black text-slate-950 mb-2">
                علامات المواد الدراسية الفردية:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {Object.entries(subjectScores).map(([subj, score]) => (
                  <div
                    key={subj}
                    className="bg-white p-2 rounded-xl border border-slate-300 flex items-center justify-between gap-1 shadow-2xs"
                  >
                    <span className="text-[11px] font-bold text-slate-900 truncate max-w-[90px]">
                      {subj}:
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={score}
                      onChange={(e) => handleUpdateSubjectScore(subj, Number(e.target.value))}
                      className="w-14 px-1 py-0.5 rounded-md border border-slate-300 text-xs font-black text-slate-950 text-center bg-slate-50 focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              {/* Add a New Custom Subject */}
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="إضافة مادة أخرى (مثال: الإسبانية، الرسم...)"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-950 bg-white"
                />
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  placeholder="العلامة"
                  value={newSubjectScore}
                  onChange={(e) => setNewSubjectScore(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 rounded-xl border-2 border-slate-300 text-xs font-black text-slate-950 text-center bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSubject}
                  className="bg-purple-300 hover:bg-purple-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl border-2 border-slate-800 transition"
                >
                  + إضافة
                </button>
              </div>
            </div>

            {/* Quick Stats overview */}
            <div className="flex items-center justify-between gap-2 p-3 bg-blue-100 border-2 border-blue-300 rounded-2xl text-xs font-black text-blue-950">
              <div className="flex items-center gap-1.5">
                <span>🧊</span>
                <span>رصيد تجميد السلسلة: {user.streakFreezes} أيام</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>⚡</span>
                <span>النقاط الإجمالية: {user.xp} XP</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-purple-400 hover:bg-purple-500 text-slate-950 font-black text-sm py-3 rounded-xl border-2 border-slate-900 shadow-sm transition"
              >
                💾 حفظ وتحديث علاماتي وبياناتي
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-950 font-black text-sm rounded-xl border-2 border-slate-400 transition"
              >
                إغلاق
              </button>
            </div>
          </form>
        )}

        {/* VIEW B: LOGIN / REGISTER (عندما يريد تسجيل الدخول بحساب جديد أو إدخال كلمة المرور) */}
        {step === 'auth' && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-300 text-slate-950 flex items-center justify-center text-2xl mx-auto mb-2 border-2 border-slate-900 shadow-xs">
                🎓
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                تسجيل الدخول إلى منصة نجاحي dz
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
                احفظ تقدمك، علاماتك المدرسية، ورصيد تجميد السلسلة
              </p>
            </div>

            {/* Account Type Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-300">
              <button
                type="button"
                onClick={() => setAccountType('existing')}
                className={`py-2 text-xs font-black rounded-lg transition border ${
                  accountType === 'existing'
                    ? 'bg-amber-300 text-slate-950 border-slate-900 shadow-2xs'
                    : 'bg-transparent text-slate-800 border-transparent'
                }`}
              >
                لدي حساب مسجل
              </button>
              <button
                type="button"
                onClick={() => setAccountType('new')}
                className={`py-2 text-xs font-black rounded-lg transition border ${
                  accountType === 'new'
                    ? 'bg-amber-300 text-slate-950 border-slate-900 shadow-2xs'
                    : 'bg-transparent text-slate-800 border-transparent'
                }`}
              >
                حساب جديد لأول مرة
              </button>
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-xs font-black text-slate-950 mb-1">
                اسم التلميذ أو اللقب:
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="مثال: يوسف، عبد الرحمان، مريم..."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:outline-none focus:border-purple-600 bg-white"
              />
            </div>

            {/* Gmail / Email */}
            <div>
              <label className="block text-xs font-black text-slate-950 mb-1">
                البريد الإلكتروني (الجيميل):
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:outline-none focus:border-purple-600 bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-slate-950 mb-1">
                كلمة المرور (المود باس):
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:outline-none focus:border-purple-600 bg-white"
              />
            </div>

            {/* Referral Source */}
            <div>
              <label className="block text-xs font-black text-slate-950 mb-1">
                من أين تعرفت على هذا الموقع؟
              </label>
              <select
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-950 bg-white"
              >
                <option value="فيسبوك">فيسبوك (Facebook)</option>
                <option value="تيك توك">تيك توك (TikTok)</option>
                <option value="توصية صديق أو زميل">توصية زميل دراسة أو ولي أمر</option>
                <option value="المدرسة أو الأستاذ">المدرسة أو الأستاذ</option>
                <option value="محرك بحث">بحث على الإنترنت</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-purple-400 hover:bg-purple-500 text-slate-950 font-black text-sm py-3 rounded-xl border-2 border-slate-900 shadow-sm transition"
              >
                {accountType === 'new' ? 'متابعة وإنشاء الحساب' : 'تسجيل الدخول للمنصة'}
              </button>
            </div>

            {hasExistingAccount && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setStep('account')}
                  className="text-xs font-black text-slate-800 underline hover:text-slate-950"
                >
                  ← العودة إلى ملف حسابي وعلاماتي المحفوظة
                </button>
              </div>
            )}
          </form>
        )}

        {/* VIEW C: START METHOD (من الصفر أو اختبار الذكاء) */}
        {step === 'mode' && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-200 text-slate-950 flex items-center justify-center text-2xl mx-auto mb-2 border-2 border-slate-800">
              🧭
            </div>
            <h3 className="text-xl font-black text-slate-950">
              كيف تفضل أن نبدأ رحلتك الدراسية؟
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed max-w-sm mx-auto">
              يمكنك البدء مباشرة من الصفر، أو خوض اختبار ذكاء دراسي سريع لتحديد مستواك الحالي وتقديم نصائح مخصصة لك.
            </p>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSelectMode('zero')}
                className="p-4 rounded-2xl border-2 border-purple-600 bg-purple-100 hover:bg-purple-200 text-right transition flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-black text-purple-950 mb-1">
                    🚀 ابدأ معي من الصفر خطوة بخطوة
                  </h4>
                  <p className="text-xs text-slate-800 font-bold">
                    الدخول المباشر إلى المنصة وتصفح الدروس والملخصات من البداية دون اختبارات مسبقة.
                  </p>
                </div>
                <span className="text-2xl mr-2">📖</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('iq')}
                className="p-4 rounded-2xl border-2 border-amber-500 bg-amber-100 hover:bg-amber-200 text-right transition flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-black text-slate-950 mb-1">
                    🧠 اختبار الذكاء وتحديد المستوى الدراسي
                  </h4>
                  <p className="text-xs text-slate-800 font-bold">
                    3 أسئلة سريعة لتشخيص مستواك، كشف نقاط قوتك، والحصول على نقاط إضافية!
                  </p>
                </div>
                <span className="text-2xl mr-2">⚡</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW D: IQ & LEVEL DIAGNOSTIC */}
        {step === 'iq_test' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                <span>🧠</span>
                <span>اختبار الذكاء وتحديد المستوى</span>
              </h3>
              <span className="text-xs font-black text-slate-800">
                {iqAnswers.length} من {IQ_QUESTIONS.length} مجاب
              </span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {IQ_QUESTIONS.map((item, qIdx) => (
                <div key={qIdx} className="bg-slate-100 border-2 border-slate-300 rounded-xl p-3.5 text-right">
                  <div className="text-xs font-black text-slate-950 mb-2">
                    {qIdx + 1}. {item.q}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {item.options.map((opt, oIdx) => {
                      const isSelected = iqAnswers[qIdx] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleAnswerIq(qIdx, oIdx)}
                          className={`p-2 rounded-lg text-xs font-black text-right transition border-2 ${
                            isSelected
                              ? 'bg-amber-300 text-slate-950 border-slate-900 shadow-2xs'
                              : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {iqResult && (
              <div className="p-4 bg-purple-100 border-2 border-purple-400 rounded-xl text-center">
                <div className="text-xs font-black text-purple-950 mb-1">النتيجة والتقييم:</div>
                <div className="text-sm font-black text-slate-950 mb-2">{iqResult}</div>
                <button
                  type="button"
                  onClick={() => setStep('guide')}
                  className="bg-purple-400 hover:bg-purple-500 text-slate-950 text-xs font-black px-6 py-2 rounded-xl border-2 border-slate-900 transition"
                >
                  المتابعة ودليل الاستخدام ←
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW E: HOW TO USE GUIDE */}
        {step === 'guide' && (
          <div className="space-y-4 text-right">
            <div className="text-center mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-200 text-slate-950 flex items-center justify-center text-xl mx-auto mb-2 border-2 border-slate-800">
                💡
              </div>
              <h3 className="text-lg font-black text-slate-950">
                كيف تستعمل منصة نجاحي dz بكل سهولة؟
              </h3>
              <p className="text-xs text-slate-700 font-bold">3 خطوات بسيطة لضمان أعلى معدل</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 bg-slate-100 rounded-xl border border-slate-300">
                <span className="w-6 h-6 rounded-full bg-amber-300 text-slate-950 flex items-center justify-center text-xs font-black shrink-0 border border-slate-800">
                  1
                </span>
                <div>
                  <div className="text-xs font-black text-slate-950 mb-0.5">
                    اختر طورك وسنتك ومادتك
                  </div>
                  <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                    حدد طورك الدراسي من أعلى الصفحة، ثم اختر المادة لتتكيف جميع شروحات الأستاذ والامتحانات معها.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-100 rounded-xl border border-slate-300">
                <span className="w-6 h-6 rounded-full bg-amber-300 text-slate-950 flex items-center justify-center text-xs font-black shrink-0 border border-slate-800">
                  2
                </span>
                <div>
                  <div className="text-xs font-black text-slate-950 mb-0.5">
                    استخدم زر إخفاء المستطيل لراحة عينيك
                  </div>
                  <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                    يمكنك طي وإخفاء المستطيل الكبير بضغطة زر لرؤية الشروحات والدروس مباشرة دون شغل الشاشة.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-100 rounded-xl border border-slate-300">
                <span className="w-6 h-6 rounded-full bg-amber-300 text-slate-950 flex items-center justify-center text-xs font-black shrink-0 border border-slate-800">
                  3
                </span>
                <div>
                  <div className="text-xs font-black text-slate-950 mb-0.5">
                    حافظ على سلسلة المواظبة وتجميد الـ 5 أيام
                  </div>
                  <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                    استخدم زر التجميد عند الحاجة لحماية سلسلتك اليومية دون انقطاع.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="w-full bg-purple-400 hover:bg-purple-500 text-slate-950 font-black text-sm py-3 rounded-xl border-2 border-slate-900 shadow-sm transition"
            >
              دخول المنصة والبدء فوراً ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
