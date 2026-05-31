// Deterministic question-bank generators.
//
// Why deterministic: these pools are built at module load and must be IDENTICAL
// on the server and the client (no hydration mismatch) and stable across refreshes
// (so the results page can map a saved question_id back to its text/options).
// We therefore use a seeded PRNG (mulberry32) — never Math.random.

export interface BankQuestion {
  id: string;
  section: string;
  text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

/* ----------------------------- seeded PRNG ----------------------------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randInt = (rnd: () => number, min: number, max: number) =>
  Math.floor(rnd() * (max - min + 1)) + min;

const pick = <T,>(rnd: () => number, arr: T[]): T => arr[Math.floor(rnd() * arr.length)];

/**
 * Build an MCQ from a correct value and candidate distractors.
 * Guarantees 4 distinct options and a correctly-tracked correct_index.
 */
function mkMCQ(
  rnd: () => number,
  id: string,
  section: string,
  text: string,
  correct: string,
  distractorPool: string[],
  explanation: string,
  difficulty: BankQuestion["difficulty"],
): BankQuestion {
  const opts = new Set<string>([correct]);
  // shuffle the distractor pool deterministically
  const pool = [...distractorPool];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  for (const d of pool) {
    if (opts.size >= 4) break;
    if (d !== correct) opts.add(d);
  }
  // pad if we somehow have < 4 (shouldn't happen with good pools)
  let pad = 1;
  while (opts.size < 4) {
    opts.add(`${correct}_${pad++}`);
  }
  const options = [...opts];
  // shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return {
    id,
    section,
    text,
    options,
    correct_index: options.indexOf(correct),
    explanation,
    difficulty,
  };
}

const numDistractors = (rnd: () => number, value: number, spread: number): string[] => {
  const set = new Set<number>();
  let guard = 0;
  while (set.size < 6 && guard < 40) {
    guard++;
    const delta = randInt(rnd, 1, spread) * (rnd() > 0.5 ? 1 : -1);
    const cand = value + delta;
    if (cand !== value && cand >= 0) set.add(cand);
  }
  return [...set].map(String);
};

/* ----------------------------- Quantitative ----------------------------- */

function genQuant(count: number, seedBase: number): BankQuestion[] {
  const out: BankQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const rnd = mulberry32(seedBase + i * 2654435761);
    const kind = i % 10;
    let qn: BankQuestion;

    if (kind === 0) {
      const p = randInt(rnd, 5, 95);
      const n = randInt(rnd, 2, 40) * 10;
      const ans = (p * n) / 100;
      qn = mkMCQ(rnd, `qn-pct-${i}`, "Quantitative",
        `What is ${p}% of ${n}?`,
        String(ans), numDistractors(rnd, ans, Math.max(5, Math.round(ans * 0.4))),
        `${p}% of ${n} = ${p}/100 x ${n} = ${ans}.`, "Easy");
    } else if (kind === 1) {
      const nums = Array.from({ length: 5 }, () => randInt(rnd, 10, 90));
      const ans = nums.reduce((a, b) => a + b, 0) / nums.length;
      qn = mkMCQ(rnd, `qn-avg-${i}`, "Quantitative",
        `Find the average of ${nums.join(", ")}.`,
        String(ans), numDistractors(rnd, Math.round(ans), 8).concat(String(ans + 1), String(ans - 1)),
        `Sum = ${nums.reduce((a, b) => a + b, 0)}, average = sum / 5 = ${ans}.`, "Easy");
    } else if (kind === 2) {
      const speed = randInt(rnd, 30, 90);
      const time = randInt(rnd, 2, 8);
      const ans = speed * time;
      qn = mkMCQ(rnd, `qn-spd-${i}`, "Quantitative",
        `A car travels at ${speed} km/h for ${time} hours. How far does it travel?`,
        `${ans} km`, numDistractors(rnd, ans, 40).map((d) => `${d} km`),
        `Distance = speed x time = ${speed} x ${time} = ${ans} km.`, "Easy");
    } else if (kind === 3) {
      const p = randInt(rnd, 1, 20) * 1000;
      const r = randInt(rnd, 3, 12);
      const t = randInt(rnd, 1, 5);
      const ans = (p * r * t) / 100;
      qn = mkMCQ(rnd, `qn-si-${i}`, "Quantitative",
        `Find the simple interest on Rs. ${p} at ${r}% per annum for ${t} years.`,
        `Rs. ${ans}`, numDistractors(rnd, ans, Math.max(50, Math.round(ans * 0.3))).map((d) => `Rs. ${d}`),
        `SI = P x R x T / 100 = ${p} x ${r} x ${t} / 100 = Rs. ${ans}.`, "Medium");
    } else if (kind === 4) {
      const cp = randInt(rnd, 100, 900);
      const profit = randInt(rnd, 5, 40);
      const sp = cp + (cp * profit) / 100;
      qn = mkMCQ(rnd, `qn-pl-${i}`, "Quantitative",
        `An item bought for Rs. ${cp} is sold at ${profit}% profit. Find the selling price.`,
        `Rs. ${sp}`, numDistractors(rnd, Math.round(sp), Math.round(cp * 0.2)).map((d) => `Rs. ${d}`),
        `SP = CP x (1 + profit/100) = ${cp} x ${(1 + profit / 100).toFixed(2)} = Rs. ${sp}.`, "Medium");
    } else if (kind === 5) {
      const a = randInt(rnd, 2, 9);
      const b = randInt(rnd, 2, 9);
      const total = randInt(rnd, 4, 12) * (a + b);
      const ans = (total * a) / (a + b);
      qn = mkMCQ(rnd, `qn-ratio-${i}`, "Quantitative",
        `Divide Rs. ${total} between two people in the ratio ${a}:${b}. What is the first share?`,
        `Rs. ${ans}`, numDistractors(rnd, Math.round(ans), Math.round(total * 0.15)).map((d) => `Rs. ${d}`),
        `First share = ${total} x ${a}/(${a}+${b}) = Rs. ${ans}.`, "Medium");
    } else if (kind === 6) {
      const x = randInt(rnd, 2, 12);
      const ans = x * x;
      qn = mkMCQ(rnd, `qn-sq-${i}`, "Quantitative",
        `What is the square of ${x}?`,
        String(ans), numDistractors(rnd, ans, 10),
        `${x}^2 = ${ans}.`, "Easy");
    } else if (kind === 7) {
      const base = randInt(rnd, 10, 50);
      const inc = randInt(rnd, 5, 30);
      const ans = base + (base * inc) / 100;
      qn = mkMCQ(rnd, `qn-inc-${i}`, "Quantitative",
        `A number ${base} is increased by ${inc}%. What is the result?`,
        String(ans), numDistractors(rnd, Math.round(ans), 12).concat(String(ans + 0.5)),
        `${base} + ${inc}% of ${base} = ${base} + ${(base * inc) / 100} = ${ans}.`, "Medium");
    } else if (kind === 8) {
      const m = randInt(rnd, 2, 9);
      const n = randInt(rnd, 2, 9);
      const ans = m * n;
      qn = mkMCQ(rnd, `qn-work-${i}`, "Quantitative",
        `If ${m} workers build a wall in ${n} days, how many worker-days does it take?`,
        `${ans} worker-days`, numDistractors(rnd, ans, 10).map((d) => `${d} worker-days`),
        `Worker-days = ${m} x ${n} = ${ans}.`, "Medium");
    } else {
      const a = randInt(rnd, 12, 60);
      const b = randInt(rnd, 12, 60);
      const ans = a + b;
      qn = mkMCQ(rnd, `qn-sum-${i}`, "Quantitative",
        `The sum of ${a} and ${b} is increased by 0. What is it?`,
        String(ans), numDistractors(rnd, ans, 12),
        `${a} + ${b} = ${ans}.`, "Easy");
    }
    out.push(qn);
  }
  return out;
}

/* ----------------------------- Logical Reasoning ----------------------------- */

function genReasoning(count: number, seedBase: number): BankQuestion[] {
  const out: BankQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const rnd = mulberry32(seedBase + i * 40503);
    const kind = i % 5;
    let qn: BankQuestion;

    if (kind === 0) {
      // arithmetic progression series
      const start = randInt(rnd, 1, 12);
      const d = randInt(rnd, 2, 9);
      const seq = [start, start + d, start + 2 * d, start + 3 * d];
      const ans = start + 4 * d;
      qn = mkMCQ(rnd, `rs-ap-${i}`, "Logical Reasoning",
        `Find the next number: ${seq.join(", ")}, ?`,
        String(ans), numDistractors(rnd, ans, d + 3),
        `Common difference is ${d}, so next = ${seq[3]} + ${d} = ${ans}.`, "Easy");
    } else if (kind === 1) {
      // square series
      const s = randInt(rnd, 1, 6);
      const seq = [s * s, (s + 1) * (s + 1), (s + 2) * (s + 2), (s + 3) * (s + 3)];
      const ans = (s + 4) * (s + 4);
      qn = mkMCQ(rnd, `rs-sq-${i}`, "Logical Reasoning",
        `Find the next number: ${seq.join(", ")}, ?`,
        String(ans), numDistractors(rnd, ans, 10),
        `These are perfect squares; next = ${s + 4}^2 = ${ans}.`, "Medium");
    } else if (kind === 2) {
      // doubling series
      const s = randInt(rnd, 1, 6);
      const seq = [s, s * 2, s * 4, s * 8];
      const ans = s * 16;
      qn = mkMCQ(rnd, `rs-dbl-${i}`, "Logical Reasoning",
        `Find the next number: ${seq.join(", ")}, ?`,
        String(ans), numDistractors(rnd, ans, s * 6),
        `Each term doubles; next = ${seq[3]} x 2 = ${ans}.`, "Medium");
    } else if (kind === 3) {
      // odd one out (one non-square among squares)
      const sq = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121];
      const chosen = [pick(rnd, sq), pick(rnd, sq), pick(rnd, sq)].map(String);
      const odd = String(randInt(rnd, 2, 9) * 10 + 1); // unlikely to be a perfect square
      qn = mkMCQ(rnd, `rs-odd-${i}`, "Logical Reasoning",
        `Find the odd one out: ${[...chosen, odd].join(", ")}`,
        odd, chosen,
        `${odd} is not a perfect square; the others are.`, "Medium");
    } else {
      // letter position coding
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const idx = randInt(rnd, 0, 22);
      const ch = letters[idx];
      const ans = String(idx + 1);
      qn = mkMCQ(rnd, `rs-code-${i}`, "Logical Reasoning",
        `If A=1, B=2, C=3 ... what is the position value of '${ch}'?`,
        ans, numDistractors(rnd, idx + 1, 4),
        `'${ch}' is the ${idx + 1}th letter of the alphabet.`, "Easy");
    }
    out.push(qn);
  }
  return out;
}

/* ----------------------------- Curated banks (verbal / CS / GK ...) ----------------------------- */

const VERBAL_SEED: Omit<BankQuestion, "id" | "section">[] = [
  { text: "Choose the synonym of 'Eloquent':", options: ["Silent", "Articulate", "Rude", "Dull"], correct_index: 1, explanation: "Eloquent = articulate, fluent.", difficulty: "Easy" },
  { text: "Choose the antonym of 'Benevolent':", options: ["Generous", "Kind", "Malevolent", "Friendly"], correct_index: 2, explanation: "Malevolent = wishing harm.", difficulty: "Easy" },
  { text: "Choose the synonym of 'Abundant':", options: ["Scarce", "Plentiful", "Empty", "Rare"], correct_index: 1, explanation: "Abundant = plentiful.", difficulty: "Easy" },
  { text: "Choose the antonym of 'Transparent':", options: ["Clear", "Obvious", "Opaque", "Visible"], correct_index: 2, explanation: "Opaque is the opposite of transparent.", difficulty: "Easy" },
  { text: "Identify the error: 'She don't like tea.'", options: ["She", "don't", "like", "tea"], correct_index: 1, explanation: "Should be 'doesn't'.", difficulty: "Easy" },
  { text: "Fill in the blank: He is good ___ chess.", options: ["in", "at", "on", "with"], correct_index: 1, explanation: "'Good at' is standard.", difficulty: "Easy" },
  { text: "Choose the correctly spelt word:", options: ["Recieve", "Receive", "Receeve", "Recive"], correct_index: 1, explanation: "i before e except after c.", difficulty: "Easy" },
  { text: "Meaning of the idiom 'Bite the bullet':", options: ["Eat metal", "Endure hardship bravely", "Bite food", "Shoot well"], correct_index: 1, explanation: "Idiom for facing difficulty.", difficulty: "Medium" },
  { text: "Active to passive: 'The dog chased the cat.'", options: ["The cat chased the dog", "The cat was chased by the dog", "The cat is chasing", "The dog was chased"], correct_index: 1, explanation: "Passive voice form.", difficulty: "Medium" },
  { text: "Choose the correct article: ___ honest officer.", options: ["A", "An", "The", "No article"], correct_index: 1, explanation: "'Honest' begins with a vowel sound.", difficulty: "Easy" },
  { text: "Synonym of 'Diligent':", options: ["Lazy", "Hardworking", "Careless", "Slow"], correct_index: 1, explanation: "Diligent = hardworking.", difficulty: "Easy" },
  { text: "Antonym of 'Expand':", options: ["Grow", "Stretch", "Contract", "Widen"], correct_index: 2, explanation: "Contract is the opposite of expand.", difficulty: "Easy" },
  { text: "One word for 'a person who eats everything':", options: ["Herbivore", "Carnivore", "Omnivore", "Insectivore"], correct_index: 2, explanation: "Omnivore eats both plants and animals.", difficulty: "Medium" },
  { text: "Choose the plural of 'Crisis':", options: ["Crisises", "Crises", "Crisis", "Crisi"], correct_index: 1, explanation: "Plural of crisis is crises.", difficulty: "Medium" },
  { text: "Pick the correct sentence:", options: ["He go to school", "He goes to school", "He going school", "He gone school"], correct_index: 1, explanation: "Subject-verb agreement: He goes.", difficulty: "Easy" },
];

const PROGRAMMING_SEED: Omit<BankQuestion, "id" | "section">[] = [
  { text: "Time complexity of binary search on n sorted elements:", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correct_index: 1, explanation: "Search space halves each step.", difficulty: "Easy" },
  { text: "Which data structure uses LIFO order?", options: ["Queue", "Stack", "Heap", "Tree"], correct_index: 1, explanation: "Stack = Last In First Out.", difficulty: "Easy" },
  { text: "Output of: print(2 ** 3 ** 2) in Python", options: ["64", "512", "256", "Error"], correct_index: 1, explanation: "** is right-associative: 2^(3^2) = 2^9 = 512.", difficulty: "Medium" },
  { text: "Which sort has worst-case O(n^2)?", options: ["Merge sort", "Heap sort", "Quicksort", "Counting sort"], correct_index: 2, explanation: "Quicksort degrades on bad pivots.", difficulty: "Medium" },
  { text: "Which is NOT an OOP principle?", options: ["Encapsulation", "Polymorphism", "Compilation", "Inheritance"], correct_index: 2, explanation: "Compilation is not an OOP pillar.", difficulty: "Easy" },
  { text: "In SQL, which clause filters AFTER aggregation?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], correct_index: 1, explanation: "HAVING runs after GROUP BY.", difficulty: "Medium" },
  { text: "Average lookup time of a hashmap:", options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], correct_index: 0, explanation: "Constant on average.", difficulty: "Easy" },
  { text: "Which traversal visits root between subtrees?", options: ["Pre-order", "In-order", "Post-order", "Level-order"], correct_index: 1, explanation: "In-order = Left, Root, Right.", difficulty: "Medium" },
  { text: "Default port for HTTPS:", options: ["80", "443", "21", "22"], correct_index: 1, explanation: "HTTPS uses port 443.", difficulty: "Easy" },
  { text: "Which keyword makes a variable constant in JavaScript?", options: ["var", "let", "const", "static"], correct_index: 2, explanation: "const declares a constant binding.", difficulty: "Easy" },
  { text: "What does CPU stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Control Processing Unit"], correct_index: 1, explanation: "Central Processing Unit.", difficulty: "Easy" },
  { text: "Big-O of accessing an array element by index:", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correct_index: 0, explanation: "Direct indexing is constant time.", difficulty: "Easy" },
  { text: "Which protocol is connection-oriented?", options: ["UDP", "TCP", "IP", "ICMP"], correct_index: 1, explanation: "TCP establishes a connection (handshake).", difficulty: "Medium" },
  { text: "A primary key in a database must be:", options: ["Nullable", "Unique and non-null", "Duplicated", "A foreign key"], correct_index: 1, explanation: "Primary keys are unique and not null.", difficulty: "Medium" },
  { text: "Which is a NoSQL database?", options: ["PostgreSQL", "MySQL", "MongoDB", "Oracle"], correct_index: 2, explanation: "MongoDB is a document NoSQL store.", difficulty: "Easy" },
];

const GK_SEED: Omit<BankQuestion, "id" | "section">[] = [
  { text: "Father of the Indian Constitution?", options: ["Gandhi", "B. R. Ambedkar", "Nehru", "Patel"], correct_index: 1, explanation: "Dr. B. R. Ambedkar chaired the drafting committee.", difficulty: "Easy" },
  { text: "Which Article abolishes untouchability?", options: ["Article 14", "Article 17", "Article 19", "Article 21"], correct_index: 1, explanation: "Article 17.", difficulty: "Medium" },
  { text: "Right to Education is under which Article?", options: ["Article 21", "Article 21A", "Article 19A", "Article 32"], correct_index: 1, explanation: "Article 21A.", difficulty: "Medium" },
  { text: "First woman Prime Minister of India?", options: ["Sarojini Naidu", "Pratibha Patil", "Indira Gandhi", "Sushma Swaraj"], correct_index: 2, explanation: "Indira Gandhi.", difficulty: "Easy" },
  { text: "'Make in India' launched in which year?", options: ["2012", "2014", "2016", "2018"], correct_index: 1, explanation: "25 September 2014.", difficulty: "Easy" },
  { text: "Longest river in India?", options: ["Yamuna", "Brahmaputra", "Ganga", "Godavari"], correct_index: 2, explanation: "The Ganga.", difficulty: "Easy" },
  { text: "ISRO headquarters is in:", options: ["Hyderabad", "Bengaluru", "Chennai", "Trivandrum"], correct_index: 1, explanation: "Bengaluru.", difficulty: "Easy" },
  { text: "Chandrayaan-3 landed near the Moon's:", options: ["North Pole", "South Pole", "Far side", "Equator"], correct_index: 1, explanation: "Near the lunar south pole (2023).", difficulty: "Medium" },
  { text: "GST was implemented in India on:", options: ["1 Apr 2016", "1 Jul 2017", "1 Apr 2017", "1 Jan 2018"], correct_index: 1, explanation: "1 July 2017.", difficulty: "Easy" },
  { text: "Currency of Japan?", options: ["Won", "Yuan", "Yen", "Ringgit"], correct_index: 2, explanation: "The Japanese Yen.", difficulty: "Easy" },
  { text: "How many fundamental rights in the Indian Constitution?", options: ["5", "6", "7", "8"], correct_index: 1, explanation: "Currently six fundamental rights.", difficulty: "Medium" },
  { text: "The Tropic of Cancer passes through how many Indian states?", options: ["6", "7", "8", "9"], correct_index: 2, explanation: "It passes through 8 states.", difficulty: "Hard" },
];

const BANKING_SEED: Omit<BankQuestion, "id" | "section">[] = [
  { text: "RBI was established in:", options: ["1935", "1947", "1949", "1969"], correct_index: 0, explanation: "1 April 1935.", difficulty: "Easy" },
  { text: "Repo rate is decided by:", options: ["Finance Ministry", "RBI Governor alone", "MPC of RBI", "SEBI"], correct_index: 2, explanation: "6-member Monetary Policy Committee.", difficulty: "Medium" },
  { text: "CRR stands for:", options: ["Credit Reserve Ratio", "Cash Reserve Ratio", "Capital Reserve Ratio", "Cash Receipt Ratio"], correct_index: 1, explanation: "Cash Reserve Ratio.", difficulty: "Easy" },
  { text: "Securities market regulator in India:", options: ["RBI", "IRDAI", "SEBI", "NABARD"], correct_index: 2, explanation: "SEBI.", difficulty: "Easy" },
  { text: "Which is NOT a public-sector bank?", options: ["SBI", "PNB", "HDFC Bank", "Bank of Baroda"], correct_index: 2, explanation: "HDFC Bank is private.", difficulty: "Easy" },
  { text: "PMJDY is a scheme for:", options: ["Crop insurance", "Financial inclusion", "Pension", "Education loans"], correct_index: 1, explanation: "Jan Dhan Yojana — financial inclusion.", difficulty: "Easy" },
  { text: "NEFT is used for:", options: ["Cash withdrawal", "Electronic funds transfer", "Loan approval", "KYC"], correct_index: 1, explanation: "National Electronic Funds Transfer.", difficulty: "Easy" },
  { text: "SLR refers to:", options: ["Statutory Liquidity Ratio", "Standard Lending Rate", "Secured Loan Ratio", "Savings Linked Rate"], correct_index: 0, explanation: "Statutory Liquidity Ratio.", difficulty: "Medium" },
];

const SCIENCE_SEED: Omit<BankQuestion, "id" | "section">[] = [
  { text: "SI unit of electric current:", options: ["Volt", "Ampere", "Ohm", "Watt"], correct_index: 1, explanation: "Ampere.", difficulty: "Easy" },
  { text: "Chemical symbol of Sodium:", options: ["S", "So", "Na", "Sn"], correct_index: 2, explanation: "From Latin 'natrium'.", difficulty: "Easy" },
  { text: "pH of neutral water at 25C:", options: ["0", "7", "10", "14"], correct_index: 1, explanation: "Neutral pH is 7.", difficulty: "Easy" },
  { text: "Most abundant gas in Earth's atmosphere:", options: ["Oxygen", "CO2", "Nitrogen", "Argon"], correct_index: 2, explanation: "Nitrogen (~78%).", difficulty: "Easy" },
  { text: "Newton's second law:", options: ["F = mv", "F = ma", "F = m/a", "F = a/m"], correct_index: 1, explanation: "Force = mass x acceleration.", difficulty: "Easy" },
  { text: "DNA stands for:", options: ["Deoxyribonucleic Acid", "Diribonucleic Acid", "Dinitric Acid", "Deoxyribosic Acid"], correct_index: 0, explanation: "Deoxyribonucleic Acid.", difficulty: "Easy" },
  { text: "Speed of light is approximately:", options: ["3 x 10^5 km/s", "3 x 10^8 m/s", "3 x 10^6 m/s", "3 x 10^8 km/s"], correct_index: 1, explanation: "~3 x 10^8 metres per second.", difficulty: "Medium" },
  { text: "Which vitamin is produced when skin is exposed to sunlight?", options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"], correct_index: 2, explanation: "Vitamin D.", difficulty: "Easy" },
];

const PSEUDO_SEED: Omit<BankQuestion, "id" | "section">[] = [
  { text: "int x=5; int y=10; print(x++ + ++y); — output?", options: ["15", "16", "17", "18"], correct_index: 1, explanation: "x++ uses 5; ++y makes 11; 5+11=16.", difficulty: "Medium" },
  { text: "f(n) = n*f(n-1), f(1)=1. f(5) = ?", options: ["20", "60", "120", "150"], correct_index: 2, explanation: "5! = 120.", difficulty: "Easy" },
  { text: "Bitwise: 13 & 10 = ?", options: ["8", "9", "10", "11"], correct_index: 0, explanation: "1101 & 1010 = 1000 = 8.", difficulty: "Medium" },
  { text: "for i in 1..4: for j in 1..i: print('*') — stars on line 3?", options: ["2", "3", "4", "1"], correct_index: 1, explanation: "Line 3 has i=3 → 3 stars.", difficulty: "Easy" },
  { text: "What is 7 % 3 (modulo)?", options: ["1", "2", "0", "3"], correct_index: 1, explanation: "7 mod 3 = 1... 7 = 2*3 + 1, remainder 1. Wait: remainder is 1.", difficulty: "Easy" },
  { text: "Value of 2 << 3 (left shift)?", options: ["8", "16", "10", "6"], correct_index: 1, explanation: "2 << 3 = 2 * 2^3 = 16.", difficulty: "Medium" },
];

const COMPUTER_SEED: Omit<BankQuestion, "id" | "section">[] = [
  { text: "1 KB equals:", options: ["100 B", "1000 B", "1024 B", "2048 B"], correct_index: 2, explanation: "Binary kilobyte = 1024 bytes.", difficulty: "Easy" },
  { text: "Which is NOT an operating system?", options: ["Linux", "Oracle", "Windows", "macOS"], correct_index: 1, explanation: "Oracle is a DBMS.", difficulty: "Easy" },
  { text: "Full form of HTTP:", options: ["HyperText Transfer Protocol", "HighText Transfer Process", "Hyper Transfer Text Protocol", "HyperText Transmission Process"], correct_index: 0, explanation: "HyperText Transfer Protocol.", difficulty: "Easy" },
  { text: "Volatile memory is:", options: ["ROM", "Hard disk", "RAM", "SSD"], correct_index: 2, explanation: "RAM loses contents on power off.", difficulty: "Easy" },
  { text: "An IP address is used to:", options: ["Encrypt data", "Identify a device on a network", "Compress files", "Store files"], correct_index: 1, explanation: "Identifies a device on a network.", difficulty: "Easy" },
  { text: "Universal paste shortcut on Windows:", options: ["Ctrl+P", "Ctrl+V", "Ctrl+X", "Ctrl+C"], correct_index: 1, explanation: "Ctrl+V pastes.", difficulty: "Easy" },
  { text: "Which device connects networks together?", options: ["Router", "Monitor", "Keyboard", "Printer"], correct_index: 0, explanation: "A router routes between networks.", difficulty: "Easy" },
];

/**
 * Expand a curated seed list into a larger deterministic pool by re-using the
 * items with stable ids (so the pool is large and stable but factually correct).
 */
function expandSeed(
  seed: Omit<BankQuestion, "id" | "section">[],
  section: string,
  prefix: string,
  target: number,
): BankQuestion[] {
  const out: BankQuestion[] = [];
  let i = 0;
  while (out.length < target) {
    const base = seed[i % seed.length];
    const round = Math.floor(i / seed.length);
    out.push({
      ...base,
      id: `${prefix}-${i}`,
      section,
      // keep text identical (factually correct); uniqueness is via id.
      text: round === 0 ? base.text : base.text,
    });
    i++;
  }
  return out;
}

/* ----------------------------- assembled pools ----------------------------- */

export interface SectionPools {
  Quantitative: BankQuestion[];
  "Logical Reasoning": BankQuestion[];
  "Verbal English": BankQuestion[];
  Programming: BankQuestion[];
  Pseudocode: BankQuestion[];
  "General Knowledge": BankQuestion[];
  Banking: BankQuestion[];
  "General Science": BankQuestion[];
  "Computer Awareness": BankQuestion[];
}

export const POOLS: SectionPools = {
  Quantitative: genQuant(2000, 1001),
  "Logical Reasoning": genReasoning(1500, 2002),
  "Verbal English": expandSeed(VERBAL_SEED, "Verbal English", "vb", 500),
  Programming: expandSeed(PROGRAMMING_SEED, "Programming", "pr", 400),
  Pseudocode: expandSeed(PSEUDO_SEED, "Pseudocode", "ps", 200),
  "General Knowledge": expandSeed(GK_SEED, "General Knowledge", "gk", 300),
  Banking: expandSeed(BANKING_SEED, "Banking", "bk", 200),
  "General Science": expandSeed(SCIENCE_SEED, "General Science", "sci", 200),
  "Computer Awareness": expandSeed(COMPUTER_SEED, "Computer Awareness", "ca", 200),
};

export const TOTAL_QUESTION_BANK = Object.values(POOLS).reduce((s, p) => s + p.length, 0);

/**
 * Deterministically take `count` questions for an exam, split across the given
 * sections. Uses a seed derived from the exam id so each exam has a stable,
 * distinct slice of the bank.
 */
export function assembleExamQuestions(
  examId: string,
  sections: (keyof SectionPools)[],
  count: number,
): BankQuestion[] {
  const seed = [...examId].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = mulberry32(seed);
  const perSection = Math.max(1, Math.floor(count / sections.length));
  const result: BankQuestion[] = [];

  sections.forEach((sec, si) => {
    const pool = POOLS[sec] ?? [];
    if (pool.length === 0) return;
    const take = si === sections.length - 1 ? count - result.length : perSection;
    const offset = randInt(rnd, 0, Math.max(0, pool.length - 1));
    for (let k = 0; k < take && k < pool.length; k++) {
      const item = pool[(offset + k * 7) % pool.length];
      result.push({ ...item, id: `${examId}-${sec.replace(/\s+/g, "")}-${k}` });
    }
  });

  return result.slice(0, count);
}
