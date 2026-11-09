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
  pts: number;
  combo: number;
  towerOn: boolean;
  campaign: string | null;
  poster: PosterData | null;
  evid: string[];
}

export type ViewScreen = 'title' | 'register' | 'map' | 'game';

export interface QuizItem {
  q: string;
  hint?: string;
  a: string;
  opts: string[];
}
