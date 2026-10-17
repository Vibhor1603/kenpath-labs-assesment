export type DiscoveryId = "fridge" | "leaf" | "heart";
export type DayNumber = 1 | 2 | 3;
export type BadgeId =
  | "first-discovery"
  | "perfect-scholar"
  | "streak-3"
  | "curious-mind"
  | "close-call"
  | "return-visitor";

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

/** Where the stage camera looks for a step, in art (viewBox) coordinates. */
export type Camera = { x: number; y: number; scale: number };

export type StepLocale = {
  title: string;
  body: string;
  beats?: string[];
  more?: string;
};

export type Step = {
  id: string;
  title: string;
  /** Plain explanation. Prefer short clear sentences over clever phrases. */
  body: string;
  /** Optional short lines under the body (what happens / what to notice). */
  beats?: string[];
  more?: string;
  /** Hinglish alternate for ESL readers (same science, mixed Hindi-English). */
  hinglish?: StepLocale;
  partFocus: string[];
  labels: Label[];
  pose: Record<string, PartPose>;
  camera?: Camera;
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
  /** Best quiz score (0-5) for this discovery. Shown as fire marks. */
  score: number;
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
  /** Local date key of the last revisit bonus claimed per discovery. */
  revisitClaimed: Partial<Record<DiscoveryId, string>>;
  badges: Badge[];
  seenBadges: BadgeId[];
  settings: {
    haptics: boolean;
    calmMotion: boolean;
    darkMode: boolean;
    hinglish: boolean;
  };
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

export type PointsBreakdown = {
  discovery: number;
  streak: number;
  effort: number;
  revisit: number;
};

export type TestOutcome = {
  isPerfect: boolean;
  /** True when score is at least PASS_SCORE (4 of 5). */
  isPassing: boolean;
  pointsEarned: number;
  breakdown: PointsBreakdown;
  newBadges: Badge[];
  streakBefore: number;
  streakAfter: number;
  isFirstCollect: boolean;
  attemptNumber: number;
  /** Passing revisit of an already collected exhibit (day bonus). */
  isRevisit: boolean;
  score: number;
};

/** Props for the small exterior art used on Home, the collection and the reward. */
export type ExhibitArtProps = {
  idPrefix: string;
  tone?: "full" | "silhouette";
  className?: string;
};

/** Props for the full lesson art. Every part stays mounted; steps change targets only. */
export type LessonArtProps = {
  idPrefix: string;
  stepIndex: number;
  focus: string[];
  pose: Record<string, PartPose>;
  playing: boolean;
  reduced: boolean;
  lite: boolean;
};

export type LegendItem = { color: string; label: string };

export type LessonArtModule = {
  default: import("react").ComponentType<LessonArtProps>;
  viewBox: { w: number; h: number };
  legend?: readonly LegendItem[];
  /** Zero-based step indexes that show the legend. */
  legendSteps?: readonly number[];
  /** Short notes shown under the stage, by zero-based step index. */
  notes?: Readonly<Record<number, string>>;
};
