import type { BadgeId } from "@/content/types";

export const copy = {
  app: {
    wordmark: "How Things Work",
    demoModeChip: "Demo mode",
  },
  home: {
    firstVisitLine: "A new thing to understand, every day.",
    startDiscovery: "Start discovery",
    museumHeading: "Your museum",
    thingsUnderstand: (count: number) =>
      count === 1 ? "1 thing you understand" : `${count} things you understand`,
    allCollectedLine:
      "You understand all 3. In the full app, a new one arrives tomorrow.",
    today: "Today",
    collectedToday: "Understood. A new one opens tomorrow.",
    watchAgain: "Watch it again",
    meta: (steps: number, questions: number) => `${steps} steps, ${questions} questions`,
    countLine: (count: number, total: number) => `${count} of ${total} understood`,
    badgesHeading: "Badges",
    seeAll: "See all",
    prefsHeading: "Preferences",
    hapticsLabel: "Haptics",
    hapticsHint: "A short buzz on right answers",
    calmLabel: "Calm motion",
    calmHint: "Less movement, same lessons",
    savedLine: "Progress is saved on this phone.",
    understood: "Understood",
    ready: "Ready",
  },
  lesson: {
    next: "Next",
    back: "Back",
    replay: "Replay",
    takeTheTest: "Take the test",
    learnMore: "Learn more",
    sourcesLink: "Sources",
    pause: "Pause",
    play: "Play",
    close: "Close lesson",
    swipeHint: "Swipe the picture to move between steps",
    sourcesHeading: "Where this comes from",
    stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
  },
  test: {
    questionOf: (current: number, total: number) => `Question ${current} of ${total}`,
    next: "Next",
    seeResult: "See result",
    close: "Leave the test",
  },
  quiz: {
    correct: ["Yes. That is it.", "Right. You saw how it works."],
    wrong: "Not this one. The right answer has a check.",
  },
  result: {
    scoreLine: (correct: number, total: number) => `You got ${correct} of ${total}.`,
    needPerfect: "You need 5 of 5 to earn points.",
    almost: "So close. You need 5 of 5 for points.",
    tryAgain: "Try again",
    watchLessonAgain: "Watch the lesson again",
    shuffleNote: "Each try shuffles the questions and answers.",
  },
  reward: {
    stamp: "Understood",
    understand: {
      fridge: "You understand the refrigerator now.",
      leaf: "You understand the leaf now.",
      heart: "You understand the heart now.",
    },
    pointsLabel: "Kenpath Points",
    total: (points: number) => `${points} in total`,
    continue: "Continue",
    skipHint: "Tap to skip",
  },
  streak: {
    kept: (day: number) => `Day ${day} in a row. Your sprout grew a leaf.`,
    broken: "Start a new streak today.",
  },
  locked: {
    opensTomorrow: "Opens tomorrow.",
    opensInDays: (days: number) => `Opens in ${days} days`,
  },
  offline: {
    toast: "You are offline. Your progress is saved on this phone.",
  },
  storage: {
    toast: "Progress cannot be saved in this browser mode.",
  },
  errors: {
    boundary: "Something went wrong. Your progress is safe.",
    goHome: "Go home",
  },
  shelf: {
    placard: (catalogNo: string, shortName: string, domainLabel: string) =>
      `${catalogNo}, ${shortName}, ${domainLabel}`,
  },
  domains: {
    technology: "Technology",
    nature: "Nature",
    body: "Body",
  } as const,
  badges: {
    names: {
      "first-discovery": "First Discovery",
      "perfect-scholar": "Perfect Scholar",
      "streak-3": "3-Day Streak",
      "curious-mind": "Curious Mind",
    } satisfies Record<BadgeId, string>,
    newBadgeTitle: "New badge",
    descriptions: {
      "first-discovery": "Pass your first test with 5 of 5.",
      "perfect-scholar": "Get 5 of 5 on the first try.",
      "streak-3": "Pass a test 3 days in a row.",
      "curious-mind": "Understand all 3 things.",
    } satisfies Record<BadgeId, string>,
    earnedOn: (date: string) => `Earned ${date}`,
    notYet: "Not yet",
    sheetTitle: "Your badges",
    gotIt: "Nice",
  },
  easterEggs: {
    fridgeDoor: "Shh. You are letting heat in.",
    heartTapHint: "Tap to the beat",
    heartTapCaption: "About 60 to 100 beats a minute at rest.",
  },
  heart: {
    loopColorNote:
      "We color blood without oxygen purple to tell the loops apart. Real blood is always red.",
  },
  aria: {
    stepAnnounce: (stepIndex: number, stepTotal: number, title: string) =>
      `Step ${stepIndex} of ${stepTotal}. ${title}.`,
  },
  catalogLine: (catalogNo: string, domainLabel: string) => `${catalogNo}, ${domainLabel}`,
} as const;
