// Mock leaderboard rows for offline mode. Mirrors the demo users seeded in the backend.

export interface LeaderboardRow {
  rank: number;
  user_id: number;
  name: string;
  avatar_url: string | null;
  xp: number;
  sessions: number;
  avg_score: number;
  best_score: number;
}

export const MOCK_LEADERBOARD: LeaderboardRow[] = [
  { rank: 1, user_id: 1, name: "Priya R.", avatar_url: null, xp: 2840, sessions: 7, avg_score: 86, best_score: 94 },
  { rank: 2, user_id: 2, name: "Arjun S.", avatar_url: null, xp: 2610, sessions: 9, avg_score: 84, best_score: 92 },
  { rank: 3, user_id: 3, name: "Mei L.", avatar_url: null, xp: 2480, sessions: 8, avg_score: 82, best_score: 91 },
  { rank: 4, user_id: 4, name: "Karan P.", avatar_url: null, xp: 2210, sessions: 6, avg_score: 79, best_score: 88 },
  { rank: 5, user_id: 5, name: "Diego M.", avatar_url: null, xp: 1980, sessions: 5, avg_score: 78, best_score: 86 },
  { rank: 6, user_id: 6, name: "Sara K.", avatar_url: null, xp: 1850, sessions: 7, avg_score: 76, best_score: 84 },
  { rank: 7, user_id: 7, name: "Ananya B.", avatar_url: null, xp: 1720, sessions: 8, avg_score: 75, best_score: 83 },
  { rank: 8, user_id: 8, name: "Ravi T.", avatar_url: null, xp: 1640, sessions: 4, avg_score: 73, best_score: 80 },
  { rank: 9, user_id: 9, name: "Lin C.", avatar_url: null, xp: 1530, sessions: 6, avg_score: 72, best_score: 81 },
  { rank: 10, user_id: 10, name: "Noor A.", avatar_url: null, xp: 1410, sessions: 5, avg_score: 70, best_score: 78 },
  { rank: 11, user_id: 11, name: "Kenji T.", avatar_url: null, xp: 1280, sessions: 4, avg_score: 68, best_score: 75 },
  { rank: 12, user_id: 12, name: "Maya I.", avatar_url: null, xp: 1150, sessions: 3, avg_score: 66, best_score: 73 },
];
