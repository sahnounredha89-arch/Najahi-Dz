import React, { useState } from 'react';
import { Mic, MicOff, Send, Printer, Sparkles, BookOpen, ShieldAlert, CheckCircle2, RotateCcw, Copy, Camera, Edit3, FileText, Check, ChevronLeft, BookmarkCheck } from 'lucide-react';
import { A4SummaryItem } from '../types';
import { READY_LESSONS_CATALOG } from '../data/summaries';

interface ConversationalSummarizerProps {
  currentCycle: 'primary' | 'middle' | 'secondary' | 'university';
  currentGradeId: string;
  onAddXP: (amount: number) => void;
  onOpenScanner: () => void;
}

const CATALOG_CATEGORIES = [
  'الكل',
  'الرياضيات',
  'العلوم الفيزيائية والتكنولوجيا',
  'علوم الطبيعة والحياة',
  'اللغة العربية وآدابها',
  'التاريخ والجغرافيا',
  'الفلسفة',
  'التربية الإسلامية'
];

export const ConversationalSummarizer: React.FC<ConversationalSummarizerProps> = ({
  currentCycle,
  currentGradeId,
  onAddXP,
  onOpenScanner
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  // Default to the first ready lesson so the user immediately sees a rich, printable/writable lesson!
  const [summaryData, setSummaryData] = useState<A4SummaryItem | null>(READY_LESSONS_CATALOG[0]);
  const [summaryMode, setSummaryMode] = useState<'a4' | 'handwritten'>('a4');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [personalNote, setPersonalNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [cheatAlert, setCheatAlert] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyNotebookSuccess, setCopyNotebookSuccess] = useState(false);

  // Filter ready lessons by selected category
  const filteredCatalog = selectedCategory === 'الكل'
    ? READY_LESSONS_CATALOG
    : READY_LESSONS_CATALOG.filter(l => l.subject.includes(selectedCategory) || selectedCategory.includes(l.subject));

  // Speech Recognition
  const startVoiceRecognition = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("متصفحك لا يدعم التعرف الصوتي المباشر. يمكنك كتابة اسم الدرس في المربع وسنلخصه فوراً.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'ar-DZ';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setInputQuery(transcript);
        handleGenerate(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Anti-cheating verification
  const checkAntiCheating = (query: string): boolean => {
    const cheatingKeywords = [
      'أنا في الامتحان', 'حل لي الفرض الآن', 'أريد الغش', 'كيف اغش',
      'ورقة الاختبار الآن', 'امتحان فجائي ساعدني بسرعة', 'قاعة الامتحان'
    ];
    for (const kw of cheatingKeywords) {
      if (query.includes(kw)) {
        setCheatAlert('«مَنْ غَشَّنَا فَلَيْسَ مِنَّا» — منصة نجاحي dz وسيلة شريفة للفهم والتحضير المنزلي والمراجعة. لا نساعد أبداً في الغش أثناء الفروض والامتحانات الرسمية!');
        return true;
      }
    }
    setCheatAlert(null);
    return false;
  };

  const handleGenerate = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text) return;

    if (checkAntiCheating(text)) {
      return;
    }

    // Check if the query matches an existing ready lesson
    const directMatch = READY_LESSONS_CATALOG.find(l => 
      l.title.includes(text) || l.lessonName?.includes(text) || text.includes(l.lessonName || '')
    );
    if (directMatch) {
      setSummaryData(directMatch);
      onAddXP(50);
      return;
    }

    setIsGenerating(true);
    setCheatAlert(null);

    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: text,
          subject: 'المنهاج الجزائري الرسمي',
          level: currentGradeId || currentCycle
        })
      });

      const data = await res.json();
      if (data && data.title) {
        setSummaryData(data);
        onAddXP(75);
      }
    } catch (err) {
      console.error("Summary generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyFull = () => {
    if (!summaryData) return;
    const fullText = `${summaryData.title}
المادة: ${summaryData.subject}

مقدمة الدرس:
${summaryData.intro}

القاعدة الذهبية:
${summaryData.rule1}

عناصر التلخيص:
${summaryData.points.join('\n')}

عناصر الكراس للكتابة:
${(summaryData.notebookPoints || []).join('\n')}

فخاخ الامتحانات الوزارية:
${summaryData.examTrap || 'الانتباه للدقة المنهجية وسلم التنقيط.'}

تطبيقات وتمارين نموذجية:
${summaryData.exercises.map((e, idx) => `تمرين ${idx + 1}: ${e.q}\nالحل: ${e.a}`).join('\n\n')}

${personalNote ? `ملاحظة خاصة: ${personalNote}` : ''}`;

    navigator.clipboard?.writeText(fullText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleCopyNotebookOnly = () => {
    if (!summaryData?.notebookPoints) return;
    const nbText = `📝 عناصر كتابة درس: ${summaryData.title}\n\n${summaryData.notebookPoints.join('\n')}\n\n⚠️ فخ الامتحان: ${summaryData.examTrap || ''}`;
    navigator.clipboard?.writeText(nbText);
    setCopyNotebookSuccess(true);
    setTimeout(() => setCopyNotebookSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Academic Honesty Guard Banner */}
      <div className="no-print bg-purple-950 text-white rounded-2xl p-4 shadow-xs border border-purple-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-800 flex items-center justify-center text-amber-300 font-black">
            🛡️
          </div>
          <div>
            <div className="text-xs font-bold text-purple-200 uppercase tracking-wide">
              ميثاق النزاهة العلمية — نجاحي dz
            </div>
            <div className="text-sm font-black text-amber-100">
              «مَنْ غَشَّنَا فَلَيْسَ مِنَّا» — ملخصات الدروس جاهزة للطباعة الورقية A4 والكتابة في الكراس، ومخصصة للمراجعة المنزلية وبناء الفهم.
            </div>
          </div>
        </div>
        <div className="text-xs text-purple-200 bg-purple-900/80 border border-purple-700/50 px-3 py-1.5 rounded-lg font-bold">
          جهد شريف وعرق جبيني 🇩🇿
        </div>
      </div>

      {/* Cheating Warning Alert if triggered */}
      {cheatAlert && (
        <div className="no-print bg-red-50 border-2 border-red-500 rounded-2xl p-4 text-red-900 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-sm mb-1">تنبيه حازم ضد الغش</div>
            <div className="text-xs font-bold leading-relaxed">{cheatAlert}</div>
          </div>
        </div>
      )}

      {/* SECTION 1: Ready Lessons Library (مكتبة الدروس الجاهزة فوراً للطباعة والكتابة) */}
      <div className="no-print bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-900 text-white flex items-center justify-center text-xl shadow-xs">
              📚
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                دروس جاهزة فوراً للطباعة والكتابة
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                دروس نموذجية ملخصة وفق المنهاج الوزاري الجزائري، مهيأة للطباعة A4 المباشرة أو التدوين المنظم في كراسك
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-purple-100 text-purple-900 px-3 py-1 rounded-full border border-purple-200">
            {filteredCatalog.length} دروس جاهزة بنقرة واحدة
          </span>
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {CATALOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                selectedCategory === cat
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Ready Lesson Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCatalog.map((lesson) => {
            const isSelected = summaryData?.title === lesson.title;
            return (
              <div
                key={lesson.id}
                className={`p-4 rounded-2xl border transition text-right flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-900 bg-purple-50/50 shadow-xs ring-2 ring-purple-900/20'
                    : 'border-slate-200 hover:border-purple-300 bg-white hover:bg-slate-50/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-black bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md">
                      {lesson.subject}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-black text-purple-900 flex items-center gap-1">
                        <BookmarkCheck className="w-3.5 h-3.5" /> معروض الآن
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug mb-1">
                    {lesson.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {lesson.rule1}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSummaryData(lesson);
                      setSummaryMode('a4');
                      onAddXP(30);
                    }}
                    className="flex-1 bg-purple-900 hover:bg-purple-800 text-white text-[11px] font-bold py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 shadow-2xs"
                    title="عرض بنموذج A4 الرسمي للطباعة"
                  >
                    <Printer className="w-3 h-3" />
                    <span>طباعة A4</span>
                  </button>
                  <button
                    onClick={() => {
                      setSummaryData(lesson);
                      setSummaryMode('handwritten');
                      onAddXP(30);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-purple-100 text-slate-800 hover:text-purple-900 text-[11px] font-bold py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 border border-slate-200"
                    title="عرض دفتر الكراس وخط اليد"
                  >
                    <FileText className="w-3 h-3" />
                    <span>دفتر الكراس</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Custom Lesson Generator (لأي درس آخر بالصوت أو الصورة أو الكتابة) */}
      <div className="no-print bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-900 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
            ✨
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              تريد تلخيص أي درس آخر؟ اطلبه من الأستاذ فوراً
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              اكتب اسم الدرس، أو تحدث بالصوت 🎙️، أو صوّر صفحة الكراس 📸، وسيلخصه لك الأستاذ في نقاط مركزة جاهزة للطباعة أو الكتابة.
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 focus-within:border-purple-900 rounded-2xl p-2 transition">
          <button
            onClick={startVoiceRecognition}
            title="تحدث بالميكروفون للإجابة صوتياً"
            className={`p-3 rounded-xl transition flex items-center justify-center ${
              isListening
                ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/30'
                : 'bg-purple-100 hover:bg-purple-200 text-purple-900'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={onOpenScanner}
            title="تصوير صفحة الدرس بالكاميرا"
            className="p-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition flex items-center justify-center"
          >
            <Camera className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder={isListening ? "أستمع لصوتك الآن... قل اسم الدرس والمادة" : "مثال: درس الدوال اللوغاريتمية، درس التفاعلات الكيميائية، إعراب إذا وإذ..."}
            className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-slate-900 px-2 placeholder:text-slate-400"
          />

          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !inputQuery.trim()}
            className="bg-purple-900 hover:bg-purple-800 disabled:opacity-50 text-white text-xs sm:text-sm font-black px-4 sm:px-6 py-3 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            {isGenerating ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>جاري التلخيص...</span>
              </>
            ) : (
              <>
                <span>لخّص الدرس</span>
                <Send className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 3: The Active Summary Viewer (جاهز للطباعة أو للكتابة) */}
      {summaryData && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="no-print bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs font-bold text-purple-900">الملخص المعروض حالياً:</div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">{summaryData.title}</h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Mode Switch: A4 vs Handwritten Notebook */}
              <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200">
                <button
                  onClick={() => setSummaryMode('a4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                    summaryMode === 'a4' ? 'bg-purple-900 shadow-xs text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>جاهز للطباعة A4</span>
                </button>
                <button
                  onClick={() => setSummaryMode('handwritten')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                    summaryMode === 'handwritten' ? 'bg-purple-900 shadow-xs text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>جاهز للكتابة في الكراس</span>
                </button>
              </div>

              {/* Copy Notebook Points Button */}
              {summaryData.notebookPoints && (
                <button
                  onClick={handleCopyNotebookOnly}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 border border-purple-200"
                  title="نسخ رؤوس الأقلام لتنظيم كتابتها في كراسك"
                >
                  {copyNotebookSuccess ? <Check className="w-3.5 h-3.5 text-purple-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copyNotebookSuccess ? 'تم نسخ عناصر الكراس!' : 'نسخ عناصر الكراس'}</span>
                </button>
              )}

              {/* Add Personal Note Button */}
              <button
                onClick={() => setIsEditingNote(!isEditingNote)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 border border-slate-200"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-900" />
                <span>إضافة ملاحظة</span>
              </button>

              {/* Copy Full Document */}
              <button
                onClick={handleCopyFull}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 border border-slate-200"
              >
                {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copySuccess ? 'تم النسخ!' : 'نسخ كامل'}</span>
              </button>

              {/* Direct Print Button */}
              <button
                onClick={() => window.print()}
                className="bg-purple-900 hover:bg-purple-800 text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة A4 فوراً</span>
              </button>
            </div>
          </div>

          {/* Personal Note Editor */}
          {isEditingNote && (
            <div className="no-print bg-amber-50/70 border border-amber-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-900">ملاحظتك وتنبيهاتك الشخصية (ستظهر في ورقة A4 أو الدفتر المطبوع):</span>
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="text-xs font-bold text-amber-800 hover:underline"
                >
                  حفظ وإغلاق
                </button>
              </div>
              <textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="اكتب ملاحظتك الخاصة، مثل: تذكير بالتركيز على إشارة السالب، أو هذا السؤال تكرر في بكالوريا 2021..."
                rows={2}
                className="w-full bg-white border border-amber-300 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* MODE 1: Ready to Print A4 Official Document */}
          {summaryMode === 'a4' ? (
            <div className="printable-area print-content bg-white rounded-2xl p-6 sm:p-10 border border-slate-300 shadow-sm max-w-[850px] mx-auto text-right">
              
              {/* Algerian Ministry of Education Header */}
              <div className="border-b-2 border-slate-800 pb-4 mb-6">
                <div className="flex justify-between items-start text-xs font-bold text-slate-700 mb-2">
                  <div>
                    الجمهورية الجزائرية الديمقراطية الشعبية<br />
                    وزارة التربية الوطنية
                  </div>
                  <div className="text-center">
                    <span className="text-purple-900 font-black text-sm">منصة نجاحي dz للدراسة والتفوق</span>
                    <br />
                    وثيقة ملخص مادة: {summaryData.subject}
                  </div>
                  <div className="text-left">
                    الموسم الدراسي: 2024 / 2025<br />
                    جاهزة للطباعة والمراجعة
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 text-center mt-3">
                  {summaryData.title}
                </h1>
              </div>

              {/* Lesson Introduction */}
              <div className="bg-purple-50/60 border-r-4 border-purple-900 p-4 rounded-lg mb-6 text-sm text-slate-800 leading-relaxed font-medium">
                <span className="font-black text-purple-950 block mb-1">🎯 الهدف والمدخل المنهجي:</span>
                {summaryData.intro}
              </div>

              {/* Golden Rule */}
              <div className="mb-6">
                <h3 className="text-sm font-black text-purple-950 mb-2 flex items-center gap-1.5">
                  <span>⭐</span>
                  <span>القاعدة الذهبية للاستيعاب:</span>
                </h3>
                <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                  {summaryData.rule1}
                </div>
              </div>

              {/* Structured Summary Points */}
              <div className="mb-6">
                <h3 className="text-sm font-black text-slate-900 mb-2">
                  {summaryData.simplification || "أهم عناصر ومحاور الدرس الملخصة:"}
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-800 pr-4 list-disc">
                  {summaryData.points.map((pt, idx) => (
                    <li key={idx} className="leading-relaxed font-medium">{pt}</li>
                  ))}
                </ul>
              </div>

              {/* Dedicated Notebook Points to Write */}
              {summaryData.notebookPoints && summaryData.notebookPoints.length > 0 && (
                <div className="mb-6 bg-slate-50 border border-slate-300 rounded-xl p-4">
                  <h3 className="text-xs font-black text-purple-900 mb-2 flex items-center gap-1.5">
                    <span>📝</span>
                    <span>عناصر ملخصة لتكتبها في كراسك (رؤوس أقلام منظمة):</span>
                  </h3>
                  <div className="space-y-1.5 text-xs font-bold text-slate-800 pr-2">
                    {summaryData.notebookPoints.map((np, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-purple-900">•</span>
                        <span>{np}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Exam Trap Warning */}
              {summaryData.examTrap && (
                <div className="mb-6 bg-red-50 border-r-4 border-red-600 p-3.5 rounded-lg text-xs font-bold text-red-950">
                  <span className="font-black text-red-700 block mb-1">⚠️ فخ الامتحان والتصحيح الوزاري:</span>
                  {summaryData.examTrap}
                </div>
              )}

              {/* Exercises & Practice */}
              <div className="mb-6 border-t border-slate-200 pt-4">
                <h3 className="text-sm font-black text-slate-900 mb-3">
                  {summaryData.practice || "تطبيقات نموذجية بسلم التنقيط:"}
                </h3>
                <div className="space-y-3">
                  {summaryData.exercises.map((ex, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs sm:text-sm">
                      <div className="font-extrabold text-slate-900 mb-2">
                        تطبيق نموذجي {idx + 1}: {ex.q}
                      </div>
                      <div className="text-purple-950 font-bold bg-white p-3 rounded-lg border border-purple-200 leading-relaxed">
                        <span className="text-purple-900 font-black">الحل المنهجي وسلم التنقيط: </span>
                        {ex.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Student Note on Printable Page */}
              {personalNote && (
                <div className="mb-6 bg-amber-50/80 border border-amber-300 p-3.5 rounded-xl text-xs font-bold text-amber-950">
                  <span className="font-black text-amber-900">ملاحظتي وتنبيهاتي الخاصة: </span>
                  {personalNote}
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-purple-900">
                  🛡️ {summaryData.antiCheatNotice || "«مَنْ غَشَّنَا فَلَيْسَ مِنَّا» — هذا الملخص للمراجعة المنزلية فقط ويحرم الغش به."}
                </span>
                <span>
                  منصة نجاحي dz • النجاح بعرق الجبين
                </span>
              </div>

            </div>
          ) : (
            /* MODE 2: Ready to Write in Notebook (دفتر الكراس وخط اليد الجزائري) */
            <div className="printable-area print-content bg-[#fffdf5] rounded-2xl p-6 sm:p-10 border-2 border-amber-200 shadow-sm max-w-[850px] mx-auto text-right relative overflow-hidden">
              
              {/* Notebook Top Margin Line */}
              <div className="border-b-2 border-red-300 pb-3 mb-5 flex justify-between items-center text-xs font-bold text-slate-600">
                <span className="text-red-600 font-black">دفتر كراس التلميذ الجزائري 📓</span>
                <span className="text-base font-black text-purple-950">{summaryData.title}</span>
                <span className="text-slate-700">مادة {summaryData.subject}</span>
              </div>

              {/* Copy Notebook Action Header */}
              <div className="no-print mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900">
                  💡 اكتب هذه النقاط بنفس الترتيب في كراسك لتثبيت الحفظ:
                </span>
                <button
                  onClick={handleCopyNotebookOnly}
                  className="bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs"
                >
                  {copyNotebookSuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copyNotebookSuccess ? 'تم النسخ!' : 'نسخ العناصر للكتابة'}</span>
                </button>
              </div>

              {/* Ruled lines and notebook content */}
              <div className="space-y-4 text-sm sm:text-base leading-loose text-slate-900">
                
                {/* 1. Introduction in green */}
                <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-300">
                  <span className="font-black text-purple-800 block mb-1">🟢 1. المدخل والتعريف الأساسي:</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">{summaryData.intro}</p>
                </div>

                {/* 2. Golden Rule in red box */}
                <div className="bg-red-50/70 p-3.5 rounded-xl border border-red-300 font-bold">
                  <span className="font-black text-red-700 block mb-1">🔴 2. القاعدة أو القانون الذهبي (احفظه جيداً):</span>
                  <p className="text-xs sm:text-sm text-slate-900">{summaryData.rule1}</p>
                </div>

                {/* 3. Notebook Points to copy in blue */}
                <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-300 space-y-2">
                  <span className="font-black text-blue-900 block mb-1">🔵 3. عناصر الدرس لتنظيمها في الصفحة:</span>
                  {(summaryData.notebookPoints || summaryData.points).map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm font-bold text-slate-800">
                      <span className="text-blue-700 font-black">✦</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                {/* 4. Exam Trap */}
                {summaryData.examTrap && (
                  <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-300 text-xs sm:text-sm font-bold text-slate-900">
                    <span className="font-black text-amber-800 block mb-1">⚠️ 4. تنبيه وفخ وزاري (لا تقع فيه):</span>
                    {summaryData.examTrap}
                  </div>
                )}

                {/* 5. Practice */}
                <div className="space-y-3 pt-2">
                  <span className="font-black text-purple-900 block text-xs sm:text-sm">🟣 5. تمرين تطبيقي للتدريب بالكراس:</span>
                  {summaryData.exercises.map((ex, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-300">
                      <div className="font-black text-slate-900 text-xs sm:text-sm mb-1">المسألة: {ex.q}</div>
                      <div className="text-xs sm:text-sm font-bold text-purple-800 bg-purple-50/50 p-2.5 rounded-lg border border-purple-200">
                        طريقة الحل النموذجي: {ex.a}
                      </div>
                    </div>
                  ))}
                </div>

                {personalNote && (
                  <div className="bg-amber-100/70 p-3 rounded-xl text-xs font-bold text-amber-950 border border-amber-300">
                    ملاحظتي الشخصية: {personalNote}
                  </div>
                )}
              </div>

              {/* Notebook Bottom Signature */}
              <div className="mt-8 pt-3 border-t border-slate-300 flex justify-between items-center text-[11px] text-slate-500">
                <span>كراس المراجعة والتحضير • منصة نجاحي dz</span>
                <span className="font-bold text-purple-900">شرف العلم في الأمانة</span>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
