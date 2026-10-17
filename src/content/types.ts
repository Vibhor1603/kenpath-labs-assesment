export type DiscoveryId = "fridge" | "leaf" | "heart";
export type DayNumber = 1 | 2 | 3;
export type BadgeId = "first-discovery" | "perfect-scholar" | "streak-3" | "curious-mind";

export type Label = {
  partId: string;
  text: string;
  anchor: { x: number; y: number };
  side: "left" | "right" | "top" | "bottom";
  isPartName?: boolean;
};

export type PartPose = {
  x?: number;
  y?: number;
  rotate?: number;
  scale?: number;
  opacity?: number;
  scaleX?: number;
  skewY?: number;
};

export type Step = {
  id: string;
  title: string;
  body: string;
  more?: string;
  partFocus: string[];
  labels: Label[];
  pose: Record<string, PartPose>;
};

export type QuizQuestion = {
  id: string;
  q: string;
  options: string[];
  answer: number;
  why: string;
};

export type Discovery = {
  id: DiscoveryId;
  domain: "technology" | "nature" | "body";
  day: DayNumber;
  catalogNo: string;
  title: string;
  shortName: string;
  parts: string[];
  steps: Step[];
  quiz: QuizQuestion[];
};

export type Streak = {
  count: number;
  lastPerfectDate: string | null;
};

export type CollectedEntry = {
  perfectAt: string;
  firstTry: boolean;
};

export type Badge = {
  id: BadgeId;
  earnedAt: string;
};

export type Progress = {
  version: 1;
  firstVisitDate: string;
  maxUnlockedDay: DayNumber;
  points: number;
  streak: Streak;
  attempts: Partial<Record<DiscoveryId, number>>;
  collected: Partial<Record<DiscoveryId, CollectedEntry>>;
  badges: Badge[];
  seenBadges: BadgeId[];
  settings: { haptics: boolean; calmMotion: boolean };
  introDismissed: boolean;
};

export type ShuffledQuestion = {
  id: string;
  q: string;
  options: string[];
  answer: number;
  why: string;
  originalOptionIndexes: number[];
};

export type TestOutcome = {
  isPerfect: boolean;
  pointsEarned: number;
  newBadges: Badge[];
  streakBefore: number;
  streakAfter: number;
  isFirstCollect: boolean;
  attemptNumber: number;
};

export type ArtComponentProps = {
  idPrefix?: string;
  variant?: "full" | "trophy";
};
