import { answerAll, correctAnswers, expect, readProgress, test } from "./fixtures";

test("heart today after seeded fridge and leaf; pass at 4 of 5", async ({ page }) => {
  await page.goto("/?fresh=1");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /How does your heart/i })).toBeVisible();
  await expect(page.getByText("Refrigerator")).toBeVisible();
  await expect(page.getByText("Leaf")).toBeVisible();

  // Seeded fridge shows 5/5 fire marks in the museum list.
  await expect(page.getByRole("img", { name: "5 of 5" })).toBeVisible();
  await expect(page.getByRole("img", { name: "4 of 5" })).toBeVisible();

  await page.getByRole("button", { name: "Start discovery", exact: true }).click();
  await expect(page).toHaveURL(/view=lesson&d=heart/);

  const last = page.getByRole("button", { name: "Take the test" });
  // Walk steps until the test CTA.
  for (let i = 0; i < 20; i++) {
    if (await last.isVisible().catch(() => false)) break;
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }
  await last.click();
  await answerAll(page, correctAnswers("heart", 1));
  await expect(page).toHaveURL(/view=reward&d=heart/);
  await expect(page.getByText(/You understand the heart/i)).toBeVisible();

  const stored = await readProgress(page);
  expect(stored?.collected?.heart?.score).toBe(5);
});
