// Competitive exam data — mirrors backend/app/seed_data.py.
// This lets the frontend work standalone (no backend required).

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

const GK_INDIA: ExamQuestion[] = [
  q("gk-1", "General Knowledge", "Father of the Indian Constitution?", ["Gandhi", "B. R. Ambedkar", "Nehru", "Patel"], 1, "Dr. B. R. Ambedkar chaired the drafting committee.", "Easy"),
  q("gk-2", "General Knowledge", "Article that abolishes untouchability?", ["Article 14", "Article 17", "Article 19", "Article 21"], 1, "Article 17 of the Indian Constitution.", "Medium"),
  q("gk-3", "General Knowledge", "Right to Education Article?", ["Article 21", "Article 21A", "Article 19A", "Article 32"], 1, "Article 21A guarantees free education for ages 6-14.", "Medium"),
  q("gk-4", "General Knowledge", "First woman Prime Minister of India?", ["Sarojini Naidu", "Pratibha Patil", "Indira Gandhi", "Sushma Swaraj"], 2, "Indira Gandhi.", "Easy"),
  q("gk-5", "General Knowledge", "'Make in India' was launched in:", ["2012", "2014", "2016", "2018"], 1, "Launched on 25 September 2014.", "Easy"),
  q("gk-6", "General Knowledge", "Longest river in India?", ["Yamuna", "Brahmaputra", "Ganga", "Godavari"], 2, "Ganga ~2,525 km.", "Easy"),
  q("gk-7", "General Knowledge", "Constitutional head of state of India?", ["PM", "CJI", "President", "VP"], 2, "President is the head of state.", "Easy"),
  q("gk-8", "General Knowledge", "ISRO headquarters?", ["Hyderabad", "Bengaluru", "Chennai", "Trivandrum"], 1, "Bengaluru.", "Easy"),
  q("gk-9", "General Knowledge", "Chandrayaan-3 landed on Moon's:", ["North Pole", "South Pole", "Far side", "Equator"], 1, "Soft-landing near south pole on 23 Aug 2023.", "Medium"),
  q("gk-10", "General Knowledge", "Composer of 'Jana Gana Mana'?", ["Bankim Chandra", "Tagore", "Sarojini Naidu", "Bose"], 1, "Rabindranath Tagore (1911).", "Easy"),
  q("gk-11", "General Knowledge", "State with longest coastline?", ["Tamil Nadu", "Kerala", "Andhra Pradesh", "Gujarat"], 3, "Gujarat ~1,600 km.", "Medium"),
  q("gk-12", "General Knowledge", "GST in India was implemented on:", ["1 Apr 2016", "1 Jul 2017", "1 Apr 2017", "1 Jan 2018"], 1, "1 July 2017.", "Easy"),
];

const BANKING: ExamQuestion[] = [
  q("bk-1", "Banking", "RBI was established in:", ["1935", "1947", "1949", "1969"], 0, "1 April 1935 under RBI Act 1934.", "Easy"),
  q("bk-2", "Banking", "Repo rate is decided by:", ["Finance Ministry", "RBI Governor", "MPC of RBI", "SEBI"], 2, "6-member Monetary Policy Committee.", "Medium"),
  q("bk-3", "Banking", "Full form of CRR:", ["Credit Reserve Ratio", "Cash Reserve Ratio", "Capital Reserve Ratio", "Cash Receipt Ratio"], 1, "Cash Reserve Ratio.", "Easy"),
  q("bk-4", "Banking", "PSL stands for:", ["Public Sector Lending", "Priority Sector Lending", "Primary Sector Loans", "Public Service Lending"], 1, "Priority Sector Lending.", "Medium"),
  q("bk-5", "Banking", "Which is NOT a public-sector bank?", ["SBI", "PNB", "HDFC Bank", "Bank of Baroda"], 2, "HDFC Bank is private.", "Easy"),
  q("bk-6", "Banking", "NEFT settles transactions:", ["Real time", "Half-hourly batches", "End of day", "T+1"], 1, "24x7 half-hourly batches since 2019.", "Medium"),
  q("bk-7", "Banking", "Securities market regulator?", ["RBI", "IRDAI", "SEBI", "NABARD"], 2, "SEBI.", "Easy"),
  q("bk-8", "Banking", "PMJDY is for:", ["Financial inclusion", "Crop insurance", "Pension", "Education loans"], 0, "Pradhan Mantri Jan Dhan Yojana.", "Easy"),
];

const SCIENCE: ExamQuestion[] = [
  q("sci-1", "General Science", "SI unit of electric current:", ["Volt", "Ampere", "Ohm", "Watt"], 1, "Ampere.", "Easy"),
  q("sci-2", "General Science", "Chemical symbol of Sodium:", ["S", "So", "Na", "Sn"], 2, "From Latin 'natrium'.", "Easy"),
  q("sci-3", "General Science", "pH of neutral water at 25C:", ["0", "7", "10", "14"], 1, "Neutral pH = 7.", "Easy"),
  q("sci-4", "General Science", "Most abundant gas in Earth's atmosphere:", ["Oxygen", "CO2", "Nitrogen", "Argon"], 2, "Nitrogen ~78%.", "Easy"),
  q("sci-5", "General Science", "Newton's second law:", ["F=mv", "F=ma", "F=md", "F=Et"], 1, "F = m * a.", "Easy"),
  q("sci-6", "General Science", "DNA stands for:", ["Deoxyribonucleic Acid", "Diribonucleic Acid", "Dinitric Acid", "Deoxyribosic Acid"], 0, "Deoxyribonucleic Acid.", "Easy"),
];

const COMPUTER_AWARENESS: ExamQuestion[] = [
  q("ca-1", "Computer Awareness", "1 KB equals:", ["100 B", "1000 B", "1024 B", "2048 B"], 2, "Binary kilobyte.", "Easy"),
  q("ca-2", "Computer Awareness", "Which is NOT an OS?", ["Linux", "Oracle", "Windows", "macOS"], 1, "Oracle is a DBMS.", "Easy"),
  q("ca-3", "Computer Awareness", "Full form of HTTP:", ["HyperText Transfer Protocol", "HighText Transfer Process", "Hyper Transfer Text Protocol", "HyperText Transmission Process"], 0, "HyperText Transfer Protocol.", "Easy"),
  q("ca-4", "Computer Awareness", "Volatile memory is:", ["ROM", "Hard disk", "RAM", "SSD"], 2, "RAM loses contents on power off.", "Easy"),
  q("ca-5", "Computer Awareness", "An IP address:", ["Encrypts data", "Identifies device on network", "Compresses files", "Stores files"], 1, "Identifies a device on a network.", "Easy"),
  q("ca-6", "Computer Awareness", "Universal paste shortcut on Windows:", ["Ctrl+P", "Ctrl+V", "Ctrl+X", "Ctrl+C"], 1, "Ctrl+V pastes.", "Easy"),
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

  // ---------- Indian Government / Banking / Defence Exams ----------
  buildExam("upsc-prelims", "UPSC CSE Prelims (GS-I)", "UPSC", "government",
    "UPSC Civil Services Preliminary - GS Paper-I (history, polity, science, current affairs).",
    ["General Knowledge", "General Science", "Quantitative", "Logical Reasoning"],
    "from-amber-500 to-rose-500", "Building2",
    120, 24, "Hard", [GK_INDIA, SCIENCE, QUANT, LOGICAL]),
  buildExam("ssc-cgl", "SSC CGL Tier-1", "SSC", "government",
    "Staff Selection Commission Combined Graduate Level - Tier 1.",
    ["Quantitative", "Logical Reasoning", "Verbal English", "General Knowledge"],
    "from-emerald-500 to-cyan-500", "Building2",
    60, 25, "Medium", [QUANT, LOGICAL, VERBAL, GK_INDIA]),
  buildExam("ssc-chsl", "SSC CHSL", "SSC", "government",
    "Combined Higher Secondary Level (10+2) - aptitude + reasoning + English + GK.",
    ["Quantitative", "Logical Reasoning", "Verbal English", "General Knowledge"],
    "from-teal-500 to-cyan-500", "Building2",
    60, 22, "Medium", [QUANT, LOGICAL, VERBAL, GK_INDIA]),
  buildExam("ibps-po", "IBPS PO Prelims", "IBPS", "banking",
    "Probationary Officer prelims - English, reasoning, quantitative aptitude.",
    ["Verbal English", "Logical Reasoning", "Quantitative"],
    "from-blue-500 to-cyan-500", "Building2",
    60, 22, "Medium", [VERBAL, LOGICAL, QUANT]),
  buildExam("ibps-clerk", "IBPS Clerk Prelims", "IBPS", "banking",
    "Clerk prelims - aptitude + reasoning + English at speed.",
    ["Quantitative", "Logical Reasoning", "Verbal English"],
    "from-cyan-500 to-blue-500", "Building2",
    60, 22, "Medium", [QUANT, LOGICAL, VERBAL]),
  buildExam("sbi-po", "SBI PO Prelims", "SBI", "banking",
    "State Bank of India PO prelims - speed + accuracy heavy.",
    ["Verbal English", "Quantitative", "Logical Reasoning"],
    "from-blue-700 to-indigo-500", "Building2",
    60, 22, "Hard", [VERBAL, QUANT, LOGICAL]),
  buildExam("rbi-grade-b", "RBI Grade B (Phase 1)", "RBI", "banking",
    "RBI officer entry - banking awareness + reasoning + quant + English.",
    ["Banking", "General Knowledge", "Quantitative", "Logical Reasoning", "Verbal English"],
    "from-indigo-500 to-blue-700", "Building2",
    60, 24, "Hard", [BANKING, GK_INDIA, QUANT, LOGICAL, VERBAL]),
  buildExam("nabard-grade-a", "NABARD Grade-A", "NABARD", "banking",
    "Assistant Manager (Grade A) prelims with rural development + economy focus.",
    ["Banking", "General Knowledge", "Quantitative", "Logical Reasoning"],
    "from-emerald-500 to-teal-600", "Building2",
    90, 22, "Hard", [BANKING, GK_INDIA, QUANT, LOGICAL]),
  buildExam("rrb-ntpc", "RRB NTPC", "Indian Railways", "government",
    "Railway Recruitment Board Non-Technical Popular Categories - Stage 1.",
    ["General Knowledge", "Quantitative", "Logical Reasoning", "General Science"],
    "from-orange-500 to-red-500", "Building2",
    90, 24, "Medium", [GK_INDIA, QUANT, LOGICAL, SCIENCE]),
  buildExam("rrb-group-d", "RRB Group D", "Indian Railways", "government",
    "Railway Group D - mathematics, science, GK, reasoning.",
    ["Quantitative", "General Science", "General Knowledge", "Logical Reasoning"],
    "from-orange-600 to-amber-500", "Building2",
    90, 22, "Medium", [QUANT, SCIENCE, GK_INDIA, LOGICAL]),
  buildExam("ssc-gd", "SSC GD Constable", "SSC", "government",
    "General Duty Constable - reasoning, math, GK, English.",
    ["Logical Reasoning", "Quantitative", "General Knowledge", "Verbal English"],
    "from-rose-500 to-pink-500", "Building2",
    60, 22, "Easy", [LOGICAL, QUANT, GK_INDIA, VERBAL]),
  buildExam("nda", "NDA & NA", "UPSC", "defence",
    "National Defence Academy entrance - mathematics + GAT.",
    ["Quantitative", "General Knowledge", "General Science", "Verbal English"],
    "from-slate-500 to-blue-600", "Building2",
    150, 24, "Hard", [QUANT, GK_INDIA, SCIENCE, VERBAL]),
  buildExam("cds", "CDS Examination", "UPSC", "defence",
    "Combined Defence Services - English, GK, elementary mathematics.",
    ["Verbal English", "General Knowledge", "Quantitative"],
    "from-blue-700 to-slate-500", "Building2",
    120, 22, "Hard", [VERBAL, GK_INDIA, QUANT]),
  buildExam("cat", "CAT Mock", "IIMs", "mba",
    "Common Admission Test - VARC, DI/LR, Quant.",
    ["Verbal English", "Logical Reasoning", "Quantitative"],
    "from-purple-600 to-indigo-700", "Building2",
    120, 24, "Hard", [VERBAL, LOGICAL, QUANT]),
  buildExam("gate-cs", "GATE CSE Mock", "IISc/IITs", "engineering",
    "GATE Computer Science - DSA, OS, DBMS, networks, programming MCQ.",
    ["Programming", "Pseudocode", "Quantitative", "Logical Reasoning"],
    "from-indigo-500 to-fuchsia-600", "Building2",
    120, 24, "Hard", [CODING_MCQ, PSEUDO, QUANT, LOGICAL]),

  // Standalone topic mocks
  buildExam("gk-india-mix", "GK & Current Affairs (India)", null, "general",
    "Indian polity, history, geography, science and recent affairs.",
    ["General Knowledge"], "from-amber-500 to-orange-500", "BookOpen",
    25, 12, "Medium", [GK_INDIA]),
  buildExam("general-science", "General Science", null, "general",
    "Physics, chemistry, biology fundamentals.",
    ["General Science"], "from-teal-500 to-emerald-500", "Sigma",
    20, 6, "Easy", [SCIENCE]),
  buildExam("computer-awareness", "Computer Awareness", null, "general",
    "Operating systems, networking, hardware basics for banking + SSC.",
    ["Computer Awareness"], "from-fuchsia-500 to-violet-600", "Code2",
    20, 6, "Easy", [COMPUTER_AWARENESS]),
  buildExam("banking-awareness", "Banking Awareness", null, "banking",
    "RBI, monetary policy, schemes - for IBPS / SBI / NABARD.",
    ["Banking"], "from-blue-500 to-cyan-500", "Building2",
    20, 8, "Medium", [BANKING]),
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
  government: "Government Exams (UPSC / SSC / Railway)",
  banking: "Banking & Finance (IBPS / SBI / RBI)",
  defence: "Defence Services (NDA / CDS)",
  mba: "MBA Entrance (CAT / XAT)",
  engineering: "Engineering (GATE / ESE)",
  general: "General Awareness",
};
