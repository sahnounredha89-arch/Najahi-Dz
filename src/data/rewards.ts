export interface AvatarOption {
  id: string;
  name: string;
  avatarChar: string;
  requiredXp: number;
  description: string;
}

export const AVATARS_CATALOG: AvatarOption[] = [
  { id: 'student_boy', name: 'الطالب المجتهد', avatarChar: '👨‍🎓', requiredXp: 0, description: 'الأفاتار الأساسي لكل طالب طموح' },
  { id: 'student_girl', name: 'الطالبة المتميزة', avatarChar: '👩‍🎓', requiredXp: 0, description: 'أفاتار التميز والذكاء' },
  { id: 'scientist', name: 'العالِم المكتشف', avatarChar: '🔬', requiredXp: 300, description: 'مخصص لعشاق الفيزياء والعلوم' },
  { id: 'mathematician', name: 'عبقري الرياضيات', avatarChar: '📐', requiredXp: 500, description: 'لمن يحل أصعب المسائل ببراعة' },
  { id: 'astronaut', name: 'رائد الفضاء', avatarChar: '🚀', requiredXp: 800, description: 'طموحك يتجاوز عنان السماء' },
  { id: 'doctor', name: 'طبيب المستقبل', avatarChar: '🩺', requiredXp: 1200, description: 'شغف الطب وإنقاذ الأرواح' },
  { id: 'coder', name: 'مهندس المستقبل', avatarChar: '💻', requiredXp: 1600, description: 'عقل منطقي وبناء للمستقبل' },
  { id: 'writer', name: 'الأديب الفيلسوف', avatarChar: '📜', requiredXp: 2000, description: 'فصاحة اللسان وعمق الفكر' },
  { id: 'falcon', name: 'الصقر الجزائري', avatarChar: '🦅', requiredXp: 2500, description: 'رؤية حادة وثبات في القمة' },
  { id: 'golden_crown', name: 'المتوّج بالامتياز', avatarChar: '👑', requiredXp: 3000, description: 'رتبة العباقرة الأوائل في الجزائر' },
];

export interface RewardResult {
  type: 'xp' | 'avatar' | 'freeze';
  title: string;
  description: string;
  value: any;
  icon: string;
}

export function drawRandomReward(unlockedAvatars: string[]): RewardResult {
  // Check if there are locked avatars to gift
  const lockedAvatars = AVATARS_CATALOG.filter(a => !unlockedAvatars.includes(a.avatarChar));
  
  const rand = Math.random();
  if (rand < 0.35 && lockedAvatars.length > 0) {
    // Reward a new rare profile avatar!
    const chosen = lockedAvatars[Math.floor(Math.random() * lockedAvatars.length)];
    return {
      type: 'avatar',
      title: 'صورة ملف شخصي جديدة!',
      description: `مبروك! لقد فتحت أفاتار [${chosen.name}] لاستخدامه في ملفك الشخصي!`,
      value: chosen.avatarChar,
      icon: chosen.avatarChar,
    };
  } else if (rand < 0.65) {
    // Reward a Streak Freeze card
    return {
      type: 'freeze',
      title: 'بطاقة تجميد السلسلة 🧊',
      description: 'حصلت على بطاقة تجميد لحماية سلسلة أيام مواظبتك في حال غبت يوماً عن الدراسة!',
      value: 1,
      icon: '🧊',
    };
  } else {
    // Reward bonus XP
    return {
      type: 'xp',
      title: 'مكافأة 50 XP إضافية!',
      description: 'أحسنت صنعاً! أضيفت 50 نقطة خبرة جديدة إلى رصيدك الدراسي.',
      value: 50,
      icon: '⚡',
    };
  }
}

export function playRewardSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.3);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
    });
  } catch (e) {
    // AudioContext may be restricted or unsupported
  }
}
