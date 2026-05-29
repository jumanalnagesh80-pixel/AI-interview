// Competitive exam data — mirrors backend/app/seed_data.py.
// This lets the frontend work standalone (no backend required).

export type ExamCategory = "placement" | "aptitude" | "reasoning" | "verbal" | "coding";

export interface ExamQuestion {
  id: string;
  section: string;
  text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

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

const q = (
  id: string,
  section: string,
  text: string,
  options: string[],
  correct_index: number,
  explanation = "",
  difficulty: "Easy" | "Medium" | "Hard" = "Medium",
): ExamQuestion => ({ id, section, text, options, correct_index, explanation, difficulty });

const QUANT: ExamQuestion[] = [
  q("quant-1", "Quantitative",
    "If a train travels 360 km in 4 hours, what is its speed in m/s?",
    ["20 m/s", "25 m/s", "30 m/s", "15 m/s"], 1,
    "360/4 = 90 km/h. 90 × 1000/3600 = 25 m/s.", "Easy"),
  q("quant-2", "Quantitative",
    "Compound interest on Rs. 10,000 at 10% per annum for 2 years (compounded annually):",
    ["Rs. 2000", "Rs. 2100", "Rs. 2110", "Rs. 2210"], 1,
    "10000 × (1.1² − 1) = 10000 × 0.21 = 2100.", "Medium"),
  q("quant-3", "Quantitative",
    "The average of the first 50 natural numbers is:",
    ["25", "25.5", "26", "24.5"], 1,
    "Sum = n(n+1)/2 = 1275. Avg = 1275/50 = 25.5.", "Easy"),
  q("quant-4", "Quantitative",
    "A man rows 6 km/h in still water; river flows at 2 km/h. Time to row 16 km downstream and back:",
    ["6 hours", "5 hours", "4 hours", "8 hours"], 0,
    "Down 8, Up 4 → 16/8 + 16/4 = 2 + 4 = 6h.", "Medium"),
  q("quant-5", "Quantitative",
    "If 20% of a number is 60, what is 75% of that number?",
    ["180", "200", "225", "250"], 2,
    "Number = 60/0.2 = 300. 75% of 300 = 225.", "Easy"),
  q("quant-6", "Quantitative",
    "Probability of getting a sum of 7 when two dice are rolled:",
    ["1/6", "1/9", "5/36", "7/36"], 0,
    "6 favorable out of 36 → 1/6.", "Medium"),
  q("quant-7", "Quantitative",
    "A and B finish a job in 12 days; A alone in 20 days. B alone takes:",
    ["20 days", "30 days", "25 days", "15 days"], 1,
    "1/12 − 1/20 = 1/30 → B = 30 days.", "Medium"),
  q("quant-8", "Quantitative",
    "What is 15% of 240?",
    ["30", "32", "36", "40"], 2,
    "0.15 × 240 = 36.", "Easy"),
];

const LOGICAL: ExamQuestion[] = [
  q("log-1", "Logical Reasoning",
    "Find the missing number: 2, 6, 12, 20, 30, ?",
    ["40", "42", "44", "46"], 1,
    "Differences are 4,6,8,10,12 → 30+12 = 42.", "Easy"),
  q("log-2", "Logical Reasoning",
    "If 'CAT' is coded as '3-1-20', then 'DOG' is:",
    ["4-15-7", "4-12-7", "5-15-7", "4-15-8"], 0,
    "D=4, O=15, G=7.", "Easy"),
  q("log-3", "Logical Reasoning",
    "In a row of 40 students, Rahul is 12th from the left. His position from the right?",
    ["28", "29", "30", "27"], 1,
    "40 − 12 + 1 = 29.", "Easy"),
  q("log-4", "Logical Reasoning",
    "All cats are dogs. All dogs are mammals. Conclusion?",
    ["All cats are mammals", "Some mammals are not cats", "Both A and B", "None"], 2,
    "Both follow logically.", "Medium"),
  q("log-5", "Logical Reasoning",
    "Find the odd one out: 121, 144, 169, 200, 225",
    ["121", "169", "200", "225"], 2,
    "All others are perfect squares; 200 is not.", "Easy"),
  q("log-6", "Logical Reasoning",
    "Pointing to a man, Asha says 'He is the son of my mother's only son.' How is the man related to Asha?",
    ["Brother", "Son", "Cousin", "Nephew"], 1,
    "Mother's only son = Asha's brother (or self in classic version) → Son.", "Medium"),
  q("log-7", "Logical Reasoning",
    "Complete the series: A, C, F, J, ?",
    ["O", "M", "N", "L"], 0,
    "Skip 1,2,3,4 → +5 → O.", "Medium"),
  q("log-8", "Logical Reasoning",
    "If MONDAY → ONODBZ, then FRIDAY →",
    ["GSJEBZ", "HSJEBZ", "GTJEBZ", "GSKFBZ"], 0,
    "Each letter +1: F→G, R→S, I→J, D→E, A→B, Y→Z.", "Hard"),
];

const VERBAL: ExamQuestion[] = [
  q("ver-1", "Verbal English", "Synonym of 'Eloquent':", ["Silent", "Articulate", "Rude", "Dull"], 1, "Eloquent = articulate.", "Easy"),
  q("ver-2", "Verbal English", "Antonym of 'Benevolent':", ["Generous", "Kind", "Malevolent", "Friendly"], 2, "Malevolent = wishing harm.", "Easy"),
  q("ver-3", "Verbal English", "Identify the error: 'She don't like coffee.'", ["She", "don't", "like", "coffee"], 1, "Should be 'doesn't'.", "Easy"),
  q("ver-4", "Verbal English", "He is good ___ mathematics.", ["in", "at", "on", "with"], 1, "'Good at' is standard.", "Easy"),
  q("ver-5", "Verbal English", "Choose the correctly spelt word:", ["Recieve", "Receive", "Receeve", "Recive"], 1, "i before e except after c.", "Easy"),
  q("ver-6", "Verbal English", "Meaning of 'Bite the bullet':", ["Eat metal", "Endure pain courageously", "Bite a snack", "Shoot accurately"], 1, "Idiom for facing hardship.", "Medium"),
  q("ver-7", "Verbal English", "Active to passive: 'The cat chased the mouse.'", ["The mouse chased the cat", "The mouse was chased by the cat", "The mouse was chasing", "The cat was chased"], 1, "Passive form.", "Easy"),
  q("ver-8", "Verbal English", "Choose the correct article: ___ honest man is respected.", ["A", "An", "The", "No article"], 1, "'Honest' starts with vowel sound.", "Easy"),
];

const CODING_MCQ: ExamQuestion[] = [
  q("cod-1", "Programming", "Time complexity of binary search on n sorted elements:", ["O(n)", "O(log n)", "O(n log n)", "O(1)"], 1, "Halving each step.", "Easy"),
  q("cod-2", "Programming", "Which data structure uses LIFO order?", ["Queue", "Stack", "Heap", "Tree"], 1, "Last In First Out = Stack.", "Easy"),
  q("cod-3", "Programming", "Output of: print(2 ** 3 ** 2) in Python", ["64", "512", "256", "Error"], 1, "** is right-associative → 2^(3^2) = 2^9 = 512.", "Medium"),
  q("cod-4", "Programming", "Which sort has worst case O(n²)?", ["Merge sort", "Heap sort", "Quicksort", "All of these"], 2, "Quicksort can degrade with bad pivots.", "Medium"),
  q("cod-5", "Programming", "Which is NOT an OOP principle?", ["Encapsulation", "Polymorphism", "Compilation", "Inheritance"], 2, "Compilation is not an OOP principle.", "Easy"),
  q("cod-6", "Programming", "In SQL, which clause filters AFTER aggregation?", ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], 1, "HAVING runs after GROUP BY.", "Medium"),
  q("cod-7", "Programming", "Hashmap average lookup time complexity:", ["O(1)", "O(log n)", "O(n)", "O(n²)"], 0, "Constant time on average.", "Easy"),
  q("cod-8", "Programming", "Which traversal visits root between left and right?", ["Pre-order", "In-order", "Post-order", "Level-order"], 1, "In-order = Left, Root, Right.", "Medium"),
];

const PSEUDO: ExamQuestion[] = [
  q("ps-1", "Pseudocode", "int x=5; int y=10; print(x++ + ++y); What prints?", ["15", "16", "17", "18"], 1, "x++ uses 5; ++y makes y=11. 5+11=16.", "Medium"),
  q("ps-2", "Pseudocode", "Nested loop printing stars by row count. Line 3 prints?", ["**", "***", "****", "*"], 1, "i=3 → 3 stars.", "Easy"),
  q("ps-3", "Pseudocode", "f(n) = n*f(n-1), f(1)=1. f(5) = ?", ["20", "60", "120", "150"], 2, "5! = 120.", "Easy"),
  q("ps-4", "Pseudocode", "Bitwise: 13 & 10 = ?", ["8", "9", "10", "11"], 0, "1101 & 1010 = 1000 = 8.", "Medium"),
];

function buildExam(
  id: string,
  name: string,
  company: string | null,
  category: ExamCategory,
  description: string,
  sections: string[],
  color: string,
  icon: string,
  duration_min: number,
  total: number,
  difficulty: "Easy" | "Medium" | "Hard",
  banks: ExamQuestion[][],
): Exam {
  const questions: ExamQuestion[] = [];
  let counter = 0;
  outer: for (const bank of banks) {
    for (const item of bank) {
      counter += 1;
      questions.push({ ...item, id: `${id}-${counter}`, section: item.section });
      if (questions.length >= total) break outer;
    }
  }
  return {
    id, name, company, category, description,
    duration_min, total_questions: questions.length,
    difficulty, sections, color, icon, questions,
  };
}

export const EXAMS: Exam[] = [
  buildExam("tcs-nqt", "TCS NQT", "TCS", "placement",
    "TCS National Qualifier Test pattern: aptitude, reasoning, verbal, programming.",
    ["Quantitative", "Logical Reasoning", "Verbal English", "Programming"],
    "from-blue-600 to-cyan-500", "Building2",
    90, 24, "Medium", [QUANT, LOGICAL, VERBAL, CODING_MCQ]),
  buildExam("infosys-spp", "Infosys SP / DSE", "Infosys", "placement",
    "Infosys Specialist Programmer / Digital Specialist Engineer.",
    ["Quantitative", "Logical Reasoning", "Verbal English", "Pseudocode"],
    "from-cyan-500 to-teal-500", "Building2",
    95, 20, "Medium", [QUANT, LOGICAL, VERBAL, PSEUDO]),
  buildExam("wipro-nlth", "Wipro Elite NLTH", "Wipro", "placement",
    "Wipro National Talent Hunt: aptitude + English + coding fundamentals.",
    ["Quantitative", "Verbal English", "Logical Reasoning"],
    "from-violet-500 to-fuchsia-500", "Building2",
    60, 18, "Medium", [QUANT, VERBAL, LOGICAL]),
  buildExam("capgemini-pi", "Capgemini Placement", "Capgemini", "placement",
    "Capgemini Pseudocode + Aptitude + English pattern.",
    ["Pseudocode", "Quantitative", "Verbal English"],
    "from-blue-500 to-indigo-500", "Building2",
    60, 18, "Hard", [PSEUDO, QUANT, VERBAL]),
  buildExam("cognizant-genc", "Cognizant GenC", "Cognizant", "placement",
    "Cognizant GenC: aptitude, reasoning, verbal, programming MCQs.",
    ["Quantitative", "Logical Reasoning", "Verbal English", "Programming"],
    "from-sky-500 to-blue-600", "Building2",
    75, 22, "Medium", [QUANT, LOGICAL, VERBAL, CODING_MCQ]),
  buildExam("accenture-cog", "Accenture Cognitive", "Accenture", "placement",
    "Accenture cognitive + technical assessment pattern.",
    ["Quantitative", "Logical Reasoning", "Verbal English", "Programming"],
    "from-purple-500 to-pink-500", "Building2",
    90, 24, "Medium", [QUANT, LOGICAL, VERBAL, CODING_MCQ]),
  buildExam("aptitude-mix", "Quantitative Aptitude", null, "aptitude",
    "Mixed aptitude: percentages, ratios, time–speed, probability.",
    ["Quantitative"], "from-emerald-500 to-teal-500", "Sigma",
    30, 8, "Medium", [QUANT]),
  buildExam("logical-mix", "Logical Reasoning", null, "reasoning",
    "Series, coding-decoding, syllogisms, blood relations.",
    ["Logical Reasoning"], "from-amber-500 to-orange-500", "GitBranch",
    30, 8, "Medium", [LOGICAL]),
  buildExam("verbal-mix", "Verbal English", null, "verbal",
    "Synonyms, antonyms, grammar, idioms, sentence correction.",
    ["Verbal English"], "from-pink-500 to-rose-500", "BookOpen",
    25, 8, "Easy", [VERBAL]),
  buildExam("coding-mcq", "Coding & DSA MCQ", null, "coding",
    "Data structures, algorithms, complexity, OOP, SQL fundamentals.",
    ["Programming"], "from-fuchsia-500 to-purple-600", "Code2",
    30, 8, "Medium", [CODING_MCQ]),
];

export function getExam(id: string): Exam | undefined {
  return EXAMS.find((e) => e.id === id);
}

export const CATEGORY_LABEL: Record<ExamCategory, string> = {
  placement: "Placement Drives",
  aptitude: "Quantitative Aptitude",
  reasoning: "Logical Reasoning",
  verbal: "Verbal English",
  coding: "Coding & DSA",
};
