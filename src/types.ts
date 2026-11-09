export type AvatarType = 'a' | 'b' | 'c' | 'd';

export type SpeakerId =
  | 'pori'
  | 'thermo'
  | 'danbi'
  | 'luka'
  | 'me'
  | 'friend'
  | 'shadow'
  | 'factory'
  | 'squirrel'
  | 'police'
  | 'grandma'
  | 'janitor'
  | 'villager'
  | 'rep'
  | 'repGreen'
  | 'repBlue'
  | 'repYellow'
  | 'repPink'
  | 'narr';

export type MoodType = 'happy' | 'joy' | 'sad' | 'scared' | 'smile' | 'grin' | 'serious' | 'alert' | 'o';

export interface LeaderboardEntry {
  id?: string;
  name: string;
  code: string;
  score: number;
  stars: number;
  date: string;
  avatar?: AvatarType;
  isFirebase?: boolean;
}

export interface PosterData {
  t: string;
  s: string;
  p: string;
}

export interface GameState {
  name: string;
  code: string;
  avatar: AvatarType;
  unlocked: number;
  done: Record<number, boolean>;
  blocks: number;
  clues: Record<string, string>;
  seen: Record<string, string>;
  gear: string[];
  stars: Record<number, number>;
  scores: Record<number, number>;
  pledge: string[];
  sound: boolean;
  cur: number;
  mist: number;
  /** 이번 작전에서 비상 얼음을 받은 횟수 */
  emerg?: number;
  pts: number;
  combo: number;
  towerOn: boolean;
  campaign: string | null;
  poster: PosterData | null;
  evid: string[];
  /** 선생님용 '모든 작전 열기'를 쓴 기록 (명예의 전당에 올리지 않음) */
  teacher?: boolean;
}

export type ViewScreen = 'title' | 'register' | 'map' | 'game';

export interface QuizItem {
  q: string;
  hint?: string;
  a: string;
  opts: string[];
}
