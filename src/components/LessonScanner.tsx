import React, { useState } from 'react';
import { Camera, Upload, ScanLine, Sparkles, CheckCircle2, AlertCircle, BookOpen, HelpCircle, Save, Loader2, ArrowRight } from 'lucide-react';
import { Subject, SavedLesson, QuizQuestion, FlashcardItem } from '../types';

interface LessonScannerProps {
  onAddXP: (amount: number) => void;
  onSaveLesson: (lesson: SavedLesson) => void;
  onSwitchToQuiz: (quiz: QuizQuestion[]) => void;
  onSwitchToFlashcards: (flashcards: FlashcardItem[]) => void;
}

export const LessonScanner: React.FC<LessonScannerProps> = ({
  onAddXP,
  onSaveLesson,
  onSwitchToQuiz,
  onSwitchToFlashcards
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [subject, setSubject] = useState<Subject>('الرياضيات');
  const [lessonTitle, setLessonTitle] = useState<string>('درس جديد');
  
  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string;
    flashcards: FlashcardItem[];
    quiz: QuizQuestion[];
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setAnalysisResult(null);
    setExtractedText('');
    setSaveSuccess(false);

    setOcrStatus("جاري قراءة نص الدرس من الصورة (Tesseract OCR)... يرجى الانتظار ⏳");
    setIsProcessing(true);

    try {
      // Use Tesseract.js loaded from index.html CDN script
      const Tesseract = (window as any).Tesseract;
      if (!Tesseract) {
        throw new Error("لم يتم تحميل مكتبة Tesseract بشكل صحيح.");
      }

      const result = await Tesseract.recognize(file, 'ara+eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setOcrStatus(`جاري استخراج النص: ${Math.round(m.progress * 100)}% ⏳`);
          }
        }
      });

      const text = result.data.text;
      if (text.trim().length < 5) {
        setOcrStatus("⚠️ لم يتم العثور على نص واضح في الصورة. يرجى اختيار صورة أوضح.");
      } else {
        setExtractedText(text);
        setOcrStatus("تمت قراءة الدرس بنجاح! ✅ يمكنك الآن تحليله بالذكاء الاصطناعي.");
      }
    } catch (err: any) {
      console.error(err);
      setOcrStatus("❌ حدث خطأ أثناء قراءة الصورة. تأكد أن الصورة واضحة.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeLesson = async () => {
    if (!extractedText.trim()) return;

    setIsAnalyzing(true);
    setOcrStatus("🤖 الأستاذ الذكي يقوم بتحليل الدرس، تلخيصه، وإعداد الاختبار والبطاقات...");

    try {
      const res = await fetch('/api/analyze-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonText: extractedText, subject })
      });

      const data = await res.json();
      setAnalysisResult(data);
      setOcrStatus("🎉 تم تحليل الدرس وتجهيز مواد المراجعة بنجاح!");
      onAddXP(30);
    } catch (err) {
      console.error(err);
      setOcrStatus("❌ فشل الاتصال بالذكاء الاصطناعي للتحليل.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveCurrentLesson = () => {
    if (!analysisResult) return;

    const newLesson: SavedLesson = {
      id: Date.now().toString(),
      title: lessonTitle || 'درس مصور',
      subject,
      summary: analysisResult.summary,
      flashcards: analysisResult.flashcards,
      quiz: analysisResult.quiz,
      date: new Date().toLocaleDateString('ar-DZ'),
      imageUrl: selectedImage || undefined
    };

    onSaveLesson(newLesson);
    setSaveSuccess(true);
    onAddXP(20);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-200/80 p-6 sm:p-8">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
            <ScanLine className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">تصوير الدرس والتلخيص بالذكاء الاصطناعي</h2>
            <p className="text-sm text-slate-500">قم بتصوير صفحة الكتاب أو الكراس وسيقوم النظام بقراءتها وتحفيظك إياها</p>
          </div>
        </div>

        {/* Form controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">عنوان الدرس</label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              placeholder="مثال: الدوال الاساسية، الحرب العالمية..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">المادة الدراسية</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            >
              <option value="الرياضيات">الرياضيات</option>
              <option value="الفيزياء والعلوم الفيزيائية">الفيزياء والعلوم الفيزيائية</option>
              <option value="العلوم الطبيعية">العلوم الطبيعية</option>
              <option value="اللغة العربية">اللغة العربية</option>
              <option value="التاريخ والجغرافيا">التاريخ والجغرافيا</option>
              <option value="اللغة الفرنسية">اللغة الفرنسية</option>
              <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
              <option value="الفلسفة">الفلسفة</option>
              <option value="عام">عام</option>
            </select>
          </div>
        </div>

        {/* Upload Box */}
        <div className="border-2 border-dashed border-slate-300 rounded-3xl p-6 sm:p-10 text-center bg-slate-50/50 hover:bg-slate-50 transition-all mb-6">
          <input
            type="file"
            id="lessonImageInput"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          {selectedImage ? (
            <div className="flex flex-col items-center">
              <img
                src={selectedImage}
                alt="Lesson Preview"
                className="max-h-64 rounded-2xl shadow-md border border-slate-200 mb-4 object-contain"
              />
              <button
                onClick={() => document.getElementById('lessonImageInput')?.click()}
                className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all"
              >
                📷 اختيار صورة أخرى
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center cursor-pointer" onClick={() => document.getElementById('lessonImageInput')?.click()}>
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 shadow-sm">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">اضغط هنا لتصوير الدرس أو رفع صورة</h3>
              <p className="text-xs text-slate-500 max-w-md">يدعم صيغ JPG, PNG. سيتم استخراج النصوص العربية تلقائياً وتحليلها.</p>
            </div>
          )}
        </div>

        {/* Status / OCR Progress */}
        {ocrStatus && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl p-4 mb-6 text-sm flex items-center gap-3">
            {isProcessing || isAnalyzing ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
            )}
            <span className="font-medium">{ocrStatus}</span>
          </div>
        )}

        {/* Extracted Text Preview & Analyze Button */}
        {extractedText && !analysisResult && (
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">النص المستخرج من الدرس (قابل للتعديل):</label>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <button
              onClick={handleAnalyzeLesson}
              disabled={isAnalyzing}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/25 text-base"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تحليل الدرس وإعداد الخلاصة والأسئلة...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>تلخيص الدرس وإنشاء بطاقات الحفظ والاختبار</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Analysis Result Display */}
        {analysisResult && (
          <div className="space-y-6 mt-8 pt-6 border-t border-slate-200">
            <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6">
              <h3 className="font-black text-purple-900 text-lg mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                ملخص الأستاذ الذكي للدرس
              </h3>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base font-medium">
                {analysisResult.summary}
              </div>
            </div>

            {/* Flashcards preview */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                بطاقات الحفظ السريعة ({analysisResult.flashcards.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {analysisResult.flashcards.map((fc, i) => (
                  <div key={i} className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-xs sm:text-sm">
                    <p className="font-bold text-amber-900 mb-1">س: {fc.question}</p>
                    <p className="text-amber-800/80">ج: {fc.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSwitchToQuiz(analysisResult.quiz)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-teal-600/20"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>ابدأ اختبار هذا الدرس (Quiz)</span>
                </button>

                <button
                  onClick={() => onSwitchToFlashcards(analysisResult.flashcards)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-amber-600/20"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>مراجعة البطاقات</span>
                </button>
              </div>

              <button
                onClick={handleSaveCurrentLesson}
                disabled={saveSuccess}
                className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
                  saveSuccess
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{saveSuccess ? 'تم الحفظ في دروسك ✅' : 'حفظ الدرس'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
