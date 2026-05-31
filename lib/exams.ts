// Competitive-exam catalog. Questions are drawn from the large deterministic
// bank in lib/questionBank.ts (5000+ items) so every exam has plenty of variety
// while the client bundle stays tiny (questions are computed at load, not shipped).

import {
  assembleExamQuestions,
  TOTAL_QUESTION_BANK,
  type BankQuestion,
  type SectionPools,
} from "./questionBank";

export type ExamCategory =
  | "placement"
  | "aptitude"
  | "reasoning"
  | "verbal"
  | "coding"
  | "government"
  | "banking"
  | "defence"
  | "mba"
  | "engineering"
  | "general";

export type ExamQuestion = BankQuestion;

export interface Exam {
  id: string;
  name: string;
  company: string | null;
  category: ExamCategory;
  description: string;
  duration_min: number;
  total_questions: number;
  difficulty: "Easy" | "Medium" | "Hard";
  sections: string[];
  color: string;
  icon: string;
  questions: ExamQuestion[];
}

interface ExamMeta {
  id: string;
  name: string;
  company: string | null;
  category: ExamCategory;
  description: string;
  duration_min: number;
  count: number;
  difficulty: "Easy" | "Medium" | "Hard";
  sections: (keyof SectionPools)[];
  color: string;
  icon: string;
}

const META: ExamMeta[] = [
  // ---------- Placement drives ----------
  { id: "tcs-nqt", name: "TCS NQT", company: "TCS", category: "placement",
    description: "TCS National Qualifier Test: aptitude, reasoning, verbal, programming.",
    duration_min: 90, count: 30, difficulty: "Medium",
    sections: ["Quantitative", "Logical Reasoning", "Verbal English", "Programming"],
    color: "from-blue-600 to-cyan-500", icon: "Building2" },
  { id: "infosys-spp", name: "Infosys SP / DSE", company: "Infosys", category: "placement",
    description: "Infosys Specialist Programmer / Digital Specialist Engineer pattern.",
    duration_min: 95, count: 28, difficulty: "Medium",
    sections: ["Quantitative", "Logical Reasoning", "Verbal English", "Pseudocode"],
    color: "from-cyan-500 to-teal-500", icon: "Building2" },
  { id: "wipro-nlth", name: "Wipro Elite NLTH", company: "Wipro", category: "placement",
    description: "Wipro National Talent Hunt: aptitude + English + coding fundamentals.",
    duration_min: 60, count: 24, difficulty: "Medium",
    sections: ["Quantitative", "Verbal English", "Logical Reasoning"],
    color: "from-violet-500 to-fuchsia-500", icon: "Building2" },
  { id: "capgemini-pi", name: "Capgemini Placement", company: "Capgemini", category: "placement",
    description: "Capgemini Pseudocode + Aptitude + English pattern.",
    duration_min: 60, count: 24, difficulty: "Hard",
    sections: ["Pseudocode", "Quantitative", "Verbal English"],
    color: "from-blue-500 to-indigo-500", icon: "Building2" },
  { id: "cognizant-genc", name: "Cognizant GenC", company: "Cognizant", category: "placement",
    description: "Cognizant GenC: aptitude, reasoning, verbal, programming MCQs.",
    duration_min: 75, count: 28, difficulty: "Medium",
    sections: ["Quantitative", "Logical Reasoning", "Verbal English", "Programming"],
    color: "from-sky-500 to-blue-600", icon: "Building2" },
  { id: "accenture-cog", name: "Accenture Cognitive", company: "Accenture", category: "placement",
    description: "Accenture cognitive + technical assessment pattern.",
    duration_min: 90, count: 30, difficulty: "Medium",
    sections: ["Quantitative", "Logical Reasoning", "Verbal English", "Programming"],
    color: "from-purple-500 to-pink-500", icon: "Building2" },

  // ---------- Government / UPSC / SSC / Railway ----------
  { id: "upsc-prelims", name: "UPSC CSE Prelims (GS-I)", company: "UPSC", category: "government",
    description: "UPSC Civil Services Preliminary GS Paper-I: polity, science, current affairs.",
    duration_min: 120, count: 32, difficulty: "Hard",
    sections: ["General Knowledge", "General Science", "Quantitative", "Logical Reasoning"],
    color: "from-amber-500 to-rose-500", icon: "Building2" },
  { id: "ssc-cgl", name: "SSC CGL Tier-1", company: "SSC", category: "government",
    description: "Combined Graduate Level Tier 1: quant, reasoning, English, GK.",
    duration_min: 60, count: 30, difficulty: "Medium",
    sections: ["Quantitative", "Logical Reasoning", "Verbal English", "General Knowledge"],
    color: "from-emerald-500 to-cyan-500", icon: "Building2" },
  { id: "ssc-chsl", name: "SSC CHSL", company: "SSC", category: "government",
    description: "Combined Higher Secondary Level (10+2).",
    duration_min: 60, count: 28, difficulty: "Medium",
    sections: ["Quantitative", "Logical Reasoning", "Verbal English", "General Knowledge"],
    color: "from-teal-500 to-cyan-500", icon: "Building2" },
  { id: "rrb-ntpc", name: "RRB NTPC", company: "Indian Railways", category: "government",
    description: "Railway Non-Technical Popular Categories — Stage 1.",
    duration_min: 90, count: 30, difficulty: "Medium",
    sections: ["General Knowledge", "Quantitative", "Logical Reasoning", "General Science"],
    color: "from-orange-500 to-red-500", icon: "Building2" },
  { id: "rrb-group-d", name: "RRB Group D", company: "Indian Railways", category: "government",
    description: "Railway Group D: mathematics, science, GK, reasoning.",
    duration_min: 90, count: 28, difficulty: "Medium",
    sections: ["Quantitative", "General Science", "General Knowledge", "Logical Reasoning"],
    color: "from-orange-600 to-amber-500", icon: "Building2" },
  { id: "ssc-gd", name: "SSC GD Constable", company: "SSC", category: "government",
    description: "General Duty Constable: reasoning, maths, GK, English.",
    duration_min: 60, count: 28, difficulty: "Easy",
    sections: ["Logical Reasoning", "Quantitative", "General Knowledge", "Verbal English"],
    color: "from-rose-500 to-pink-500", icon: "Building2" },

  // ---------- Banking ----------
  { id: "ibps-po", name: "IBPS PO Prelims", company: "IBPS", category: "banking",
    description: "Probationary Officer prelims: English, reasoning, quant.",
    duration_min: 60, count: 28, difficulty: "Medium",
    sections: ["Verbal English", "Logical Reasoning", "Quantitative"],
    color: "from-blue-500 to-cyan-500", icon: "Building2" },
  { id: "ibps-clerk", name: "IBPS Clerk Prelims", company: "IBPS", category: "banking",
    description: "Clerk prelims: aptitude + reasoning + English at speed.",
    duration_min: 60, count: 28, difficulty: "Medium",
    sections: ["Quantitative", "Logical Reasoning", "Verbal English"],
    color: "from-cyan-500 to-blue-500", icon: "Building2" },
  { id: "sbi-po", name: "SBI PO Prelims", company: "SBI", category: "banking",
    description: "State Bank of India PO prelims — speed and accuracy.",
    duration_min: 60, count: 30, difficulty: "Hard",
    sections: ["Verbal English", "Quantitative", "Logical Reasoning"],
    color: "from-blue-700 to-indigo-500", icon: "Building2" },
  { id: "rbi-grade-b", name: "RBI Grade B (Phase 1)", company: "RBI", category: "banking",
    description: "RBI officer entry: banking awareness + reasoning + quant + English.",
    duration_min: 120, count: 32, difficulty: "Hard",
    sections: ["Banking", "General Knowledge", "Quantitative", "Logical Reasoning", "Verbal English"],
    color: "from-indigo-500 to-blue-700", icon: "Building2" },
  { id: "nabard-grade-a", name: "NABARD Grade-A", company: "NABARD", category: "banking",
    description: "Assistant Manager prelims with economy + rural development focus.",
    duration_min: 90, count: 28, difficulty: "Hard",
    sections: ["Banking", "General Knowledge", "Quantitative", "Logical Reasoning"],
    color: "from-emerald-500 to-teal-600", icon: "Building2" },

  // ---------- Defence / MBA / Engineering ----------
  { id: "nda", name: "NDA & NA", company: "UPSC", category: "defence",
    description: "National Defence Academy entrance: mathematics + GAT.",
    duration_min: 150, count: 32, difficulty: "Hard",
    sections: ["Quantitative", "General Knowledge", "General Science", "Verbal English"],
    color: "from-slate-500 to-blue-600", icon: "Building2" },
  { id: "cds", name: "CDS Examination", company: "UPSC", category: "defence",
    description: "Combined Defence Services: English, GK, elementary maths.",
    duration_min: 120, count: 28, difficulty: "Hard",
    sections: ["Verbal English", "General Knowledge", "Quantitative"],
    color: "from-blue-700 to-slate-500", icon: "Building2" },
  { id: "cat", name: "CAT Mock", company: "IIMs", category: "mba",
    description: "Common Admission Test: VARC, DI/LR, Quant.",
    duration_min: 120, count: 30, difficulty: "Hard",
    sections: ["Verbal English", "Logical Reasoning", "Quantitative"],
    color: "from-purple-600 to-indigo-700", icon: "Building2" },
  { id: "gate-cs", name: "GATE CSE Mock", company: "IISc/IITs", category: "engineering",
    description: "GATE Computer Science: DSA, OS, DBMS, networks, programming.",
    duration_min: 120, count: 32, difficulty: "Hard",
    sections: ["Programming", "Pseudocode", "Quantitative", "Logical Reasoning"],
    color: "from-indigo-500 to-fuchsia-600", icon: "Building2" },

  // ---------- Standalone topic mocks ----------
  { id: "aptitude-mix", name: "Quantitative Aptitude", company: null, category: "aptitude",
    description: "Percentages, ratios, time-speed, interest, profit & loss.",
    duration_min: 30, count: 20, difficulty: "Medium",
    sections: ["Quantitative"], color: "from-emerald-500 to-teal-500", icon: "Sigma" },
  { id: "logical-mix", name: "Logical Reasoning", company: null, category: "reasoning",
    description: "Series, coding-decoding, odd-one-out, patterns.",
    duration_min: 30, count: 20, difficulty: "Medium",
    sections: ["Logical Reasoning"], color: "from-amber-500 to-orange-500", icon: "GitBranch" },
  { id: "verbal-mix", name: "Verbal English", company: null, category: "verbal",
    description: "Synonyms, antonyms, grammar, idioms, sentence correction.",
    duration_min: 25, count: 15, difficulty: "Easy",
    sections: ["Verbal English"], color: "from-pink-500 to-rose-500", icon: "BookOpen" },
  { id: "coding-mcq", name: "Coding & DSA MCQ", company: null, category: "coding",
    description: "Data structures, algorithms, complexity, OOP, SQL.",
    duration_min: 30, count: 20, difficulty: "Medium",
    sections: ["Programming"], color: "from-fuchsia-500 to-purple-600", icon: "Code2" },
  { id: "gk-india-mix", name: "GK & Current Affairs (India)", company: null, category: "general",
    description: "Indian polity, history, geography, science and recent affairs.",
    duration_min: 25, count: 18, difficulty: "Medium",
    sections: ["General Knowledge"], color: "from-amber-500 to-orange-500", icon: "BookOpen" },
  { id: "general-science", name: "General Science", company: null, category: "general",
    description: "Physics, chemistry, biology fundamentals.",
    duration_min: 20, count: 15, difficulty: "Easy",
    sections: ["General Science"], color: "from-teal-500 to-emerald-500", icon: "Sigma" },
  { id: "computer-awareness", name: "Computer Awareness", company: null, category: "general",
    description: "Operating systems, networking, hardware basics.",
    duration_min: 20, count: 15, difficulty: "Easy",
    sections: ["Computer Awareness"], color: "from-fuchsia-500 to-violet-600", icon: "Code2" },
  { id: "banking-awareness", name: "Banking Awareness", company: null, category: "banking",
    description: "RBI, monetary policy, schemes — for IBPS / SBI / NABARD.",
    duration_min: 20, count: 15, difficulty: "Medium",
    sections: ["Banking"], color: "from-blue-500 to-cyan-500", icon: "Building2" },
];

export const EXAMS: Exam[] = META.map((m) => {
  const questions = assembleExamQuestions(m.id, m.sections, m.count);
  return {
    id: m.id,
    name: m.name,
    company: m.company,
    category: m.category,
    description: m.description,
    duration_min: m.duration_min,
    total_questions: questions.length,
    difficulty: m.difficulty,
    sections: m.sections as string[],
    color: m.color,
    icon: m.icon,
    questions,
  };
});

export function getExam(id: string): Exam | undefined {
  return EXAMS.find((e) => e.id === id);
}

/** Total size of the underlying question bank (for the "5000+ questions" stat). */
export const QUESTION_BANK_SIZE = TOTAL_QUESTION_BANK;

export const CATEGORY_LABEL: Record<ExamCategory, string> = {
  placement: "Placement Drives",
  aptitude: "Quantitative Aptitude",
  reasoning: "Logical Reasoning",
  verbal: "Verbal English",
  coding: "Coding & DSA",
  government: "Government Exams (UPSC / SSC / Railway)",
  banking: "Banking & Finance (IBPS / SBI / RBI)",
  defence: "Defence Services (NDA / CDS)",
  mba: "MBA Entrance (CAT / XAT)",
  engineering: "Engineering (GATE / ESE)",
  general: "General Awareness",
};
