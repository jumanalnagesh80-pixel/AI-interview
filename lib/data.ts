// Mock data + question banks. In production these come from your DB / LLM.

export type Role =
  | "Software Engineer"
  | "Data Scientist"
  | "Product Manager"
  | "Frontend Developer"
  | "Backend Developer"
  | "ML Engineer"
  | "DevOps"
  | "Marketing"
  | "Sales";

export type Round = "HR" | "Technical" | "Behavioral" | "System Design" | "Coding";

export interface Question {
  id: string;
  round: Round;
  text: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  expected?: string[];
}

export const ROLES: Role[] = [
  "Software Engineer",
  "Data Scientist",
  "Product Manager",
  "Frontend Developer",
  "Backend Developer",
  "ML Engineer",
  "DevOps",
  "Marketing",
  "Sales",
];

export const QUESTIONS: Question[] = [
  // HR
  { id: "hr-1", round: "HR", difficulty: "Easy", text: "Tell me about yourself.", tags: ["intro", "self"], expected: ["concise pitch", "skills", "experience", "goal"] },
  { id: "hr-2", round: "HR", difficulty: "Easy", text: "Why do you want to work at this company?", tags: ["motivation"], expected: ["company research", "alignment", "specific reason"] },
  { id: "hr-3", round: "HR", difficulty: "Medium", text: "What is your biggest weakness, and how are you improving it?", tags: ["self-aware"], expected: ["honest weakness", "action plan", "progress"] },
  { id: "hr-4", round: "HR", difficulty: "Medium", text: "Where do you see yourself in 5 years?", tags: ["goals"], expected: ["growth plan", "role link"] },
  { id: "hr-5", round: "HR", difficulty: "Easy", text: "Why should we hire you?", tags: ["pitch"], expected: ["unique value", "fit"] },

  // Behavioral (STAR)
  { id: "bh-1", round: "Behavioral", difficulty: "Medium", text: "Describe a time you faced a difficult deadline. What did you do?", tags: ["STAR", "pressure"], expected: ["Situation", "Task", "Action", "Result"] },
  { id: "bh-2", round: "Behavioral", difficulty: "Medium", text: "Tell me about a conflict you had with a teammate. How did you resolve it?", tags: ["STAR", "conflict"], expected: ["empathy", "communication", "outcome"] },
  { id: "bh-3", round: "Behavioral", difficulty: "Hard", text: "Tell me about a time you failed. What did you learn?", tags: ["STAR", "growth"], expected: ["accountability", "lesson", "change"] },
  { id: "bh-4", round: "Behavioral", difficulty: "Medium", text: "Describe a project you led end-to-end.", tags: ["leadership"], expected: ["scope", "ownership", "result"] },

  // Technical (general)
  { id: "tech-1", round: "Technical", difficulty: "Easy", text: "Explain the difference between SQL and NoSQL databases.", tags: ["db"], expected: ["schema", "scaling", "use-cases"] },
  { id: "tech-2", round: "Technical", difficulty: "Medium", text: "What happens when you type a URL into the browser and press enter?", tags: ["web"], expected: ["DNS", "TCP", "HTTPS", "render"] },
  { id: "tech-3", round: "Technical", difficulty: "Medium", text: "Explain REST vs GraphQL. When would you pick which?", tags: ["api"], expected: ["over-fetch", "schema", "tooling"] },
  { id: "tech-4", round: "Technical", difficulty: "Hard", text: "How would you scale a service to handle 1M concurrent users?", tags: ["scale"], expected: ["LB", "cache", "db sharding", "queue"] },
  { id: "tech-5", round: "Technical", difficulty: "Medium", text: "Explain Big-O for binary search and quicksort.", tags: ["dsa"], expected: ["O(log n)", "O(n log n)", "worst case"] },

  // System Design
  { id: "sd-1", round: "System Design", difficulty: "Hard", text: "Design a URL shortener like bit.ly.", tags: ["design"], expected: ["hashing", "db", "redirect", "analytics"] },
  { id: "sd-2", round: "System Design", difficulty: "Hard", text: "Design a chat application like WhatsApp.", tags: ["design", "realtime"], expected: ["websocket", "fanout", "storage", "delivery"] },

  // Coding
  { id: "co-1", round: "Coding", difficulty: "Easy", text: "Write a function that reverses a string in-place.", tags: ["string"], expected: ["two pointer", "O(n)"] },
  { id: "co-2", round: "Coding", difficulty: "Medium", text: "Given an array, find the two numbers that add up to a target.", tags: ["array", "hashmap"], expected: ["hashmap", "complement", "O(n)"] },
  { id: "co-3", round: "Coding", difficulty: "Medium", text: "Detect whether a linked list has a cycle.", tags: ["linked-list"], expected: ["fast slow pointers", "Floyd", "O(1) space"] },
  { id: "co-4", round: "Coding", difficulty: "Hard", text: "Find the longest substring without repeating characters.", tags: ["string", "sliding-window"], expected: ["sliding window", "set", "two pointers"] },

  // More HR
  { id: "hr-6", round: "HR", difficulty: "Easy", text: "Tell me about yourself.", tags: ["intro"], expected: ["pitch", "experience", "goal"] },
  { id: "hr-7", round: "HR", difficulty: "Medium", text: "What motivates you at work?", tags: ["motivation"], expected: ["intrinsic", "growth", "impact"] },
  { id: "hr-8", round: "HR", difficulty: "Medium", text: "How do you handle criticism and feedback?", tags: ["feedback"], expected: ["openness", "action", "growth"] },
  { id: "hr-9", round: "HR", difficulty: "Medium", text: "Why are you leaving your current role?", tags: ["transition"], expected: ["positive framing", "growth", "no blame"] },
  { id: "hr-10", round: "HR", difficulty: "Easy", text: "What are your salary expectations?", tags: ["negotiation"], expected: ["research", "range", "flexibility"] },

  // More Behavioral (STAR)
  { id: "bh-5", round: "Behavioral", difficulty: "Medium", text: "Tell me about a time you went above and beyond for a customer or teammate.", tags: ["STAR", "ownership"], expected: ["Situation", "Action", "Result", "impact"] },
  { id: "bh-6", round: "Behavioral", difficulty: "Medium", text: "Describe a time you had to learn something new quickly.", tags: ["STAR", "learning"], expected: ["approach", "resources", "outcome"] },
  { id: "bh-7", round: "Behavioral", difficulty: "Hard", text: "Tell me about a time you disagreed with your manager.", tags: ["STAR", "backbone"], expected: ["respectful", "data", "resolution"] },
  { id: "bh-8", round: "Behavioral", difficulty: "Medium", text: "Give an example of a goal you set and how you achieved it.", tags: ["STAR", "goals"], expected: ["specific goal", "plan", "measurable result"] },

  // More Technical
  { id: "tech-6", round: "Technical", difficulty: "Easy", text: "What is the difference between a process and a thread?", tags: ["os"], expected: ["memory", "scheduling", "isolation"] },
  { id: "tech-7", round: "Technical", difficulty: "Medium", text: "Explain how a hash map works and when collisions happen.", tags: ["dsa"], expected: ["hashing", "buckets", "chaining", "O(1)"] },
  { id: "tech-8", round: "Technical", difficulty: "Medium", text: "What is database indexing and what are its trade-offs?", tags: ["db"], expected: ["B-tree", "read vs write", "storage"] },
  { id: "tech-9", round: "Technical", difficulty: "Medium", text: "Explain the difference between authentication and authorization.", tags: ["security"], expected: ["identity", "permissions", "tokens"] },
  { id: "tech-10", round: "Technical", difficulty: "Hard", text: "How does HTTPS keep a connection secure?", tags: ["security", "web"], expected: ["TLS handshake", "certificates", "encryption"] },

  // More System Design
  { id: "sd-3", round: "System Design", difficulty: "Hard", text: "Design a rate limiter for a public API.", tags: ["design"], expected: ["token bucket", "sliding window", "redis"] },
  { id: "sd-4", round: "System Design", difficulty: "Hard", text: "Design a news feed like Instagram or Twitter.", tags: ["design", "scale"], expected: ["fanout", "cache", "ranking", "pagination"] },
  { id: "sd-5", round: "System Design", difficulty: "Hard", text: "Design a parking-lot management system.", tags: ["design", "oop"], expected: ["entities", "pricing", "availability"] },
];

export const COMPANIES = [
  {
    id: "google",
    name: "Google",
    color: "from-blue-500 to-emerald-500",
    style: "Algorithmic depth, system design rigor, structured behavioral (Googleyness).",
    rounds: ["Coding x2", "System Design", "Behavioral", "Hiring Committee"],
  },
  {
    id: "amazon",
    name: "Amazon",
    color: "from-orange-500 to-yellow-500",
    style: "Heavy STAR-based behavioral on 16 Leadership Principles + coding + design.",
    rounds: ["Online Assessment", "Coding", "LP Behavioral", "Bar Raiser"],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    color: "from-sky-400 to-blue-600",
    style: "Balanced coding + design, focus on collaboration and growth mindset.",
    rounds: ["Coding", "System Design", "Behavioral", "AS-Appropriate"],
  },
  {
    id: "meta",
    name: "Meta",
    color: "from-indigo-500 to-purple-500",
    style: "Fast-paced coding, product sense, behavioral focused on impact.",
    rounds: ["Coding x2", "Design", "Behavioral"],
  },
  {
    id: "tcs",
    name: "TCS",
    color: "from-blue-600 to-cyan-500",
    style: "Aptitude + technical fundamentals + managerial + HR.",
    rounds: ["Aptitude", "Technical", "Managerial", "HR"],
  },
  {
    id: "infosys",
    name: "Infosys",
    color: "from-cyan-500 to-teal-500",
    style: "DSA basics, OOPs, DBMS, OS + HR with communication weight.",
    rounds: ["Online Test", "Technical", "HR"],
  },
  {
    id: "wipro",
    name: "Wipro",
    color: "from-violet-500 to-fuchsia-500",
    style: "Aptitude, written English, technical + HR for service roles.",
    rounds: ["WILP", "Technical", "HR"],
  },
  {
    id: "accenture",
    name: "Accenture",
    color: "from-purple-500 to-pink-500",
    style: "Cognitive + technical assessment, communication, situational.",
    rounds: ["Cognitive", "Technical", "Communication", "HR"],
  },
];

export const COMPETITORS = [
  {
    name: "Other AI Interview Sites",
    realFaceToFace: false,
    voiceTone: "limited",
    bodyLanguage: false,
    companySimulators: "few",
    starCoach: false,
    realtimeScoring: "delayed",
    pricing: "$30+/mo",
  },
  {
    name: "AceTerview (this app)",
    realFaceToFace: true,
    voiceTone: "advanced",
    bodyLanguage: true,
    companySimulators: "8+",
    starCoach: true,
    realtimeScoring: "live",
    pricing: "Free tier + $9 Pro",
  },
];

export interface Session {
  id: string;
  date: string;
  type: Round;
  role: Role;
  score: number;
  duration: number; // minutes
  strengths: string[];
  weaknesses: string[];
}

export const RECENT_SESSIONS: Session[] = [
  {
    id: "s1",
    date: "2026-05-28",
    type: "Technical",
    role: "Software Engineer",
    score: 82,
    duration: 28,
    strengths: ["Clear structure", "Good complexity analysis"],
    weaknesses: ["Skipped edge cases", "Filler words"],
  },
  {
    id: "s2",
    date: "2026-05-26",
    type: "Behavioral",
    role: "Software Engineer",
    score: 74,
    duration: 22,
    strengths: ["Honest reflection"],
    weaknesses: ["Weak Result step in STAR"],
  },
  {
    id: "s3",
    date: "2026-05-24",
    type: "HR",
    role: "Software Engineer",
    score: 88,
    duration: 14,
    strengths: ["Confident pace", "Strong opener"],
    weaknesses: ["Generic 'why this company'"],
  },
  {
    id: "s4",
    date: "2026-05-22",
    type: "System Design",
    role: "Backend Developer",
    score: 69,
    duration: 38,
    strengths: ["Identified trade-offs"],
    weaknesses: ["No capacity estimation", "Missed caching layer"],
  },
];

export const SKILL_RADAR = [
  { label: "Communication", value: 78 },
  { label: "Technical Depth", value: 82 },
  { label: "Problem Solving", value: 74 },
  { label: "Confidence", value: 68 },
  { label: "Structure", value: 80 },
  { label: "STAR Usage", value: 62 },
];

export const TESTIMONIALS = [
  {
    name: "Priya R.",
    role: "Hired @ Google",
    text: "The face-to-face AI felt eerily real. The body language feedback fixed my eye contact issues in two weeks.",
  },
  {
    name: "Arjun S.",
    role: "Hired @ Amazon",
    text: "STAR coach + Bar Raiser simulator was the difference. Walked into Amazon loops fully calibrated.",
  },
  {
    name: "Mei L.",
    role: "Hired @ Stripe",
    text: "Best mock interview tool I've used. Real-time scoring beats the static reports from competitors.",
  },
  {
    name: "Karan P.",
    role: "Hired @ TCS Digital",
    text: "Aptitude + HR simulator nailed the actual TCS pattern. Got placed in my first attempt.",
  },
];
