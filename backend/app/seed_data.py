"""Seed data: competitive exams + question bank.

This is intentionally rich so the UI feels real out of the box.
"""

# ---- Interview question bank (mirrors lib/data.ts on the frontend) ----
INTERVIEW_QUESTIONS = [
    # HR
    {"id": "hr-1", "round": "HR", "difficulty": "Easy", "text": "Tell me about yourself.", "tags": ["intro", "self"], "expected": ["concise pitch", "skills", "experience", "goal"]},
    {"id": "hr-2", "round": "HR", "difficulty": "Easy", "text": "Why do you want to work at this company?", "tags": ["motivation"], "expected": ["company research", "alignment", "specific reason"]},
    {"id": "hr-3", "round": "HR", "difficulty": "Medium", "text": "What is your biggest weakness, and how are you improving it?", "tags": ["self-aware"], "expected": ["honest weakness", "action plan", "progress"]},
    {"id": "hr-4", "round": "HR", "difficulty": "Medium", "text": "Where do you see yourself in 5 years?", "tags": ["goals"], "expected": ["growth plan", "role link"]},
    {"id": "hr-5", "round": "HR", "difficulty": "Easy", "text": "Why should we hire you?", "tags": ["pitch"], "expected": ["unique value", "fit"]},
    # Behavioral
    {"id": "bh-1", "round": "Behavioral", "difficulty": "Medium", "text": "Describe a time you faced a difficult deadline. What did you do?", "tags": ["STAR", "pressure"], "expected": ["Situation", "Task", "Action", "Result"]},
    {"id": "bh-2", "round": "Behavioral", "difficulty": "Medium", "text": "Tell me about a conflict you had with a teammate. How did you resolve it?", "tags": ["STAR", "conflict"], "expected": ["empathy", "communication", "outcome"]},
    {"id": "bh-3", "round": "Behavioral", "difficulty": "Hard", "text": "Tell me about a time you failed. What did you learn?", "tags": ["STAR", "growth"], "expected": ["accountability", "lesson", "change"]},
    {"id": "bh-4", "round": "Behavioral", "difficulty": "Medium", "text": "Describe a project you led end-to-end.", "tags": ["leadership"], "expected": ["scope", "ownership", "result"]},
    # Technical
    {"id": "tech-1", "round": "Technical", "difficulty": "Easy", "text": "Explain the difference between SQL and NoSQL databases.", "tags": ["db"], "expected": ["schema", "scaling", "use-cases"]},
    {"id": "tech-2", "round": "Technical", "difficulty": "Medium", "text": "What happens when you type a URL into the browser and press enter?", "tags": ["web"], "expected": ["DNS", "TCP", "HTTPS", "render"]},
    {"id": "tech-3", "round": "Technical", "difficulty": "Medium", "text": "Explain REST vs GraphQL. When would you pick which?", "tags": ["api"], "expected": ["over-fetch", "schema", "tooling"]},
    {"id": "tech-4", "round": "Technical", "difficulty": "Hard", "text": "How would you scale a service to handle 1M concurrent users?", "tags": ["scale"], "expected": ["LB", "cache", "db sharding", "queue"]},
    {"id": "tech-5", "round": "Technical", "difficulty": "Medium", "text": "Explain Big-O for binary search and quicksort.", "tags": ["dsa"], "expected": ["O(log n)", "O(n log n)", "worst case"]},
    # System Design
    {"id": "sd-1", "round": "System Design", "difficulty": "Hard", "text": "Design a URL shortener like bit.ly.", "tags": ["design"], "expected": ["hashing", "db", "redirect", "analytics"]},
    {"id": "sd-2", "round": "System Design", "difficulty": "Hard", "text": "Design a chat application like WhatsApp.", "tags": ["design", "realtime"], "expected": ["websocket", "fanout", "storage", "delivery"]},
    # Coding
    {"id": "co-1", "round": "Coding", "difficulty": "Easy", "text": "Write a function that reverses a string in-place.", "tags": ["string"], "expected": ["two pointer", "O(n)"]},
    {"id": "co-2", "round": "Coding", "difficulty": "Medium", "text": "Find the first non-repeating character in a string.", "tags": ["string", "hashmap"], "expected": ["hashmap", "single pass"]},
]


# ---- Competitive exams + MCQs ----

def _q(qid, section, text, options, correct_index, explanation="", difficulty="Medium"):
    return {
        "id": qid, "section": section, "text": text, "options": options,
        "correct_index": correct_index, "explanation": explanation, "difficulty": difficulty,
    }


# Reusable banks ------------------------------------------------------------
QUANT = [
    _q("q-quant-1", "Quantitative",
       "If a train travels 360 km in 4 hours, what is its speed in m/s?",
       ["20 m/s", "25 m/s", "30 m/s", "15 m/s"], 1,
       "360 km/h = 90 km/h = 90*1000/3600 = 25 m/s.", "Easy"),
    _q("q-quant-2", "Quantitative",
       "Compound interest on Rs. 10,000 at 10% per annum for 2 years (compounded annually) is:",
       ["Rs. 2000", "Rs. 2100", "Rs. 2110", "Rs. 2210"], 1,
       "10000 * (1.1^2 - 1) = 10000 * 0.21 = 2100.", "Medium"),
    _q("q-quant-3", "Quantitative",
       "The average of first 50 natural numbers is:",
       ["25", "25.5", "26", "24.5"], 1,
       "Sum = n(n+1)/2 = 1275. Avg = 1275/50 = 25.5.", "Easy"),
    _q("q-quant-4", "Quantitative",
       "A man can row 6 km/h in still water. River flows at 2 km/h. Time taken to row 16 km downstream and back:",
       ["6 hours", "5 hours", "4 hours", "8 hours"], 0,
       "Down=8 km/h, Up=4 km/h. Time=16/8 + 16/4 = 2+4 = 6.", "Medium"),
    _q("q-quant-5", "Quantitative",
       "If 20% of a number is 60, what is 75% of the same number?",
       ["180", "200", "225", "250"], 2,
       "Number = 60/0.2 = 300. 75% of 300 = 225.", "Easy"),
    _q("q-quant-6", "Quantitative",
       "Probability of getting a sum of 7 when two dice are rolled:",
       ["1/6", "1/9", "5/36", "7/36"], 0,
       "There are 6 favorable outcomes out of 36 -> 1/6.", "Medium"),
    _q("q-quant-7", "Quantitative",
       "A and B can finish a job in 12 days. A alone can finish it in 20 days. How long would B take alone?",
       ["20 days", "30 days", "25 days", "15 days"], 1,
       "1/12 - 1/20 = (5-3)/60 = 1/30. So B alone takes 30 days.", "Medium"),
    _q("q-quant-8", "Quantitative",
       "What is 15% of 240?",
       ["30", "32", "36", "40"], 2,
       "0.15 * 240 = 36.", "Easy"),
]

LOGICAL = [
    _q("q-log-1", "Logical Reasoning",
       "Find the missing number: 2, 6, 12, 20, 30, ?",
       ["40", "42", "44", "46"], 1,
       "Differences are 4, 6, 8, 10, 12 -> 30+12 = 42.", "Easy"),
    _q("q-log-2", "Logical Reasoning",
       "If 'CAT' is coded as '3-1-20', then 'DOG' is:",
       ["4-15-7", "4-12-7", "5-15-7", "4-15-8"], 0,
       "D=4, O=15, G=7.", "Easy"),
    _q("q-log-3", "Logical Reasoning",
       "In a row of 40 students facing North, Rahul is 12th from the left. What is his position from the right?",
       ["28", "29", "30", "27"], 1,
       "40 - 12 + 1 = 29.", "Easy"),
    _q("q-log-4", "Logical Reasoning",
       "Statements: All cats are dogs. All dogs are mammals. Conclusion?",
       ["All cats are mammals", "Some mammals are not cats", "Both A and B", "None"], 2,
       "Both follow logically.", "Medium"),
    _q("q-log-5", "Logical Reasoning",
       "Find the odd one out: 121, 144, 169, 200, 225",
       ["121", "169", "200", "225"], 2,
       "All others are perfect squares; 200 is not.", "Easy"),
    _q("q-log-6", "Logical Reasoning",
       "Pointing to a man, Asha says 'He is the son of my mother's only son.' How is the man related to Asha?",
       ["Brother", "Son", "Cousin", "Nephew"], 1,
       "Mother's only son = Asha (if female speaker has no brother) or her brother. Standard answer: Son.", "Medium"),
    _q("q-log-7", "Logical Reasoning",
       "Complete the series: A, C, F, J, ?",
       ["O", "M", "N", "L"], 0,
       "Skip 1, 2, 3, 4 -> +5 -> O.", "Medium"),
    _q("q-log-8", "Logical Reasoning",
       "If MONDAY is coded as ONODBZ, how is FRIDAY coded?",
       ["GSJEBZ", "HSJEBZ", "GTJEBZ", "GSKFBZ"], 0,
       "Each letter +1: F->G, R->S, I->J, D->E, A->B, Y->Z.", "Hard"),
]

VERBAL = [
    _q("q-ver-1", "Verbal English",
       "Choose the synonym of 'Eloquent':",
       ["Silent", "Articulate", "Rude", "Dull"], 1,
       "Eloquent = articulate, fluent in speech.", "Easy"),
    _q("q-ver-2", "Verbal English",
       "Choose the antonym of 'Benevolent':",
       ["Generous", "Kind", "Malevolent", "Friendly"], 2,
       "Malevolent means wishing harm.", "Easy"),
    _q("q-ver-3", "Verbal English",
       "Identify the error: 'She don't like coffee.'",
       ["She", "don't", "like", "coffee"], 1,
       "Should be 'doesn't'.", "Easy"),
    _q("q-ver-4", "Verbal English",
       "Fill in the blank: He is good ___ mathematics.",
       ["in", "at", "on", "with"], 1,
       "'Good at' is the standard collocation.", "Easy"),
    _q("q-ver-5", "Verbal English",
       "Choose the correctly spelt word:",
       ["Recieve", "Receive", "Receeve", "Recive"], 1,
       "Mnemonic: i before e except after c.", "Easy"),
    _q("q-ver-6", "Verbal English",
       "Pick the best meaning of the idiom 'Bite the bullet':",
       ["To eat metal", "Endure something painful courageously", "To bite a snack", "To shoot accurately"], 1,
       "Idiom for facing hardship.", "Medium"),
    _q("q-ver-7", "Verbal English",
       "Active to passive: 'The cat chased the mouse.'",
       ["The mouse chased the cat", "The mouse was chased by the cat", "The mouse was chasing", "The cat was chased"], 1,
       "Passive form.", "Easy"),
    _q("q-ver-8", "Verbal English",
       "Choose the correct article: ___ honest man is respected.",
       ["A", "An", "The", "No article"], 1,
       "'Honest' starts with vowel sound -> 'an'.", "Easy"),
]

CODING_MCQ = [
    _q("q-cod-1", "Programming",
       "Time complexity of binary search on a sorted array of size n:",
       ["O(n)", "O(log n)", "O(n log n)", "O(1)"], 1,
       "Halving the search space each step -> log n.", "Easy"),
    _q("q-cod-2", "Programming",
       "Which data structure uses LIFO order?",
       ["Queue", "Stack", "Heap", "Tree"], 1,
       "Last In First Out = Stack.", "Easy"),
    _q("q-cod-3", "Programming",
       "Output of: print(2 ** 3 ** 2) in Python",
       ["64", "512", "256", "Error"], 1,
       "** is right-associative -> 2 ** (3**2) = 2**9 = 512.", "Medium"),
    _q("q-cod-4", "Programming",
       "Which sorting algorithm has worst case O(n^2)?",
       ["Merge sort", "Heap sort", "Quicksort", "All of these"], 2,
       "Quicksort can degrade to O(n^2) on bad pivots.", "Medium"),
    _q("q-cod-5", "Programming",
       "Which of these is NOT an OOP principle?",
       ["Encapsulation", "Polymorphism", "Compilation", "Inheritance"], 2,
       "Compilation is not an OOP principle.", "Easy"),
    _q("q-cod-6", "Programming",
       "In SQL, which clause filters AFTER aggregation?",
       ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], 1,
       "HAVING runs after GROUP BY.", "Medium"),
    _q("q-cod-7", "Programming",
       "Hashmap average lookup time complexity:",
       ["O(1)", "O(log n)", "O(n)", "O(n^2)"], 0,
       "Constant time on average.", "Easy"),
    _q("q-cod-8", "Programming",
       "Which traversal visits root between left and right children?",
       ["Pre-order", "In-order", "Post-order", "Level-order"], 1,
       "In-order = Left, Root, Right.", "Medium"),
]

PSEUDO = [
    _q("q-ps-1", "Pseudocode",
       "What does this print?\nint x = 5; int y = 10; print(x++ + ++y);",
       ["15", "16", "17", "18"], 1,
       "x++ uses 5 then x=6; ++y makes y=11. Sum = 5+11 = 16.", "Medium"),
    _q("q-ps-2", "Pseudocode",
       "for(i=1; i<=4; i++) { for(j=1;j<=i;j++) print('*'); print(newline); }\nWhat is printed in line 3?",
       ["**", "***", "****", "*"], 1,
       "Line 3 has i=3, so 3 stars.", "Easy"),
    _q("q-ps-3", "Pseudocode",
       "If function f(n) returns n*f(n-1) with f(1)=1, what is f(5)?",
       ["20", "60", "120", "150"], 2,
       "Factorial of 5 = 120.", "Easy"),
    _q("q-ps-4", "Pseudocode",
       "Output of bitwise: 13 & 10",
       ["8", "9", "10", "11"], 0,
       "1101 & 1010 = 1000 = 8.", "Medium"),
]


def make_exam(exam_id, name, company, category, description, sections, color, icon,
              duration_min, total_questions, difficulty, sources):
    """Build an exam dict with prefixed copies of question banks."""
    questions = []
    counter = 0
    for source_qs in sources:
        for q in source_qs:
            counter += 1
            questions.append({
                **q,
                "id": f"{exam_id}-{counter}",
                "section": q["section"],
            })
            if len(questions) >= total_questions:
                break
        if len(questions) >= total_questions:
            break
    return {
        "id": exam_id, "name": name, "company": company, "category": category,
        "description": description, "duration_min": duration_min,
        "total_questions": len(questions), "difficulty": difficulty,
        "sections": sections, "color": color, "icon": icon,
        "questions": questions,
    }


EXAMS = [
    make_exam(
        "tcs-nqt", "TCS NQT", "TCS", "placement",
        "TCS National Qualifier Test pattern: aptitude, reasoning, verbal, programming.",
        ["Quantitative", "Logical Reasoning", "Verbal English", "Programming"],
        "from-blue-600 to-cyan-500", "Building2",
        90, 24, "Medium",
        [QUANT, LOGICAL, VERBAL, CODING_MCQ],
    ),
    make_exam(
        "infosys-spp", "Infosys SP / DSE", "Infosys", "placement",
        "Infosys Specialist Programmer / Digital Specialist Engineer pattern.",
        ["Quantitative", "Logical Reasoning", "Verbal English", "Pseudocode"],
        "from-cyan-500 to-teal-500", "Building2",
        95, 20, "Medium",
        [QUANT, LOGICAL, VERBAL, PSEUDO],
    ),
    make_exam(
        "wipro-nlth", "Wipro Elite NLTH", "Wipro", "placement",
        "Wipro National Talent Hunt: aptitude + English + coding fundamentals.",
        ["Quantitative", "Verbal English", "Logical Reasoning"],
        "from-violet-500 to-fuchsia-500", "Building2",
        60, 18, "Medium",
        [QUANT, VERBAL, LOGICAL],
    ),
    make_exam(
        "capgemini-pi", "Capgemini Placement", "Capgemini", "placement",
        "Capgemini Pseudocode + Aptitude + English pattern.",
        ["Pseudocode", "Quantitative", "Verbal English"],
        "from-blue-500 to-indigo-500", "Building2",
        60, 18, "Hard",
        [PSEUDO, QUANT, VERBAL],
    ),
    make_exam(
        "cognizant-genc", "Cognizant GenC", "Cognizant", "placement",
        "Cognizant GenC: aptitude, reasoning, verbal, programming MCQs.",
        ["Quantitative", "Logical Reasoning", "Verbal English", "Programming"],
        "from-sky-500 to-blue-600", "Building2",
        75, 22, "Medium",
        [QUANT, LOGICAL, VERBAL, CODING_MCQ],
    ),
    make_exam(
        "accenture-cog", "Accenture Cognitive", "Accenture", "placement",
        "Accenture cognitive + technical assessment pattern.",
        ["Quantitative", "Logical Reasoning", "Verbal English", "Programming"],
        "from-purple-500 to-pink-500", "Building2",
        90, 24, "Medium",
        [QUANT, LOGICAL, VERBAL, CODING_MCQ],
    ),
    make_exam(
        "aptitude-mix", "Quantitative Aptitude", None, "aptitude",
        "Mixed aptitude practice: percentages, ratios, time-speed, probability.",
        ["Quantitative"],
        "from-emerald-500 to-teal-500", "Sigma",
        30, 8, "Medium",
        [QUANT],
    ),
    make_exam(
        "logical-mix", "Logical Reasoning", None, "reasoning",
        "Series, coding-decoding, syllogisms, blood relations.",
        ["Logical Reasoning"],
        "from-amber-500 to-orange-500", "GitBranch",
        30, 8, "Medium",
        [LOGICAL],
    ),
    make_exam(
        "verbal-mix", "Verbal English", None, "verbal",
        "Synonyms, antonyms, grammar, idioms, sentence correction.",
        ["Verbal English"],
        "from-pink-500 to-rose-500", "BookOpen",
        25, 8, "Easy",
        [VERBAL],
    ),
    make_exam(
        "coding-mcq", "Coding & DSA MCQ", None, "coding",
        "Data structures, algorithms, complexity, OOP, SQL fundamentals.",
        ["Programming"],
        "from-fuchsia-500 to-purple-600", "Code2",
        30, 8, "Medium",
        [CODING_MCQ],
    ),
]


# ---- Mock leaderboard users (for first-load demo before real users sign up) ----
DEMO_USERS = [
    {"email": "priya.r@aceterview.demo", "name": "Priya R.", "xp": 2840, "streak_days": 21, "plan": "pro"},
    {"email": "arjun.s@aceterview.demo", "name": "Arjun S.", "xp": 2610, "streak_days": 18, "plan": "pro"},
    {"email": "mei.l@aceterview.demo", "name": "Mei L.", "xp": 2480, "streak_days": 15, "plan": "pro"},
    {"email": "karan.p@aceterview.demo", "name": "Karan P.", "xp": 2210, "streak_days": 12, "plan": "free"},
    {"email": "diego.m@aceterview.demo", "name": "Diego M.", "xp": 1980, "streak_days": 9, "plan": "free"},
    {"email": "sara.k@aceterview.demo", "name": "Sara K.", "xp": 1850, "streak_days": 7, "plan": "pro"},
    {"email": "ananya.b@aceterview.demo", "name": "Ananya B.", "xp": 1720, "streak_days": 11, "plan": "pro"},
    {"email": "ravi.t@aceterview.demo", "name": "Ravi T.", "xp": 1640, "streak_days": 6, "plan": "free"},
    {"email": "lin.c@aceterview.demo", "name": "Lin C.", "xp": 1530, "streak_days": 5, "plan": "free"},
    {"email": "noor.a@aceterview.demo", "name": "Noor A.", "xp": 1410, "streak_days": 8, "plan": "free"},
]
