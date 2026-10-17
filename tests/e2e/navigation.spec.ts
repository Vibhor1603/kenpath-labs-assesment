import {
  answerAll,
  correctAnswers,
  expect,
  readProgress,
  test,
  wrongAnswers,
} from "./fixtures";

test("a wrong answer earns nothing and Try again reshuffles", async ({ page }) => {
  await page.goto("/?view=test&d=fridge");
  await expect(page).toHaveURL(/view=test&d=fridge/);

  const first = wrongAnswers("fridge", 1);
  await answerAll(page, first);
  await expect(page).toHaveURL(/view=result&d=fridge/);
  await expect(page.getByText("You need 5 of 5 to earn points.")).toBeVisible();
  expect((await readProgress(page))?.points ?? 0).toBe(0);

  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page).toHaveURL(/view=test&d=fridge/);
  await answerAll(page, correctAnswers("fridge", 2));
  await expect(page).toHaveURL(/view=reward&d=fridge/);
  await expect.poll(async () => (await readProgress(page))?.points).toBe(120);
  expect((await readProgress(page))?.collected?.fridge?.firstTry).toBe(false);
});

test("tomorrow's exhibit is locked and its deep link goes home", async ({ page }) => {
  await page.goto("/");
  // aria-disabled still answers a tap with a toast; Playwright treats it as not actionable.
  await page.getByRole("button", { name: "Leaf Opens tomorrow" }).click({ force: true });
  await expect(page.getByText("Leaf. Opens tomorrow.").first()).toBeVisible();

  await page.goto("/?view=lesson&d=leaf&step=2");
  await expect(page).not.toHaveURL(/view=/);
  await expect(
    page.getByRole("heading", { name: "How does a fridge stay cold?" }),
  ).toBeVisible();
});

test("demo mode deep link opens a locked lesson at the requested step", async ({
  page,
}) => {
  await page.goto("/?demo=1&view=lesson&d=leaf&step=4");
  await expect(page).toHaveURL(/view=lesson&d=leaf&step=4/);
  await expect(page.getByRole("button", { name: "Take the test" })).toBeVisible();
});

test("browser back from a lesson returns home and stays in the app", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start discovery", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/step=3/);
  await page.goBack();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("button", { name: "Start discovery", exact: true }),
  ).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(/view=lesson&d=fridge/);
  await page.getByRole("button", { name: "Close lesson" }).click();
  await expect(page).not.toHaveURL(/view=/);
});

test("reloading a lesson URL reopens that step", async ({ page }) => {
  await page.goto("/?view=lesson&d=fridge&step=3");
  await expect(page.getByText("3/6")).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/step=3/);
  await expect(page.getByText("3/6")).toBeVisible();
});
