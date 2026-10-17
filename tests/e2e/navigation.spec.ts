import {
  answerAll,
  correctAnswers,
  expect,
  readProgress,
  test,
  wrongAnswers,
} from "./fixtures";

test("3 of 5 fails; 4 of 5 collects", async ({ page }) => {
  // Seed blank day-1 progress before the document boots so React cannot overwrite it.
  await page.addInitScript(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;
    localStorage.setItem(
      "kenpath-museum-v2",
      JSON.stringify({
        version: 1,
        firstVisitDate: key,
        maxUnlockedDay: 1,
        points: 0,
        spentPoints: 0,
        redemptions: [],
        streak: { count: 0, lastPerfectDate: null },
        attempts: {},
        collected: {},
        revisitClaimed: {},
        badges: [],
        seenBadges: [],
        settings: { haptics: true, calmMotion: false, darkMode: false, hinglish: false },
        introDismissed: true,
      }),
    );
  });
  await page.goto("/?view=test&d=fridge");

  const near = correctAnswers("fridge", 1);
  near[3] = wrongAnswers("fridge", 1)[3];
  near[4] = wrongAnswers("fridge", 1)[4];
  await answerAll(page, near);
  await expect(page).toHaveURL(/view=result&d=fridge/);
  await expect(page.getByText(/need 4 of 5/i)).toBeVisible();

  await page.getByRole("button", { name: "Try again" }).click();
  const pass = correctAnswers("fridge", 2);
  pass[4] = wrongAnswers("fridge", 2)[4]; // 4 of 5
  await answerAll(page, pass);
  await expect(page).toHaveURL(/view=reward&d=fridge/);
  await expect.poll(async () => (await readProgress(page))?.collected?.fridge?.score).toBe(4);
});

test("demo mode deep link still opens locked lessons", async ({ page }) => {
  await page.goto("/?demo=1&view=lesson&d=leaf&step=1");
  await expect(page).toHaveURL(/view=lesson&d=leaf&step=1/);
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
});

test("browser back from a lesson returns home", async ({ page }) => {
  await page.goto("/?fresh=1");
  await page.goto("/");
  await page.getByRole("button", { name: "Start discovery", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.goBack();
  await expect(page).toHaveURL("/");
});
