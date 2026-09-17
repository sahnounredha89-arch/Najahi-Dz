import React, { useState } from 'react';
import { TOP_ALGERIAN_TEACHERS, TeacherVideo } from '../data/teachers';

interface TeachersVideosProps {
  currentCycle: string;
  selectedSubject?: string;
}

export const TeachersVideos: React.FC<TeachersVideosProps> = ({ currentCycle, selectedSubject }) => {
  const [activeCycle, setActiveCycle] = useState<string>('all');
  const [activeSubject, setActiveSubject] = useState<string>(selectedSubject || 'all');
  const [activeVideo, setActiveVideo] = useState<TeacherVideo | null>(null);

  // Synchronize when parent passes a selectedSubject
  React.useEffect(() => {
    if (selectedSubject && selectedSubject !== 'الكل') {
      setActiveSubject(selectedSubject);
    }
  }, [selectedSubject]);

  const filteredTeachers = TOP_ALGERIAN_TEACHERS.filter((tv) => {
    const cycleMatch =
      activeCycle === 'all' || tv.cycle === activeCycle || tv.cycle === 'all' || tv.cycle === currentCycle;
    const subjectMatch =
      activeSubject === 'all' ||
      tv.subject.includes(activeSubject) ||
      activeSubject.includes(tv.subject);
    return cycleMatch && subjectMatch;
  });

  return (
    <div className="space-y-6 text-right">
      {/* Header Banner - Clean Light Eye-Comfort Design */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full text-xs font-black text-purple-800 mb-2">
              <span>🎬 شروحات كبار الأساتذة</span>
              <span>•</span>
              <span>شرح مباشر ومبسط</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              فيديوهات وشروحات الأساتذة
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              اختر الدرس واضغط على المشاهدة للدخول فوراً في الشرح دون تشتيت
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200">
              {filteredTeachers.length} فيديو متوفر
            </span>
          </div>
        </div>

        {/* Filter Controls - Mobile Scrollable */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Subject Filter */}
          <div className="w-full sm:w-auto overflow-x-auto scrollbar-none py-1">
            <div className="flex items-center gap-1.5 flex-nowrap sm:flex-wrap">
              <span className="text-xs text-slate-500 font-bold ml-1 shrink-0">المادة:</span>
              {['all', 'الرياضيات', 'العلوم الفيزيائية', 'علوم الطبيعة', 'التاريخ والجغرافيا', 'اللغة العربية'].map(
                (subj) => (
                  <button
                    key={subj}
                    onClick={() => setActiveSubject(subj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border shrink-0 min-h-[38px] flex items-center ${
                      activeSubject === subj
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {subj === 'all' ? 'جميع المواد' : subj}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Cycle Filter */}
          <div className="w-full sm:w-auto overflow-x-auto scrollbar-none py-1">
            <div className="flex items-center gap-1.5 flex-nowrap sm:flex-wrap">
              <span className="text-xs text-slate-500 font-bold ml-1 shrink-0">الطور:</span>
              <button
                onClick={() => setActiveCycle('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 min-h-[38px] flex items-center ${
                  activeCycle === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setActiveCycle('secondary')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 min-h-[38px] flex items-center ${
                  activeCycle === 'secondary'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ثانوي
              </button>
              <button
                onClick={() => setActiveCycle('middle')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 min-h-[38px] flex items-center ${
                  activeCycle === 'middle' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                متوسط
              </button>
              <button
                onClick={() => setActiveCycle('primary')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 min-h-[38px] flex items-center ${
                  activeCycle === 'primary' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ابتدائي
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid - Compact, Concise 3D-feeling cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Header: Teacher Name & Subject */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                    👨‍🏫
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{item.teacherName}</h3>
                    <span className="text-[11px] text-purple-700 font-bold">{item.subject}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  ⏱️ {item.duration}
                </span>
              </div>

              {/* Short Title */}
              <h4 className="text-sm font-bold text-slate-800 mb-3 leading-snug">
                {item.title}
              </h4>
            </div>

            {/* Direct Play Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setActiveVideo(item)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <span>▶️</span>
                <span>مشاهدة الدرس الآن</span>
              </button>
              <a
                href={item.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2.5 rounded-xl transition"
                title="فتح في يوتيوب"
              >
                يوتيوب ↗
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm">{activeVideo.teacherName}</span>
                <span className="text-xs text-slate-400">({activeVideo.subject})</span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Video Frame */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.embedId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 text-right flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">{activeVideo.title}</h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
