import type { BadgeId } from "@/content/types";

export const copy = {
  app: {
    wordmark: "Ken",
    tagline: "Become smarter every day",
    demoModeChip: "Demo mode",
  },
  home: {
    firstVisitLine: "One new thing to understand, every day.",
    startDiscovery: "Start discovery",
    museumHeading: "Your museum",
    thingsUnderstand: (count: number) =>
      count === 1 ? "1 thing you understand" : `${count} things you understand`,
    allCollectedLine: "You understand all 3. Come back tomorrow for more.",
    today: "Today",
    collectedToday: "Understood. A new one opens tomorrow.",
    watchAgain: "Watch it again",
    meta: (steps: number, questions: number) =>
      `${steps} steps, ${questions} questions`,
    countLine: (count: number, total: number) => `${count} of ${total} understood`,
    badgesHeading: "Badges",
    seeAll: "See all",
    prefsHeading: "Preferences",
    hapticsLabel: "Haptics",
    hapticsHint: "A short buzz on right answers",
    calmLabel: "Calm motion",
    calmHint: "Less movement, same lessons",
    darkLabel: "Dark mode",
    darkHint: "Easier on eyes at night",
    hinglishLabel: "Hinglish",
    hinglishHint: "Mix of Hindi and English in lessons",
    savedLine: "Progress is saved on this phone.",
    understood: "Understood",
    ready: "Ready",
    scoreLabel: "Test score",
    streakLabel: "Streak",
    streakDays: (count: number) => (count === 1 ? "1 day" : `${count} days`),
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
    hinglishToggle: "Hinglish",
    englishToggle: "English",
  },
  menu: {
    title: "Menu",
    profile: "Profile",
    guestLine: "Create a free local account to put your name on share cards.",
    editName: "Edit name",
    save: "Save",
    openMenu: "Open menu",
  },
  auth: {
    createTitle: "Create account",
    loginTitle: "Log in",
    localNote: "Saved only on this phone. Not a cloud account.",
    username: "Username",
    password: "Password",
    create: "Create account",
    login: "Log in",
    logout: "Log out",
    loginOrCreate: "Log in or create account",
    haveAccount: "Already have an account? Log in",
    needAccount: "New here? Create an account",
  },
  share: {
    title: "Share achievement",
    hint: "Save or share a card for Instagram or anywhere.",
    needAccount: "Log in so your name appears on the card.",
    download: "Save image",
    share: "Share",
    saved: "Image saved.",
    failed: "Could not share. Try Save image.",
    guestName: "Ken learner",
    learner: "Ken learner",
    shareAction: "Share",
  },
  test: {
    questionOf: (current: number, total: number) =>
      `Question ${current} of ${total}`,
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
    needPass: "You need at least 4 of 5 to add this to your museum.",
    almost: "So close. You need 4 of 5 to add this to your museum.",
    effortLine: (points: number) =>
      points === 1
        ? "+1 Ken point for the answers you got right."
        : `+${points} Ken points for the answers you got right.`,
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
    pointsLabel: "Ken points",
    total: (points: number) => `${points} in total`,
    discoveryLine: (n: number) => `+${n} for the discovery`,
    streakLine: (n: number, day: number) => `+${n} day ${day} streak`,
    revisitNote: "Revisit bonus for coming back today.",
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
      "close-call": "Close Call",
      "return-visitor": "Return Visitor",
    } satisfies Record<BadgeId, string>,
    newBadgeTitle: "New badge",
    descriptions: {
      "first-discovery": "Pass your first test with at least 4 of 5.",
      "perfect-scholar": "Get 5 of 5 on the first try.",
      "streak-3": "Pass a test 3 days in a row.",
      "curious-mind": "Understand all 3 things.",
      "close-call": "Score 3 of 5 on any test.",
      "return-visitor": "Revisit a thing you already understand.",
    } satisfies Record<BadgeId, string>,
    earnedOn: (date: string) => `Earned ${date}`,
    notYet: "Not yet",
    sheetTitle: "Points and badges",
    gotIt: "Nice",
  },
  wallet: {
    heading: "Demo reward wallet",
    unitsLabel: "Reward units",
    unitsHint: (per: number) => `${per} points = 1 reward unit in this demo`,
    unitsValue: (n: number) => `${n}`,
    about:
      "In a full Kenpath app, points can unlock real rewards after a server checks your score. This demo only saves points on your phone. It does not send rewards off the device.",
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
  catalogLine: (catalogNo: string, domainLabel: string) =>
    `${catalogNo}, ${domainLabel}`,
} as const;
