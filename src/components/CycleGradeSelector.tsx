import React from 'react';
import { GRADES, SECONDARY_STREAMS } from '../data/curriculum';
import { UserProfile } from '../types';
import { Check } from 'lucide-react';

interface CycleGradeSelectorProps {
  user: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  showToast?: (msg: string) => void;
}

export const CycleGradeSelector: React.FC<CycleGradeSelectorProps> = ({
  user,
  onSaveProfile,
  showToast,
}) => {
  // 3 Official Algerian Educational Cycles only (as requested: الابتدائي، المتوسط، الثانوي)
  const CYCLES = [
    {
      id: 'primary' as const,
      name: 'الطور الابتدائي',
      subtitle: 'من 1 ابتدائي إلى 5 ابتدائي',
      icon: '🎒',
      badge: 'التعليم القاعدي',
      defaultGrade: '5AP',
      defaultStream: 'الطور الابتدائي',
    },
    {
      id: 'middle' as const,
      name: 'الطور المتوسط',
      subtitle: 'من 1 متوسط إلى 4 متوسط (BEM)',
      icon: '🔥',
      badge: 'شهادة BEM',
      defaultGrade: '4AM',
      defaultStream: 'الطور المتوسط',
    },
    {
      id: 'secondary' as const,
      name: 'الطور الثانوي',
      subtitle: '1 ثانوي، 2 ثانوي، 3 ثانوي (BAC)',
      icon: '🎓',
      badge: 'شهادة البكالوريا',
      defaultGrade: '3AS',
      defaultStream: 'علوم تجريبية',
    },
  ];

  const handleSelectCycle = (c: typeof CYCLES[0]) => {
    onSaveProfile({
      ...user,
      cycle: c.id,
      gradeId: c.defaultGrade,
      stream: c.defaultStream,
    });
    if (showToast) {
      showToast(`تم اختيار ${c.name}`);
    }
  };

  const handleSelectGrade = (gradeId: string, gradeName: string) => {
    onSaveProfile({
      ...user,
      gradeId,
    });
    if (showToast) {
      showToast(`تم اختيار: ${gradeName}`);
    }
  };

  const handleSelectStream = (streamName: string) => {
    onSaveProfile({
      ...user,
      stream: streamName,
    });
    if (showToast) {
      showToast(`تم اختيار الشعبة: ${streamName}`);
    }
  };

  // Active cycle data
  const currentCycleId = user.cycle === 'university' ? 'secondary' : user.cycle;
  const currentGrades = GRADES[currentCycleId] || GRADES.middle;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-right space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
          <h2 className="text-base font-bold text-slate-900">
            اختر الطور والسنة الدراسية:
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          يتكيف المنهج والملخصات والأساتذة تلقائياً
        </span>
      </div>

      {/* 3 Cycle Cards on Top (الابتدائي، المتوسط، الثانوي) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {CYCLES.map((c) => {
          const isSelected = currentCycleId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelectCycle(c)}
              className={`p-4 rounded-xl border text-right transition flex items-center justify-between ${
                isSelected
                  ? 'border-purple-600 bg-purple-50/80 text-purple-950 font-bold ring-2 ring-purple-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{c.name}</span>
                    {isSelected && (
                      <span className="text-purple-700 bg-purple-100 text-[11px] px-1.5 py-0.2 rounded font-black">
                        محدد ✓
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{c.subtitle}</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {c.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Years of the Selected Cycle - Displayed Directly Underneath */}
      <div className="pt-3 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center justify-between">
          <span>
            سنوات {currentCycleId === 'primary' ? 'الطور الابتدائي' : currentCycleId === 'middle' ? 'الطور المتوسط' : 'الطور الثانوي'}:
          </span>
          <span className="text-purple-700 text-xs font-bold">
            السنة المحددة حالياً: {currentGrades.find(g => g.id === user.gradeId)?.name || user.gradeId}
          </span>
        </div>

        <div className={`grid gap-2 ${
          currentCycleId === 'primary'
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            : currentCycleId === 'middle'
            ? 'grid-cols-2 sm:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-3'
        }`}>
          {currentGrades.map((g) => {
            const isGradeActive = user.gradeId === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleSelectGrade(g.id, g.name)}
                className={`py-2.5 px-3 rounded-xl border text-center transition text-xs font-bold ${
                  isGradeActive
                    ? 'border-purple-600 bg-purple-700 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div className="truncate">{g.name}</div>
              </button>
            );
          })}
        </div>

        {/* Secondary Streams if Secondary is Selected */}
        {currentCycleId === 'secondary' && (
          <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
            <div className="text-xs font-bold text-slate-700 mb-2">
              اختر الشعبة (الطور الثانوي):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SECONDARY_STREAMS.map((st) => {
                const isStreamActive = user.stream === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectStream(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      isStreamActive
                        ? 'border-purple-600 bg-purple-100 text-purple-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
