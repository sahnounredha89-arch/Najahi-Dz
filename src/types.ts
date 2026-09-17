export type SubjectName = string;

export interface SubjectItem {
  id: string;
  name: string;
  iconName?: string;
  desc: string;
  cycle: 'primary' | 'middle' | 'secondary' | 'university';
  minGrade?: string; // For subjects starting in later grades like English/French/History
}

export interface UserProfile {
  name: string;
  email: string;
  currentScore: number;
  targetScore: number;
  subjectScores?: Record<string, number>; // علامات المواد المحفوظة
  cycle: 'primary' | 'middle' | 'secondary' | 'university';
  gradeId: string;
  stream: string;
  avatar: string;
  unlockedAvatars: string[];
  streak: number;
  bestStreak: number;
  streakFreezes: number; // بطاقة تجميد السلسلة
  xp: number;
  levelRank: string;
  badges: string[];
  completedTasksToday: string[];
  lastStudyDate: string;
  isLoggedIn?: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  xp: number;
  category?: 'memorization' | 'reading' | 'practice' | 'review' | 'tutor' | 'quiz';
  difficulty?: 'hard' | 'medium' | 'easy';
  rewardType?: 'xp' | 'avatar' | 'freeze' | 'chest';
  rewardDetail?: string;
}

export interface RewardChest {
  title: string;
  description: string;
  type: 'xp' | 'avatar' | 'freeze';
  value: string | number;
  icon: string;
}

export interface A4SummaryItem {
  id?: string;
  subject: string;
  title: string;
  lessonName?: string;
  intro: string;
  rule1: string;
  simplification: string;
  points: string[];
  practice: string;
  exercises: { q: string; a: string }[];
  notebookPoints?: string[];
  examTrap?: string;
  antiCheatNotice?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

export interface FlashcardItem {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Backward-compatible types for legacy components
export type Subject = string;
export type AcademicLevel = string;

export interface SavedLesson {
  id: string;
  title: string;
  subject: Subject;
  summary: string;
  flashcards: FlashcardItem[];
  quiz: QuizQuestion[];
  date: string;
  imageUrl?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  quizzesCompleted: number;
  lessonsScanned: number;
}

export interface BlackboardLesson {
  id: string;
  subject: string;
  grade: string;
  cycle?: 'primary' | 'middle' | 'secondary' | 'university';
  unit: string;
  title: string;
  dateStr: string;
  competency: string;
  starter: {
    title: string;
    priorKnowledge: string[];
    problemText: string;
    hypothesis: string;
  };
  coreSections: {
    title: string;
    ruleBox?: string;
    explanation: string;
    bulletPoints: string[];
    diagramOrFormula?: string;
  }[];
  sidebar: {
    applicationExercise: {
      title: string;
      question: string;
      stepByStepSolution: string;
    };
    teacherWarnings: string[];
    goldenTip: string;
    homeworkTask: string;
  };
}


