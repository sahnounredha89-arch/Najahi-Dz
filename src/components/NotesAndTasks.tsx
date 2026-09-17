import React, { useState, useEffect } from 'react';
import { DailyTask } from '../types';
import { STRESS_RELIEF_RIDDLES, StressReliefRiddle } from '../data/riddles';

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  content: string;
  date: string;
}

const NOTES_STORAGE_KEY = 'najahy_student_notes_v1';

interface NotesAndTasksProps {
  tasks: DailyTask[];
  completedTasks: string[];
  onCompleteTask: (task: DailyTask) => void;
  onAskTutor: (question: string) => void;
  xp: number;
}

export const NotesAndTasks: React.FC<NotesAndTasksProps> = ({
  tasks,
  completedTasks,
  onCompleteTask,
  onAskTutor,
  xp,
}) => {
  // Notes State
  const [notes, setNotes] = useState<StudyNote[]>(() => {
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load notes', e);
    }
    return [
      {
        id: 'n1',
        title: 'قاعدة المتتاليات العددية',
        subject: 'الرياضيات',
        content: 'تذكر دائماً أن مجموع حدود متتالية هندسية: S = الحد الأول × (1 - q^n) / (1 - q). لا تنسَ حساب عدد الحدود n بدقة!',
        date: new Date().toLocaleDateString('ar-DZ'),
      },
      {
        id: 'n2',
        title: 'منهجية تحليل الوثيقة في العلوم',
        subject: 'علوم الطبيعة والحياة',
        content: 'في التحليل: 1. تقديم الوثيقة. 2. الدلالة بالأرقام. 3. استنتاج مباشر وصريح دون تطرق للتفسير.',
        date: new Date().toLocaleDateString('ar-DZ'),
      },
    ];
  });

  // New Note Form
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteSubject, setNewNoteSubject] = useState('الرياضيات');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // New Custom Task Form
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [extraTasks, setExtraTasks] = useState<DailyTask[]>([]);

  // Riddle State (لعبة تخفيف الضغط والضحك)
  const [riddleIndex, setRiddleIndex] = useState(0);
  const [riddleSelectedOption, setRiddleSelectedOption] = useState<number | null>(null);
  const [riddleShowResult, setRiddleShowResult] = useState(false);

  const currentRiddle = STRESS_RELIEF_RIDDLES[riddleIndex % STRESS_RELIEF_RIDDLES.length];

  // Save notes to localStorage
  const handleSaveNotes = (updatedNotes: StudyNote[]) => {
    setNotes(updatedNotes);
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
    } catch (e) {
      console.warn('Could not save notes', e);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote: StudyNote = {
      id: Date.now().toString(),
      title: newNoteTitle.trim(),
      subject: newNoteSubject,
      content: newNoteContent.trim(),
      date: new Date().toLocaleDateString('ar-DZ'),
    };

    const updated = [newNote, ...notes];
    handleSaveNotes(updated);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    handleSaveNotes(updated);
  };

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskTitle.trim()) return;
    const newTask: DailyTask = {
      id: `custom_${Date.now()}`,
      title: customTaskTitle.trim(),
      xp: 50,
      rewardType: 'xp',
      rewardDetail: '+50 XP',
    };
    setExtraTasks(prev => [newTask, ...prev]);
    setCustomTaskTitle('');
  };

  const allTasks = [...extraTasks, ...tasks];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-teal-800 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <span>📝 مفكرة التميز ومتابعة الإنجاز</span>
            <span>•</span>
            <span className="text-amber-300 font-extrabold">{xp} XP مكتسبة</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            المهام اليومية، الملاحظات الشخصية، واستراحة تخفيف الضغط
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 max-w-2xl mt-1 leading-relaxed">
            نظّم وقتك بخطوات بسيطة؛ دوّن ملاحظاتك الهامة، أنجز مهامك لحصد نقاط XP، ولا تنسَ أخذ استراحة خفيفة ترفه عنك وتجدد طاقتك.
          </p>
        </div>

        <button
          onClick={() => setIsAddingNote(!isAddingNote)}
          className="bg-white hover:bg-purple-50 text-purple-900 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <span>✍️</span>
          <span>{isAddingNote ? 'إلغاء' : 'إضافة ملاحظة جديدة'}</span>
        </button>
      </div>

      {/* Grid: Tasks Column + Notes Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Middle Column (Tasks & Stress-Relief Riddles) - 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Daily Tasks Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  قائمة مهام المذاكرة اليومية (+50 XP لكل مهمة)
                </h3>
                <p className="text-xs text-slate-500">
                  أنجز خطوات صغيرة منتظمة؛ كل إنجاز يقربك خطوة من معدلك المستهدف!
                </p>
              </div>
              <span className="text-xs font-extrabold text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                أنجزت {completedTasks.length} من {allTasks.length}
              </span>
            </div>

            {/* Quick Task Add */}
            <form onSubmit={handleAddCustomTask} className="mb-4 flex items-center gap-2">
              <input
                type="text"
                value={customTaskTitle}
                onChange={(e) => setCustomTaskTitle(e.target.value)}
                placeholder="أضف مهمتك الخاصة (مثال: حفظ 5 مصطلحات تاريخ، أو حل تمرين فيزياء)..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
              >
                + إضافة مهمة
              </button>
            </form>

            {/* Tasks Items */}
            <div className="space-y-2.5">
              {allTasks.map((task) => {
                const isDone = completedTasks.includes(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => !isDone && onCompleteTask(task)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isDone
                        ? 'bg-purple-50/60 border-purple-300 text-slate-400'
                        : 'bg-white border-slate-200 hover:border-purple-400 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition ${
                          isDone ? 'bg-purple-600 text-white' : 'border-2 border-slate-300 bg-slate-50'
                        }`}
                      >
                        {isDone ? '✓' : ''}
                      </div>
                      <span className={`text-xs font-bold leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </span>
                    </div>

                    <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 shrink-0">
                      +50 XP 🎁
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STRESS-RELIEF RIDDLES CARD (أسئلة طريفة وفوازير لتخفيف الضغط النفسي كما طلب المستخدم) */}
          <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-purple-50/50 rounded-2xl p-5 sm:p-6 border border-amber-200/80 shadow-xs text-right">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                  {currentRiddle.smileEmoji}
                </span>
                <div>
                  <h4 className="text-sm font-black text-amber-950">
                    استراحة فكاهية وذكاء خفيف (لتخفيف الضغط والمرح 🎭)
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    ارأف بنفسك قليلاً! أجب عن هذا اللغز الطريف وابتسم قبل مواصلة المذاكرة
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setRiddleIndex(prev => prev + 1);
                  setRiddleSelectedOption(null);
                  setRiddleShowResult(false);
                }}
                className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs"
              >
                <span>🔄</span>
                <span>لغز طريف آخر</span>
              </button>
            </div>

            {/* Riddle Question */}
            <div className="bg-white p-4 rounded-xl border border-amber-100/90 shadow-2xs my-3">
              <p className="text-sm font-black text-slate-900 leading-relaxed mb-3">
                {currentRiddle.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentRiddle.options.map((opt, idx) => {
                  const isSelected = riddleSelectedOption === idx;
                  const isCorrect = idx === currentRiddle.correctIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setRiddleSelectedOption(idx);
                        setRiddleShowResult(true);
                      }}
                      className={`p-3 rounded-xl text-right text-xs font-bold transition border ${
                        riddleShowResult
                          ? isCorrect
                            ? 'bg-purple-100 border-purple-500 text-purple-950 font-black'
                            : isSelected
                            ? 'bg-red-50 border-red-300 text-red-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                          : isSelected
                          ? 'bg-amber-100 border-amber-500 text-amber-950'
                          : 'bg-slate-50 hover:bg-amber-50/70 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="inline-block w-5 text-slate-400 font-bold">{idx + 1}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Reveal explanation */}
              {riddleShowResult && (
                <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs font-bold text-amber-950 leading-relaxed animate-in fade-in">
                  <span>✨ {currentRiddle.funExplanation}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Student Personal Notes) - 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Add Note Form Modal/Collapsible */}
          {isAddingNote && (
            <div className="bg-white rounded-2xl p-5 border-2 border-purple-500 shadow-sm animate-in fade-in">
              <h4 className="text-sm font-black text-slate-900 mb-3">تدوين ملاحظة أو قاعدة جديدة</h4>
              <form onSubmit={handleAddNote} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">المادة</label>
                  <select
                    value={newNoteSubject}
                    onChange={(e) => setNewNoteSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
                  >
                    <option value="الرياضيات">الرياضيات</option>
                    <option value="العلوم الفيزيائية">العلوم الفيزيائية</option>
                    <option value="علوم الطبيعة والحياة">علوم الطبيعة والحياة</option>
                    <option value="اللغة العربية">اللغة العربية</option>
                    <option value="التاريخ والجغرافيا">التاريخ والجغرافيا</option>
                    <option value="الفلسفة">الفلسفة</option>
                    <option value="العلوم الإسلامية">العلوم الإسلامية</option>
                    <option value="اللغات الأجنبية">اللغات الأجنبية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">عنوان الملاحظة</label>
                  <input
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="مثال: فكرة تمرين الدوال، أو تنبيه إعراب..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">محتوى الملاحظة</label>
                  <textarea
                    rows={4}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="اكتب خلاصة القاعدة أو التنبيه هنا لتتذكره دوماً..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-600 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black py-2 rounded-xl transition"
                  >
                    حفظ الملاحظة
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notes List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>📓</span>
                <span>كراس ملاحظاتي المحفوظة ({notes.length})</span>
              </h3>
              <button
                onClick={() => setIsAddingNote(true)}
                className="text-xs text-purple-700 font-extrabold hover:underline"
              >
                + تدوين
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <div className="text-3xl mb-1">📝</div>
                <div className="text-xs font-bold">لا توجد ملاحظات مسجلة بعد</div>
                <div className="text-[11px] mt-1">سجل أي فكرة أو قانون لتجده جاهزاً قبل الامتحان</div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/60 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-extrabold text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded">
                          {note.subject}
                        </span>
                        <span className="text-[10px] text-slate-400">{note.date}</span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 mb-1">{note.title}</h4>
                      <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed mb-3">
                        {note.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-[11px]">
                      {/* Button to ask smart tutor about this note */}
                      <button
                        onClick={() => onAskTutor(`أستاذ، لدي استفسار حول ملاحظتي في ${note.subject}: "${note.title}". ${note.content} هل يمكنك توضيحها أكثر وإعطائي مثالاً؟`)}
                        className="text-purple-700 hover:text-purple-800 font-extrabold flex items-center gap-1"
                      >
                        <span>🤖</span>
                        <span>اسأل الأستاذ ذكي حولها</span>
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-500 hover:text-red-700 font-bold"
                        title="حذف الملاحظة"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
