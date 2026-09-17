export interface CurriculumSubject {
  id: string;
  name: string;
  category: 'أساسية' | 'لغات' | 'علوم' | 'اجتماعيات' | 'فنية وبدنية';
  desc: string;
  gradeRestriction?: string[]; // Specific grades if applicable
}

export const GRADES = {
  primary: [
    { id: '1AP', name: 'السنة الأولى ابتدائي' },
    { id: '2AP', name: 'السنة الثانية ابتدائي' },
    { id: '3AP', name: 'السنة الثالثة ابتدائي' },
    { id: '4AP', name: 'السنة الرابعة ابتدائي' },
    { id: '5AP', name: 'السنة الخامسة ابتدائي (الشهادة)' },
  ],
  middle: [
    { id: '1AM', name: 'السنة الأولى متوسط' },
    { id: '2AM', name: 'السنة الثانية متوسط' },
    { id: '3AM', name: 'السنة الثالثة متوسط' },
    { id: '4AM', name: 'السنة الرابعة متوسط (BEM)' },
  ],
  secondary: [
    { id: '1AS', name: 'السنة الأولى ثانوي' },
    { id: '2AS', name: 'السنة الثانية ثانوي' },
    { id: '3AS', name: 'السنة الثالثة ثانوي (BAC)' },
  ],
  university: [
    { id: 'L1', name: 'السنة الأولى جامعي L1 (جذع مشترك)' },
    { id: 'L2', name: 'السنة الثانية جامعي L2 (تخصص)' },
    { id: 'L3', name: 'السنة الثالثة ليسانس L3 (تخرج)' },
    { id: 'M1', name: 'ماستر 1 (Master)' },
    { id: 'M2', name: 'ماستر 2 (Master & PFE)' },
    { id: 'PREPA', name: 'المدارس العليا والمعاهد الوطنية' },
  ],
};

export const SECONDARY_STREAMS = [
  'علوم تجريبية',
  'رياضيات',
  'تقني رياضي',
  'تسيير واقتصاد',
  'آداب وفلسفة',
  'لغات أجنبية',
  'جذع مشترك علوم وتكنولوجيا',
  'جذع مشترك آداب',
];

// All official subjects taught in the Algerian educational system
export const PRIMARY_ALL_SUBJECTS: CurriculumSubject[] = [
  { id: 'arabic', name: 'اللغة العربية', category: 'أساسية', desc: 'القراءة، التعبير الشفوي، الكتابة، الإملاء وقواعد اللغة' },
  { id: 'math', name: 'الرياضيات', category: 'أساسية', desc: 'الأعداد والحساب، الهندسة والقياس، حل المسائل' },
  { id: 'islamic', name: 'التربية الإسلامية', category: 'أساسية', desc: 'القرآن الكريم، الحديث النبوي، العقيدة والآداب' },
  { id: 'civic', name: 'التربية المدنية', category: 'اجتماعيات', desc: 'الحياة في المجتمع، المدرسة، حقوق وواجبات المواطن' },
  { id: 'science_tech', name: 'التربية العلمية والتكنولوجية', category: 'علوم', desc: 'عالم الأحياء، المادة والكهرباء، البيئة والصحة' },
  { id: 'history_geo', name: 'التاريخ والجغرافيا', category: 'اجتماعيات', desc: 'تاريخ الجزائر، معالم المكان والخرائط (ابتداءً من 3 ابتدائي)', gradeRestriction: ['3AP', '4AP', '5AP'] },
  { id: 'french', name: 'اللغة الفرنسية', category: 'لغات', desc: 'Apprentissage des sons, lecture et expression (ابتداءً من 3 ابتدائي)', gradeRestriction: ['3AP', '4AP', '5AP'] },
  { id: 'english', name: 'اللغة الإنجليزية', category: 'لغات', desc: 'Basic alphabet, vocabulary, listening & speaking', gradeRestriction: ['3AP', '4AP', '5AP'] },
  { id: 'art', name: 'التربية الفنية والتشكيلية', category: 'فنية وبدنية', desc: 'الرسم، الألوان، التعبير الفني والتشكيل' },
  { id: 'music', name: 'التربية الموسيقية', category: 'فنية وبدنية', desc: 'النشيد الوطني، الإيقاع، الأناشيد التربوية' },
  { id: 'pe', name: 'التربية البدنية والرياضية', category: 'فنية وبدنية', desc: 'اللياقة، الحركة، الروح الرياضية والأنشطة الجماعية' },
];

export const MIDDLE_ALL_SUBJECTS: CurriculumSubject[] = [
  { id: 'arabic_lit', name: 'اللغة العربية وآدابها', category: 'أساسية', desc: 'النحو، الصرف، البلاغة، النصوص الأدبية والمطالعة' },
  { id: 'math', name: 'الرياضيات', category: 'أساسية', desc: 'الجبر، الأنشطة الهندسية، الدوال والإحصاء' },
  { id: 'physics_tech', name: 'العلوم الفيزيائية والتكنولوجيا', category: 'علوم', desc: 'المادة وتحولاتها، الظواهر الكهربائية، الميكانيكية والضوئية' },
  { id: 'natural_science', name: 'علوم الطبيعة والحياة', category: 'علوم', desc: 'علم وظائف الأعضاء، التغذية، الاتصال العصبي والجيولوجيا' },
  { id: 'islamic', name: 'التربية الإسلامية', category: 'أساسية', desc: 'القرآن الكريم والتفسير، الفقه، السيرة والقيم' },
  { id: 'civic', name: 'التربية المدنية', category: 'اجتماعيات', desc: 'المؤسسات الدستورية، الهوية الوطنية، حقوق الإنسان' },
  { id: 'history_geo', name: 'التاريخ والجغرافيا', category: 'اجتماعيات', desc: 'تاريخ الجزائر والمغرب العربي، جغرافيا الجزائر والعالم' },
  { id: 'french', name: 'اللغة الفرنسية', category: 'لغات', desc: 'Compréhension de l’écrit, production écrite et grammaire' },
  { id: 'english', name: 'اللغة الإنجليزية', category: 'لغات', desc: 'Grammar, reading comprehension, speaking and writing' },
  { id: 'informatics', name: 'الإعلام الآلي والتكنولوجيا', category: 'علوم', desc: 'نظم التشغيل، الخوارزميات، برمجيات المكتب والإنترنت' },
  { id: 'art', name: 'التربية التشكيلية والفنية', category: 'فنية وبدنية', desc: 'المنظور، الفنون التشكيلية، التذوق الجمالي' },
  { id: 'music', name: 'التربية الموسيقية', category: 'فنية وبدنية', desc: 'المقامات، الأناشيد والتاريخ الموسيقي الجزائري' },
  { id: 'pe', name: 'التربية البدنية والرياضية', category: 'فنية وبدنية', desc: 'الرياضات الفردية والجماعية والتحكيم الرياضي' },
];

export const SECONDARY_ALL_SUBJECTS: CurriculumSubject[] = [
  { id: 'math', name: 'الرياضيات', category: 'أساسية', desc: 'الدوال والتحليل، الهندسة الفضائية، الاحتمالات والأعداد المركبة' },
  { id: 'physics', name: 'العلوم الفيزيائية', category: 'علوم', desc: 'الميكانيك، الكهرباء، الكيمياء، والتحولات النووية' },
  { id: 'natural_science', name: 'علوم الطبيعة والحياة', category: 'علوم', desc: 'تركيب البروتين، المناعة، الجيولوجيا والاتصال العصبي' },
  { id: 'philosophy', name: 'الفلسفة', category: 'أساسية', desc: 'المشكلة والإشكالية، فلسفة العلوم، الأخلاق والسياسة' },
  { id: 'arabic_lit', name: 'اللغة العربية وآدابها', category: 'أساسية', desc: 'عصور الأدب، النقد الأدبي، القواعد والإعراب' },
  { id: 'islamic_studies', name: 'العلوم الإسلامية', category: 'أساسية', desc: 'العقيدة، مقاصد الشريعة، مصادر التشريع الإسلامي' },
  { id: 'history_geo', name: 'التاريخ والجغرافيا', category: 'اجتماعيات', desc: 'الحرب الباردة، الثورة التحريرية، القوى الاقتصادية الكبرى' },
  { id: 'french', name: 'اللغة الفرنسية', category: 'لغات', desc: 'Textes d’histoire, débat d’idées, appel et argumentation' },
  { id: 'english', name: 'اللغة الإنجليزية', category: 'لغات', desc: 'Ethics in business, ancient civilizations, astronomy and safety' },
  { id: 'engineering_tech', name: 'الهندسة والتكنولوجيا', category: 'علوم', desc: 'ميكانيك، كهرباء، طرائق أو هندسة مدنية للتقني رياضي' },
  { id: 'accounting_mgmt', name: 'التسيير المحاسبي والمالي والقانون', category: 'علوم', desc: 'المحاسبة العامة، إعداد الميزانية، الاقتصاد والقانون' },
  { id: 'foreign_lang_3', name: 'اللغة الأجنبية الثالثة', category: 'لغات', desc: 'الإسبانية أو الألمانية أو الإيطالية لشعبة اللغات' },
  { id: 'pe', name: 'التربية البدنية والرياضية', category: 'فنية وبدنية', desc: 'الجمباز، ألعاب القوى والرياضات الجماعية' },
];

export const UNIVERSITY_ALL_SUBJECTS: CurriculumSubject[] = [
  { id: 'math_analysis', name: 'التحليل والرياضيات الجامعية (Analyse & Algèbre)', category: 'علوم', desc: 'Les intégrales, équations différentielles, espaces vectoriels' },
  { id: 'algorithms', name: 'الخوارزميات وهياكل البيانات (Algorithmique)', category: 'علوم', desc: 'Structures de données, complexité, programmation C/Python' },
  { id: 'physics_univ', name: 'الفيزياء الجامعية (Physique Générale)', category: 'علوم', desc: 'Mécanique du point, électrostatique, thermodynamique' },
  { id: 'languages_univ', name: 'اللغة الأجنبية والمصطلحات التقنية', category: 'لغات', desc: 'Anglais et Français scientifique et technique' },
  { id: 'methodology_univ', name: 'منهجية البحث العلمي وإعداد المذكرات (PFE)', category: 'أساسية', desc: 'Rédaction scientifique, soutenance et bibliographie' },
];

export function getCurriculumSubjects(cycle: string, gradeId: string, stream?: string): CurriculumSubject[] {
  if (cycle === 'primary') {
    return PRIMARY_ALL_SUBJECTS.filter(s => !s.gradeRestriction || s.gradeRestriction.includes(gradeId));
  }
  if (cycle === 'middle') {
    return MIDDLE_ALL_SUBJECTS;
  }
  if (cycle === 'university') {
    return UNIVERSITY_ALL_SUBJECTS;
  }
  // Secondary: filter out specialized subjects based on stream
  return SECONDARY_ALL_SUBJECTS.filter(s => {
    if (s.id === 'engineering_tech' && stream !== 'تقني رياضي') return false;
    if (s.id === 'accounting_mgmt' && stream !== 'تسيير واقتصاد') return false;
    if (s.id === 'foreign_lang_3' && stream !== 'لغات أجنبية') return false;
    return true;
  });
}

export function getGradeLabel(cycle: string, gradeId: string): string {
  const list = GRADES[cycle as keyof typeof GRADES];
  if (!list) return gradeId;
  const item = list.find(g => g.id === gradeId);
  return item ? item.name : gradeId;
}
