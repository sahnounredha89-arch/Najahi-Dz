import { DailyTask } from '../types';

export const DAILY_STUDY_TASKS: DailyTask[] = [
  // 1. مهام الحفظ العميق (150 XP - صعبة ومهمة جداً)
  {
    id: 'dt-mem1',
    title: 'حفظ واستظهار درس كامل عن ظهر قلب (خرائط ذهنية وتسميع ذاتي)',
    xp: 150,
    category: 'memorization',
    difficulty: 'hard',
    rewardType: 'chest',
    rewardDetail: 'صندوق المكافآت الكبرى + 150 XP'
  },
  {
    id: 'dt-mem2',
    title: 'حفظ وتسميع 10 مصطلحات وتواريخ مفصلية في التاريخ والجغرافيا',
    xp: 150,
    category: 'memorization',
    difficulty: 'hard',
    rewardType: 'freeze',
    rewardDetail: 'فرصة كسب بطاقة تجميد السلسلة'
  },
  {
    id: 'dt-mem3',
    title: 'استيعاب وحفظ القوانين الرياضية والفيزيائية للوحدة كاملاً دون نسيان',
    xp: 150,
    category: 'memorization',
    difficulty: 'hard',
    rewardType: 'chest',
    rewardDetail: 'صندوق مكافأة كايزن'
  },

  // 2. مهام حل المسائل والتمارين النموذجية (100 XP - تدريب تطبيقي مكثف)
  {
    id: 'dt-prob1',
    title: 'حل مسألة شاملة أو تمرين نموذجي وزاري من بنك DZexams بالخطوات',
    xp: 100,
    category: 'practice',
    difficulty: 'hard',
    rewardType: 'xp',
    rewardDetail: '100 XP ترقية المستوى'
  },
  {
    id: 'dt-prob2',
    title: 'إجراء جلسة تركيز كاملة (بومودورو 25 دقيقة) مخصصة لحل المسائل',
    xp: 100,
    category: 'practice',
    difficulty: 'medium',
    rewardType: 'freeze',
    rewardDetail: 'رصيد حماية السلسلة'
  },

  // 3. مهام القراءة والاستيعاب والمنهجية (75 XP)
  {
    id: 'dt-read1',
    title: 'قراءة وفهم ملخص A4 رسمي للدرس واستخراج القاعدة الذهبية',
    xp: 75,
    category: 'reading',
    difficulty: 'medium',
    rewardType: 'xp',
    rewardDetail: '75 XP تعزيز الفهم'
  },
  {
    id: 'dt-read2',
    title: 'قراءة نص أو سند أدبي/فلسفي وتحديد الفكرة المحورية وسلم التنقيط',
    xp: 75,
    category: 'reading',
    difficulty: 'medium',
    rewardType: 'avatar',
    rewardDetail: 'أفاتار المفكر الجزائري'
  },

  // 4. مهام التقييم الذاتي والاختبارات (60 XP)
  {
    id: 'dt-quiz1',
    title: 'اجتياز اختبار "اختبر نفسك" في المادة وتحقيق علامة ممتازة',
    xp: 60,
    category: 'quiz',
    difficulty: 'medium',
    rewardType: 'xp',
    rewardDetail: '60 XP ترقية السرعة'
  },

  // 5. مهام الشروحات والتفاعل مع الأستاذ (50 XP)
  {
    id: 'dt-vid1',
    title: 'مشاهدة فيديو شرح للأستاذ (نور الدين، خطوة تعليمية، بورنان، شريفي)',
    xp: 50,
    category: 'review',
    difficulty: 'easy',
    rewardType: 'chest',
    rewardDetail: 'وسام المتابعة الذكية'
  },
  {
    id: 'dt-tutor1',
    title: 'طرح استفسار أو نقطة مستعصية على الأستاذ ذكي ومناقشة تفاصيلها',
    xp: 50,
    category: 'tutor',
    difficulty: 'easy',
    rewardType: 'xp',
    rewardDetail: '50 XP نقاش مثمر'
  },

  // 6. مهام التدوين والملاحظات (40 XP)
  {
    id: 'dt-note1',
    title: 'تدوين 3 تنبيهات دراسية وملاحظات لمنع الفخاخ في دفتر الملاحظات',
    xp: 40,
    category: 'review',
    difficulty: 'easy',
    rewardType: 'xp',
    rewardDetail: '40 XP تنظيم الذهن'
  },
];

